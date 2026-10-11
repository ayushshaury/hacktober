import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Send, Building2 } from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

export const ApplyInduction = () => {
  const { slug } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState(null);
  const [form, setForm] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    setLoading(true);
    setError('');
    setIsClosed(false);
    try {
      let res = await fetch(`/api/induction/clubs/${slug}/form`);
      let data = await res.json();

      if (data.is_closed) {
        setClub(data.club);
        setIsClosed(true);
        return;
      }

      if (!res.ok) {
        // Fallback to fetch club info directly
        const clubRes = await fetch(`/api/clubs/${slug}`);
        const clubData = await clubRes.json();
        if (clubData.club) {
          setClub(clubData.club);
          if (clubData.club.recruitment_open !== 1) {
            setIsClosed(true);
            return;
          }
        }
        throw new Error(data.error || 'Induction application form is currently closed or being updated.');
      }

      if (!data.form || !data.form.id) {
        setClub(data.club);
        setIsClosed(true);
        return;
      }

      setClub(data.club);
      setForm(data.form);

      // Pre-fill initial state for answers
      const initialAnswers = {};
      if (data.form?.questions) {
        data.form.questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
      }
      setAnswers(initialAnswers);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!form || !form.id || !club || !club.id) {
      setError('Induction application form is currently unavailable.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const answerPayload = Object.keys(answers).map(qId => ({
        question_id: parseInt(qId),
        answer: Array.isArray(answers[qId]) ? answers[qId].join(', ') : answers[qId]
      }));

      const res = await fetch('/api/induction/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          form_id: form.id,
          club_id: club.id,
          answers: answerPayload
        })
      });

      const resData = await res.json();

      if (!res.ok) throw new Error(resData.error || 'Failed to submit application');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading application form...</div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
        <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', padding: '44px 0 32px 0' }}>
          <div className="container" style={{ maxWidth: '760px' }}>
            <Link to={`/clubs/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 600 }}>
              <ArrowLeft size={15} /> Back to {club?.name || 'Club'} Profile
            </Link>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
              Induction Application: <span className="gradient-text">{club?.name || 'Club'}</span>
            </h1>
          </div>
        </div>

        <div className="container animate-fade-in" style={{ maxWidth: '640px', marginTop: '48px', textAlign: 'center' }}>
          <div className="glass-panel" style={{ padding: '52px 36px' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#FEF7E0', color: '#B08800', border: '1px solid #FCE8B2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <AlertCircle size={38} />
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Induction Applications are Currently Closed
            </h2>
            <p style={{ color: 'var(--text-body)', fontSize: '0.96rem', lineHeight: 1.65, marginBottom: '32px' }}>
              The induction application window for <strong>{club?.name || 'this club'}</strong> is not currently accepting responses. Club administrators manage and can reopen induction applications anytime from their workspace.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={`/clubs/${slug}`} className="btn btn-primary" style={{ padding: '11px 24px' }}>
                <ArrowLeft size={16} /> Back to Club Profile
              </Link>
              <Link to="/clubs" className="btn btn-secondary" style={{ padding: '11px 24px' }}>
                Explore Other Campus Clubs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container animate-fade-in" style={{ maxWidth: '640px', padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E6F4EA', color: '#137333', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Application Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Your induction application for <strong>{club?.name}</strong> has been received. You can track your screening status anytime under My Applications.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/my-applications" className="btn btn-primary" style={{ padding: '11px 24px' }}>
              View My Applications
            </Link>
            <Link to={`/clubs/${slug}`} className="btn btn-secondary" style={{ padding: '11px 24px' }}>
              Back to Club Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '80px' }} className="animate-fade-in">
      
      {/* Header Banner (Apple Style Subdued Canvas) */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)', 
        padding: '44px 0 32px 0' 
      }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          
          <Link to={`/clubs/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 600 }}>
            <ArrowLeft size={15} /> Back to {club?.name || 'Club'} Profile
          </Link>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Induction Application: <span className="gradient-text">{club?.name}</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', marginTop: '6px', lineHeight: 1.6 }}>
            Fill out the candidate details and questions below to submit your official induction application.
          </p>

        </div>
      </div>

      {/* Form Container */}
      <div className="container" style={{ maxWidth: '760px', marginTop: '36px' }}>
        
        {error && (
          <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#FCE8E6', border: '1px solid #FAD2CF', color: '#C5221F', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="glass-panel" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              Candidate Application Questions
            </h3>

            {form?.questions && form.questions.map((q, qIdx) => (
              <div key={q.id} className="form-group">
                <label className="form-label" style={{ fontSize: '0.94rem' }}>
                  {qIdx + 1}. {q.question} {q.required === 1 && <span style={{ color: '#DC2626' }}>*</span>}
                </label>

                {/* Short text / Number / Email / URL */}
                {['short_text', 'number', 'email', 'url'].includes(q.question_type) && (
                  <input
                    type={q.question_type === 'number' ? 'number' : q.question_type === 'email' ? 'email' : 'text'}
                    className="input"
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    required={q.required === 1}
                  />
                )}

                {/* Long text */}
                {q.question_type === 'long_text' && (
                  <textarea
                    className="input"
                    rows={4}
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    required={q.required === 1}
                  />
                )}

                {/* File / Picture Upload */}
                {q.question_type === 'file_upload' && (
                  <ImageUploader
                    value={answers[q.id] || ''}
                    onChange={val => handleAnswerChange(q.id, val)}
                    label="Attach Picture or Document"
                    helperText="Upload candidate picture, portfolio work or proof (PNG, JPG, PDF, WebP)"
                    aspectRatio="video"
                  />
                )}

                {/* Yes / No */}
                {q.question_type === 'yes_no' && (
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="Yes"
                        checked={answers[q.id] === 'Yes'}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        required={q.required === 1}
                      />
                      Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="No"
                        checked={answers[q.id] === 'No'}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        required={q.required === 1}
                      />
                      No
                    </label>
                  </div>
                )}

                {/* Single Choice / Dropdown */}
                {(q.question_type === 'single_choice' || q.question_type === 'dropdown') && (
                  <select
                    className="input"
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    required={q.required === 1}
                  >
                    <option value="">-- Choose Option --</option>
                    {q.options && q.options.map(opt => (
                      <option key={opt.id} value={opt.option_text}>
                        {opt.option_text}
                      </option>
                    ))}
                  </select>
                )}

                {/* Multiple Choice */}
                {q.question_type === 'multiple_choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    {q.options && q.options.map(opt => {
                      const currentArray = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                      const isChecked = currentArray.includes(opt.option_text);
                      return (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              let nextArray;
                              if (e.target.checked) nextArray = [...currentArray, opt.option_text];
                              else nextArray = currentArray.filter(item => item !== opt.option_text);
                              handleAnswerChange(q.id, nextArray);
                            }}
                          />
                          {opt.option_text}
                        </label>
                      );
                    })}
                  </div>
                )}

              </div>
            ))}

            <button 
              type="submit" 
              disabled={submitting} 
              className="btn btn-primary" 
              style={{ padding: '14px 32px', fontSize: '0.98rem', marginTop: '16px' }}
            >
              <Send size={18} /> {submitting ? 'Submitting Application...' : 'Submit Official Induction Application'}
            </button>

          </div>
        </form>

      </div>

    </div>
  );
};
