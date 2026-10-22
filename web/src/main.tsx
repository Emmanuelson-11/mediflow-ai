import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type Transcript = {
  id: string;
  patient_name: string;
  consultation_date: string;
  clinic: string;
  status: string;
};

type Note = Record<string, unknown> & {
  diagnosis?: string | null;
  diagnosis_code?: string | null;
  plan?: string | null;
  follow_up_date?: string | null;
};

type Detail = Transcript & {
  text: string;
  note: Note | null;
  generated_by: string | null;
  follow_up: { date: string; action: string; status: string; reason: string } | null;
};

const API = "/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", "X-Role": "doctor" },
    ...options,
  });
  if (!response.ok) throw new Error((await response.json()).detail ?? "Request failed");
  return response.json();
}

function App() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadList = async () => {
    const result = await request<{ items: Transcript[] }>("/scribe/transcripts");
    setTranscripts(result.items);
    if (!selected && result.items[0]) await loadDetail(result.items[0].id);
  };

  const loadDetail = async (id: string) => {
    setMessage("");
    setSelected(await request<Detail>(`/scribe/transcripts/${id}`));
  };

  useEffect(() => {
    loadList().catch((error) => setMessage(error.message));
  }, []);

  const generate = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await request(`/scribe/transcripts/${selected.id}/generate`, { method: "POST" });
      await loadDetail(selected.id);
      await loadList();
      setMessage("AI draft generated in replay mode.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const updateField = (field: string, value: string) => {
    if (selected?.note) setSelected({ ...selected, note: { ...selected.note, [field]: value } });
  };

  const saveField = async (field: string, value: string) => {
    if (!selected?.note) return;
    await request(`/scribe/notes/note-${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({ fields: { [field]: value } }),
    });
    setMessage("Draft saved. Approval is still required.");
  };

  const approve = async () => {
    if (!selected?.note) return;
    setBusy(true);
    try {
      const result = await request<{ follow_up: Detail["follow_up"]; note: Note }>(
        `/scribe/notes/note-${selected.id}/approve`,
        { method: "POST", body: JSON.stringify({ fields: selected.note }) },
      );
      setSelected({ ...selected, status: "approved", note: result.note, follow_up: result.follow_up });
      await loadList();
      setMessage("Note approved and follow-up action proposed.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main>
      <div className="banner">Prototype with synthetic data. Not for clinical use.</div>
      <aside>
        <div className="brand"><span className="mark">✚</span><strong>MediFlow AI</strong></div>
        <p className="eyebrow">CLINIC CONSOLE</p>
        <nav><a className="active">Notes <span>{transcripts.length}</span></a><a>Guidelines <em>Under construction</em></a><a>Appointments <em>Preview</em></a><a>Messages <em>Under construction</em></a><a>Claims <em>Under construction</em></a></nav>
        <div className="side-foot"><span className="dot" />Replay mode · no live calls</div>
      </aside>
      <section className="content">
        <header><div><span className="crumb">Notes / </span><b>Today's consultations</b></div><select defaultValue="doctor"><option value="doctor">Doctor · Dr Mensah</option><option value="nurse">Nurse</option><option value="admin">Admin</option></select></header>
        <div className="intro"><div><p className="eyebrow">SCRIBE · M1</p><h1>Review clinical notes</h1><p className="muted">Turn a consultation transcript into a structured draft. Nothing becomes official without your approval.</p></div><div className="trust"><b>Human approval gate</b><span>AI drafts stay editable until approved</span></div></div>
        {message && <div className="notice">{message}</div>}
        <div className="workspace">
          <div className="list-panel"><div className="panel-title"><b>Consultations</b><span>{transcripts.length} synthetic</span></div>{transcripts.map((item) => <button className={`list-row ${selected?.id === item.id ? "selected" : ""}`} key={item.id} onClick={() => loadDetail(item.id)}><span><b>{item.patient_name}</b><small>{item.consultation_date} · {item.id}</small></span><Status status={item.status} /></button>)}</div>
          {selected && <div className="review">
            <div className="review-head"><div><p className="eyebrow">TRANSCRIPT {selected.id}</p><h2>{selected.patient_name}</h2><span className="muted">{selected.consultation_date} · {selected.clinic}</span></div><div className="actions">{!selected.note && <button className="primary" onClick={generate} disabled={busy}>Generate AI draft</button>}{selected.note && selected.status !== "approved" && <button className="primary" onClick={approve} disabled={busy}>Approve note</button>}<Status status={selected.status} /></div></div>
            <div className="columns"><article className="source"><div className="panel-title"><b>Source transcript</b><span>Identity visible to clinician</span></div><p>{selected.text}</p><div className="source-foot">Patient details are masked before any AI boundary.</div></article><article className="draft"><div className="panel-title"><b>AI draft</b><span>{selected.generated_by === "replay" ? "Replay fixture · scribe_v1" : "Manual fallback"}</span></div>{selected.note ? <><Editable label="Diagnosis" field="diagnosis" value={selected.note.diagnosis} update={updateField} save={saveField} /><Editable label="ICD-10 code" field="diagnosis_code" value={selected.note.diagnosis_code} update={updateField} save={saveField} mono /><Editable label="Plan" field="plan" value={selected.note.plan} update={updateField} save={saveField} /><Editable label="Follow-up date" field="follow_up_date" value={selected.note.follow_up_date} update={updateField} save={saveField} /><div className="flag"><b>Review before approval</b><span>Every AI draft is editable and requires a clinician decision.</span></div></> : <div className="empty"><b>Ready to generate</b><span>Generate a deterministic synthetic draft to begin the review.</span></div>}</article></div>
            {selected.follow_up && <div className="follow-up"><span className="check">✓</span><div><b>Follow-up appointment proposed</b><span>{selected.follow_up.date} · {selected.follow_up.reason}</span></div><Status status="proposed" /></div>}
          </div>}
        </div>
      </section>
    </main>
  );
}

function Status({ status }: { status: string }) {
  const label = status === "none" ? "No draft" : status.replace("_", " ");
  return <span className={`status ${status}`}>{label}</span>;
}

function Editable({ label, field, value, update, save, mono = false }: { label: string; field: string; value: unknown; update: (field: string, value: string) => void; save: (field: string, value: string) => void; mono?: boolean }) {
  const text = value == null ? "" : String(value);
  return <label className="field"><span>{label}<small>AI draft · click to edit</small></span><input className={mono ? "mono" : ""} value={text} placeholder="Not captured" onChange={(event) => update(field, event.target.value)} onBlur={(event) => save(field, event.target.value)} /></label>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
