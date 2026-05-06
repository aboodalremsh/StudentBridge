import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { learningAPI } from '../../services';

export default function Certificates() {
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    learningAPI.getMyCerts().then(({data})=>setCerts(data.certificates)).finally(()=>setLoading(false));
  }, []);

  function printCert(cert) {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Certificate</title>
    <style>body{margin:0;font-family:Georgia,serif;background:#0C1631;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .cert{border:3px solid #4F8EF7;border-radius:16px;padding:60px;max-width:700px;text-align:center;background:linear-gradient(135deg,#0C1631,#1A2F5E);}
    h1{font-size:.9rem;letter-spacing:.2em;text-transform:uppercase;color:#8A9BBE;}
    h2{font-size:2.5rem;color:#EAF0FF;margin:8px 0;}
    .course{font-size:1.5rem;color:#4F8EF7;font-weight:700;margin:16px 0 30px;}
    .uid{font-family:monospace;font-size:.7rem;color:#4E5F7A;margin-top:8px;}
    </style></head><body><div class="cert">
    <h1>Certificate of Completion</h1>
    <div style="font-size:3rem;margin:20px 0">🏆</div>
    <p style="color:#8A9BBE">This certifies that</p>
    <h2>${cert.student_name || 'Student'}</h2>
    <p style="color:#8A9BBE">completed</p>
    <div class="course">${cert.course_title}</div>
    <p style="color:#8A9BBE;font-size:.85rem">Instructor: ${cert.instructor} · Issued: ${new Date(cert.issued_at).toLocaleDateString()}</p>
    <div class="uid">ID: ${cert.certificate_uid}</div>
    </div></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  return (
    <DashboardLayout>
      <div className="page-header"><h1>My Certificates</h1><p className="subtitle">Download and share your achievements</p></div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : certs.length === 0 ? <div className="empty-state card"><p style={{ fontSize:'3rem', marginBottom:12 }}>🏆</p><p>No certificates yet. Complete a course to earn one!</p></div>
      : (
        <div className="grid-2">
          {certs.map(cert => (
            <div key={cert.id} className="card" style={{ background:'linear-gradient(135deg,#0C1631,#1A2F5E)', border:'1px solid rgba(79,142,247,0.4)' }}>
              <div style={{ fontSize:'2rem', marginBottom:12 }}>🏆</div>
              <div style={{ fontSize:'0.72rem', color:'var(--accent-primary)', fontFamily:'var(--font-display)', fontWeight:700, letterSpacing:'0.1em', marginBottom:8 }}>CERTIFICATE OF COMPLETION</div>
              <h3>{cert.course_title}</h3>
              <p style={{ fontSize:'0.83rem', marginTop:4 }}>Instructor: {cert.instructor}</p>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', margin:'8px 0 12px' }}>Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
              <div style={{ fontFamily:'monospace', fontSize:'0.7rem', color:'var(--text-muted)', background:'var(--bg-surface)', padding:'4px 8px', borderRadius:4, marginBottom:14 }}>
                ID: {cert.certificate_uid}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={()=>printCert(cert)}>🖨️ Print</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setViewing(cert)}>👁 Preview</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setViewing(null)}>
          <div className="modal" style={{ maxWidth:520, textAlign:'center', background:'linear-gradient(135deg,#0C1631,#1A2F5E)', border:'2px solid #4F8EF7' }}>
            <button className="modal-close" onClick={()=>setViewing(null)}>✕</button>
            <div style={{ fontSize:'3rem', margin:'16px 0' }}>🏆</div>
            <div style={{ color:'var(--accent-primary)', fontFamily:'var(--font-display)', fontWeight:700, letterSpacing:'0.15em', fontSize:'0.8rem', textTransform:'uppercase', marginBottom:16 }}>Certificate of Completion</div>
            <p style={{ color:'var(--text-secondary)', marginBottom:8 }}>This certifies that</p>
            <h2 style={{ fontSize:'1.8rem', marginBottom:8 }}>{viewing.student_name}</h2>
            <p style={{ color:'var(--text-secondary)', marginBottom:8 }}>completed</p>
            <h3 style={{ color:'var(--accent-primary)', marginBottom:20 }}>{viewing.course_title}</h3>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Issued {new Date(viewing.issued_at).toLocaleDateString()}</p>
            <div style={{ fontFamily:'monospace', fontSize:'0.7rem', color:'var(--text-muted)', marginTop:8 }}>{viewing.certificate_uid}</div>
            <button className="btn btn-primary" style={{ marginTop:20 }} onClick={()=>printCert(viewing)}>🖨️ Print</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
