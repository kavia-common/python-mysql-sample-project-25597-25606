/**
 * API client for the backend.
 *
 * Uses environment variables:
 * - REACT_APP_API_BASE (preferred)
 * - REACT_APP_BACKEND_URL (fallback)
 *
 * Never hardcode URLs; CI/deploy will inject env vars.
 */

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the API base URL read from env vars (no trailing slash). */
  const raw = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "";
  return raw.replace(/\/+$/, "");
}

function joinUrl(base, path) {
  const b = base.replace(/\/+$/, "");
  const p = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function parseJsonSafe(resp) {
  const text = await resp.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function request(path, { method = "GET", body, headers } = {}) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "API base URL is not configured. Set REACT_APP_API_BASE or REACT_APP_BACKEND_URL."
    );
  }

  const url = joinUrl(base, path);
  const resp = await fetch(url, {
    method,
    headers: { ...DEFAULT_HEADERS, ...(headers || {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseJsonSafe(resp);

  if (!resp.ok) {
    const message =
      (data && (data.message || data.error || data.detail)) ||
      `Request failed with status ${resp.status}`;
    const err = new Error(message);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}

// PUBLIC_INTERFACE
export const apiClient = {
  /** Fetch all users. Expects backend to provide GET /api/users. */
  async listUsers() {
    return request("/api/users");
  },

  /** Create a user. Expects backend to provide POST /api/users. */
  async createUser(payload) {
    return request("/api/users", { method: "POST", body: payload });
  },

  /** Update a user. Expects backend to provide PUT/PATCH /api/users/:id. */
  async updateUser(id, payload) {
    return request(`/api/users/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
  },

  /** Delete a user. Expects backend to provide DELETE /api/users/:id. */
  async deleteUser(id) {
    return request(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
