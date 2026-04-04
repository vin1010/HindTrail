const API_URL = import.meta.env.VITE_API_URL || "https://hindtrail-api-production.up.railway.app";

function getToken(): string | null {
  return sessionStorage.getItem("hindtrail_token");
}

export function setToken(token: string) {
  sessionStorage.setItem("hindtrail_token", token);
}

export function clearToken() {
  sessionStorage.removeItem("hindtrail_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string> || {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────────
export const auth = {
  login: (email: string, fullName: string, provider: string) =>
    request<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, fullName, provider }) }),

  setContext: (companyId: string) =>
    request<any>("/auth/context", { method: "POST", body: JSON.stringify({ companyId }) }),

  createCompany: (name: string) =>
    request<any>("/auth/onboarding/create-company", { method: "POST", body: JSON.stringify({ name }) }),

  createIndependent: (displayName: string) =>
    request<any>("/auth/onboarding/independent", { method: "POST", body: JSON.stringify({ displayName }) }),
};

// ─── Workspace ──────────────────────────────────────────────────
export const workspace = {
  get: (companyId?: string) =>
    request<any>(`/workspace${companyId ? `?companyId=${companyId}` : ""}`),
};

// ─── Projects ───────────────────────────────────────────────────
export const projects = {
  list: () => request<any[]>("/projects"),
  get: (id: string) => request<any>(`/projects/${id}`),
  create: (data: any) => request<any>("/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Packages ───────────────────────────────────────────────────
export const packages = {
  list: (projectId: string) => request<any[]>(`/packages?projectId=${projectId}`),
  get: (id: string) => request<any>(`/packages/${id}`),
  create: (data: any) => request<any>("/packages", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/packages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Documents ──────────────────────────────────────────────────
export const documents = {
  list: (packageId: string) => request<any[]>(`/documents?packageId=${packageId}`),
  create: (data: any) => request<any>("/documents", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/documents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Inspections ────────────────────────────────────────────────
export const inspections = {
  list: (packageId: string) => request<any[]>(`/inspections?packageId=${packageId}`),
  create: (data: any) => request<any>("/inspections", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/inspections/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Issues ─────────────────────────────────────────────────────
export const issues = {
  list: (packageId: string) => request<any[]>(`/issues?packageId=${packageId}`),
  create: (data: any) => request<any>("/issues", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/issues/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Approvals ──────────────────────────────────────────────────
export const approvals = {
  list: (packageId: string) => request<any[]>(`/approvals?packageId=${packageId}`),
  create: (data: any) => request<any>("/approvals", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/approvals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Activity ───────────────────────────────────────────────────
export const activity = {
  list: (packageId?: string) => request<any[]>(`/activity${packageId ? `?packageId=${packageId}` : ""}`),
  create: (data: any) => request<any>("/activity", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Members ────────────────────────────────────────────────────
export const members = {
  list: (packageId: string) => request<any[]>(`/members?packageId=${packageId}`),
  create: (data: any) => request<any>("/members", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/members/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<any>(`/members/${id}`, { method: "DELETE" }),
};

// ─── Comments ───────────────────────────────────────────────────
export const comments = {
  list: (packageId: string) => request<any[]>(`/comments?packageId=${packageId}`),
  create: (packageId: string, text: string) =>
    request<any>("/comments", { method: "POST", body: JSON.stringify({ packageId, text }) }),
};

// ─── Contractors ────────────────────────────────────────────────
export const contractors = {
  tree: () => request<any[]>("/contractors/tree"),
  link: (childId: string, parentId: string) =>
    request<any>("/contractors/link", { method: "POST", body: JSON.stringify({ childId, parentId }) }),
};
