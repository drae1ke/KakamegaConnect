/**
 * API client — thin wrapper around fetch that:
 *  - Reads VITE_API_URL from .env (falls back to localhost:5000)
 *  - Attaches Bearer token from localStorage automatically
 *  - Throws typed ApiError on non-2xx responses
 *  - Provides typed helpers for every backend endpoint
 */

const BASE_URL =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:5000/api/v1";

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public raw?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("admin_token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error ?? body?.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, message);
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>(path, { method: "GET" });
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

// ─── Multipart upload (for complaint / service application attachments) ────────

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error ?? body?.message ?? message;
    } catch { /* ignore */ }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

// ─── Shared response shapes ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  pages?: number;
  currentPage?: number;
}

export interface TrackingResult {
  trackingNumber: string;
  status: "pending" | "in-review" | "in-progress" | "resolved" | "closed" | "rejected";
  title: string;
  category: string;
  description: string;
  location: {
    ward: string;
    subcounty: string;
    specificLocation?: string;
  };
  submittedAt: string;
  lastUpdated: string;
  feedback?: string;
  resolvedAt?: string;
  assignedTo?: { name: string; department: string } | null;
}

export interface Complaint {
  _id: string;
  trackingNumber: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  title: string;
  category: string;
  description: string;
  location: {
    ward: string;
    subcounty: string;
    specificLocation?: string;
  };
  status: "pending" | "in-review" | "in-progress" | "resolved" | "closed" | "rejected";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  totalUsers: number;
  totalServices: number;
  avgResolutionTime: number;
  complaintsByCategory: { _id: string; count: number }[];
  complaintsByWard: { _id: string; count: number }[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  token: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: "admin" | "officer";
      department?: string;
    };
  };
}

export const auth = {
  login: (email: string, password: string) =>
    post<LoginResponse>("/auth/login", { email, password }),

  me: () =>
    get<{ success: boolean; data: { user: LoginResponse["data"]["user"] } }>("/auth/me"),
};

// ─── Complaints ───────────────────────────────────────────────────────────────

export interface SubmitComplaintPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  title: string;
  category: string;
  description: string;
  location: {
    ward: string;
    subcounty: string;
    specificLocation?: string;
  };
  priority?: "low" | "medium" | "high";
}

export interface SubmitComplaintResponse {
  success: boolean;
  message: string;
  data: {
    trackingNumber: string;
    fullName: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
  };
}

export interface AllComplaintsParams {
  status?: string;
  category?: string;
  priority?: string;
  ward?: string;
  page?: number;
  limit?: number;
}

export const complaints = {
  /** Public — submit a new complaint */
  submit: (payload: SubmitComplaintPayload) =>
    post<SubmitComplaintResponse>("/complaints", payload),

  /** Public — track a complaint by tracking number */
  track: (trackingNumber: string) =>
    get<{ success: boolean; data: TrackingResult }>(
      `/complaints/track/${encodeURIComponent(trackingNumber)}`
    ),

  /** Staff — get all complaints with optional filters */
  getAll: (params: AllComplaintsParams = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== "")
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return get<ApiSuccess<{ complaints: Complaint[] }>>(
      `/complaints/all${qs ? `?${qs}` : ""}`
    );
  },

  /** Staff — update complaint status */
  updateStatus: (
    id: string,
    payload: { status: string; feedback?: string; resolutionNotes?: string }
  ) => put<ApiSuccess<{ complaint: Complaint }>>(`/complaints/${id}/status`, payload),

  /** Staff — get complaint stats */
  stats: () =>
    get<{ success: boolean; data: { total: number; pending: number; inProgress: number; resolved: number } }>(
      "/complaints/stats"
    ),
};

// ─── Service requests ─────────────────────────────────────────────────────────

export interface SubmitRequestPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  category: string;
  subcounty: string;
  ward: string;
  location: string;
  description: string;
}

export interface SubmitRequestResponse {
  success: boolean;
  message: string;
  data: {
    applicationNumber: string;
    serviceName: string;
    status: string;
    fee: number;
    paymentStatus: string;
    createdAt: string;
  };
}

/** Find a service ID from the category string (fetches service list first) */
export const getServiceIdByCategory = async (category: string): Promise<string | null> => {
  try {
    const res = await get<ApiSuccess<{ services: { _id: string; category: string; name: string }[] }>>(
      `/services?category=${encodeURIComponent(category)}&isAvailable=true&limit=1`
    );
    const services = res.data?.services ?? [];
    if (services.length > 0) {
      return services[0]._id;
    }
    // No match — log so the developer can diagnose
    console.warn(
      `[api] No service found for category "${category}". ` +
      `Run: node scripts/seedService.js in your backend folder. ` +
      `Seeded categories must match frontend mockData.ts serviceCategories: ` +
      `"Water & Sanitation", "Infrastructure", "Health", "Education", "Environment", "Security".`
    );
    return null;
  } catch (err) {
    console.error("[api] getServiceIdByCategory failed:", err);
    return null;
  }
};

export const serviceRequests = {
  /**
   * Submit a service application.
   * The backend route is POST /services/:id/apply so we need a serviceId.
   * We derive it from the category if not supplied.
   */
  submit: async (
    payload: SubmitRequestPayload,
    serviceId?: string
  ): Promise<SubmitRequestResponse> => {
    const id = serviceId ?? (await getServiceIdByCategory(payload.category));
    if (!id) throw new ApiError(
      400,
      `No service found for category "${payload.category}". ` +
      `Please run: node scripts/seedService.js in your backend folder. ` +
      `The seeded categories must match: "Water & Sanitation", "Infrastructure", "Health", "Education", "Environment", "Security".`
    );

    const body = {
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      applicantDetails: {
        address: { ward: payload.ward },
      },
      applicationData: {
        subcounty: payload.subcounty,
        ward: payload.ward,
        location: payload.location,
        description: payload.description,
      },
    };

    return post<SubmitRequestResponse>(`/services/${id}/apply`, body);
  },

  /** Public — track a service application */
  track: (trackingNumber: string) =>
    get<{ success: boolean; data: Record<string, unknown> }>(
      `/services/applications/track/${encodeURIComponent(trackingNumber)}`
    ),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const admin = {
  dashboard: () =>
    get<{ success: boolean; data: DashboardStats }>("/admin/dashboard"),
};

// ─── Convenience: save / clear token ─────────────────────────────────────────

export function saveToken(token: string, user: LoginResponse["data"]["user"]) {
  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(user));
}

export function clearToken() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

export function getSavedUser(): LoginResponse["data"]["user"] | null {
  try {
    const raw = localStorage.getItem("admin_user");
    return raw ? (JSON.parse(raw) as LoginResponse["data"]["user"]) : null;
  } catch {
    return null;
  }
}