import { useEffect, useMemo, useState, type ReactNode } from 'react'

type IconName =
  | 'activity'
  | 'arrow'
  | 'bell'
  | 'book'
  | 'calendar'
  | 'check'
  | 'chevron'
  | 'clipboard'
  | 'clock'
  | 'file'
  | 'grid'
  | 'heart'
  | 'inbox'
  | 'lock'
  | 'menu'
  | 'message'
  | 'more'
  | 'plus'
  | 'refresh'
  | 'search'
  | 'spark'
  | 'users'
  | 'x'

type Role = 'Doctor' | 'Nurse' | 'Front desk' | 'Billing' | 'Admin'
type Status = 'Approved' | 'Needs attention' | 'AI draft' | 'Not started'

type NavItem = {
  label: string
  icon: IconName
  count?: number
  roles: Role[]
}

type Consultation = {
  name: string
  initials: string
  reason: string
  time: string
  status: Status
  tone: 'green' | 'amber' | 'teal' | 'slate'
}

type Transcript = {
  id: string
  patient_name: string
  consultation_date: string
  clinic: string
  status: string
}

type Note = {
  diagnosis?: string | null
  diagnosis_code?: string | null
  plan?: string | null
  follow_up_date?: string | null
}

type TranscriptDetail = Transcript & {
  text: string
  note: Note | null
  generated_by: string | null
  follow_up: { date: string; action: string; status: string; reason: string } | null
}

const roles: Role[] = ['Doctor', 'Nurse', 'Front desk', 'Billing', 'Admin']

const navItems: NavItem[] = [
  { label: 'Overview', icon: 'grid', roles },
  { label: 'Consultations', icon: 'clipboard', count: 10, roles: ['Doctor', 'Admin'] },
  { label: 'Care plans', icon: 'heart', count: 3, roles: ['Nurse', 'Admin'] },
  { label: 'Schedule', icon: 'calendar', count: 8, roles: ['Front desk', 'Admin'] },
  { label: 'Claims queue', icon: 'file', count: 6, roles: ['Billing', 'Admin'] },
  { label: 'Patient chat', icon: 'message', roles: ['Nurse', 'Admin'] },
  { label: 'Ask guidelines', icon: 'book', roles },
]

const operationsItems: NavItem[] = [
  { label: 'Alerts', icon: 'bell', count: 2, roles: ['Nurse', 'Admin'] },
  { label: 'Nurse inbox', icon: 'inbox', count: 4, roles: ['Nurse', 'Admin'] },
  { label: 'Outbox', icon: 'arrow', count: 2, roles: ['Nurse', 'Admin'] },
]

const adminItems: NavItem[] = [
  { label: 'Knowledge base', icon: 'book', roles: ['Admin'] },
  { label: 'Results', icon: 'activity', roles: ['Admin'] },
  { label: 'Demo controls', icon: 'refresh', roles: ['Admin'] },
]

const consultations: Consultation[] = [
  { name: 'Ama Mensah', initials: 'AM', reason: 'Malaria follow-up', time: '09:40', status: 'Needs attention', tone: 'amber' },
  { name: 'Kofi Owusu', initials: 'KO', reason: 'Hypertension review', time: '10:15', status: 'AI draft', tone: 'teal' },
  { name: 'Esi Boateng', initials: 'EB', reason: 'New patient · fatigue', time: '11:00', status: 'Not started', tone: 'slate' },
  { name: 'Yaw Asare', initials: 'YA', reason: 'Diabetes review', time: '11:30', status: 'Approved', tone: 'green' },
]

