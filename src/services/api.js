const API_BASE = process.env.REACT_APP_API_BASE || "";

// Reads token from localStorage and attaches to requests
const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

const buildUrl = (path) => {
  if (!API_BASE) return path; // fallback for local dev
  if (path.startsWith("http")) return path;
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

export const api = {
  async get(path, options = {}) {
    const res = await fetch(buildUrl(path), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      ...options,
    });
    if (!res.ok) throw res;
    return res.status !== 204 ? res.json() : null;
  },

  async post(path, body, options = {}) {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {})
    };
    if (!(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(buildUrl(path), {
      method: "POST",
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
    if (!res.ok) throw res;
    return res.status !== 204 ? res.json() : null;
  },

  async put(path, body, options = {}) {
    const res = await fetch(buildUrl(path), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      body: JSON.stringify(body),
      ...options,
    });
    if (!res.ok) throw res;
    return res.status !== 204 ? res.json() : null;
  },

  async del(path, options = {}) {
    const res = await fetch(buildUrl(path), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      ...options,
    });
    if (!res.ok) throw res;
    return res.status !== 204 ? res.json() : null;
  },
};
