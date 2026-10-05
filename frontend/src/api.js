const API_BASE_URL = "http://127.0.0.1:8000";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("loksetu_access_token");

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

export function saveAuth(data) {
  if (data?.access_token) {
    localStorage.setItem(
      "loksetu_access_token",
      data.access_token
    );
  }

  if (data?.refresh_token) {
    localStorage.setItem(
      "loksetu_refresh_token",
      data.refresh_token
    );
  }

  if (data?.user) {
    localStorage.setItem(
      "loksetu_user",
      JSON.stringify(data.user)
    );
  }
}

export function clearAuth() {
  localStorage.removeItem("loksetu_access_token");
  localStorage.removeItem("loksetu_refresh_token");
  localStorage.removeItem("loksetu_user");
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem("loksetu_user");

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(
    localStorage.getItem("loksetu_access_token")
  );
}