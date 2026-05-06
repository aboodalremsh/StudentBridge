import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

const CAREER_GOALS = [
  'General Career','Frontend Developer','Backend Developer','Full-Stack Developer',
  'Data Analyst','Data Scientist','UI/UX Designer','DevOps Engineer','Mobile Developer',
];

const GOAL_DATA = {
  'Frontend Developer': {
    recommendations: [
      { icon: '⛛️', title: 'Learn React & TypeScript', priority: 'high', desc: 'Frontend roles require strong React skills. Build 2-3 portfolio projects with TypeScript.' },
      { icon: 'Ἲ8', title: 'Master CSS & Responsive Design', priority: 'high', desc: 'Deep knowledge of Flexbox, Grid, and mobile-first design is expected in every frontend role.' },
      { icon: 'ὒ7', title: 'Add JavaScript ES6+ to your skills', priority: 'medium', desc: 'Core JS fundamentals are tested in almost every frontend interview.' },
      { icon: '὎6', title: 'Learn a build tool (Vite/Webpack)', priority: 'low', desc: 'Understanding of bundlers and dev tools will set you apart from other candidates.' },
    ],
    careerPaths: [
      { path: 'Frontend Developer', match: 95 },
      { path: 'UI/UX Engineer', match: 75 },
      { path: 'Full-Stack Developer', match: 65 },
      { path: 'React Native Developer', match: 60 },
    ],
  },
  'Backend Developer': {
    recommendations: [
      { icon: 'ὒ7', title: 'Strengthen Node.js & Express', priority: 'high', desc: 'Build REST APIs with authentication, validation, and proper error handling.' },
      { icon: '὜4️', title: 'Learn Database Design', priority: 'high', desc: 'SQL, normalization, and query optimization are core backend skills.' },
      { icon: 'ὑ0', title: 'Understand JWT & Auth', priority: 'medium', desc: 'Implement secure login flows, token refresh, and role-based access control.' },
      { icon: 'ὃ3', title: 'Learn Docker basics', priority: 'low', desc: 'Containerizing your apps shows production readiness.' },
    ],
    careerPaths: [
      { path: 'Backend Developer', match: 95 },
      { path: 'Full-Stack Developer', match: 72 },
      { path: 'DevOps Engineer', match: 58 },
      { path: 'Database Administrator', match: 55 },
    ],
  },
  'Full-Stack Developer': {
    recommendations: [
      { icon: '⛛️', title: 'Build a full-stack project', priority: 'high', desc: 'A real deployed project (React + Node + DB) is the best proof of full-stack capability.' },
      { icon: '὜4️', title: 'Learn SQL & MySQL deeply', priority: 'high', desc: 'Full-stack roles require you to design and optimize your own database schemas.' },
      { icon: 'ὒ7', title: 'Add REST API skills', priority: 'medium', desc: 'Designing clean APIs is a key differentiator for full-stack developers.' },
      { icon: 'ἱ0', title: 'Deploy to a cloud platform', priority: 'low', desc: 'Deploying to Heroku, Vercel, or AWS shows you understand the full software lifecycle.' },
    ],
    careerPaths: [
      { path: 'Full-Stack Developer', match: 92 },
      { path: 'Frontend Developer', match: 80 },
      { path: 'Backend Developer', match: 78 },
      { path: 'Software Engineer', match: 70 },
    ],
  },
  'Data Analyst': {
    recommendations: [
      { icon: 'Ὄa', title: 'Master Python & Pandas', priority: 'high', desc: 'Data wrangling with Pandas is the first thing every data analyst does on the job.' },
      { icon: '὜4️', title: 'Strengthen your SQL skills', priority: 'high', desc: 'Complex JOINs, window functions, and aggregations are tested in every data interview.' },
      { icon: 'Ὄ8', title: 'Learn Tableau or Power BI', priority: 'medium', desc: 'Dashboard tools are required by most data analyst job postings.' },
      { icon: 'Ὄ9', title: 'Study basic statistics', priority: 'low', desc: 'Mean, median, standard deviation, and correlation are used daily in data analysis.' },
    ],
    careerPaths: [
      { path: 'Data Analyst', match: 95 },
      { path: 'Business Intelligence', match: 78 },
      { path: 'Data Scientist', match: 60 },
      { path: 'Product Analyst', match: 65 },
    ],
  },
  'Data Scientist': {
    recommendations: [
      { icon: 'ᾑ6', title: 'Learn Machine Learning', priority: 'high', desc: 'Supervised and unsupervised learning with scikit-learn is the baseline for data science.' },
      { icon: 'ὀd', title: 'Master Python (NumPy, Pandas)', priority: 'high', desc: 'Python is the dominant language in data science. Deep proficiency is non-negotiable.' },
      { icon: 'Ὄa', title: 'Practice on real datasets', priority: 'medium', desc: 'Kaggle competitions and public datasets build the portfolio companies want to see.' },
      { icon: 'ᾞ0', title: 'Study Neural Networks basics', priority: 'low', desc: 'TensorFlow or PyTorch basics will open doors to AI-focused roles.' },
    ],
    careerPaths: [
      { path: 'Data Scientist', match: 92 },
      { path: 'Machine Learning Engineer', match: 80 },
      { path: 'Data Analyst', match: 70 },
      { path: 'AI Researcher', match: 55 },
    ],
  },
  'UI/UX Designer': {
    recommendations: [
      { icon: 'Ἲ8', title: 'Master Figma', priority: 'high', desc: 'Figma is the industry standard. Build a portfolio of 3-5 real case studies with it.' },
      { icon: 'ὒc', title: 'Learn user research methods', priority: 'high', desc: 'Interviews, usability testing, and card sorting are expected skills in UX roles.' },
      { icon: 'Ὅ0', title: 'Study design systems', priority: 'medium', desc: 'Understanding component libraries and design tokens shows professional maturity.' },
      { icon: 'Ὃb', title: 'Learn basic HTML & CSS', priority: 'low', desc: 'Designers who can code are highly valued.' },
    ],
    careerPaths: [
      { path: 'UI/UX Designer', match: 95 },
      { path: 'Product Designer', match: 85 },
      { path: 'Frontend Developer', match: 50 },
      { path: 'Design Consultant', match: 60 },
    ],
  },
  'DevOps Engineer': {
    recommendations: [
      { icon: 'ὃ3', title: 'Learn Docker & Kubernetes', priority: 'high', desc: 'Container orchestration is the core of modern DevOps. Practice deploying real applications.' },
      { icon: '☁️', title: 'Get AWS Cloud Practitioner', priority: 'high', desc: 'Cloud certifications significantly boost your chances of landing a DevOps role.' },
      { icon: '⚙️', title: 'Set up a CI/CD pipeline', priority: 'medium', desc: 'GitHub Actions or Jenkins pipeline on a personal project demonstrates real DevOps skill.' },
      { icon: 'ὂ7', title: 'Strengthen Linux skills', priority: 'low', desc: 'Shell scripting and Linux administration are daily tasks for most DevOps engineers.' },
    ],
    careerPaths: [
      { path: 'DevOps Engineer', match: 92 },
      { path: 'Cloud Engineer', match: 82 },
      { path: 'Site Reliability Engineer', match: 70 },
      { path: 'Backend Developer', match: 55 },
    ],
  },
  'Mobile Developer': {
    recommendations: [
      { icon: '὏1', title: 'Learn React Native', priority: 'high', desc: 'Cross-platform development with React Native is the most in-demand mobile skill.' },
      { icon: '⛛️', title: 'Strengthen your JavaScript', priority: 'high', desc: 'React Native is built on JS — strong fundamentals are essential for mobile development.' },
      { icon: 'ὐc', title: 'Learn REST API integration', priority: 'medium', desc: 'Every mobile app consumes APIs. Practice fetching, error handling, and loading states.' },
      { icon: '὎6', title: 'Publish an app to a store', priority: 'low', desc: 'A published app on Google Play or App Store is the strongest portfolio item for mobile developers.' },
    ],
    careerPaths: [
      { path: 'React Native Developer', match: 93 },
      { path: 'Mobile Developer', match: 88 },
      { path: 'Frontend Developer', match: 72 },
      { path: 'Full-Stack Developer', match: 60 },
    ],
  },
};

