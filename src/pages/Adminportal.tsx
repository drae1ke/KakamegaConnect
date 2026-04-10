/**
 * Admin Portal — wired to real Express/MongoDB backend.
 *
 * Auth flow:
 *  1. Staff logs in with email + password (POST /auth/login)
 *  2. JWT is stored in localStorage under "admin_token"
 *  3. All subsequent requests carry the Bearer token via api.ts
 *  4. Logout clears localStorage and returns to login screen
 *
 * Data flow:
 *  - Dashboard: GET /admin/dashboard
 *  - Queries:   GET /complaints/all  (with filter params)
 *  - Status:    PUT /complaints/:id/status
 *  - Settings:  GET /auth/me
 */

import { useState, useEffect, useCallback } from "react";
import {
  auth,
  admin,
  complaints as complaintsApi,
  saveToken,
  clearToken,
  getSavedUser,
  ApiError,
  DashboardStats,
  Complaint,
  LoginResponse,
} from "@/lib/api";

// ─── Status config ────────────────────────────────────────────────────────────

type StatusKey = "pending" | "in-review" | "in-progress" | "resolved" | "closed" | "rejected";

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bg: string }> = {
  pending:      { label: "Pending",     color: "#f59e0b", bg: "#fef3c7" },
  "in-review":  { label: "In Review",   color: "#f97316", bg: "#ffedd5" },
  "in-progress":{ label: "In Progress", color: "#3b82f6", bg: "#dbeafe" },
  resolved:     { label: "Resolved",    color: "#10b981", bg: "#d1fae5" },
  closed:       { label: "Closed",      color: "#6b7280", bg: "#f3f4f6" },
  rejected:     { label: "Rejected",    color: "#ef4444", bg: "#fee2e2" },
};

