import { currentWeekRange, getHistoryData } from "../services/api.js";
import { badge } from "../components/ui.js";

const queryTabs = [
  { id: "switches", label: "Switches" },
  { id: "servidores", label: "Servidores" },
  { id: "servicios", label: "Servicios" },
  { id: "backups", label: "Backups" },
  { id: "ups", label: "UPS" },
  { id: "ambiente", label: "Ambiente" },
  { id: "vpn", label: "VPN" },
];

function displaySede(sede) {
  return sede === "DP" ? "Central" : (sede || "Central");
}

function weekDates(range) {
  const dates = [];
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
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

function queryRangeFromHash() {
  const current = currentWeekRange();
  const query = globalThis.location?.hash?.split("?")[1] || "";
  const params = new URLSearchParams(query);
  const start = params.get("start");
  return /^\d{4}-\d{2}-\d{2}$/.test(start || "") ? rangeFromStart(start) : current;
}

function queryWeekControls(range) {
  const current = currentWeekRange();
  const prevStart = addDays(range.start, -7);
  const nextStart = addDays(range.start, 7);
  const isCurrent = range.start === current.start;
  return `
    <div class="dashboard-week-controls" aria-label="Navegacion semanal">
      <a class="week-control" href="#/consultas?start=${prevStart}" title="Semana anterior">
        <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
      </a>
      <a class="week-control week-control--current" href="#/consultas">Semana actual</a>
      <a class="week-control ${isCurrent ? "is-disabled" : ""}" href="${isCurrent ? "#/consultas" : `#/consultas?start=${nextStart}`}" title="Semana siguiente">
        <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
      </a>
    </div>
  `;
}

function dayLabel(value) {
  const date = new Date(`${value}T00:00:00`);
  const day = date.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "");
  const shortDate = date.toLocaleDateString("es-PE", { day: "numeric", month: "numeric" });
  return `${day} ${shortDate}`;
}

function uniqueBy(items, key) {
  return [...new Map(items.map(item => [key(item), item])).values()];
}

function normalizeStatus(status) {
  if (!status) return "";
  if (status === "warning") return "alert";
  if (status === "operativo" || status === "sync" || status === "secure") return "ok";
  if (status === "falla" || status === "critical") return "fail";
  return status;
}

function statusCell(status) {
  const value = normalizeStatus(status);
  if (!value) return `<span class="state-pill state-pill--empty">-</span>`;
  const label = value === "alert" ? "ALERT" : value.toUpperCase();
  return `<span class="state-pill state-pill--${value}">${label}</span>`;
}

function valueCell(value) {
  if (value === undefined || value === null || value === "") return `<span class="state-pill state-pill--empty">-</span>`;
  return `<span class="query-value">${value}</span>`;
}

function escapeAttr(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function linkCell(value) {
  if (!value) return `<span class="state-pill state-pill--empty">-</span>`;
  const text = String(value);
  if (!/^https?:\/\//i.test(text)) return `<span class="query-value">${text}</span>`;
  return `
    <a class="query-link" href="${escapeAttr(text)}" target="_blank" rel="noopener noreferrer">
      <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
      Abrir
    </a>
  `;
}

function pivotRows(items, dates, nameKey = "nombre", valueGetter = item => item.estado, metaGetter = () => ({})) {
  const names = [...new Set(items.map(item => item[nameKey]))].filter(Boolean).sort();
  return names.map(name => {
    const group = items.filter(item => item[nameKey] === name);
    const byDate = Object.fromEntries(
      group.map(item => [item.fecha, valueGetter(item)])
    );
    return { name, meta: metaGetter(group[0] || {}), values: dates.map(fecha => byDate[fecha]) };
  });
}

function weeklyTable({ title, subtitle, firstHeader, rows, dates, cell = statusCell, extraHeaders = [], extraCells = () => [] }) {
  const totalColumns = dates.length + 1 + extraHeaders.length;
  return `
    <section class="query-block">
      <div class="query-block__head">
        <div>
          <h3>${title}</h3>
          ${subtitle ? `<p>${subtitle}</p>` : ""}
        </div>
        <span>${rows.length} items</span>
      </div>
      <div class="query-table-wrap">
        <table class="query-table">
          <thead>
            <tr>
              <th>${firstHeader}</th>
              ${extraHeaders.map(header => `<th class="query-extra-head">${header}</th>`).join("")}
              ${dates.map(fecha => `<th>${dayLabel(fecha)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map(row => `
              <tr>
                <td><strong>${row.name}</strong></td>
                ${extraCells(row).map(value => `<td class="query-extra-cell">${value}</td>`).join("")}
                ${row.values.map(value => `<td>${cell(value)}</td>`).join("")}
              </tr>
            `).join("") : `
              <tr><td colspan="${totalColumns}" class="query-empty">Sin registros en el periodo.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function queryStatCard({ label, value, sub, tone = "info", icon = "fa-solid fa-circle-info" }) {
  return `
    <article class="query-stat query-stat--${tone}">
      <div class="query-stat__icon"><i class="${icon}" aria-hidden="true"></i></div>
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
        <p>${sub}</p>
      </div>
    </article>
  `;
}

function switchesPanel(data, dates) {
  const central = data.switches.filter(item => item.sede === "DP");
  const otras = data.switches.filter(item => item.sede !== "DP");
  const radioenlaces = data.radioenlaces || [];

  return `
    <div class="query-summary-grid">
      ${queryStatCard({ label: "Central", value: uniqueBy(central, item => item.nombre).length, sub: "switches registrados", tone: "ok", icon: "fa-solid fa-network-wired" })}
      ${queryStatCard({ label: "Otras sedes", value: uniqueBy(otras, item => item.nombre).length, sub: "switches registrados", tone: "info", icon: "fa-solid fa-building" })}
      ${queryStatCard({ label: "Radioenlace", value: uniqueBy(radioenlaces, item => item.nombre).length, sub: "enlaces registrados", tone: "warn", icon: "fa-solid fa-tower-broadcast" })}
    </div>
    ${weeklyTable({
      title: "Switches central",
      subtitle: "Estado diario por nombre de equipo.",
      firstHeader: "Nombre equipo",
      dates,
      rows: pivotRows(central, dates),
    })}
    ${weeklyTable({
      title: "Switches otras sedes",
      subtitle: "Consulta separada por sede y equipo.",
      firstHeader: "Sede / nombre",
      dates,
      rows: pivotRows(otras.map(item => ({ ...item, nombre: `${displaySede(item.sede)} - ${item.nombre}` })), dates),
    })}
    ${weeklyTable({
      title: "Radioenlace",
      subtitle: "Dispositivos de enlace registrados en el periodo.",
      firstHeader: "Dispositivo",
      dates,
      rows: pivotRows(radioenlaces, dates),
    })}
  `;
}

function servidoresPanel(data, dates) {
  const windows = uniqueBy(data.servidores.filter(item => item.tipo === "Windows"), item => item.nombre).length;
  const linux = uniqueBy(data.servidores.filter(item => item.tipo === "Linux"), item => item.nombre).length;
  return `
    <div class="query-summary-grid">
      ${queryStatCard({ label: "Windows", value: windows, sub: "servidores registrados", tone: "info", icon: "fa-brands fa-windows" })}
      ${queryStatCard({ label: "Linux", value: linux, sub: "servidores registrados", tone: "ok", icon: "fa-brands fa-linux" })}
    </div>
    ${weeklyTable({
      title: "Servidores",
      subtitle: "Estado semanal por servidor y rol.",
      firstHeader: "Servidor",
      dates,
      rows: pivotRows(data.servidores, dates, "nombre", item => item.estado, item => ({
        rol: item.rol,
        tipo: item.tipo,
      })),
      extraHeaders: ["Rol", "Tipo"],
      extraCells: row => [valueCell(row.meta.rol), valueCell(row.meta.tipo)],
    })}
  `;
}

function serviciosPanel(data, dates) {
  return `
    <div class="query-summary-grid">
      ${queryStatCard({ label: "Servicios", value: uniqueBy(data.servicios, item => item.nombre).length, sub: "servicios registrados", tone: "info", icon: "fa-solid fa-globe" })}
    </div>
    ${weeklyTable({
      title: "Servicios web",
      subtitle: "Disponibilidad registrada por servicio.",
      firstHeader: "Servicio",
      dates,
      rows: pivotRows(data.servicios, dates, "nombre", item => item.estado, item => ({
        url: item.url,
      })),
      extraHeaders: ["Enlace"],
      extraCells: row => [linkCell(row.meta.url)],
    })}
  `;
}

function backupPct(ok, total) {
  const safeTotal = Math.max(0, Number(total) || 0);
  if (!safeTotal) return "";
  return `${Math.max(0, Math.min(100, Math.round(((Number(ok) || 0) / safeTotal) * 100)))}%`;
}

function backupsPanel(data, dates) {
  const arcserve = data.backups.map(item => ({
    fecha: item.fecha,
    nombre: "Arcserve",
    valor: backupPct(item.arcserve_exitosos, item.arcserve_total),
  }));
  const oracle = data.backups.map(item => ({
    fecha: item.fecha,
    nombre: "Oracle",
    valor: backupPct(item.oracle_exitosos, item.oracle_total),
  }));

  return `
    <div class="query-summary-grid">
      ${queryStatCard({ label: "Motores", value: 2, sub: "Arcserve y Oracle", tone: "info", icon: "fa-solid fa-database" })}
      ${queryStatCard({ label: "Dias", value: uniqueBy(data.backups, item => item.fecha).length, sub: "con registro", tone: "ok", icon: "fa-solid fa-calendar-check" })}
    </div>
    ${weeklyTable({
      title: "Backups",
      subtitle: "Porcentaje diario de jobs exitosos.",
      firstHeader: "Motor",
      dates,
      rows: pivotRows([...arcserve, ...oracle], dates, "nombre", item => item.valor),
      cell: valueCell,
    })}
  `;
}

function upsPanel(data, dates) {
  const rows = data.ups.map(item => ({ ...item, nombre: item.grupo }));
  const alertas = data.ups.filter(item => normalizeStatus(item.estado) !== "ok").length;
  return `
    <div class="query-summary-grid">
      ${queryStatCard({ label: "Grupos UPS", value: uniqueBy(rows, item => item.nombre).length, sub: "grupos registrados", tone: "info", icon: "fa-solid fa-bolt" })}
      ${queryStatCard({ label: "Alertas/Fallos", value: alertas, sub: "registros no OK", tone: alertas ? "warn" : "ok", icon: "fa-solid fa-triangle-exclamation" })}
    </div>
    ${weeklyTable({
      title: "UPS",
      subtitle: "Estado por grupo UPS.",
      firstHeader: "Grupo",
      dates,
      rows: pivotRows(rows, dates),
    })}
  `;
}

function ambientePanel(data, dates) {
  const rows = [
    ...data.ambiente.map(item => ({ fecha: item.fecha, nombre: "Temperatura", valor: `${item.temperatura} C` })),
    ...data.ambiente.map(item => ({ fecha: item.fecha, nombre: "Humedad", valor: `${item.humedad}%` })),
  ];
  return `
    <div class="query-summary-grid">
      ${queryStatCard({ label: "Variables", value: 2, sub: "temperatura y humedad", tone: "info", icon: "fa-solid fa-temperature-half" })}
      ${queryStatCard({ label: "Dias", value: uniqueBy(data.ambiente, item => item.fecha).length, sub: "con lectura", tone: "ok", icon: "fa-solid fa-calendar-days" })}
    </div>
    ${weeklyTable({
      title: "Ambiente",
      subtitle: "Lecturas diarias de ambiente.",
      firstHeader: "Variable",
      dates,
      rows: pivotRows(rows, dates, "nombre", item => item.valor),
      cell: valueCell,
    })}
  `;
}

function vpnPanel(data, dates) {
  const rows = [
    ...data.vpn.map(item => ({ fecha: item.fecha, nombre: "Estado", valor: item.estado })),
    ...data.vpn.map(item => ({ fecha: item.fecha, nombre: "Hora de conexion", valor: item.hora_conexion })),
    ...data.vpn.map(item => ({ fecha: item.fecha, nombre: "Proveedor", valor: item.proveedor })),
    ...data.vpn.map(item => ({ fecha: item.fecha, nombre: "Dispositivo", valor: item.dispositivo })),
  ];
  return `
    <div class="query-summary-grid">
      ${queryStatCard({ label: "Dias", value: uniqueBy(data.vpn, item => item.fecha).length, sub: "con registro", tone: "info", icon: "fa-solid fa-shield-halved" })}
      ${queryStatCard({ label: "Fallos", value: data.vpn.filter(item => normalizeStatus(item.estado) === "fail").length, sub: "registros con falla", tone: data.vpn.some(item => normalizeStatus(item.estado) === "fail") ? "fail" : "ok", icon: "fa-solid fa-signal" })}
    </div>
    ${weeklyTable({
      title: "VPN",
      subtitle: "Consulta diaria del enlace remoto.",
      firstHeader: "Campo",
      dates,
      rows: pivotRows(rows, dates, "nombre", item => item.valor),
      cell: valueCell,
    })}
  `;
}

function fallbackHistory(range = currentWeekRange()) {
  return {
    range,
    switches: [
      { fecha: range.start, nombre: "SW_CORE (G02)", estado: "ok", sede: "DP" },
      { fecha: range.today, nombre: "SW_CORE (G02)", estado: "ok", sede: "DP" },
      { fecha: range.today, nombre: "SW_PISO3_PCM_C9200_48P", estado: "ok", sede: "PCM" },
    ],
    servidores: [{ fecha: range.today, nombre: "DPSRVMAIL001", estado: "ok", rol: "Exchange", tipo: "Windows" }],
    servicios: [{ fecha: range.today, nombre: "SGD Oficial", estado: "ok", url: "Servicio verificado" }],
    backups: [{ fecha: range.today, arcserve_exitosos: 44, arcserve_total: 44, oracle_exitosos: 25, oracle_total: 25 }],
    ups: [{ fecha: range.today, grupo: "OACGD", estado: "alert", observacion: "Correctivo pendiente" }],
    ambiente: [{ fecha: range.today, temperatura: 20.8, humedad: 59.2 }],
    vpn: [{ fecha: range.today, hora_conexion: "09:15 a.m.", estado: "operativo", proveedor: "Telefonica", dispositivo: "PC HP408" }],
    radioenlaces: [{ fecha: range.today, nombre: "Radioenlace 1 - SW_Alojamiento", estado: "ok" }],
  };
}

function panelByTab(tab, data, dates) {
  const map = {
    switches: switchesPanel,
    servidores: servidoresPanel,
    servicios: serviciosPanel,
    backups: backupsPanel,
    ups: upsPanel,
    ambiente: ambientePanel,
    vpn: vpnPanel,
  };
  return map[tab](data, dates);
}

export function bindConsultasEvents() {
  document.querySelectorAll(".query-tab").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".query-tab").forEach(item => item.classList.remove("is-active"));
      document.querySelectorAll(".query-panel").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      document.querySelector(`#query-panel-${button.dataset.queryTab}`)?.classList.add("is-active");
    });
  });
}

