import { currentWeekRange, getDashboardData } from "../services/api.js";
import { badge } from "../components/ui.js";

function fallbackData(range = currentWeekRange()) {
  return {
    range,
    resumen: {
      switches: { ok: 81, total: 83, pct: 97.6 },
      servidores: { ok: 42, total: 42, pct: 100 },
      servicios: { ok: 16, total: 16, pct: 100 },
      backups: {
        arcserve: { ok: 44, total: 44, pct: 100 },
        oracle: { ok: 24, total: 25, pct: 96 },
      },
      ups_alertas: [],
      vpn_dias_operativos: 5,
    },
    ambiente: [
      { fecha: range.start, temperatura: 20.4, humedad: 58.4 },
      { fecha: range.today, temperatura: 21.1, humedad: 59.2 },
    ],
    radioenlaces: [
      { fecha: range.today, nombre: "Radioenlace 1 - SW_Alojamiento (10.100.0.16)", estado: "ok" },
      { fecha: range.today, nombre: "Radioenlace 2 - SW_Loreto (10.100.0.182)", estado: "ok" },
    ],
    biometricos: [
      { fecha: range.today, nombre: "Reloj biometrico principal", estado: "ok" },
      { fecha: range.today, nombre: "Reloj biometrico contingencia", estado: "ok" },
    ],
  };
}

function statusTone(value) {
  if (value >= 98) return "ok";
  if (value >= 90) return "warn";
  return "fail";
}

function stateClass(status) {
  const value = String(status || "").toLowerCase();
  if (["ok", "operativo", "sync", "secure"].includes(value)) return "ok";
  if (["alert", "warning"].includes(value)) return "warn";
  if (["fail", "falla", "critical"].includes(value)) return "fail";
  return "info";
}

function formatDate(value, options = { weekday: "short", day: "numeric", month: "numeric" }) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-PE", options).replace(".", "");
}

function weekDays(range) {
  const days = [];
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(cursor.toISOString().slice(0, 10));
  }
  return days;
}

function addDays(value, days) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function rangeFromStart(start) {
  return {
    start,
    end: addDays(start, 4),
    today: currentWeekRange().today,
  };
}

function dashboardRangeFromHash() {
  const current = currentWeekRange();
  const query = globalThis.location?.hash?.split("?")[1] || "";
  const params = new URLSearchParams(query);
  const start = params.get("start");
  return /^\d{4}-\d{2}-\d{2}$/.test(start || "") ? rangeFromStart(start) : current;
}

