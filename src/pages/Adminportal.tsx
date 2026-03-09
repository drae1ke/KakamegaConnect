import { useState, useEffect } from "react";

// ─── Mock Credentials (swap for API call later) ───────────────────────────────
const ADMIN_USERS = [
  { id: 1, username: "admin", password: "Admin@2024", name: "System Administrator", role: "super_admin", avatar: "SA" },
  { id: 2, username: "manager", password: "Manager@2024", name: "County Manager", role: "manager", avatar: "CM" },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUBMISSIONS = [
  { id: "ab12cd", trackingNumber: "KC87654321", type: "complaint", category: "Infrastructure", subcounty: "Kakamega Central", ward: "Burhani", fullName: "James Ochieng", phoneNumber: "0712345678", email: "james@example.com", location: "Near market junction", description: "The road leading to Burhani market has large potholes that have caused several accidents.", status: "pending", createdAt: "2025-03-01T08:30:00Z", updatedAt: "2025-03-01T08:30:00Z" },
  { id: "ef34gh", trackingNumber: "KC87651234", type: "request", category: "Health Services", subcounty: "Shinyalu", ward: "Isukha North", fullName: "Mary Wanjiru", phoneNumber: "0723456789", email: "", location: "Shinyalu Health Centre", description: "Request for additional medical supplies and staff at Shinyalu Health Centre.", status: "in-progress", createdAt: "2025-03-02T10:15:00Z", updatedAt: "2025-03-03T14:20:00Z" },
  { id: "ij56kl", trackingNumber: "KC87659876", type: "complaint", category: "Water & Sanitation", subcounty: "Mumias East", ward: "East Wanga", fullName: "Peter Simiyu", phoneNumber: "0734567890", email: "peter@example.com", location: "East Wanga village", description: "Clean water supply has been interrupted for over two weeks causing serious sanitation issues.", status: "resolved", createdAt: "2025-02-20T09:00:00Z", updatedAt: "2025-03-04T11:00:00Z" },
  { id: "mn78op", trackingNumber: "KC87652468", type: "request", category: "Education", subcounty: "Lugari", ward: "Lugari", fullName: "Sarah Achieng", phoneNumber: "0745678901", email: "sarah@gmail.com", location: "Lugari Primary School", description: "Request for desks and learning materials at Lugari Primary School where learners sit on the floor.", status: "pending", createdAt: "2025-03-05T07:45:00Z", updatedAt: "2025-03-05T07:45:00Z" },
  { id: "qr90st", trackingNumber: "KC87651357", type: "complaint", category: "Agriculture", subcounty: "Navakholo", ward: "Navakholo", fullName: "David Barasa", phoneNumber: "0756789012", email: "", location: "Navakholo farms", description: "Subsidy seeds distributed were of poor quality resulting in failed harvest for many farmers.", status: "in-progress", createdAt: "2025-03-03T13:30:00Z", updatedAt: "2025-03-06T09:00:00Z" },
  { id: "uv12wx", trackingNumber: "KC87653579", type: "request", category: "Social Services", subcounty: "Ikolomani", ward: "Idakho South", fullName: "Grace Nabwire", phoneNumber: "0767890123", email: "grace@example.com", location: "Ikolomani community centre", description: "Request for support for vulnerable elderly residents who lack food and basic necessities.", status: "closed", createdAt: "2025-02-15T11:00:00Z", updatedAt: "2025-02-28T10:00:00Z" },
  { id: "yz34ab", trackingNumber: "KC87654680", type: "complaint", category: "Infrastructure", subcounty: "Malava", ward: "Chemuche", fullName: "Robert Khisa", phoneNumber: "0778901234", email: "", location: "Chemuche bridge", description: "The bridge connecting Chemuche to Malava town is severely damaged and unsafe for use.", status: "pending", createdAt: "2025-03-07T14:00:00Z", updatedAt: "2025-03-07T14:00:00Z" },
  { id: "cd56ef", trackingNumber: "KC87655791", type: "request", category: "Health Services", subcounty: "Butere", ward: "Butere Town", fullName: "Agnes Atieno", phoneNumber: "0789012345", email: "agnes@example.com", location: "Butere County Hospital", description: "Request for ambulance services to be established in Butere sub-county.", status: "in-progress", createdAt: "2025-03-04T08:20:00Z", updatedAt: "2025-03-06T16:00:00Z" },
];

type StatusKey = "pending" | "in-progress" | "resolved" | "closed";

type StatusConfig = { label: string; color: string; bg: string };

type Submission = {
  id: string;
  trackingNumber: string;
  type: string;
  category: string;
  subcounty: string;
  ward: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  location: string;
  description: string;
  status: StatusKey;
  createdAt: string;
  updatedAt: string;
};

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  pending: { label: "Pending", color: "#f59e0b", bg: "#fef3c7" },
  "in-progress": { label: "In Progress", color: "#3b82f6", bg: "#dbeafe" },
  resolved: { label: "Resolved", color: "#10b981", bg: "#d1fae5" },
  closed: { label: "Closed", color: "#6b7280", bg: "#f3f4f6" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  queries: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  settings: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  search: "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l3.5 3.5",
  filter: "M22 3H2l8 9.46V19l4 2V12.46z",
  check: "M20 6L9 17l-5-5",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  chevronDown: "M6 9l6 6 6-6",
  close: "M18 6L6 18 M6 6l12 12",
  menu: "M3 12h18 M3 6h18 M3 18h18",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --green: #0a7a4e;
    --green-light: #d1fae5;
    --green-mid: #047857;
    --dark: #1a1a2e;
    --dark-2: #16213e;
    --sidebar-w: 260px;
    --header-h: 64px;
    --font-serif: 'Lora', serif;
    --font-sans: 'Work Sans', sans-serif;
  }

  body { font-family: var(--font-sans); }

  .admin-root {
    font-family: var(--font-sans);
    min-height: 100vh;
    background: #f0f4f1;
  }

  /* ── LOGIN ── */
  .login-wrap {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: var(--font-sans);
  }
  @media (max-width: 768px) {
    .login-wrap { grid-template-columns: 1fr; }
    .login-brand { display: none !important; }
  }

  .login-brand {
    background: linear-gradient(145deg, #0a7a4e 0%, #065f38 60%, #023f24 100%);
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 48px; color: white; position: relative; overflow: hidden;
  }
  .login-brand::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .login-brand-logo {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.3);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 24px; font-size: 36px;
    backdrop-filter: blur(10px);
  }
  .login-brand h1 {
    font-family: var(--font-serif);
    font-size: 28px; font-weight: 700;
    text-align: center; line-height: 1.3;
    margin-bottom: 12px;
  }
  .login-brand p {
    opacity: 0.75; text-align: center;
    font-size: 14px; max-width: 300px; line-height: 1.6;
  }
  .login-brand-badge {
    margin-top: 40px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px; padding: 12px 20px;
    font-size: 12px; opacity: 0.8;
    text-align: center; backdrop-filter: blur(5px);
  }

  .login-form-side {
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 48px; background: #fff;
  }
  .login-card { width: 100%; max-width: 400px; }
  .login-card h2 {
    font-family: var(--font-serif);
    font-size: 26px; font-weight: 700;
    color: #111; margin-bottom: 8px;
  }
  .login-card .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 32px; }

  .form-group { margin-bottom: 20px; }
  .form-label {
    display: block; font-size: 13px; font-weight: 600;
    color: #374151; margin-bottom: 6px;
  }
  .form-input {
    width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb;
    border-radius: 8px; font-size: 14px; font-family: var(--font-sans);
    color: #111; background: #fafafa; outline: none; transition: all 0.2s;
  }
  .form-input:focus { border-color: var(--green); background: #fff; box-shadow: 0 0 0 3px rgba(10,122,78,0.1); }
  .form-input.error { border-color: #ef4444; }

  .btn-primary {
    width: 100%; padding: 12px; background: var(--green);
    color: white; border: none; border-radius: 8px;
    font-size: 15px; font-weight: 600; font-family: var(--font-sans);
    cursor: pointer; transition: all 0.2s; margin-top: 8px;
  }
  .btn-primary:hover { background: var(--green-mid); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(10,122,78,0.3); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .error-msg {
    background: #fef2f2; border: 1px solid #fecaca;
    color: #dc2626; border-radius: 8px; padding: 10px 14px;
    font-size: 13px; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }

  .login-footer { margin-top: 24px; text-align: center; font-size: 12px; color: #9ca3af; }

  /* ── ADMIN LAYOUT ── */
  .admin-layout { display: flex; min-height: 100vh; }

  .sidebar {
    width: var(--sidebar-w); min-height: 100vh;
    background: var(--dark);
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; z-index: 100;
    transition: transform 0.3s ease;
  }
  .sidebar.collapsed { transform: translateX(-100%); }

  .sidebar-header {
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; }
  .sidebar-logo-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: var(--green); display: flex; align-items: center;
    justify-content: center; font-size: 18px;
  }
  .sidebar-logo-text { font-family: var(--font-serif); }
  .sidebar-logo-text h3 { color: white; font-size: 13px; font-weight: 700; line-height: 1.2; }
  .sidebar-logo-text span { color: rgba(255,255,255,0.45); font-size: 11px; }

  .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .nav-section { margin-bottom: 24px; }
  .nav-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
    color: rgba(255,255,255,0.3); text-transform: uppercase;
    padding: 0 8px; margin-bottom: 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; cursor: pointer;
    color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 500;
    transition: all 0.15s; margin-bottom: 2px; border: none;
    background: transparent; width: 100%; text-align: left;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
  .nav-item.active { background: rgba(10,122,78,0.3); color: white; }
  .nav-item.active .nav-dot { background: var(--green); }
  .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: transparent; margin-left: auto; }

  .sidebar-footer {
    padding: 16px; border-top: 1px solid rgba(255,255,255,0.07);
  }
  .admin-user {
    display: flex; align-items: center; gap: 10px; padding: 8px;
    border-radius: 8px; margin-bottom: 8px;
    background: rgba(255,255,255,0.04);
  }
  .avatar {
    width: 34px; height: 34px; border-radius: 8px;
    background: var(--green); display: flex; align-items: center;
    justify-content: center; font-size: 12px; font-weight: 700; color: white;
    flex-shrink: 0;
  }
  .admin-user-info h4 { color: white; font-size: 13px; font-weight: 600; }
  .admin-user-info span { color: rgba(255,255,255,0.45); font-size: 11px; text-transform: capitalize; }
  .btn-logout {
    width: 100%; display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; background: transparent; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
  }
  .btn-logout:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #fca5a5; }

  /* ── MAIN CONTENT ── */
  .main-content {
    margin-left: var(--sidebar-w); flex: 1;
    display: flex; flex-direction: column; min-height: 100vh;
  }
  @media (max-width: 900px) { .main-content { margin-left: 0; } }

  .topbar {
    height: var(--header-h); background: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; position: sticky; top: 0; z-index: 50;
  }
  .topbar-left { display: flex; align-items: center; gap: 16px; }
  .topbar-title { font-family: var(--font-serif); font-size: 18px; font-weight: 700; color: #111; }
  .topbar-breadcrumb { font-size: 12px; color: #9ca3af; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .icon-btn {
    width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb;
    background: white; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; color: #6b7280;
  }
  .icon-btn:hover { background: #f9fafb; color: #111; }

  .page-body { padding: 28px; flex: 1; }

  /* ── STATS CARDS ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }

  .stat-card {
    background: white; border-radius: 12px; padding: 20px;
    border: 1px solid #e5e7eb; transition: box-shadow 0.2s;
  }
  .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .stat-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px; }
  .stat-value { font-size: 32px; font-weight: 700; color: #111; font-family: var(--font-serif); }
  .stat-footer { margin-top: 8px; font-size: 12px; color: #6b7280; }
  .stat-accent { display: inline-block; width: 3px; border-radius: 2px; height: 40px; margin-right: 12px; vertical-align: middle; }

  /* ── TABLE ── */
  .card {
    background: white; border-radius: 12px; border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  .card-header {
    padding: 18px 20px; border-bottom: 1px solid #f3f4f6;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  }
  .card-title { font-family: var(--font-serif); font-size: 16px; font-weight: 700; color: #111; }
  .card-subtitle { font-size: 12px; color: #9ca3af; margin-top: 2px; }

  .search-bar {
    display: flex; align-items: center; gap: 8px;
    background: #f9fafb; border: 1px solid #e5e7eb;
    border-radius: 8px; padding: 8px 12px;
    color: #6b7280; font-size: 14px; min-width: 220px;
  }
  .search-bar input {
    border: none; background: transparent; outline: none;
    font-size: 13px; font-family: var(--font-sans); color: #111; flex: 1;
  }

  .filter-row {
    display: flex; gap: 8px; padding: 12px 20px;
    border-bottom: 1px solid #f3f4f6; flex-wrap: wrap;
  }
  .filter-btn {
    padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
    cursor: pointer; border: 1.5px solid #e5e7eb; background: white; color: #6b7280;
    transition: all 0.15s; font-family: var(--font-sans);
  }
  .filter-btn.active { border-color: var(--green); background: var(--green-light); color: var(--green-mid); }
  .filter-btn:hover:not(.active) { border-color: #d1d5db; background: #f9fafb; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th {
    background: #f9fafb; padding: 12px 16px;
    font-size: 11px; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.6px;
    border-bottom: 1px solid #f3f4f6; white-space: nowrap; text-align: left;
  }
  td {
    padding: 14px 16px; font-size: 13px; color: #374151;
    border-bottom: 1px solid #f9fafb; vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafafa; }

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
  }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; }

  .type-tag {
    display: inline-block; padding: 3px 8px; border-radius: 4px;
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;
  }
  .type-complaint { background: #fef2f2; color: #dc2626; }
  .type-request { background: #eff6ff; color: #2563eb; }

  .action-btn {
    padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
    cursor: pointer; border: 1px solid #e5e7eb; background: white; color: #374151;
    transition: all 0.15s; margin-right: 4px; font-family: var(--font-sans);
  }
  .action-btn:hover { background: #f9fafb; border-color: #d1d5db; }
  .action-btn.green { border-color: var(--green); color: var(--green); }
  .action-btn.green:hover { background: var(--green-light); }

  select.form-select {
    padding: 5px 10px; border: 1px solid #e5e7eb; border-radius: 6px;
    font-size: 12px; font-family: var(--font-sans); color: #374151;
    background: white; cursor: pointer; outline: none;
  }
  select.form-select:focus { border-color: var(--green); }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .modal {
    background: white; border-radius: 16px; width: 100%; max-width: 580px;
    max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }
  .modal-header {
    padding: 20px 24px; border-bottom: 1px solid #f3f4f6;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; background: white;
  }
  .modal-header h3 { font-family: var(--font-serif); font-size: 18px; font-weight: 700; }
  .modal-body { padding: 24px; }
  .modal-close {
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: #f3f4f6; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #6b7280; transition: all 0.15s;
  }
  .modal-close:hover { background: #fee2e2; color: #dc2626; }

  .detail-row { margin-bottom: 14px; }
  .detail-label { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; }
  .detail-value { font-size: 14px; color: #111; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media (max-width: 500px) { .detail-grid { grid-template-columns: 1fr; } }

  .desc-box {
    background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
    padding: 12px; font-size: 13px; color: #374151; line-height: 1.6;
  }

  .status-update {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 16px; margin-top: 16px;
  }
  .status-update label { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 8px; }
  .status-update-row { display: flex; gap: 8px; }
  .status-update select { flex: 1; }
  .btn-update {
    padding: 8px 16px; background: var(--green); color: white;
    border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: var(--font-sans); transition: all 0.15s;
  }
  .btn-update:hover { background: var(--green-mid); }

  /* ── CHARTS placeholder ── */
  .chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  @media (max-width: 800px) { .chart-grid { grid-template-columns: 1fr; } }

  .mini-bar { display: flex; align-items: flex-end; gap: 6px; height: 80px; }
  .bar-item { flex: 1; border-radius: 4px 4px 0 0; min-width: 20px; transition: opacity 0.2s; }
  .bar-item:hover { opacity: 0.75; }
  .bar-labels { display: flex; gap: 6px; margin-top: 6px; }
  .bar-label { flex: 1; font-size: 10px; color: #9ca3af; text-align: center; }

  .donut-wrap { display: flex; align-items: center; gap: 20px; }
  .legend { display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #374151; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

  .empty-state {
    padding: 60px 20px; text-align: center;
    color: #9ca3af; font-size: 14px;
  }
  .empty-state svg { margin: 0 auto 12px; display: block; opacity: 0.3; }

  /* ── MOBILE TOPBAR TOGGLE ── */
  .menu-toggle {
    display: none; width: 36px; height: 36px; border: none; background: transparent;
    cursor: pointer; color: #374151; align-items: center; justify-content: center;
    border-radius: 8px;
  }
  @media (max-width: 900px) { .menu-toggle { display: flex; } }
  .sidebar-overlay {
    display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    z-index: 99;
  }
  @media (max-width: 900px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
  }

  .notification-dot {
    width: 8px; height: 8px; background: #ef4444;
    border-radius: 50%; position: absolute; top: 2px; right: 2px;
  }
  .relative { position: relative; }

  .page-section { margin-bottom: 28px; }
  .section-title {
    font-family: var(--font-serif); font-size: 15px; font-weight: 700;
    color: #111; margin-bottom: 14px;
  }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="badge-dot" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, accent, footer }) {
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

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) { setError("Please enter both username and password."); return; }
    setLoading(true);
    // Simulate async auth
    setTimeout(() => {
      const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
      if (user) { onLogin(user); }
      else { setError("Invalid credentials. Please check your username and password."); setLoading(false); }
    }, 800);
  };

  return (
    <div className="login-wrap">
      <div className="login-brand">
        <div className="login-brand-logo">🏛️</div>
        <h1>Kakamega County<br />Service Portal</h1>
        <p>Unified platform for managing citizen requests, complaints, and service delivery across all sub-counties.</p>
        <div className="login-brand-badge">
          🔒 Restricted Access — Admin Personnel Only
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
              <label className="form-label">Username</label>
              <input
                className={`form-input ${error ? "error" : ""}`}
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username" autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className={`form-input ${error ? "error" : ""}`}
                  type={showPass ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" autoComplete="current-password"
                  style={{ paddingRight: "42px" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  <Icon path={ICONS.eye} size={16} />
                </button>
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Authenticating…" : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="login-footer">
            <p>Demo: <strong>admin / Admin@2024</strong> &nbsp;|&nbsp; <strong>manager / Manager@2024</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SUBMISSION MODAL ─────────────────────────────────────────────────────────
function SubmissionModal({ submission, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(submission.status);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3>{submission.type === "complaint" ? "Complaint" : "Service Request"} Details</h3>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>#{submission.trackingNumber}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icon path={ICONS.close} size={14} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <span className={`type-tag type-${submission.type}`}>{submission.type}</span>
            <StatusBadge status={submission.status} />
          </div>

          <div className="detail-grid">
            <div className="detail-row">
              <div className="detail-label">Full Name</div>
              <div className="detail-value">{submission.fullName}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{submission.phoneNumber}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Category</div>
              <div className="detail-value">{submission.category}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Sub-County</div>
              <div className="detail-value">{submission.subcounty}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Ward</div>
              <div className="detail-value">{submission.ward}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Submitted</div>
              <div className="detail-value">{new Date(submission.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</div>
            </div>
          </div>

          {submission.email && (
            <div className="detail-row">
              <div className="detail-label">Email</div>
              <div className="detail-value">{submission.email}</div>
            </div>
          )}

          <div className="detail-row">
            <div className="detail-label">Location</div>
            <div className="detail-value">{submission.location}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Description</div>
            <div className="desc-box">{submission.description}</div>
          </div>

          <div className="status-update">
            <label>Update Status</label>
            <div className="status-update-row">
              <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button className="btn-update" onClick={() => { onStatusUpdate(submission.id, newStatus); onClose(); }}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
function DashboardPage({ submissions }: { submissions: Submission[] }) {
  const counts = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    inProgress: submissions.filter(s => s.status === "in-progress").length,
    resolved: submissions.filter(s => s.status === "resolved").length,
    complaints: submissions.filter(s => s.type === "complaint").length,
    requests: submissions.filter(s => s.type === "request").length,
  };

  const byCategory = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  const catEntries = Object.entries(byCategory) as [string, number][];
  const sortedCatEntries = catEntries.sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat = sortedCatEntries.length ? Math.max(...sortedCatEntries.map(([, count]) => count)) : 0;

  const catColors = ["#0a7a4e","#3b82f6","#f59e0b","#8b5cf6","#ef4444"];

  return (
    <div>
      <div className="stats-grid">
        <StatCard label="Total Submissions" value={counts.total} accent="#0a7a4e" footer="All time" />
        <StatCard label="Pending Review" value={counts.pending} accent="#f59e0b" footer="Awaiting action" />
        <StatCard label="In Progress" value={counts.inProgress} accent="#3b82f6" footer="Being handled" />
        <StatCard label="Resolved" value={counts.resolved} accent="#10b981" footer="Closed successfully" />
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Submissions by Category</div>
              <div className="card-subtitle">Top 5 categories</div>
            </div>
          </div>
          <div style={{ padding: "20px" }}>
            {sortedCatEntries.map(([cat, count], i) => {
              const widthPct = maxCat ? (count / maxCat) * 100 : 0;
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: "#374151" }}>
                    <span>{cat}</span><span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${widthPct}%`, background: catColors[i], borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Status Overview</div>
              <div className="card-subtitle">Current breakdown</div>
            </div>
          </div>
          <div style={{ padding: "20px" }}>
            {(Object.entries(STATUS_CONFIG) as [StatusKey, StatusConfig][]).map(([key, cfg]) => {
              const cnt = submissions.filter(s => s.status === key).length;
              const pct = counts.total ? Math.round((cnt / counts.total) * 100) : 0;
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: "#374151" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
                      {cfg.label}
                    </span>
                    <span style={{ fontWeight: 600 }}>{cnt} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6", display: "flex", gap: 20 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626", fontFamily: "Lora, serif" }}>{counts.complaints}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Complaints</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb", fontFamily: "Lora, serif" }}>{counts.requests}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Requests</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Activity</div>
            <div className="card-subtitle">Latest 5 submissions</div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tracking #</th><th>Type</th><th>Category</th><th>Sub-County</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#0a7a4e" }}>{s.trackingNumber}</td>
                  <td><span className={`type-tag type-${s.type}`}>{s.type}</span></td>
                  <td>{s.category}</td>
                  <td style={{ color: "#6b7280" }}>{s.subcounty}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td style={{ color: "#6b7280", fontSize: 12 }}>{new Date(s.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── QUERIES PAGE ─────────────────────────────────────────────────────────────
function QueriesPage({ submissions, onStatusUpdate }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = submissions.filter(s => {
    const matchSearch = !search || [s.trackingNumber, s.fullName, s.category, s.subcounty, s.description]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchType = filterType === "all" || s.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div>
      {selected && (
        <SubmissionModal
          submission={selected}
          onClose={() => setSelected(null)}
          onStatusUpdate={(id, status) => { onStatusUpdate(id, status); setSelected(null); }}
        />
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Submissions</div>
            <div className="card-subtitle">{filtered.length} of {submissions.length} entries</div>
          </div>
          <div className="search-bar">
            <Icon path={ICONS.search} size={14} />
            <input placeholder="Search by name, tracking #, category…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="filter-row">
          <span style={{ fontSize: 12, color: "#9ca3af", alignSelf: "center", marginRight: 4 }}>Status:</span>
          {["all", "pending", "in-progress", "resolved", "closed"].map(f => (
            <button key={f} className={`filter-btn ${filterStatus === f ? "active" : ""}`} onClick={() => setFilterStatus(f)}>
              {f === "all" ? "All" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
          <span style={{ fontSize: 12, color: "#9ca3af", alignSelf: "center", marginLeft: 12, marginRight: 4 }}>Type:</span>
          {["all", "complaint", "request"].map(f => (
            <button key={f} className={`filter-btn ${filterType === f ? "active" : ""}`} onClick={() => setFilterType(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Icon path={ICONS.queries} size={40} />
              <p>No submissions match your filters</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tracking #</th><th>Type</th><th>Submitter</th><th>Category</th>
                  <th>Sub-County</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#0a7a4e" }}>{s.trackingNumber}</td>
                    <td><span className={`type-tag type-${s.type}`}>{s.type}</span></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.fullName}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.phoneNumber}</div>
                    </td>
                    <td>{s.category}</td>
                    <td style={{ color: "#6b7280", fontSize: 12 }}>{s.subcounty}<br /><span style={{ color: "#9ca3af" }}>{s.ward}</span></td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{new Date(s.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <button className="action-btn green" onClick={() => setSelected(s)}>
                        <Icon path={ICONS.eye} size={12} /> View
                      </button>
                      <select className="form-select" value={s.status}
                        onChange={e => onStatusUpdate(s.id, e.target.value)}
                        style={{ marginTop: 4, width: "100%" }}>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ user }) {
  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><div className="card-title">Admin Credentials</div></div>
        <div style={{ padding: 20 }}>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#92400e", marginBottom: 16 }}>
            ⚠️ These are mock credentials. Replace with your backend auth API when ready.
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>Username</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>Name</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>Role</th>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>Password (Dev Only)</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_USERS.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontSize: 13, color: "#0a7a4e", borderBottom: "1px solid #f9fafb" }}>{u.username}</td>
                  <td style={{ padding: "12px", fontSize: 13, borderBottom: "1px solid #f9fafb" }}>{u.name}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #f9fafb" }}><span style={{ background: "#ede9fe", color: "#7c3aed", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{u.role}</span></td>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontSize: 12, color: "#9ca3af", borderBottom: "1px solid #f9fafb" }}>{u.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Current Session</div></div>
        <div style={{ padding: 20 }}>
          <div className="detail-grid">
            <div className="detail-row"><div className="detail-label">Logged in as</div><div className="detail-value">{user.name}</div></div>
            <div className="detail-row"><div className="detail-label">Role</div><div className="detail-value" style={{ textTransform: "capitalize" }}>{user.role.replace("_", " ")}</div></div>
            <div className="detail-row"><div className="detail-label">Username</div><div className="detail-value" style={{ fontFamily: "monospace" }}>{user.username}</div></div>
            <div className="detail-row"><div className="detail-label">Session Started</div><div className="detail-value">{new Date().toLocaleTimeString("en-KE")}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingCount = submissions.filter(s => s.status === "pending").length;

  const handleStatusUpdate = (id, status) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s));
  };

  if (!user) return (
    <>
      <style>{styles}</style>
      <LoginPage onLogin={setUser} />
    </>
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: ICONS.dashboard },
    { id: "queries", label: "All Queries", icon: ICONS.queries, badge: pendingCount },
    { id: "settings", label: "Settings", icon: ICONS.settings },
  ];

  const pageTitle = { dashboard: "Dashboard", queries: "Manage Queries", settings: "Settings" }[page];

  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        <div className="admin-layout">

          {/* Sidebar overlay for mobile */}
          <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

          {/* Sidebar */}
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
              <div className="nav-section">
                <div className="nav-section-label">Navigation</div>
                {navItems.map(item => (
                  <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`}
                    onClick={() => { setPage(item.id); setSidebarOpen(false); }}>
                    <Icon path={item.icon} size={16} />
                    {item.label}
                    {item.badge > 0 && (
                      <span style={{ marginLeft: "auto", background: "#f59e0b", color: "white", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                        {item.badge}
                      </span>
                    )}
                    {page === item.id && <span className="nav-dot" />}
                  </button>
                ))}
              </div>
            </nav>

            <div className="sidebar-footer">
              <div className="admin-user">
                <div className="avatar">{user.avatar}</div>
                <div className="admin-user-info">
                  <h4>{user.name}</h4>
                  <span>{user.role.replace("_", " ")}</span>
                </div>
              </div>
              <button className="btn-logout" onClick={() => setUser(null)}>
                <Icon path={ICONS.logout} size={14} />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="main-content">
            <div className="topbar">
              <div className="topbar-left">
                <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Icon path={ICONS.menu} size={20} />
                </button>
                <div>
                  <div className="topbar-title">{pageTitle}</div>
                  <div className="topbar-breadcrumb">Kakamega County / Admin / {pageTitle}</div>
                </div>
              </div>
              <div className="topbar-right">
                <div className="relative">
                  <button className="icon-btn">
                    <Icon path={ICONS.bell} size={16} />
                  </button>
                  {pendingCount > 0 && <span className="notification-dot" />}
                </div>
                <div className="avatar" style={{ cursor: "default" }}>{user.avatar}</div>
              </div>
            </div>

            <div className="page-body">
              {page === "dashboard" && <DashboardPage submissions={submissions} />}
              {page === "queries" && <QueriesPage submissions={submissions} onStatusUpdate={handleStatusUpdate} />}
              {page === "settings" && <SettingsPage user={user} />}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}