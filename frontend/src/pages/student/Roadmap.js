import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';
import { useNavigate } from 'react-router-dom';

const STATUS = {
  not_started: { label: 'Not Started', color: '#64748b' },
  in_progress: { label: 'In Progress', color: '#f59e0b' },
  completed: { label: 'Completed', color: '#22c55e' },
};

// fallback roadmap
const DEFAULT_STEPS = [
  { id: 1, title: "Complete Profile", description: "Fill your personal & academic info", status: "not_started" },
  { id: 2, title: "Learn Skills", description: "HTML, CSS, JS, React", status: "not_started" },
  { id: 3, title: "Create CV", description: "Build professional CV", status: "not_started" },
  { id: 4, title: "Setup GitHub", description: "Upload projects", status: "not_started" },
  { id: 5, title: "Build Projects", description: "At least 2 projects", status: "not_started" },
  { id: 6, title: "Analyze CV", description: "Use AI CV checker", status: "not_started" },
  { id: 7, title: "Apply Jobs", description: "Start applying", status: "not_started" },
  { id: 8, title: "Get Hired", description: "Final goal 🚀", status: "not_started" },
];

export default function Roadmap() {
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    try {
      const { data } = await studentAPI.getRoadmap();

      if (data?.steps?.length > 0) {
        setSteps(data.steps);
      } else {
        setSteps(DEFAULT_STEPS);
      }
    } catch (err) {
      console.error(err);
      setSteps(DEFAULT_STEPS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ✅ FIXED: instant UI update + backend sync
  async function updateStep(id, status) {
    setSteps(prev =>
      prev.map(step =>
        step.id === id ? { ...step, status } : step
      )
    );

    try {
      await studentAPI.updateStep(id, { status });
    } catch (err) {
      console.error(err);
    }
  }

  // ✅ normalize statuses safely
  const normalizedSteps = steps.map(s => ({
    ...s,
    status: (s.status || '').toLowerCase()
  }));

  const completed = normalizedSteps.filter(
    s => s.status === 'completed'
  ).length;

  const percent = Math.round(
    (completed / normalizedSteps.length) * 100
  );

  // ✅ Option 2: full completion detection
  const allCompleted = normalizedSteps.every(
    s => s.status === 'completed'
  );

  const current = allCompleted
    ? "🎉 Roadmap Completed"
    : normalizedSteps.find(
        s => s.status !== 'completed'
      )?.title || "";

  return (
    <DashboardLayout>

      {/* HEADER */}
      <h1>🗺️ Career Roadmap</h1>
      <p>Your journey to become job-ready developer</p>

      {/* PROGRESS */}
      <div className="card">
        <h3>🎯 Career Progress</h3>
        <h2>{percent}%</h2>
        <p>{current}</p>

        <div style={{
          height: 10,
          background: '#1f2937',
          borderRadius: 10,
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg,#4f46e5,#22c55e)'
          }} />
        </div>

        <p>{completed} / {steps.length} completed</p>

        {/* ✅ Completion message */}
        {allCompleted && (
          <div style={{
            marginTop: 12,
            color: '#34D99B',
            fontWeight: 600,
            textAlign: 'center'
          }}>
            🏆 Congratulations! You completed your entire roadmap.
          </div>
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* STEPS */}
          {normalizedSteps.map((step, i) => {

            const key = step.status;
            const s = STATUS[key] || STATUS.not_started;

            return (
              <div
                key={step.id}
                className="card"
                style={{
                  borderLeft: `5px solid ${s.color}`,
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >

                {/* LEFT */}
                <div>
                  <h3>
                    {key === 'completed' ? '✅' : i + 1} {step.title}
                  </h3>

                  <p>{step.description}</p>

                  <span style={{ color: s.color }}>
                    {s.label}
                  </span>
                </div>

                {/* RIGHT */}
                <select
                  value={key || 'not_started'}
                  onChange={(e) =>
                    updateStep(step.id, e.target.value)
                  }
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#111827',
                    color: '#fff',
                    border: '1px solid #2a3142'
                  }}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

              </div>
            );
          })}
        </>
      )}

      {/* ACTIONS */}
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => navigate('/student/jobs')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: 'linear-gradient(135deg, #34D99B, #22c55e)',
            color: '#04130c',
            boxShadow: '0 2px 12px rgba(52,217,155,0.35)'
          }}
        >
          💼 Find Jobs
        </button>

        <button
          onClick={() => navigate('/student/learning')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: 'transparent',
            color: '#8A9BBE',
            border: '1px solid rgba(99,120,180,0.18)'
          }}
        >
          📚 Courses
        </button>

        <button
          onClick={() => navigate('/student/profile')}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            background: 'transparent',
            color: '#8A9BBE',
            border: '1px solid rgba(99,120,180,0.18)'
          }}
        >
          👤 Improve Profile
        </button>
      </div>

    </DashboardLayout>
  );
}