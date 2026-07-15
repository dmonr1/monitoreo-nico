const origin = globalThis.location?.origin || "http://localhost:8000";
const API_BASE = `${origin}/api`;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

async function requestOptional(path, fallback = []) {
  return request(path).catch(() => fallback);
}

export function currentWeekRange() {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay() || 7;
  monday.setDate(today.getDate() - day + 1);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const fmt = value => value.toISOString().slice(0, 10);

  return {
    start: fmt(monday),
    end: fmt(friday),
    today: fmt(today),
  };
}

export async function getDashboardData(range = currentWeekRange()) {
  const query = `fecha_inicio=${range.start}&fecha_fin=${range.end}`;
  const [resumen, switches, servidores, servicios, backups, ups, vpn, ambiente, radioenlaces, biometricos] = await Promise.all([
    request(`/resumen?${query}`),
    request(`/switches?${query}`),
    request(`/servidores?${query}`),
    request(`/servicios?${query}`),
    request(`/backups?${query}`),
    request(`/ups?${query}`),
    request(`/vpn?${query}`),
    requestOptional("/ambiente?dias=30"),
    requestOptional(`/radioenlaces?${query}`),
    requestOptional(`/biometricos?${query}`),
  ]);

  return { range, resumen, switches, servidores, servicios, backups, ups, vpn, ambiente, radioenlaces, biometricos };
}

export async function getHistoryData(range = currentWeekRange()) {
  const query = `fecha_inicio=${range.start}&fecha_fin=${range.end}`;
  const [switches, servidores, servicios, backups, ups, ambiente, vpn, accessPoints, hardware, radioenlaces] = await Promise.all([
    request(`/switches?${query}`),
    request(`/servidores?${query}`),
    request(`/servicios?${query}`),
    request(`/backups?${query}`),
    request(`/ups?${query}`),
    requestOptional("/ambiente?dias=30"),
    request(`/vpn?${query}`),
    requestOptional(`/access-points?${query}`),
    requestOptional(`/hardware?${query}`),
    requestOptional(`/radioenlaces?${query}`),
  ]);

  return { range, switches, servidores, servicios, backups, ups, ambiente, vpn, accessPoints, hardware, radioenlaces };
}

export async function saveDailyRecord(payload) {
  const tasks = [
    request("/switches", { method: "POST", body: JSON.stringify({ fecha: payload.fecha, registros: payload.switches }) }),
    request("/servidores", { method: "POST", body: JSON.stringify({ fecha: payload.fecha, registros: payload.servidores }) }),
    request("/servicios", { method: "POST", body: JSON.stringify({ fecha: payload.fecha, registros: payload.servicios }) }),
    request("/backups", { method: "POST", body: JSON.stringify(payload.backup) }),
    request("/ups", { method: "POST", body: JSON.stringify({ fecha: payload.fecha, registros: payload.ups }) }),
    request("/ambiente", { method: "POST", body: JSON.stringify(payload.ambiente) }),
    request("/vpn", { method: "POST", body: JSON.stringify(payload.vpn) }),
  ];

  return Promise.all(tasks);
}