const roleDescriptions: Record<Role, string> = {
  Doctor: 'Review notes and keep every decision grounded in the visit.',
  Nurse: 'Triage alerts, approve plans, and protect the patient handoff.',
  'Front desk': 'Focus on follow-ups, reminders, and attendance signals.',
  Billing: 'Resolve claim flags before they reach NHIS vetting.',
  Admin: 'See the full demo, evidence, and system controls.',
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<IconName, ReactNode> = {
    activity: <><path d="M3 12h4l2.2-7 4.1 14 2.2-7H21" /></>,
    arrow: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16" /></>,
    calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 9h18" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8 10h8M8 14h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h5" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    heart: <><path d="M20.8 8.6c0 5.4-8.8 10.3-8.8 10.3S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" /></>,
    inbox: <><path d="M4 4h16v16H4z" /><path d="M4 14h4l2 3h4l2-3h4" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-4-.9L4 20l1.4-3.3A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.8-4L3 10" /><path d="M3 5v5h5M4 13a8 8 0 0 0 14.8 4L21 14" /><path d="M21 19v-5h-5" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 11a3 3 0 1 0 0-6M21 21v-2a4 4 0 0 0-3-3.9" /></>,
    x: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }
  return <svg aria-hidden="true" {...common}>{paths[name]}</svg>
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Approved: 'badge badge-success',
    'Needs attention': 'badge badge-warning',
    'AI draft': 'badge badge-teal',
    'Not started': 'badge badge-neutral',
  }
  return <span className={styles[status]}>{status === 'Approved' && <Icon name="check" size={13} />}{status}</span>
}

