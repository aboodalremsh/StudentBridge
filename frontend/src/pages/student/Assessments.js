import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [taking,      setTaking]      = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [answers,     setAnswers]     = useState({});
  const [result,      setResult]      = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    studentAPI.getAssessments()
      .then(({ data }) => setAssessments(data.assessments))
      .finally(() => setLoading(false));
  }, []);

  async function startAssessment(assessment) {
    const { data } = await studentAPI.getQuestions(assessment.id);
    setQuestions(data.questions);
    setAnswers({});
    setResult(null);
    setTaking(assessment);
  }

  async function submitAssessment() {
    setSubmitting(true);
    const answerArray = questions.map(q => ({ question_id: q.id, answer: answers[q.id] || '' }));
    try {
      const { data } = await studentAPI.submitAssessment(taking.id, answerArray);
      setResult(data);
      // Refresh list
      const { data: updated } = await studentAPI.getAssessments();
      setAssessments(updated.assessments);
    } catch(err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Skill Assessments</h1>
        <p className="subtitle">Validate your skills and earn points</p>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : assessments.length === 0 ? (
        <div className="empty-state card"><p>No assessments available yet. Check back soon!</p></div>
      ) : (
        <div className="grid-3">
          {assessments.map(a => (
            <div key={a.id} className="card">
              <h3 style={{ marginBottom:8 }}>{a.title}</h3>
              <p style={{ fontSize:'0.85rem', marginBottom:12 }}>{a.description}</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>📝 {a.question_count} questions</span>
                {a.my_score != null ? (
                  <span style={{ fontWeight:700, color:'var(--accent-green)' }}>Score: {a.my_score}</span>
                ) : null}
              </div>
              <button className="btn btn-primary btn-full btn-sm" onClick={() => startAssessment(a)}>
                {a.my_score != null ? '🔄 Retake' : '▶ Start Assessment'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assessment modal */}
      {taking && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget && !submitting) { setTaking(null); setResult(null); } }}>
          <div className="modal" style={{ maxWidth:600 }}>
            <div className="modal-header">
              <h3>{taking.title}</h3>
              <button className="modal-close" onClick={() => { setTaking(null); setResult(null); }}>✕</button>
            </div>

            {result ? (
              <div style={{ textAlign:'center', padding:20 }}>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>{result.passed ? '🎉' : '📚'}</div>
                <h3>{result.passed ? 'Passed!' : 'Keep Practicing!'}</h3>
                <div style={{ fontSize:'2rem', fontWeight:800, color: result.passed?'var(--accent-green)':'var(--accent-amber)', margin:'16px 0' }}>
                  {result.score} / {result.total}
                </div>
                <p>{result.percentage}% correct — {result.passed ? 'You passed the 60% threshold! +25 points awarded.' : 'You need 60% to pass. Review and try again.'}</p>
                <button className="btn btn-primary" style={{ marginTop:20 }} onClick={() => { setTaking(null); setResult(null); }}>
                  Done
                </button>
              </div>
            ) : (
              <div>
                {questions.map((q, i) => (
                  <div key={q.id} style={{ marginBottom:24, paddingBottom:24, borderBottom: i<questions.length-1?'1px solid var(--border)':'none' }}>
                    <p style={{ fontWeight:600, color:'var(--text-main)', marginBottom:12 }}>
                      {i+1}. {q.question_text}
                    </p>
                    {q.question_type === 'mcq' && q.options ? (
                      (typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt, oi) => (
                        <label key={oi} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, cursor:'pointer' }}>
                          <input type="radio" name={`q_${q.id}`} value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                            style={{ width:'auto' }}/>
                          <span style={{ fontSize:'0.9rem' }}>{opt}</span>
                        </label>
                      ))
                    ) : (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                        placeholder="Type your answer…"
                        style={{ minHeight:80 }}
                      />
                    )}
                  </div>
                ))}
                <button className="btn btn-primary btn-full" onClick={submitAssessment} disabled={submitting}>
                  {submitting ? 'Submitting…' : '✓ Submit Assessment'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
