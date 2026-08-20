const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:4000").trim();

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("payquick_session");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.error || `API request failed: ${response.status}`
    );
  }

  return response.json();
}

export function saveSession(token) {
  localStorage.setItem("payquick_session", token);
}

export function clearSession() {
  localStorage.removeItem("payquick_session");
}
