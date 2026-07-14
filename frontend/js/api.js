/**
 * api.js — Cliente para conectar el frontend con el backend FastAPI
 * Despacho Presidencial del Perú — Monitoreo TI
 *
 * Cambia API_BASE si el backend corre en otro puerto o servidor.
 * Ejemplo intranet: const API_BASE = "http://192.168.1.50:8000/api"
 */

const API_BASE = `${window.location.origin}/api`;

// ─── Helper ───────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(API_BASE + path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`[API] ${path}`, e.message);
    throw e;
  }
}

// ─── GET endpoints ────────────────────────────────────────────────────────────

export async function getResumen(fechaInicio, fechaFin) {
  let qs = "";
  if (fechaInicio) qs += `?fecha_inicio=${fechaInicio}`;
  if (fechaFin)    qs += `${qs ? "&" : "?"}fecha_fin=${fechaFin}`;
  return apiFetch(`/resumen${qs}`);
}

export async function getSwitches(fechaInicio, fechaFin) {
  return apiFetch(`/switches?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
}

export async function getServidores(fechaInicio, fechaFin) {
  return apiFetch(`/servidores?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
}

export async function getServicios(fechaInicio, fechaFin) {
  return apiFetch(`/servicios?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
}

export async function getBackups(fechaInicio, fechaFin) {
  return apiFetch(`/backups?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
}

export async function getUPS(fechaInicio, fechaFin) {
  return apiFetch(`/ups?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
}

export async function getAmbiente(dias = 30) {
  return apiFetch(`/ambiente?dias=${dias}`);
}

export async function getVPN(fechaInicio, fechaFin) {
  return apiFetch(`/vpn?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
}

// ─── POST endpoints ───────────────────────────────────────────────────────────

export async function postSwitches(fecha, registros) {
  return apiFetch("/switches", {
    method: "POST",
    body: JSON.stringify({ fecha, registros }),
  });
}

export async function postServidores(fecha, registros) {
  return apiFetch("/servidores", {
    method: "POST",
    body: JSON.stringify({ fecha, registros }),
  });
}

export async function postServicios(fecha, registros) {
  return apiFetch("/servicios", {
    method: "POST",
    body: JSON.stringify({ fecha, registros }),
  });
}

export async function postBackup(payload) {
  return apiFetch("/backups", { method: "POST", body: JSON.stringify(payload) });
}

export async function postUPS(fecha, registros) {
  return apiFetch("/ups", {
    method: "POST",
    body: JSON.stringify({ fecha, registros }),
  });
}

export async function postAmbiente(payload) {
  return apiFetch("/ambiente", { method: "POST", body: JSON.stringify(payload) });
}

export async function postVPN(payload) {
  return apiFetch("/vpn", { method: "POST", body: JSON.stringify(payload) });
}

// ─── Helper: semana actual ─────────────────────────────────────────────────────
export function semanaActual() {
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  const fmt = d => d.toISOString().split("T")[0];
  return { inicio: fmt(lunes), fin: fmt(viernes), hoy: fmt(hoy) };
}