function App() {
  const [role, setRole] = useState<Role>('Doctor')
  const [active, setActive] = useState('Overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [notice, setNotice] = useState('')

  const visiblePrimary = useMemo(() => navItems.filter((item) => item.roles.includes(role)), [role])
  const visibleOps = useMemo(() => operationsItems.filter((item) => item.roles.includes(role)), [role])
  const visibleAdmin = useMemo(() => adminItems.filter((item) => item.roles.includes(role)), [role])

  const selectRole = (nextRole: Role) => {
    setRole(nextRole)
    setShowRoleMenu(false)
    setActive('Overview')
    setNotice(`Demo view switched to ${nextRole}.`)
  }

  const openDemo = (label: string) => {
    setActive(label)
    setMobileNav(false)
    const underConstruction = ['Care plans', 'Schedule', 'Claims queue', 'Patient chat', 'Ask guidelines', 'Alerts', 'Nurse inbox', 'Outbox', 'Knowledge base', 'Results', 'Demo controls']
    setNotice(underConstruction.includes(label)
      ? `${label} is under construction in this MVP. The navigation and demo state are ready for the next build slice.`
      : `${label} is ready for the next workflow step.`)
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="prototype-banner">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-2 px-4 py-2 text-center">
          <Icon name="lock" size={13} />
          <span>Prototype with synthetic data. Not for clinical use.</span>
          <span className="hidden text-white/60 sm:inline">·</span>
          <span className="hidden text-white/70 sm:inline">All names and events are fictional.</span>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-33px)]">
        <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
          <div className="flex items-center justify-between px-5 pb-8 pt-6">
            <button className="brand" onClick={() => openDemo('Overview')} aria-label="Go to MediFlow overview">
              <span className="brand-mark"><span /><span /></span>
              <span>
                <strong>MediFlow</strong>
                <small>AI operations</small>
              </span>
            </button>
            <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation">
              <Icon name="x" size={18} />
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="Primary navigation">
            <p className="nav-label">Workspace</p>
            {visiblePrimary.map((item) => <NavLink key={item.label} item={item} active={active} onClick={openDemo} />)}
            {visibleOps.length > 0 && <>
              <p className="nav-label nav-label-spaced">Operations</p>
              {visibleOps.map((item) => <NavLink key={item.label} item={item} active={active} onClick={openDemo} />)}
            </>}
            {visibleAdmin.length > 0 && <>
              <p className="nav-label nav-label-spaced">Review & controls</p>
              {visibleAdmin.map((item) => <NavLink key={item.label} item={item} active={active} onClick={openDemo} />)}
            </>}
          </nav>

          <div className="mt-auto px-4 pb-5">
            <div className="sidebar-help">
              <span className="help-icon"><Icon name="spark" size={16} /></span>
              <div>
                <strong>Demo mode</strong>
                <p>Replay is on. No patient data leaves this browser.</p>
              </div>
            </div>
            <div className="user-chip">
              <span className="avatar avatar-teal">NA</span>
              <div className="min-w-0 flex-1"><strong>Nana Addo</strong><span>{role}</span></div>
              <Icon name="more" size={17} />
            </div>
          </div>
        </aside>

        {mobileNav && <button className="mobile-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation overlay" />}

        <main className="min-w-0 flex-1">
          <header className="topbar">
            <div className="flex items-center gap-3">
              <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Icon name="menu" size={20} /></button>
              <div className="breadcrumbs"><span>Clinic workspace</span><Icon name="chevron" size={13} /><strong>{active}</strong></div>
            </div>
            <div className="topbar-actions">
              <button className="topbar-icon" aria-label="Search"><Icon name="search" size={18} /></button>
              <button className="topbar-icon notification-button" aria-label="Notifications"><Icon name="bell" size={18} /><span /></button>
              <div className="role-switcher-wrap">
                <button className="role-switcher" onClick={() => setShowRoleMenu(!showRoleMenu)} aria-expanded={showRoleMenu}>
                  <span className="avatar avatar-small">{role.slice(0, 1)}</span>
                  <span className="hidden sm:block"><small>Viewing as</small><strong>{role}</strong></span>
                  <Icon name="chevron" size={14} />
                </button>
                {showRoleMenu && <div className="role-menu">
                  <p>Switch demo role</p>
                  {roles.map((item) => <button key={item} className={item === role ? 'role-option selected' : 'role-option'} onClick={() => selectRole(item)}><span className="avatar avatar-small">{item.slice(0, 1)}</span><span>{item}</span>{item === role && <Icon name="check" size={15} />}</button>)}
                </div>}
              </div>
            </div>
          </header>

          <div className="content-shell">
            {notice && <div className="toast" role="status"><Icon name="check" size={15} /><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification"><Icon name="x" size={14} /></button></div>}
            <div className="page-heading">
              <div>
                <p className="eyebrow"><span className="eyebrow-dot" /> Tuesday, 18 June 2024 <span className="eyebrow-separator">·</span> Accra clinic</p>
                <h1>Good morning, Nana</h1>
                <p className="heading-copy">{roleDescriptions[role]}</p>
              </div>
              <div className="heading-actions">
                <button className="button button-secondary" onClick={() => setNotice('Demo reset is available from Demo controls.') }><Icon name="refresh" size={16} /> <span className="hidden sm:inline">Reset demo</span></button>
                <button className="button button-primary" onClick={() => openDemo(role === 'Doctor' ? 'Consultations' : 'Overview')}><Icon name="plus" size={17} /> <span>Start workflow</span></button>
              </div>
            </div>

            {active !== 'Overview' && active !== 'Consultations' && <UnderConstructionView label={active} role={role} />}
            {active === 'Consultations' && <ScribeWorkspace role={role} />}
            <div className={active !== 'Overview' && active !== 'Consultations' ? 'dashboard-hidden' : ''}>
            {active === 'Consultations' && <div className="view-context"><span className="view-context-icon"><Icon name="clipboard" size={17} /></span><div><strong>Consultations workspace</strong><span>Review today’s masked transcripts and move the next note forward.</span></div><span className="view-context-count">10 today</span></div>}
            <section className="hero-grid">
              <div className="hero-card">
                <div className="hero-card-top">
                  <div>
                    <span className="section-kicker"><Icon name="spark" size={14} /> Today at a glance</span>
                    <h2>Keep the clinic moving,<br /><em>one clear decision at a time.</em></h2>
                    <p>MediFlow brings the next safe action into focus while keeping sources, flags, and human approval visible.</p>
                  </div>
                  <div className="hero-orbit" aria-hidden="true"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-core"><Icon name="heart" size={25} /></span><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /></div>
                </div>
                <div className="hero-footer"><span><Icon name="lock" size={14} /> Synthetic replay · updated just now</span><button onClick={() => openDemo('Consultations')}>Follow Ama's journey <Icon name="arrow" size={15} /></button></div>
              </div>
              <div className="priority-card">
                <div className="card-heading"><div><span className="section-kicker">Needs your attention</span><h3>2 items are waiting</h3></div><button className="more-button" aria-label="More attention options"><Icon name="more" size={18} /></button></div>
                <div className="priority-item priority-critical"><span className="priority-icon"><Icon name="bell" size={17} /></span><div><strong>Emergency alert</strong><p>Chest pain message from <b>AB-204</b></p></div><Icon name="chevron" size={15} /></div>
                <div className="priority-item priority-amber"><span className="priority-icon"><Icon name="clipboard" size={17} /></span><div><strong>Ama's note needs review</strong><p>2 fields flagged before approval</p></div><Icon name="chevron" size={15} /></div>
                <button className="text-link" onClick={() => openDemo('Alerts')}>View all attention items <Icon name="arrow" size={14} /></button>
              </div>
            </section>

            <section className="metric-grid" aria-label="Clinic metrics">
              <MetricCard label="Today's consultations" value="10" detail="4 notes still open" icon="clipboard" accent="teal" />
              <MetricCard label="Follow-ups this week" value="18" detail="3 high no-show risk" icon="calendar" accent="amber" />
              <MetricCard label="Claims to review" value="06" detail="2 blocking errors" icon="file" accent="red" />
              <MetricCard label="Messages awaiting reply" value="04" detail="1 clinical handoff" icon="message" accent="purple" />
            </section>

            <section className="dashboard-grid">
              <div className="surface-card consultations-card">
                <div className="card-heading card-heading-spaced"><div><span className="section-kicker">Doctor workspace</span><h2>Today's consultations</h2></div><button className="text-link" onClick={() => openDemo('Consultations')}>View all <Icon name="arrow" size={14} /></button></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Patient</th><th>Reason</th><th>Time</th><th>Status</th><th /></tr></thead>
                    <tbody>{consultations.map((item) => <tr key={item.name} onClick={() => openDemo('Consultations')}><td><div className="patient-cell"><span className={`avatar avatar-${item.tone}`}>{item.initials}</span><strong>{item.name}</strong></div></td><td>{item.reason}</td><td className="time-cell"><Icon name="clock" size={14} />{item.time}</td><td><StatusBadge status={item.status} /></td><td><button className="row-action" aria-label={`Open ${item.name}`}><Icon name="chevron" size={16} /></button></td></tr>)}</tbody>
                  </table>
                </div>
                <div className="table-footer"><span><b>4</b> of 10 consultations shown</span><button className="pagination-button" aria-label="Next page"><Icon name="arrow" size={15} /></button></div>
              </div>
              <div className="surface-card demo-card">
                <div className="demo-card-visual"><div className="demo-visual-bar"><span /><span /><span /></div><div className="demo-visual-body"><div className="demo-line wide" /><div className="demo-line" /><div className="demo-line short" /><div className="demo-check"><span><Icon name="check" size={12} /></span><div className="demo-line" /></div><div className="demo-line wide" /></div><span className="demo-float-note"><Icon name="spark" size={14} /> AI draft</span></div>
                <div className="demo-card-copy"><span className="section-kicker">A guided demo</span><h2>See Ama's full journey</h2><p>From a masked transcript to a human-approved follow-up, explore the workflow that connects every team.</p><button className="button button-primary button-full" onClick={() => openDemo('Consultations')}>Open demo journey <Icon name="arrow" size={16} /></button></div>
              </div>
            </section>

            <section className="bottom-grid">
              <div className="surface-card">
                <div className="card-heading card-heading-spaced"><div><span className="section-kicker">System pulse</span><h2>Trust signals</h2></div><span className="live-pill"><span /> Replay mode</span></div>
                <div className="trust-list"><TrustRow icon="lock" title="Patient identity masking" detail="All demo text is masked before AI steps" status="On" /><TrustRow icon="book" title="Guideline sources" detail="3 clinic documents indexed" status="Ready" /><TrustRow icon="activity" title="Audit trail" detail="Every draft and approval is recorded" status="Live" /></div>
              </div>
              <div className="surface-card quick-card"><div className="card-heading card-heading-spaced"><div><span className="section-kicker">Quick access</span><h2>Pick up where you left off</h2></div></div><div className="quick-links"><button onClick={() => openDemo('Consultations')}><span className="quick-icon teal-bg"><Icon name="clipboard" size={17} /></span><span><strong>Review Ama's note</strong><small>2 amber fields · 4 min ago</small></span><Icon name="chevron" size={15} /></button><button onClick={() => openDemo('Ask guidelines')}><span className="quick-icon purple-bg"><Icon name="book" size={17} /></span><span><strong>Ask a guideline question</strong><small>Search 3 trusted documents</small></span><Icon name="chevron" size={15} /></button></div></div>
            </section>

            <footer className="page-footer"><span>© 2024 MediFlow AI <span className="footer-dot">·</span> Prototype workspace</span><span><Icon name="lock" size={13} /> Built for safe, human-led care operations</span></footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function NavLink({ item, active, onClick }: { item: NavItem; active: string; onClick: (label: string) => void }) {
  return <button className={`nav-link ${item.label === active ? 'nav-link-active' : ''}`} onClick={() => onClick(item.label)}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.count && <span className="nav-count">{item.count}</span>}</button>
}

function MetricCard({ label, value, detail, icon, accent }: { label: string; value: string; detail: string; icon: IconName; accent: 'teal' | 'amber' | 'red' | 'purple' }) {
  return <div className="metric-card"><span className={`metric-icon ${accent}-bg`}><Icon name={icon} size={18} /></span><div className="metric-copy"><p>{label}</p><strong>{value}</strong><span className={`metric-detail ${accent === 'red' ? 'detail-red' : accent === 'amber' ? 'detail-amber' : ''}`}>{detail}</span></div><Icon name="more" size={17} /></div>
}

function TrustRow({ icon, title, detail, status }: { icon: IconName; title: string; detail: string; status: string }) {
  return <div className="trust-row"><span className="trust-icon"><Icon name={icon} size={16} /></span><div><strong>{title}</strong><p>{detail}</p></div><span className="trust-status"><Icon name="check" size={13} /> {status}</span></div>
}

function UnderConstructionView({ label, role }: { label: string; role: Role }) {
  return <section className="under-construction">
    <span className="under-construction-icon"><Icon name="spark" size={22} /></span>
    <span className="section-kicker">MVP preview · {role} view</span>
    <h2>{label} is under construction</h2>
    <p>This clickable shell marks the workflow boundary honestly. Mock records and approvals will land here in the next build slice.</p>
    <div className="under-construction-meta"><span><Icon name="lock" size={14} /> No API calls</span><span><Icon name="file" size={14} /> Synthetic data only</span></div>
  </section>
}

function ScribeWorkspace({ role }: { role: Role }) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [selected, setSelected] = useState<TranscriptDetail | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const request = async <T,>(path: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`/api/v1${path}`, {
      headers: { 'Content-Type': 'application/json', 'X-Role': role.toLowerCase().replace(' ', '_') },
      ...options,
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.detail ?? 'Request failed')
    }
    return response.json() as Promise<T>
  }

  const loadDetail = async (id: string) => {
    setSelected(await request<TranscriptDetail>(`/scribe/transcripts/${id}`))
  }

  const loadList = async () => {
    const result = await request<{ items: Transcript[] }>('/scribe/transcripts')
    setTranscripts(result.items)
    if (!selected && result.items[0]) await loadDetail(result.items[0].id)
  }

  useEffect(() => {
    loadList().catch((error: Error) => setMessage(error.message))
  }, [])

  const generate = async () => {
    if (!selected) return
    setBusy(true)
    try {
      await request(`/scribe/transcripts/${selected.id}/generate`, { method: 'POST' })
      await loadDetail(selected.id)
      await loadList()
      setMessage('AI draft generated in replay mode.')
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const updateField = (field: keyof Note, value: string) => {
    if (selected?.note) setSelected({ ...selected, note: { ...selected.note, [field]: value } })
  }

  const saveField = async (field: keyof Note, value: string) => {
    if (!selected?.note) return
    try {
      await request(`/scribe/notes/note-${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ fields: { [field]: value } }),
      })
      setMessage('Draft saved. Approval is still required.')
    } catch (error) {
      setMessage((error as Error).message)
    }
  }

  const approve = async () => {
    if (!selected?.note) return
    setBusy(true)
    try {
      const result = await request<{ follow_up: TranscriptDetail['follow_up']; note: Note }>(
        `/scribe/notes/note-${selected.id}/approve`,
        { method: 'POST', body: JSON.stringify({ fields: selected.note }) },
      )
      setSelected({ ...selected, status: 'approved', note: result.note, follow_up: result.follow_up })
      await loadList()
      setMessage('Note approved and follow-up action proposed.')
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="scribe-workspace">
    {message && <div className="scribe-notice" role="status">{message}</div>}
    <div className="scribe-grid">
      <div className="scribe-list surface-card">
        <div className="card-heading card-heading-spaced"><div><span className="section-kicker">M1 · Scribe</span><h2>Consultations</h2></div><span className="live-pill"><span /> {transcripts.length} synthetic</span></div>
        {transcripts.map((item) => <button className={`scribe-row ${selected?.id === item.id ? 'scribe-row-active' : ''}`} key={item.id} onClick={() => loadDetail(item.id)}><span><strong>{item.patient_name}</strong><small>{item.consultation_date} · {item.id}</small></span><StatusBadge status={item.status === 'approved' ? 'Approved' : item.status === 'draft' ? 'AI draft' : 'Not started'} /></button>)}
      </div>
      {selected && <div className="scribe-review">
        <div className="scribe-review-head"><div><span className="section-kicker">Transcript {selected.id}</span><h2>{selected.patient_name}</h2><span className="scribe-muted">{selected.consultation_date} · {selected.clinic}</span></div><div className="scribe-actions">{!selected.note && <button className="button button-primary" onClick={generate} disabled={busy}>Generate AI draft</button>}{selected.note && selected.status !== 'approved' && <button className="button button-primary" onClick={approve} disabled={busy}>Approve note</button>}</div></div>
        <div className="scribe-columns">
          <article className="scribe-panel"><div className="scribe-panel-title"><strong>Source transcript</strong><span>Identity visible to clinician</span></div><p className="scribe-transcript">{selected.text}</p><div className="scribe-foot">Patient details are masked before any AI boundary.</div></article>
          <article className="scribe-panel"><div className="scribe-panel-title"><strong>AI draft</strong><span>{selected.generated_by === 'replay' ? 'Replay fixture · scribe_v1' : 'Manual fallback'}</span></div>{selected.note ? <><ScribeField label="Diagnosis" field="diagnosis" value={selected.note.diagnosis} update={updateField} save={saveField} /><ScribeField label="ICD-10 code" field="diagnosis_code" value={selected.note.diagnosis_code} update={updateField} save={saveField} /><ScribeField label="Plan" field="plan" value={selected.note.plan} update={updateField} save={saveField} /><ScribeField label="Follow-up date" field="follow_up_date" value={selected.note.follow_up_date} update={updateField} save={saveField} /><div className="scribe-flag"><strong>Review before approval</strong><span>Every AI draft is editable and requires a clinician decision.</span></div></> : <div className="scribe-empty"><strong>Ready to generate</strong><span>Generate a deterministic synthetic draft to begin the review.</span></div>}</article>
        </div>
        {selected.follow_up && <div className="scribe-follow-up"><Icon name="check" size={16} /><div><strong>Follow-up appointment proposed</strong><span>{selected.follow_up.date} · {selected.follow_up.reason}</span></div><StatusBadge status="Approved" /></div>}
      </div>}
    </div>
  </section>
}

function ScribeField({ label, field, value, update, save }: { label: string; field: keyof Note; value: unknown; update: (field: keyof Note, value: string) => void; save: (field: keyof Note, value: string) => void }) {
  return <label className="scribe-field"><span>{label}<small>AI draft · click to edit</small></span><input value={value == null ? '' : String(value)} placeholder="Not captured" onChange={(event) => update(field, event.target.value)} onBlur={(event) => save(field, event.target.value)} /></label>
}

export default App
