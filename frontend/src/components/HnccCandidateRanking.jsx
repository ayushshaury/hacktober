import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, Award, ShieldAlert, Phone, BookOpen, CheckCircle, RefreshCw, Lock, UploadCloud, FileText, X, Download, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';

const DOMAINS = ['CP / DSA', 'Web Development', 'AI / ML'];

export const HnccCandidateRanking = () => {
  const { user, token } = useAuth();
  
  const [selectedDomain, setSelectedDomain] = useState('Web Development');
  const [topN, setTopN] = useState(10);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const fileInputRef = useRef(null);

  // Check if current user is an authorized HnCC Administrator or Super Admin
  const isAuthorized = user && (
    user.role === 'super_admin' || 
    (user.role === 'club_admin' && (user.club_slug === 'hncc' || user.club_id === 1 || user.email?.includes('hncc')))
  );

  // Only hncc.admin@bitsindri.ac.in is permitted to view unmasked candidate names and raw phone numbers on seeded data
  const isMasterAdmin = (user?.email || '').toLowerCase().trim() === 'hncc.admin@bitsindri.ac.in';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a valid .csv file.');
        return;
      }
      setCsvFile(file);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateRanking = async (e) => {
    if (e) e.preventDefault();
    if (!isAuthorized) {
      setError('Unauthorized: Only official HnCC Administrators can run this model.');
      return;
    }

    const count = parseInt(topN, 10);
    if (isNaN(count) || count < 1 || count > 500) {
      setError('Please enter a valid candidate count between 1 and 500.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('domain', selectedDomain);
      formData.append('top_n', count.toString());
      if (csvFile) {
        formData.append('csv_file', csvFile);
      }

      const res = await fetch('/api/admin/hncc/candidate-ranking', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      let data = {};
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        data = { error: text || 'Server returned an unparseable response.' };
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || `Server error (${res.status})`);
      }

      setResults(data);
    } catch (err) {
      console.error('Error generating AI candidate ranking:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!results || !results.candidates || results.candidates.length === 0) {
      setError('No shortlisted candidates available to export.');
      return;
    }

    try {
      setExportingCsv(true);
      setError('');

      const headers = [
        'Rank',
        'Candidate Name',
        'Branch',
        'Phone Number',
        'Domain',
        'Matched Skills',
        'Matched Languages',
        'Technical Score (80%)',
        'Communication Score (20%)',
        'Final Score (/100)'
      ];

      const csvRows = [headers.join(',')];

      results.candidates.forEach((c) => {
        const skills = (c.matched_keywords || []).join('; ');
        const langs = (c.matched_languages || []).join('; ');
        const row = [
          `"${c.rank}"`,
          `"${(c.candidate_name || '').replace(/"/g, '""')}"`,
          `"${(c.branch || '').replace(/"/g, '""')}"`,
          `"${(c.phone_number || '').replace(/"/g, '""')}"`,
          `"${(c.domain || '').replace(/"/g, '""')}"`,
          `"${skills.replace(/"/g, '""')}"`,
          `"${langs.replace(/"/g, '""')}"`,
          `"${c.skills_score ?? ''}"`,
          `"${c.communication_score ?? ''}"`,
          `"${c.final_score ?? ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeDomain = (results.domain || 'candidates').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute('download', `hncc_${safeDomain}_shortlist_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(`Successfully exported ${results.candidates.length} candidates as CSV!`);
      setTimeout(() => setExportSuccess(''), 4500);
    } catch (err) {
      console.error('CSV export failed:', err);
      setError('Failed to export CSV: ' + err.message);
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPDF = () => {
    if (!results || !results.candidates || results.candidates.length === 0) {
      setError('No shortlisted candidates available to export.');
      return;
    }

    try {
      setExportingPdf(true);
      setError('');

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 14;

      // Header Banner
      doc.setFillColor(9, 14, 19);
      doc.rect(margin, y, pageWidth - (margin * 2), 26, 'F');
      doc.setDrawColor(194, 166, 73);
      doc.setLineWidth(0.6);
      doc.rect(margin, y, pageWidth - (margin * 2), 26, 'S');

      // Title
      doc.setTextColor(243, 208, 99);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('BIT SINDRI — HnCC AI INDUCTION SHORTLIST', margin + 6, y + 8.5);

      // Subtitle
      doc.setTextColor(190, 200, 210);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const safeDomain = results.domain || 'All Domains';
      const timestamp = new Date().toLocaleString();
      doc.text(
        `Domain: ${safeDomain}   |   Model: 80% Technical Skills + 20% Communication   |   Exported: ${timestamp}`,
        margin + 6,
        y + 15
      );
      const datasetText = results.custom_source 
        ? `Source: Custom CSV (${results.source_filename || 'Uploaded File'})` 
        : `Source: Official 2k26 Induction Responses (495 Candidates)`;
      const privacyText = !results.custom_source && !isMasterAdmin
        ? '   |   Privacy: Names masked to initials, phone hashed'
        : '';
      doc.text(
        `${datasetText}   |   Shortlisted: ${results.candidates.length} Candidates${privacyText}`,
        margin + 6,
        y + 20.5
      );

      y += 32;

      // Table Header Column Positions
      const colRank = margin;
      const colName = margin + 14;
      const colBranch = margin + 62;
      const colPhone = margin + 100;
      const colScores = margin + 134;
      const colFinal = margin + 168;
      const tableWidth = pageWidth - (margin * 2);

      const drawTableHeader = (currentY) => {
        doc.setFillColor(15, 23, 32);
        doc.rect(margin, currentY, tableWidth, 8, 'F');
        doc.setDrawColor(60, 75, 95);
        doc.line(margin, currentY + 8, margin + tableWidth, currentY + 8);

        doc.setTextColor(243, 208, 99);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('RANK', colRank + 2, currentY + 5.5);
        doc.text('CANDIDATE', colName, currentY + 5.5);
        doc.text('BRANCH', colBranch, currentY + 5.5);
        doc.text('CONTACT', colPhone, currentY + 5.5);
        doc.text('TECH / COMM', colScores, currentY + 5.5);
        doc.text('SCORE / 100', colFinal, currentY + 5.5);
      };

      drawTableHeader(y);
      y += 8;

      // Render Rows
      results.candidates.forEach((c, idx) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 14;
          drawTableHeader(y);
          y += 8;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(250, 252, 255);
        } else {
          doc.setFillColor(242, 245, 249);
        }
        doc.rect(margin, y, tableWidth, 9.5, 'F');
        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.2);
        doc.line(margin, y + 9.5, margin + tableWidth, y + 9.5);

        // Rank
        doc.setFont('helvetica', 'bold');
        if (c.rank <= 3) {
          doc.setTextColor(190, 130, 10);
        } else {
          doc.setTextColor(50, 60, 75);
        }
        doc.setFontSize(8.5);
        doc.text(`#${c.rank}`, colRank + 2, y + 6.5);

        // Candidate Name
        doc.setTextColor(20, 30, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        const nameLines = doc.splitTextToSize(c.candidate_name || 'N/A', 46);
        doc.text(nameLines[0] || 'N/A', colName, y + 6.5);

        // Branch
        doc.setTextColor(70, 80, 95);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const branchLines = doc.splitTextToSize(c.branch || 'N/A', 36);
        doc.text(branchLines[0] || 'N/A', colBranch, y + 6.5);

        // Contact
        doc.setTextColor(80, 90, 105);
        doc.setFontSize(7.5);
        doc.text(c.phone_number || 'N/A', colPhone, y + 6.5);

        // Scores Breakdown
        doc.setTextColor(50, 60, 75);
        doc.setFontSize(7.2);
        const techStr = c.skills_score !== undefined ? `${c.skills_score}` : '-';
        const commStr = c.communication_rating !== undefined ? `${c.communication_rating}★` : '-';
        doc.text(`T: ${techStr}  |  C: ${commStr}`, colScores, y + 6.5);

        // Final Score
        doc.setTextColor(180, 120, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${c.final_score ?? '-'}`, colFinal + 3, y + 6.5);

        y += 9.5;
      });

      // Page numbers footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(140, 150, 160);
        doc.text(
          `BIT Sindri Clubs Dashboard — HnCC AI Shortlisting Report  |  Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      const safeName = (results.domain || 'shortlist').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`hncc_${safeName}_shortlist_${dateStr}.pdf`);

      setExportSuccess(`Successfully generated and downloaded ${results.candidates.length} candidates as PDF!`);
      setTimeout(() => setExportSuccess(''), 4500);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to export PDF: ' + err.message);
    } finally {
      setExportingPdf(false);
    }
  };

  // If user is not an authorized HnCC Admin, display locked access banner
  if (!isAuthorized) {
    return (
      <div 
        className="pixel-corner-mark"
        style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-gold-dim)',
          padding: '40px 28px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#080d12',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px auto',
          boxShadow: '1px 1px 0px #8a7329'
        }}>
          <Lock size={26} color="var(--color-gold)" />
        </div>
        <h3 style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '1.4rem',
          color: 'var(--text-cream)',
          marginBottom: '10px',
          letterSpacing: '0.04em'
        }}>
          HnCC AI CANDIDATE RANKING SYSTEM
        </h3>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          maxWidth: '560px',
          margin: '0 auto 20px auto',
          lineHeight: 1.6
        }}>
          This domain-wise AI candidate shortlisting feature is powered by the official 2k26 induction dataset and Sentence-Transformers embedding model.
          Access is strictly restricted to verified <strong style={{ color: 'var(--color-gold)' }}>HnCC Administrators</strong>.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#070c10',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <ShieldAlert size={15} color="var(--color-coral)" />
          <span>Status: Restricted Access • Authorized HnCC Admins Only</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-mono)' }}>
      
      {/* Header Banner */}
      <div 
        className="pixel-corner-mark"
        style={{
          backgroundColor: '#090e13',
          border: '1px solid var(--border-gold)',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 0 16px rgba(194, 166, 73, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge-pixel gold">
                HnCC 2k26 AI ENGINE
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--color-mint)', fontWeight: 700 }}>
                ● MODEL ACTIVE (MiniLM-L6-v2)
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
              color: 'var(--text-cream)',
              lineHeight: 1.2
            }}>
              DOMAIN-WISE CANDIDATE RANKING
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px' }}>
              Select a domain and enter candidate count to run the 80% Technical Skills + 20% Communication scoring model.
            </p>
          </div>

          <div style={{
            padding: '10px 16px',
            backgroundColor: '#0c141c',
            border: '1px solid var(--border-card)',
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}>
            <div>WEIGHTS: <strong style={{ color: 'var(--color-gold)' }}>80% Skills</strong> + <strong style={{ color: 'var(--color-mint)' }}>20% Comm</strong></div>
            <div style={{ marginTop: '2px', color: 'var(--text-dim)' }}>DATASET: 495 Official Candidates</div>
          </div>
        </div>
      </div>

      {/* Control Panel: Domain Selector & Number Input */}
      <div 
        style={{
          backgroundColor: '#0c141c',
          border: '1px solid var(--border-card)',
          padding: '24px 28px',
          marginBottom: '28px'
        }}
      >
        <form onSubmit={handleGenerateRanking}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'flex-end' }}>
            
            {/* Domain Selector */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.92rem',
                color: 'var(--color-gold)',
                marginBottom: '10px',
                letterSpacing: '0.04em'
              }}>
                1. SELECT DOMAIN
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DOMAINS.map(domain => {
                  const isSel = selectedDomain === domain;
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => {
                        setSelectedDomain(domain);
                        // Do not auto-generate; wait for user click
                      }}
                      className={`filter-btn ${isSel ? 'active' : ''}`}
                      style={{
                        padding: '10px 18px',
                        fontSize: '0.84rem',
                        fontWeight: 700
                      }}
                    >
                      {domain}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Count Input */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.92rem',
                color: 'var(--color-gold)',
                marginBottom: '10px',
                letterSpacing: '0.04em'
              }}>
                2. TOP CANDIDATES COUNT
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={topN}
                  onChange={(e) => setTopN(e.target.value)}
                  className="pixel-input"
                  style={{
                    width: '120px',
                    padding: '9px 14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                  required
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  candidates (1 - 500)
                </span>
              </div>
            </div>

            {/* Generate Action Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-pixel-gold"
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '0.95rem'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> RUNNING MODEL...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> GENERATE AI RANKING →
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Upload Custom CSV (Optional) */}
          <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px dashed var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <label style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.88rem',
                color: 'var(--color-gold)',
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <UploadCloud size={16} /> 3. UPLOAD CANDIDATES CSV (OPTIONAL)
              </label>
              {csvFile && (
                <span style={{ fontSize: '0.74rem', color: 'var(--color-mint)', fontWeight: 700 }}>
                  ● CUSTOM DATASET ACTIVE: {(csvFile.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="hncc-csv-upload-input"
              />

              {!csvFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="filter-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <UploadCloud size={14} /> CHOOSE CSV FILE...
                </button>
              ) : (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 14px',
                  backgroundColor: '#070c10',
                  border: '1px solid var(--color-mint)',
                  fontSize: '0.82rem',
                  color: 'var(--text-cream)'
                }}>
                  <FileText size={15} color="var(--color-mint)" />
                  <span style={{ fontWeight: 600 }}>{csvFile.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-coral)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Remove custom CSV"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {csvFile 
                  ? 'Model will dynamically evaluate applicants from this uploaded file.' 
                  : 'Leave blank to evaluate the default official 2k26 induction responses.'}
              </span>
            </div>
          </div>

        </form>

        {error && (
          <div style={{
            marginTop: '18px',
            padding: '12px 16px',
            backgroundColor: 'rgba(240, 113, 103, 0.15)',
            border: '1px solid var(--color-coral)',
            color: 'var(--color-coral)',
            fontSize: '0.84rem'
          }}>
            ! {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="animate-fade-in">
          
          {/* Results Summary Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1.25rem',
                color: 'var(--text-cream)'
              }}>
                RANKED CANDIDATES: <span style={{ color: 'var(--color-gold)' }}>{results.domain}</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Showing top {results.candidates.length} of {results.total_available} eligible candidates ranked from highest to lowest score.
              </p>
            </div>

            {/* Export Actions Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={exportingCsv || !results.candidates.length}
                className="filter-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-mint)',
                  borderColor: 'rgba(92, 207, 137, 0.45)',
                  backgroundColor: 'rgba(92, 207, 137, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Download shortlisted candidate table as a CSV spreadsheet"
              >
                <FileSpreadsheet size={15} color="var(--color-mint)" />
                {exportingCsv ? 'EXPORTING CSV...' : 'EXPORT CSV'}
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={exportingPdf || !results.candidates.length}
                className="filter-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-gold)',
                  borderColor: 'rgba(243, 208, 99, 0.45)',
                  backgroundColor: 'rgba(243, 208, 99, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Download official shortlisted candidate report as a formatted PDF"
              >
                <Download size={15} color="var(--color-gold)" />
                {exportingPdf ? 'GENERATING PDF...' : 'EXPORT PDF'}
              </button>
            </div>

            {/* Badges Strip */}
            <div style={{ width: '100%', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {results.custom_source ? (
                <span className="badge-pixel mint" title={results.source_filename}>
                  CUSTOM CSV: {results.source_filename || 'UPLOADED FILE'}
                </span>
              ) : (
                <span className="badge-pixel gold">
                  OFFICIAL 2K26 DATASET
                </span>
              )}
              {results.custom_source ? (
                <span className="badge-pixel mint" title="Custom CSV input: candidate names and phone numbers are unmasked as provided">
                  RAW CSV CANDIDATE DATA
                </span>
              ) : isMasterAdmin ? (
                <span className="badge-pixel mint" title="Full names & phone numbers unlocked for master administrator (hncc.admin@bitsindri.ac.in)">
                  FULL DATA UNMASKED (MASTER ADMIN)
                </span>
              ) : (
                <span className="badge-pixel coral" title="Candidate names masked to initials (e.g. AK) and phone numbers hashed for privacy. Only hncc.admin@bitsindri.ac.in can view raw details.">
                  NAME INITIALS & PHONE HASHED (PROTECTED)
                </span>
              )}
              <span className="badge-pixel gold">
                {results.candidates.length} RETURNED
              </span>
              <span className="badge-pixel tech">
                {results.domain} ONLY
              </span>
            </div>

            {/* Export Success Feedback Notification */}
            {exportSuccess && (
              <div style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px 14px',
                backgroundColor: 'rgba(92, 207, 137, 0.15)',
                border: '1px solid var(--color-mint)',
                color: 'var(--color-mint)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={15} />
                <span>{exportSuccess}</span>
              </div>
            )}
          </div>

          {/* Candidates List Table / Cards */}
          {results.candidates.length === 0 ? (
            <div style={{
              backgroundColor: '#0c141c',
              border: '1px solid var(--border-card)',
              padding: '36px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              No eligible candidates found matching domain criteria.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.candidates.map((c) => (
                <div
                  key={c.candidate_id || c.rank}
                  className="pixel-card"
                  style={{
                    backgroundColor: '#0c141c',
                    border: c.rank <= 3 ? '1px solid var(--border-gold)' : '1px solid var(--border-card)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  
                  {/* Left: Rank & Candidate Information (Display-only Metadata) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                    
                    {/* Rank Number */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: c.rank <= 3 ? 'rgba(243, 208, 99, 0.12)' : '#070c10',
                      border: c.rank <= 3 ? '1px solid var(--color-gold)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: c.rank <= 3 ? 'var(--color-gold)' : 'var(--text-cream)',
                      flexShrink: 0
                    }}>
                      #{c.rank}
                    </div>

                    {/* Metadata: Name, Branch, Phone */}
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '1.1rem',
                        color: 'var(--text-cream)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {c.candidate_name}
                        {!results.custom_source && !isMasterAdmin && (
                          <span 
                            style={{ 
                              fontSize: '0.62rem', 
                              padding: '1px 5px', 
                              backgroundColor: 'rgba(243, 208, 99, 0.1)', 
                              border: '1px solid rgba(243, 208, 99, 0.3)', 
                              color: 'var(--color-gold)',
                              letterSpacing: '0.05em'
                            }}
                            title="Candidate name masked to initials for non-master club admins on seeded data"
                          >
                            INITIALS
                          </span>
                        )}
                        {c.rank === 1 && (
                          <span style={{ fontSize: '0.66rem', padding: '1px 6px', backgroundColor: 'var(--color-gold)', color: 'var(--text-dark)', fontWeight: 800 }}>
                            TOP MATCH
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--color-cyan)' }}>
                          🎓 {c.branch || 'Branch N/A'}
                        </span>
                        <span>•</span>
                        <span 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title={
                            !results.custom_source && !isMasterAdmin
                              ? "Phone number hashed for privacy (only visible to hncc.admin@bitsindri.ac.in)"
                              : "Contact Number"
                          }
                        >
                          <Phone size={12} color={!results.custom_source && !isMasterAdmin ? 'var(--text-dim)' : 'var(--border-gold)'} /> 
                          <span style={{ 
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: !results.custom_source && !isMasterAdmin ? '0.08em' : 'normal',
                            color: !results.custom_source && !isMasterAdmin ? 'var(--text-muted)' : 'var(--text-cream)'
                          }}>
                            {c.phone_number || 'N/A'}
                          </span>
                          {!results.custom_source && !isMasterAdmin && (
                            <span style={{ 
                              fontSize: '0.62rem', 
                              padding: '1px 5px', 
                              backgroundColor: 'rgba(240, 113, 103, 0.1)', 
                              border: '1px solid rgba(240, 113, 103, 0.3)', 
                              color: 'var(--color-coral)',
                              marginLeft: '2px' 
                            }}>
                              HASHED
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Middle: Domain & Matched Skills Tags */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Domain: <strong style={{ color: 'var(--text-cream)' }}>{c.domain}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {c.matched_keywords && c.matched_keywords.slice(0, 3).map((kw, ki) => (
                        <span key={ki} style={{
                          padding: '2px 6px',
                          backgroundColor: '#070c10',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.68rem',
                          color: 'var(--color-mint)'
                        }}>
                          ✓ {kw}
                        </span>
                      ))}
                      {c.matched_languages && c.matched_languages.slice(0, 2).map((lang, li) => (
                        <span key={li} style={{
                          padding: '2px 6px',
                          backgroundColor: '#070c10',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.68rem',
                          color: 'var(--color-cyan)'
                        }}>
                          💻 {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Scores breakdown & Final Score Out of 100 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    
                    {/* Component Scores (Technical Skills & Communication) */}
                    <div style={{ textAlign: 'right', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <div>Skills (80%): <strong style={{ color: 'var(--color-gold)' }}>{c.skills_score}</strong>/100</div>
                      <div style={{ marginTop: '2px' }}>Comm (20%): <strong style={{ color: 'var(--color-mint)' }}>{c.communication_rating}★</strong> ({c.communication_score}/100)</div>
                    </div>

                    {/* Final Overall Matching Score */}
                    <div style={{
                      minWidth: '92px',
                      padding: '8px 14px',
                      backgroundColor: '#070c10',
                      border: '1px solid var(--border-gold)',
                      textAlign: 'center',
                      boxShadow: '1px 1px 0px #8a7329'
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '1.45rem',
                        fontWeight: 800,
                        color: 'var(--color-gold)',
                        lineHeight: 1
                      }}>
                        {c.final_score}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.06em', marginTop: '2px' }}>
                        SCORE / 100
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