function weekControls(range) {
  const current = currentWeekRange();
  const prevStart = addDays(range.start, -7);
  const nextStart = addDays(range.start, 7);
  const isCurrent = range.start === current.start;
  return `
    <div class="dashboard-week-controls" aria-label="Navegacion semanal">
      <a class="week-control" href="#/dashboard?start=${prevStart}" title="Semana anterior">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </a>
      <a class="week-control week-control--current" href="#/dashboard">Semana actual</a>
      <a class="week-control ${isCurrent ? "is-disabled" : ""}" href="${isCurrent ? "#/dashboard" : `#/dashboard?start=${nextStart}`}" title="Semana siguiente">
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </a>
    </div>
  `;
}

function latestByName(items) {
  const map = new Map();
  [...items].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))).forEach(item => {
    map.set(item.nombre || item.grupo || item.tipo, item);
  });
  return [...map.values()];
}

function dashboardStat({ label, value, sub, icon, tone = "info" }) {
  return `
    <article class="dashboard-stat dashboard-stat--${tone}">
      <div class="dashboard-stat__icon"><i class="${icon}" aria-hidden="true"></i></div>
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
        <p>${sub}</p>
      </div>
    </article>
  `;
}

function weekStrip(range, items) {
  const byDate = new Map();
  items.forEach(item => {
    const tone = stateClass(item.estado);
    const current = byDate.get(item.fecha);
    if (!current || tone === "fail" || (tone === "warn" && current !== "fail")) byDate.set(item.fecha, tone);
  });

  return `
    <div class="dashboard-week">
      ${weekDays(range).map(fecha => {
        const tone = byDate.get(fecha) || "empty";
        return `
          <div class="dashboard-week__day dashboard-week__day--${tone}">
            <span>${formatDate(fecha)}</span>
            <strong>${tone === "empty" ? "-" : tone.toUpperCase()}</strong>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function tempChart(points) {
  const values = points.map(item => Number(item.temperatura)).filter(Number.isFinite);
  const safe = values.length ? values : [20.4, 20.8, 21.1, 20.9, 21.3];
  const width = 620;
  const height = 150;
  const max = Math.max(...safe) + .4;
  const min = Math.min(...safe) - .4;
  const coords = safe.map((value, index) => {
    const x = safe.length === 1 ? width / 2 : (index / (safe.length - 1)) * width;
    const y = height - ((value - min) / Math.max(.1, max - min)) * (height - 26) - 13;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return `
    <svg class="dashboard-temp-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Historial de temperatura">
      <line x1="0" y1="122" x2="${width}" y2="122"></line>
      <line x1="0" y1="78" x2="${width}" y2="78"></line>
      <line x1="0" y1="34" x2="${width}" y2="34"></line>
      <polyline points="${coords}" fill="none"></polyline>
      ${safe.map((value, index) => {
        const [x, y] = coords.split(" ")[index].split(",");
        return `<circle cx="${x}" cy="${y}" r="4"><title>${value.toFixed(1)} C</title></circle>`;
      }).join("")}
    </svg>
  `;
}

function radioPanel(items, today) {
  const rows = latestByName(items).slice(0, 2);
  return `
    <section class="dashboard-panel">
      <div class="dashboard-panel__head">
        <div>
          <span>Conectividad</span>
          <h2>Radioenlace</h2>
        </div>
        <i class="fa-solid fa-tower-broadcast" aria-hidden="true"></i>
      </div>
      <div class="dashboard-list">
        ${rows.map(item => `
          <div class="dashboard-list__item">
            <div>
              <strong>${item.nombre}</strong>
              <span>${String(item.estado || "ok").toUpperCase()} - ${formatDate(item.fecha || today)}</span>
            </div>
            ${badge(item.estado || "ok")}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function ambientePanel(items, today) {
  const latest = [...items].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))).at(-1) || {};
  const fecha = latest.fecha || today;
  const temperatura = Number(latest.temperatura || 20.8);
  const humedad = Number(latest.humedad || 59.2);

  return `
    <section class="dashboard-panel dashboard-panel--wide">
      <div class="dashboard-panel__head">
        <div>
          <span>Aire acondicionado - ${formatDate(fecha, { weekday: "short", day: "numeric", month: "numeric", year: "numeric" })}</span>
          <h2>Temperatura Centro de Datos &deg;C</h2>
        </div>
        <div class="dashboard-temp-now">${temperatura.toFixed(1)} &deg;C</div>
      </div>
      ${tempChart(items)}
      <div class="dashboard-panel__foot">
        <span>Historial acumulado</span>
        <strong>Humedad ${humedad.toFixed(1)}%</strong>
      </div>
    </section>
  `;
}

function biometricoPanel(items, today) {
  const rows = latestByName(items).slice(0, 4);
  return `
    <section class="dashboard-panel">
      <div class="dashboard-panel__head">
        <div>
          <span>Control interno</span>
          <h2>Relojes biometricos</h2>
        </div>
        <i class="fa-solid fa-fingerprint" aria-hidden="true"></i>
      </div>
      <div class="dashboard-list dashboard-list--compact">
        ${rows.map(item => `
          <div class="dashboard-list__item">
            <div>
              <strong>${item.nombre}</strong>
              <span>${formatDate(item.fecha || today)}</span>
            </div>
            ${badge(item.estado || "ok")}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

export async function dashboardView() {
  const selectedRange = dashboardRangeFromHash();
  const fallback = fallbackData(selectedRange);
  const data = await getDashboardData(selectedRange).catch(() => fallback);
  const range = data.range || selectedRange;
  const resumen = data.resumen || fallback.resumen;
  const ambiente = data.ambiente?.length ? data.ambiente : (resumen.ambiente || fallback.ambiente);
  const radioenlaces = data.radioenlaces?.length ? data.radioenlaces : (resumen.radioenlaces || fallback.radioenlaces);
  const biometricos = data.biometricos?.length ? data.biometricos : (resumen.biometricos || fallback.biometricos);
  const upsAlerts = resumen.ups_alertas || [];

  return `
    <section class="dashboard-page">
      <header class="dashboard-hero">
        <div>
          <span>Resumen ejecutivo</span>
          <h1>Panel de monitoreo TI</h1>
          <p>Estado semanal de infraestructura, servicios, ambiente y continuidad operativa.</p>
        </div>
        <div class="dashboard-hero__actions">
          ${weekControls(range)}
          <span class="date-chip">${range.start} / ${range.end}</span>
          <a class="btn btn--primary" href="#/registro">Nuevo registro</a>
        </div>
      </header>

      <section class="dashboard-stats">
        ${dashboardStat({ label: "Switches", value: `${resumen.switches.ok}/${resumen.switches.total}`, sub: `${resumen.switches.pct}% disponibilidad`, icon: "fa-solid fa-network-wired", tone: statusTone(resumen.switches.pct) })}
        ${dashboardStat({ label: "Servidores", value: `${resumen.servidores.ok}/${resumen.servidores.total}`, sub: "Windows + Linux", icon: "fa-solid fa-server", tone: statusTone(resumen.servidores.pct) })}
        ${dashboardStat({ label: "Servicios web", value: `${resumen.servicios.ok}/${resumen.servicios.total}`, sub: "Aplicaciones publicadas", icon: "fa-solid fa-globe", tone: statusTone(resumen.servicios.pct) })}
        ${dashboardStat({ label: "Backups", value: `${resumen.backups.arcserve.pct}%`, sub: "Arcserve principal", icon: "fa-solid fa-database", tone: statusTone(resumen.backups.arcserve.pct) })}
        ${dashboardStat({ label: "UPS", value: upsAlerts.length, sub: upsAlerts.length ? "Alertas activas" : "Sin alertas", icon: "fa-solid fa-bolt", tone: upsAlerts.length ? "warn" : "ok" })}
      </section>

      <section class="dashboard-grid">
        <section class="dashboard-panel dashboard-panel--wide">
          <div class="dashboard-panel__head">
            <div>
              <span>Vista semanal</span>
              <h2>Estado operativo consolidado</h2>
            </div>
            <i class="fa-solid fa-calendar-week" aria-hidden="true"></i>
          </div>
          ${weekStrip(range, [...(data.switches || []), ...(data.servidores || []), ...(data.servicios || []), ...radioenlaces])}
        </section>

        ${radioPanel(radioenlaces, range.today)}
        ${ambientePanel(ambiente, range.today)}
        ${biometricoPanel(biometricos, range.today)}
      </section>
    </section>
  `;
}