const scoreColor = n => n >= 75 ? 'var(--accent-green)' : n >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';

const ProgressBar = ({ value, color, height = 6 }) => (
  React.createElement('div', { className: 'progress-bar' },
    React.createElement('div', { className: 'progress-fill', style: { width: Math.min(Math.max(value, 0), 100) + '%', height, background: color || 'linear-gradient(90deg, var(--accent-primary), var(--accent-green))' } })
  )
);

export default function AIAdvisor() {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goalIndex, setGoalIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    studentAPI.getCareerAdvice()
      .then(({ data }) => setAdvice(data.advice))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
    </DashboardLayout>
  );

  const pct = advice?.profileCompletion || 0;
  const selectedGoal = CAREER_GOALS[goalIndex];
  const activeRecs = goalIndex === 0 ? (advice?.recommendations || []) : (GOAL_DATA[selectedGoal]?.recommendations || []);
  const activePaths = goalIndex === 0 ? (advice?.careerPaths || []) : (GOAL_DATA[selectedGoal]?.careerPaths || []);
  const motivationMsg = advice?.motivationMessage || (pct >= 80 ? 'Your profile is strong! Keep applying consistently.' : pct >= 50 ? 'Good progress! A few more improvements will boost your visibility.' : 'Complete your profile, take one course, and apply to your first job today.');

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>AI Career Advisor</h1>
            <p className="subtitle">Personalised career insights based on your profile and activity</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Goal:</span>
            <select value={goalIndex} onChange={e => setGoalIndex(Number(e.target.value))} style={{ width: 200 }}>
              {CAREER_GOALS.map((g, i) => <option key={g} value={i}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {goalIndex > 0 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(79,142,247,0.3)', background: 'rgba(79,142,247,0.04)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>&#127919;</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 2 }}>Showing results for: {selectedGoal}</div>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Recommendations and career paths are tailored to your selected goal.</p>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24, borderColor: pct >= 80 ? 'rgba(52,217,155,0.3)' : 'rgba(245,166,35,0.3)' }}>
        <div className="flex-between" style={{ marginBottom: 10 }}>
          <h3>Profile Strength</h3>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: scoreColor(pct) }}>{pct}%</span>
        </div>
        <ProgressBar value={pct} height={12} />
        <div className="flex-between" style={{ marginTop: 10 }}>
          <p style={{ fontSize: '0.85rem' }}>{pct >= 80 ? 'Excellent profile! Companies can fully evaluate you.' : pct >= 50 ? 'Good start. Add more info to increase visibility.' : 'Incomplete profile. Companies rarely contact incomplete profiles.'}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/profile')}>Update</button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
        <div>
          <h3 style={{ marginBottom: 16 }}>Recommendations</h3>
          {!activeRecs.length
            ? <div className="card"><p>Great job! No urgent recommendations.</p></div>
            : activeRecs.map((r, i) => (
              <div key={i} className="card" style={{ marginBottom: 12, borderLeft: `3px solid ${r.priority === 'high' ? 'var(--accent-red)' : r.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-primary)'}` }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <h4 style={{ fontSize: '0.95rem' }}>{r.icon} {r.title}</h4>
                  <span className="badge" style={{ background: r.priority === 'high' ? 'rgba(244,110,110,0.12)' : 'rgba(245,166,35,0.12)', color: r.priority === 'high' ? 'var(--accent-red)' : 'var(--accent-amber)', border: `1px solid ${r.priority === 'high' ? 'rgba(244,110,110,0.2)' : 'rgba(245,166,35,0.2)'}` }}>{r.priority}</span>
                </div>
                <p style={{ fontSize: '0.85rem' }}>{r.desc}</p>
              </div>
            ))
          }
        </div>
        <div>
          <h3 style={{ marginBottom: 16 }}>Suggested Career Paths</h3>
          {!activePaths.length
            ? <div className="card"><p>No career paths available.</p></div>
            : activePaths.map((p, i) => (
              <div key={i} className="card" style={{ marginBottom: 12 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <h4>{p.path}</h4>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: scoreColor(p.match) }}>{p.match}% match</span>
                </div>
                <ProgressBar value={p.match} />
              </div>
            ))
          }
        </div>
      </div>

      {advice?.skillGaps?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Skill Gaps to Fill</h3>
          <div className="grid-3">
            {advice.skillGaps.map((g, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 6 }}>{g.skill}</div>
                <p style={{ fontSize: '0.8rem', marginBottom: 12 }}>{g.reason}</p>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/learning')}>Browse Courses</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(52,217,155,0.25)', background: 'rgba(52,217,155,0.04)', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>&#128161;</div>
        <h3 style={{ marginBottom: 10, color: 'var(--accent-green)' }}>Your AI Career Insight</h3>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 600, margin: '0 auto 20px', color: 'var(--text-secondary)' }}>{motivationMsg}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/learning')}>Browse Courses</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/jobs')}>Browse Jobs</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/roadmap')}>View Roadmap</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