// ─── Inline styles block ──────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --green: #0a7a4e; --green-light: #d1fae5; --green-mid: #047857;
    --dark: #1a1a2e; --sidebar-w: 260px; --header-h: 64px;
    --font-serif: 'Lora', serif; --font-sans: 'Work Sans', sans-serif;
  }
  body { font-family: var(--font-sans); }
  .admin-root { font-family: var(--font-sans); min-height: 100vh; background: #f0f4f1; }

  /* Login */
  .login-wrap { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; font-family: var(--font-sans); }
  @media (max-width: 768px) { .login-wrap { grid-template-columns: 1fr; } .login-brand { display: none !important; } }
  .login-brand { background: linear-gradient(145deg,#0a7a4e,#023f24); display:flex; flex-direction:column; justify-content:center; align-items:center; padding:48px; color:#fff; position:relative; overflow:hidden; }
  .login-brand h1 { font-family:var(--font-serif); font-size:28px; font-weight:700; text-align:center; line-height:1.3; margin-bottom:12px; }
  .login-brand p { opacity:.75; text-align:center; font-size:14px; max-width:300px; line-height:1.6; }
  .login-form-side { display:flex; flex-direction:column; justify-content:center; align-items:center; padding:48px; background:#fff; }
  .login-card { width:100%; max-width:400px; }
  .login-card h2 { font-family:var(--font-serif); font-size:26px; font-weight:700; color:#111; margin-bottom:8px; }
  .login-card .subtitle { color:#6b7280; font-size:14px; margin-bottom:32px; }
  .form-group { margin-bottom:20px; }
  .form-label { display:block; font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
  .form-input { width:100%; padding:11px 14px; border:1.5px solid #e5e7eb; border-radius:8px; font-size:14px; font-family:var(--font-sans); color:#111; background:#fafafa; outline:none; transition:all .2s; }
  .form-input:focus { border-color:var(--green); background:#fff; box-shadow:0 0 0 3px rgba(10,122,78,.1); }
  .form-input.error { border-color:#ef4444; }
  .btn-primary { width:100%; padding:12px; background:var(--green); color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; font-family:var(--font-sans); cursor:pointer; transition:all .2s; margin-top:8px; }
  .btn-primary:hover { background:var(--green-mid); transform:translateY(-1px); box-shadow:0 4px 12px rgba(10,122,78,.3); }
  .btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .error-msg { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; border-radius:8px; padding:10px 14px; font-size:13px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }

  /* Layout */
  .admin-layout { display:flex; min-height:100vh; }
  .sidebar { width:var(--sidebar-w); min-height:100vh; background:var(--dark); display:flex; flex-direction:column; position:fixed; left:0; top:0; z-index:100; transition:transform .3s; }
  @media (max-width:900px) { .sidebar { transform:translateX(-100%); } .sidebar.open { transform:translateX(0); } .main-content { margin-left:0!important; } }
  .sidebar-header { padding:20px 20px 16px; border-bottom:1px solid rgba(255,255,255,.07); }
  .sidebar-logo { display:flex; align-items:center; gap:10px; }
  .sidebar-logo-icon { width:38px; height:38px; border-radius:10px; background:var(--green); display:flex; align-items:center; justify-content:center; font-size:18px; }
  .sidebar-logo-text h3 { color:#fff; font-size:13px; font-weight:700; line-height:1.2; }
  .sidebar-logo-text span { color:rgba(255,255,255,.45); font-size:11px; }
  .sidebar-nav { flex:1; padding:16px 12px; overflow-y:auto; }
  .nav-section-label { font-size:10px; font-weight:700; letter-spacing:1.2px; color:rgba(255,255,255,.3); text-transform:uppercase; padding:0 8px; margin-bottom:6px; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; cursor:pointer; color:rgba(255,255,255,.6); font-size:14px; font-weight:500; transition:all .15s; margin-bottom:2px; border:none; background:transparent; width:100%; text-align:left; }
  .nav-item:hover { background:rgba(255,255,255,.06); color:rgba(255,255,255,.9); }
  .nav-item.active { background:rgba(10,122,78,.3); color:#fff; }
  .sidebar-footer { padding:16px; border-top:1px solid rgba(255,255,255,.07); }
  .admin-user { display:flex; align-items:center; gap:10px; padding:8px; border-radius:8px; margin-bottom:8px; background:rgba(255,255,255,.04); }
  .avatar { width:34px; height:34px; border-radius:8px; background:var(--green); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; }
  .admin-user-info h4 { color:#fff; font-size:13px; font-weight:600; }
  .admin-user-info span { color:rgba(255,255,255,.45); font-size:11px; text-transform:capitalize; }
  .btn-logout { width:100%; display:flex; align-items:center; gap:8px; padding:9px 12px; background:transparent; border:1px solid rgba(255,255,255,.1); border-radius:8px; color:rgba(255,255,255,.5); font-size:13px; font-weight:500; cursor:pointer; transition:all .15s; font-family:var(--font-sans); }
  .btn-logout:hover { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.3); color:#fca5a5; }
  .main-content { margin-left:var(--sidebar-w); flex:1; display:flex; flex-direction:column; min-height:100vh; }
  .topbar { height:var(--header-h); background:#fff; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; padding:0 24px; position:sticky; top:0; z-index:50; }
  .topbar-title { font-family:var(--font-serif); font-size:18px; font-weight:700; color:#111; }
  .topbar-breadcrumb { font-size:12px; color:#9ca3af; }
  .page-body { padding:28px; flex:1; }

  /* Stats / Cards */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  @media (max-width:1100px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:600px) { .stats-grid { grid-template-columns:1fr; } }
  .stat-card { background:#fff; border-radius:12px; padding:20px; border:1px solid #e5e7eb; transition:box-shadow .2s; }
  .stat-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
  .stat-label { font-size:12px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.6px; margin-bottom:8px; }
  .stat-value { font-size:32px; font-weight:700; color:#111; font-family:var(--font-serif); }
  .stat-footer { margin-top:8px; font-size:12px; color:#6b7280; }
  .stat-accent { display:inline-block; width:3px; border-radius:2px; height:40px; margin-right:12px; vertical-align:middle; }

  /* Table / Card */
  .card { background:#fff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; margin-bottom:20px; }
  .card-header { padding:18px 20px; border-bottom:1px solid #f3f4f6; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .card-title { font-family:var(--font-serif); font-size:16px; font-weight:700; color:#111; }
  .card-subtitle { font-size:12px; color:#9ca3af; margin-top:2px; }
  .search-bar { display:flex; align-items:center; gap:8px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; color:#6b7280; font-size:14px; min-width:220px; }
  .search-bar input { border:none; background:transparent; outline:none; font-size:13px; font-family:var(--font-sans); color:#111; flex:1; }
  .filter-row { display:flex; gap:8px; padding:12px 20px; border-bottom:1px solid #f3f4f6; flex-wrap:wrap; }
  .filter-btn { padding:5px 12px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; border:1.5px solid #e5e7eb; background:#fff; color:#6b7280; transition:all .15s; font-family:var(--font-sans); }
  .filter-btn.active { border-color:var(--green); background:var(--green-light); color:var(--green-mid); }
  .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  th { background:#f9fafb; padding:12px 16px; font-size:11px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.6px; border-bottom:1px solid #f3f4f6; white-space:nowrap; text-align:left; }
  td { padding:14px 16px; font-size:13px; color:#374151; border-bottom:1px solid #f9fafb; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:#fafafa; }
  .badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; }
  .badge-dot { width:6px; height:6px; border-radius:50%; }
  .action-btn { padding:5px 10px; border-radius:6px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid #e5e7eb; background:#fff; color:#374151; transition:all .15s; margin-right:4px; font-family:var(--font-sans); }
  .action-btn.green { border-color:var(--green); color:var(--green); }
  .action-btn.green:hover { background:var(--green-light); }
  select.form-select { padding:5px 10px; border:1px solid #e5e7eb; border-radius:6px; font-size:12px; font-family:var(--font-sans); color:#374151; background:#fff; cursor:pointer; outline:none; }
  .empty-state { padding:60px 20px; text-align:center; color:#9ca3af; font-size:14px; }
  .loading-state { padding:40px; text-align:center; color:#9ca3af; font-size:14px; }
  .chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px; }
  @media (max-width:800px) { .chart-grid { grid-template-columns:1fr; } }
  .menu-toggle { display:none; width:36px; height:36px; border:none; background:transparent; cursor:pointer; color:#374151; align-items:center; justify-content:center; border-radius:8px; }
  @media (max-width:900px) { .menu-toggle { display:flex; } }
  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99; }
  @media (max-width:900px) { .sidebar-overlay.open { display:block; } }
  .relative { position:relative; }
  .notification-dot { width:8px; height:8px; background:#ef4444; border-radius:50%; position:absolute; top:2px; right:2px; }
  .icon-btn { width:36px; height:36px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; color:#6b7280; }
`;

// ─── Small icon helper ─────────────────────────────────────────────────────────

const Icon = ({ path, size = 20 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  queries:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  settings:  "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  search:    "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l3.5 3.5",
  alert:     "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  menu:      "M3 12h18 M3 6h18 M3 18h18",
  bell:      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG.pending;
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="badge-dot" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, footer }: { label: string; value: number | string; accent: string; footer?: string }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center" }}>
        <span className="stat-accent" style={{ background: accent }} />
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {footer && <div className="stat-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (user: LoginResponse["data"]["user"]) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter both email and password."); return; }
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      saveToken(res.token, res.data.user);
      onLogin(res.data.user);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-brand">
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"2px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, fontSize:36 }}>🏛️</div>
        <h1>Kakamega County<br />Service Portal</h1>
        <p>Admin access for county staff only. Use your official county email address.</p>
        <div style={{ marginTop:40, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", borderRadius:8, padding:"12px 20px", fontSize:12, opacity:.8, textAlign:"center" }}>
          🔒 Restricted Access — Authorised Personnel Only
        </div>
      </div>
      <div className="login-form-side">
        <div className="login-card">
          <h2>Admin Login</h2>
          <p className="subtitle">Sign in to access the administration dashboard</p>
          {error && (
            <div className="error-msg">
              <Icon path={ICONS.alert} size={16} />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className={`form-input ${error ? "error" : ""}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@kakamega.go.ke" autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className={`form-input ${error ? "error" : ""}`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Authenticating…" : "Sign In to Dashboard"}
            </button>
          </form>
          <p style={{ marginTop:16, textAlign:"center", fontSize:12, color:"#9ca3af" }}>
            Contact your system administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    admin.dashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard…</div>;
  if (error) return <div className="loading-state" style={{ color: "#ef4444" }}>{error}</div>;
  if (!stats) return null;

  const maxCat = Math.max(...(stats.complaintsByCategory?.map((c) => c.count) ?? [1]));
  const catColors = ["#0a7a4e","#3b82f6","#f59e0b","#8b5cf6","#ef4444"];

  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Total Complaints" value={stats.totalComplaints} accent="#0a7a4e" footer="All time" />
        <StatCard label="Pending Review"   value={stats.pendingComplaints} accent="#f59e0b" footer="Awaiting action" />
        <StatCard label="In Progress"      value={stats.inProgressComplaints} accent="#3b82f6" footer="Being handled" />
        <StatCard label="Resolved"         value={stats.resolvedComplaints} accent="#10b981" footer="Successfully closed" />
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Complaints by Category</div>
              <div className="card-subtitle">Top {stats.complaintsByCategory?.length ?? 0} categories</div>
            </div>
          </div>
          <div style={{ padding:"20px" }}>
            {(stats.complaintsByCategory ?? []).map(({ _id, count }, i) => (
              <div key={_id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4, color:"#374151" }}>
                  <span>{_id}</span><span style={{ fontWeight:600 }}>{count}</span>
                </div>
                <div style={{ height:6, background:"#f3f4f6", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(count/maxCat)*100}%`, background:catColors[i % catColors.length], borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Status Overview</div>
          </div>
          <div style={{ padding:"20px" }}>
            {(Object.entries(STATUS_CONFIG) as [StatusKey, { label: string; color: string; bg: string }][]).map(([key, cfg]) => {
              const count = key === "pending"
                ? stats.pendingComplaints
                : key === "in-progress"
                  ? stats.inProgressComplaints
                  : key === "resolved"
                    ? stats.resolvedComplaints
                    : 0;
              const pct = stats.totalComplaints ? Math.round((count / stats.totalComplaints) * 100) : 0;
              return (
                <div key={key} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4, color:"#374151" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background:cfg.color, display:"inline-block" }} />
                      {cfg.label}
                    </span>
                    <span style={{ fontWeight:600 }}>{count} <span style={{ color:"#9ca3af", fontWeight:400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height:6, background:"#f3f4f6", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:cfg.color, borderRadius:4 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #f3f4f6" }}>
              <div style={{ fontSize:12, color:"#6b7280" }}>
                Avg. resolution time: <strong>{stats.avgResolutionTime} days</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Queries Page ─────────────────────────────────────────────────────────────

function QueriesPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complaintsApi.getAll({
        status: filterStatus === "all" ? undefined : filterStatus,
        page,
        limit: 20,
      });
      setComplaints(res.data.complaints ?? []);
      setTotal(res.total ?? 0);
    } catch {
      // silent — table stays empty
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await complaintsApi.updateStatus(id, { status });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: status as Complaint["status"] } : c))
      );
    } catch { /* toast if desired */ }
    finally { setUpdatingId(null); }
  };

  // Client-side search filter on top of server results
  const visible = search
    ? complaints.filter((c) =>
        [c.trackingNumber, c.fullName, c.category, c.location?.ward ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : complaints;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Submissions</div>
            <div className="card-subtitle">{total} total entries</div>
          </div>
          <div className="search-bar">
            <Icon path={ICONS.search} size={14} />
            <input placeholder="Search by name, tracking #…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="filter-row">
          <span style={{ fontSize:12, color:"#9ca3af", alignSelf:"center", marginRight:4 }}>Status:</span>
          {["all", ...Object.keys(STATUS_CONFIG)].map((f) => (
            <button key={f} className={`filter-btn ${filterStatus === f ? "active" : ""}`} onClick={() => { setFilterStatus(f); setPage(1); }}>
              {f === "all" ? "All" : STATUS_CONFIG[f as StatusKey]?.label ?? f}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="loading-state">Loading complaints…</div>
          ) : visible.length === 0 ? (
            <div className="empty-state">No complaints match your filters</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Submitter</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontFamily:"monospace", fontSize:12, fontWeight:600, color:"#0a7a4e" }}>{c.trackingNumber}</td>
                    <td>
                      <div style={{ fontWeight:500 }}>{c.fullName}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{c.phoneNumber}</div>
                    </td>
                    <td>{c.category}</td>
                    <td style={{ color:"#6b7280", fontSize:12 }}>
                      {c.location?.ward ?? "—"}<br />
                      <span style={{ color:"#9ca3af" }}>{c.location?.subcounty ?? ""}</span>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize:12, color:"#6b7280" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={c.status}
                        disabled={updatingId === c._id}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      >
                        {Object.keys(STATUS_CONFIG).map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s as StatusKey].label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div style={{ padding:"12px 20px", display:"flex", justifyContent:"flex-end", gap:8 }}>
            <button className="action-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ alignSelf:"center", fontSize:13, color:"#6b7280" }}>Page {page}</span>
            <button className="action-btn" onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage({ user }: { user: LoginResponse["data"]["user"] }) {
  return (
    <div>
      <div className="card">
        <div className="card-header"><div className="card-title">Current Session</div></div>
        <div style={{ padding:20 }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <tbody>
              {[
                ["Name", user.name],
                ["Email", user.email],
                ["Role", user.role.replace("_", " ")],
                ["Department", user.department ?? "—"],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding:"10px 0", color:"#6b7280", fontSize:13, width:140 }}>{label}</td>
                  <td style={{ padding:"10px 0", fontSize:13, fontWeight:500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Backend Connection</div></div>
        <div style={{ padding:20, fontSize:13, color:"#374151" }}>
          <p>API URL: <code style={{ background:"#f3f4f6", padding:"2px 6px", borderRadius:4 }}>{import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1"}</code></p>
          <p style={{ marginTop:8, color:"#6b7280" }}>Set <strong>VITE_API_URL</strong> in your <code>.env</code> file to change the backend endpoint.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Portal ────────────────────────────────────────────────────────

export default function AdminPortal() {
  const [user, setUser] = useState<LoginResponse["data"]["user"] | null>(() => getSavedUser());
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (!user) return;
    auth.me().catch(() => {
      clearToken();
      setUser(null);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = (u: LoginResponse["data"]["user"]) => setUser(u);
  const handleLogout = () => { clearToken(); setUser(null); };

  if (!user) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={handleLogin} />
    </>
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
    { id: "queries",   label: "All Queries", icon: ICONS.queries },
    { id: "settings",  label: "Settings", icon: ICONS.settings },
  ];

  const pageTitle: Record<string, string> = { dashboard: "Dashboard", queries: "Manage Queries", settings: "Settings" };
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        <div className="admin-layout">
          <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🏛️</div>
                <div className="sidebar-logo-text">
                  <h3>Admin Portal</h3>
                  <span>Kakamega County</span>
                </div>
              </div>
            </div>
            <nav className="sidebar-nav">
              <div className="nav-section-label">Navigation</div>
              {navItems.map((item) => (
                <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                  <Icon path={item.icon} size={16} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="sidebar-footer">
              <div className="admin-user">
                <div className="avatar">{initials}</div>
                <div className="admin-user-info">
                  <h4>{user.name}</h4>
                  <span>{user.role}</span>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <Icon path={ICONS.logout} size={14} />
                Sign Out
              </button>
            </div>
          </aside>

          <div className="main-content">
            <div className="topbar">
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Icon path={ICONS.menu} size={20} />
                </button>
                <div>
                  <div className="topbar-title">{pageTitle[page]}</div>
                  <div className="topbar-breadcrumb">Kakamega County / Admin / {pageTitle[page]}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div className="relative">
                  <button className="icon-btn"><Icon path={ICONS.bell} size={16} /></button>
                </div>
                <div className="avatar" style={{ cursor:"default" }}>{initials}</div>
              </div>
            </div>

            <div className="page-body">
              {page === "dashboard" && <DashboardPage />}
              {page === "queries"   && <QueriesPage />}
              {page === "settings"  && <SettingsPage user={user} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}