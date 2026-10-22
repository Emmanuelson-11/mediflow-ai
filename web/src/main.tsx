import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main>
      <div className="banner">Prototype with synthetic data. Not for clinical use.</div>
      <aside><strong>MediFlow AI</strong><nav>Overview<br />Notes<br />Guidelines<br />Appointments<br />Messages<br />Claims</nav></aside>
      <section><header><span>Overview</span><select defaultValue="doctor"><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="admin">Admin</option></select></header>
        <h1>Clinical workflow overview</h1><p className="muted">A calm foundation for human-approved clinical work.</p>
        <div className="cards"><article><small>Patients</small><b>10</b><span>Demo records ready</span></article><article><small>AI mode</small><b>Replay</b><span>No live API calls</span></article><article><small>Approvals</small><b>Human-led</b><span>Every final action is reviewable</span></article></div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
