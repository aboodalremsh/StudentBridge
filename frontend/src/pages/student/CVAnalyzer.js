import { useState, useEffect } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { studentAPI } from "../../services";

export default function CVAnalyzer() {
  // Local state (no props needed)
  const [cvText, setCvText] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [tab, setTab] = useState("analyze");

  // Load history when component mounts
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { data } = await studentAPI.getCVHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.log("Failed to load history");
    }
  }

  async function handleAnalyze(e) {
    e.preventDefault();

    if (!cvText.trim()) {
      return setMsg({
        type: "error",
        text: "Please paste your CV text first."
      });
    }

    setAnalyzing(true);
    setResult(null);
    setMsg({ type: "", text: "" });

    try {
      const { data } = await studentAPI.analyzeCV(cvText);
      setResult(data.analysis);

      // Refresh history after analysis
      loadHistory();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Analysis failed."
      });
    } finally {
      setAnalyzing(false);
    }
  }

  const ScoreRing = ({ score }) => {
    const color =
      score >= 75
        ? "var(--accent-green)"
        : score >= 50
        ? "var(--accent-amber)"
        : "var(--accent-red)";

    return (
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: `6px solid ${color}`,
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: `0 0 24px ${color}33`
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 800,
            color,
            lineHeight: 1
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          /100
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>CV Analyzer</h1>
        <p className="subtitle">
          Paste your CV to get a score and improvement tips
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          ["analyze", "🔍 Analyze CV"],
          ["history", "📋 History"]
        ].map(([t, label]) => (
          <button
            key={t}
            className={`btn btn-sm ${
              tab === t ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setTab(t)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ANALYZE TAB */}
      {tab === "analyze" && (
        <div className="grid-2" style={{ gap: 24 }}>
          <form onSubmit={handleAnalyze}>
            {msg.text && (
              <div className={`alert alert-${msg.type}`}>
                {msg.text}
              </div>
            )}

            <div className="form-group">
              <label>Paste your CV / Resume text</label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                style={{
                  minHeight: 400,
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  lineHeight: 1.6
                }}
                placeholder="Paste your full CV text here — include Experience, Education, Skills, Projects…"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={analyzing}
            >
              {analyzing ? "🔍 Analyzing…" : "🚀 Analyze My CV"}
            </button>
          </form>

          <div>
            {analyzing && (
              <div
                className="card"
                style={{ textAlign: "center", padding: 60 }}
              >
                <div className="spinner" style={{ margin: "0 auto 16px" }} />
                <p>Analyzing your CV…</p>
              </div>
            )}

            {result && !analyzing && (
              <div>
                <div
                  className="card"
                  style={{ textAlign: "center", marginBottom: 16 }}
                >
                  <h3 style={{ marginBottom: 16 }}>CV Score</h3>
                  <ScoreRing score={result.score} />

                  <p style={{ fontSize: "0.85rem" }}>
                    {result.score >= 75
                      ? "🟢 Strong CV! Minor improvements can perfect it."
                      : result.score >= 50
                      ? "🟡 Average CV. Several improvements recommended."
                      : "🔴 Needs significant improvement before sending to companies."}
                  </p>
                </div>

                {result.strengths?.length > 0 && (
                  <div className="card">
                    <h4 style={{ color: "var(--accent-green)" }}>
                      ✅ Strengths
                    </h4>
                    {result.strengths.map((s, i) => (
                      <div key={i}>{s}</div>
                    ))}
                  </div>
                )}

                {result.weaknesses?.length > 0 && (
                  <div className="card">
                    <h4 style={{ color: "var(--accent-red)" }}>
                      ❌ Weaknesses
                    </h4>
                    {result.weaknesses.map((w, i) => (
                      <div key={i}>{w}</div>
                    ))}
                  </div>
                )}

                {result.suggestions?.length > 0 && (
                  <div className="card">
                    <h4 style={{ color: "var(--accent-primary)" }}>
                      💡 Suggestions
                    </h4>
                    {result.suggestions.map((s, i) => (
                      <div key={i}>{s}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        history.length === 0 ? (
          <div className="empty-state card">
            <p>No CV analysis history yet.</p>
          </div>
        ) : (
          <div className="grid-3">
            {history.map((h) => (
              <div key={h.id} className="card">
                <div style={{ marginBottom: 10 }}>
                  <span>
                    {new Date(h.analyzed_at).toLocaleDateString()}
                  </span>
                  <span style={{ fontWeight: 800 }}>
                    {h.score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </DashboardLayout>
  );
}