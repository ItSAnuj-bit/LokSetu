const API_BASE_URL = "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("loksetu_worker_access_token");

  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "Something went wrong. Please try again."
    );
  }

  return data;
}

export function saveWorkerToken(token) {
  localStorage.setItem("loksetu_worker_access_token", token);
}

export function getWorkerToken() {
  return localStorage.getItem("loksetu_worker_access_token");
}

export function clearWorkerToken() {
  localStorage.removeItem("loksetu_worker_access_token");
}