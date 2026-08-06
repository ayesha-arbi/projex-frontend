const API_BASE = import.meta.env?.VITE_API_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function getProjectFull(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/full`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load project details.");
  return data.project;
}