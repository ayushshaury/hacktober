import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, AlertCircle, Send, ShieldAlert } from 'lucide-react';
import { PixelIcon } from '../components/PixelIcon';
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
        const clubRes = await fetch(`/api/clubs/${slug}`);
        const clubData = await clubRes.json();
        if (clubData.club) {
          setClub(clubData.club);
          if (clubData.club.recruitment_open !== 1) {
            setIsClosed(true);
            return;
          }
        }
        throw new Error(data.error || 'Induction form is currently unavailable.');
      }

      if (!data.form || !data.form.id) {
        setClub(data.club);
        setIsClosed(true);
        return;
      }

      setClub(data.club);
      setForm(data.form);

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

    if (user.role === 'club_admin' || user.role === 'admin') {
      setError('Club administrators cannot apply to clubs. Induction applications are reserved for students only.');
      return;
    }

    if (!form || !form.id || !club || !club.id) {
      setError('Induction application form is currently unavailable.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/induction/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          form_id: form.id,
          club_id: club.id,
          answers: answers
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
      <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>LOADING INDUCTION FORM...</div>
      </div>
    );
  }

  // Club Administrators cannot apply for any club inductions
  if (user && (user.role === 'club_admin' || user.role === 'admin')) {
    return (
      <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '640px', paddingTop: '60px', textAlign: 'center' }}>
          <div style={{
            backgroundColor: '#0c141c',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '48px 32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '1px solid #ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.6rem', color: '#f87171', marginBottom: '16px' }}>
              ADMINS CANNOT APPLY
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              marginBottom: '28px',
              maxWidth: '480px',
              margin: '0 auto 28px'
            }}>
              You are logged in as a <strong>Club Administrator ({user.name || user.email})</strong>. Administrators are not eligible to apply for club inductions. Induction applications are reserved for student applicants only.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/admin/dashboard" className="btn-pixel-gold">
                GO TO WORKSPACE
              </Link>
              <Link to={`/clubs/${slug}`} className="btn-pixel-outline">
                ← BACK TO CLUB
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '640px', paddingTop: '60px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#0c141c', border: '1px solid var(--border-gold-dim)', padding: '48px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.8rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
              RECRUITMENT CLOSED
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '28px' }}>
              The induction application window for <strong>{club?.name || 'this club'}</strong> is currently locked.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
              <Link to={`/clubs/${slug}`} className="btn-pixel-gold">
                ← BACK TO CLUB
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: '80px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#0c141c', border: '1px solid var(--border-gold)', padding: '48px 32px' }}>
          <div style={{ width: '56px', height: '56px', border: '1px solid var(--color-mint)', backgroundColor: 'var(--color-mint-dim)', color: 'var(--color-mint)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1.8rem', color: 'var(--text-cream)', marginBottom: '12px' }}>
            APPLICATION SUBMITTED!
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Your induction application for <strong>{club?.name}</strong> has been saved. You can track your screening status anytime.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <Link to="/my-applications" className="btn-pixel-gold">
              MY APPLICATIONS →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '760px', paddingTop: '36px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <Link to={`/clubs/${slug}`} style={{ color: 'var(--color-cyan)', textDecoration: 'none' }}>
            &lt; BACK TO {club?.name?.toUpperCase() || 'CLUB'}
          </Link>
        </div>

        <div style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold)',
          padding: '36px',
          boxShadow: '0 0 20px rgba(194, 166, 73, 0.1)'
        }}>
          
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '28px' }}>
            <h1 style={{ fontFamily: 'var(--font-pixel)', fontSize: '2rem', color: 'var(--text-cream)' }}>
              INDUCTION APPLICATION
            </h1>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--color-gold)', marginTop: '4px' }}>
              {club?.name} • BIT SINDRI
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(240, 113, 103, 0.15)', border: '1px solid var(--color-coral)', color: 'var(--color-coral)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '24px' }}>
              ! {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {form?.questions && form.questions.map((q, qIdx) => (
              <div key={q.id}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-cream)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  {qIdx + 1}. {q.question} {q.required === 1 && <span style={{ color: 'var(--color-coral)' }}>*</span>}
                </label>

                {['short_text', 'number', 'email', 'url'].includes(q.question_type) && (
                  <input
                    type={q.question_type === 'number' ? 'number' : q.question_type === 'email' ? 'email' : 'text'}
                    className="pixel-input"
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    required={q.required === 1}
                  />
                )}

                {q.question_type === 'long_text' && (
                  <textarea
                    className="pixel-input"
                    rows={4}
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    required={q.required === 1}
                  />
                )}

                {(q.question_type === 'single_choice' || q.question_type === 'dropdown') && (
                  <select
                    className="pixel-input"
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    required={q.required === 1}
                  >
                    <option value="">-- CHOOSE OPTION --</option>
                    {q.options && q.options.map(opt => (
                      <option key={opt.id} value={opt.option_text}>
                        {opt.option_text}
                      </option>
                    ))}
                  </select>
                )}

                {q.question_type === 'file_upload' && (
                  <ImageUploader
                    value={answers[q.id] || ''}
                    onChange={val => handleAnswerChange(q.id, val)}
                    label="Attach Picture or Document"
                    aspectRatio="video"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="btn-pixel-gold"
              style={{ padding: '14px 28px', marginTop: '12px' }}
            >
              {submitting ? 'TRANSMITTING...' : 'SUBMIT APPLICATION →'}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