export async function consultasView() {
  const range = queryRangeFromHash();
  const data = await getHistoryData(range).catch(() => fallbackHistory(range));
  data.ambiente = (data.ambiente || []).filter(item => item.fecha >= data.range.start && item.fecha <= data.range.end);
  data.vpn = data.vpn || [];
  data.backups = data.backups || [];
  const dates = weekDates(data.range);

  return `
    <section class="query-page">
      <header class="query-head">
        <div>
          <h1 class="page-title">Consultas de registros</h1>
          <p>Revision semanal separada por tipo de registro operativo.</p>
        </div>
        <div class="query-head__actions">
          ${queryWeekControls(data.range)}
          <span class="date-chip">${data.range.start} / ${data.range.end}</span>
        </div>
      </header>

      <nav class="query-tabs" aria-label="Tipos de consulta">
        ${queryTabs.map((tab, index) => `
          <button class="query-tab ${index === 0 ? "is-active" : ""}" type="button" data-query-tab="${tab.id}">
            ${tab.label}
          </button>
        `).join("")}
      </nav>

      <section class="query-panels">
        ${queryTabs.map((tab, index) => `
          <div class="query-panel ${index === 0 ? "is-active" : ""}" id="query-panel-${tab.id}">
            ${panelByTab(tab.id, data, dates)}
          </div>
        `).join("")}
      </section>
    </section>
  `;
}
