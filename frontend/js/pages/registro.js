import { servidores, servicios, switches, upsGrupos } from "../data/catalog.js";
import { currentWeekRange, saveDailyRecord } from "../services/api.js";
import { badge } from "../components/ui.js";

const sections = [
  { id: "switches", label: "Switches" },
  { id: "servidores", label: "Servidores" },
  { id: "servicios", label: "Servicios" },
  { id: "backups", label: "Backups" },
  { id: "ups", label: "UPS" },
  { id: "ambiente", label: "Ambiente" },
  { id: "vpn", label: "VPN" },
];

const cardIcons = {
  switches: "./assets/switch-svg.svg",
  servidores: "./assets/server-svg.svg",
  servicios: "./assets/services-svgrepo-com.svg",
};

const backupThresholds = {
  ok: 95,
  alert: 80,
};

let activeSectionId = "switches";
let recordDraft = createDefaultDraft();

function createDefaultDraft() {
  const today = currentWeekRange().today;
  return {
    fecha: today,
    switches: switches.map(item => ({ ...item, estado: "ok" })),
    servidores: servidores.map(item => ({ ...item, estado: "ok" })),
    servicios: servicios.map(item => ({ ...item, estado: "ok" })),
    ups: upsGrupos.map(grupo => ({ grupo, estado: "ok", observacion: "" })),
    backup: {
      fecha: today,
      arcserve_exitosos: 44,
      arcserve_total: 44,
      oracle_exitosos: 25,
      oracle_total: 25,
      observaciones: "",
    },
    ambiente: { fecha: today, temperatura: 20.8, humedad: 59.2 },
    vpn: {
      fecha: today,
      hora_conexion: "09:15 a.m.",
      estado: "operativo",
      proveedor: "Telefonica",
      dispositivo: "PC HP408",
    },
  };
}

function assetCard(item, type) {
  const title = item.nombre || item;
  const meta = item.sede || item.rol || item.grupo || "Monitoreo";

  if (type === "switches") return statusToggleCard({ type, title, meta, metaLabel: displayMeta(meta), state: item.estado });
  if (type === "servidores") return statusToggleCard({
    type,
    title,
    meta,
    metaLabel: `${item.tipo} - ${item.rol}`,
    extraAttrs: `data-tipo="${item.tipo}" data-rol="${item.rol}"`,
    state: item.estado,
  });
  if (type === "servicios") return statusToggleCard({
    type,
    title,
    meta: item.url,
    metaLabel: item.grupo,
    extraAttrs: `data-url="${item.url}"`,
    state: item.estado,
  });
  if (type === "ups") return upsCard(item);

  return `
    <article class="asset-card" data-type="${type}" data-name="${title}">
      <div class="asset-card__top">
        <strong>${title}</strong>
        ${badge("ok")}
      </div>
      <div class="form-grid">
        <label class="field">
          <span>Estado</span>
          <select data-field="estado">
            <option value="ok">OK</option>
            <option value="alert">ALERT</option>
            <option value="fail">FAIL</option>
          </select>
        </label>
        <label class="field">
          <span>${type === "switches" ? "Sede" : "Grupo"}</span>
          <input data-field="meta" value="${meta}">
        </label>
      </div>
      <label class="field" style="margin-top:12px">
        <span>Estado operativo</span>
        <select data-field="estado">
          <option value="ok">OK</option>
          <option value="alert">ALERT</option>
          <option value="fail">FAIL</option>
        </select>
      </label>
    </article>
  `;
}

function statusToggleCard({ type, title, meta, metaLabel, extraAttrs = "", state = "ok" }) {
  const icon = cardIcons[type];
  const cardMark = icon
    ? `<img class="asset-card__mark" src="${icon}" alt="" aria-hidden="true">`
    : "";
  return `
    <article class="asset-card asset-card--status asset-card--${type}" data-type="${type}" data-name="${title}" data-meta="${meta}" data-state="${state}" ${extraAttrs}>
      ${cardMark}
      <div class="asset-card__identity">
        <span class="asset-card__name" title="${title}">${title}</span>
        <span class="asset-card__meta">${metaLabel}</span>
      </div>
      <div class="state-toggle" data-state="${state}" role="group" aria-label="Estado de ${title}">
        <button class="state-toggle__btn ${state === "ok" ? "is-active" : ""}" type="button" data-value="ok">OK</button>
        <button class="state-toggle__btn ${state === "fail" ? "is-active" : ""}" type="button" data-value="fail">FAIL</button>
      </div>
    </article>
  `;
}

function upsCard(item) {
  const grupo = item.grupo || item;
  const estado = item.estado || "ok";
  const observacion = item.observacion || "";
  return `
    <article class="ups-card" data-type="ups" data-name="${grupo}" data-state="${estado}">
      <div class="ups-card__head">
        <div class="ups-card__title">
          <strong>${grupo}</strong>
          <span>Unidad UPS</span>
        </div>
        ${badge(estado)}
      </div>
      <div class="ups-card__body">
        <div class="ups-field">
          <span>Estado</span>
          <input data-field="estado" type="hidden" value="${estado}">
          <div class="ups-state" data-state="${estado}" role="group" aria-label="Estado de UPS ${grupo}">
            <button class="ups-state__btn ${estado === "ok" ? "is-active" : ""}" type="button" data-value="ok">OK</button>
            <button class="ups-state__btn ${estado === "alert" ? "is-active" : ""}" type="button" data-value="alert">Alerta</button>
            <button class="ups-state__btn ${estado === "fail" ? "is-active" : ""}" type="button" data-value="fail">Fail</button>
          </div>
        </div>
        <label class="ups-field ups-field--notes">
          <span>Observacion</span>
          <textarea data-field="observacion" placeholder="Mantenimiento, falla o detalle relevante">${observacion}</textarea>
        </label>
      </div>
    </article>
  `;
}

function displayMeta(value) {
  return value === "DP" ? "Central" : value;
}

function statusSection(id, items, extraClass = "") {
  return `
    <div class="record-section-tools">
      <div class="record-section-tools__title">${sections.find(section => section.id === id)?.label || "Registro"}</div>
      <button class="btn btn--outline btn--small" type="button" data-mark-all-ok="${id}">
        <i class="fa-solid fa-check-double" aria-hidden="true"></i>
        Marcar todos OK
      </button>
    </div>
    <div class="asset-grid ${extraClass}">${items.map(item => assetCard(item, id)).join("")}</div>
  `;
}

function backupMetric(label, ok, total, okId, totalId) {
  const pct = backupPct(ok, total);
  const status = backupStatus(pct);
  return `
    <section class="backup-row backup-row--${status}" data-backup-row data-ok-input="${okId}" data-total-input="${totalId}">
      <div class="backup-row__title">
        <img src="./assets/database-filled-svgrepo-com.svg" alt="" aria-hidden="true">
        <div>
          <h3>${label}</h3>
          <p data-backup-copy>${ok} de ${total} procesos correctos</p>
        </div>
      </div>
      <div class="backup-row__meter">
        <strong data-backup-pct>${pct}%</strong>
        <div class="backup-progress" aria-hidden="true">
          <span data-backup-progress style="width:${pct}%"></span>
        </div>
      </div>
      <div class="backup-row__fields">
        <label class="backup-number-field"><span>Exitosos</span><input id="${okId}" type="number" min="0" value="${ok}"></label>
        <label class="backup-number-field"><span>Total</span><input id="${totalId}" type="number" min="0" value="${total}"></label>
      </div>
    </section>
  `;
}

function backupPct(ok, total) {
  const safeTotal = Math.max(0, Number(total) || 0);
  if (!safeTotal) return 0;
  return Math.max(0, Math.min(100, Math.round(((Number(ok) || 0) / safeTotal) * 100)));
}

function backupStatus(pct) {
  if (pct >= backupThresholds.ok) return "ok";
  if (pct >= backupThresholds.alert) return "alert";
  return "fail";
}

function backupSection(backup) {
  return `
    <div class="backup-layout">
      <div class="backup-header">
        <div>
          <h2>Control de backups</h2>
          <p>Registra el resultado diario de los procesos programados.</p>
        </div>
        <div class="backup-legend" aria-label="Rangos de estado de backups">
          <span class="backup-legend__item backup-legend__item--ok">Verde >= ${backupThresholds.ok}%</span>
          <span class="backup-legend__item backup-legend__item--alert">Amarillo ${backupThresholds.alert}-${backupThresholds.ok - 1}%</span>
          <span class="backup-legend__item backup-legend__item--fail">Rojo &lt; ${backupThresholds.alert}%</span>
        </div>
      </div>
      <div class="backup-summary">
        ${backupMetric("Arcserve", backup.arcserve_exitosos, backup.arcserve_total, "arc-ok", "arc-total")}
        ${backupMetric("Oracle", backup.oracle_exitosos, backup.oracle_total, "ora-ok", "ora-total")}
      </div>
      <label class="field backup-notes">
        <span>Observaciones</span>
        <textarea id="backup-obs" placeholder="Detalle de jobs fallidos, mantenimiento o evidencia relevante">${backup.observaciones}</textarea>
      </label>
    </div>
  `;
}

function operationalField({ icon, title, sub, fields }) {
  return `
    <section class="operational-row">
      <div class="operational-row__title">
        <i class="${icon}" aria-hidden="true"></i>
        <div>
          <h3>${title}</h3>
          <p>${sub}</p>
        </div>
      </div>
      <div class="operational-row__fields">
        ${fields}
      </div>
    </section>
  `;
}

function ambienteSection(ambiente) {
  return `
    <div class="operational-layout">
      <div class="backup-header">
        <div>
          <h2>Condiciones de ambiente</h2>
          <p>Registra los valores diarios del espacio monitoreado.</p>
        </div>
      </div>
      <div class="operational-summary">
        ${operationalField({
          icon: "fa-solid fa-temperature-half",
          title: "Temperatura",
          sub: "Lectura en grados Celsius",
          fields: `<label class="backup-number-field"><span>Valor C</span><input id="amb-temp" type="number" step="0.1" value="${ambiente.temperatura}"></label>`,
        })}
        ${operationalField({
          icon: "fa-solid fa-droplet",
          title: "Humedad",
          sub: "Porcentaje relativo registrado",
          fields: `<label class="backup-number-field"><span>Valor %</span><input id="amb-hum" type="number" step="0.1" value="${ambiente.humedad}"></label>`,
        })}
      </div>
    </div>
  `;
}

function vpnSection(vpn) {
  return `
    <div class="operational-layout">
      <div class="backup-header">
        <div>
          <h2>Control VPN</h2>
          <p>Registra el estado diario de la conectividad remota.</p>
        </div>
      </div>
      <div class="operational-summary">
        ${operationalField({
          icon: "fa-regular fa-clock",
          title: "Conexion",
          sub: "Hora reportada de conexion",
          fields: `<label class="operational-text-field"><span>Hora</span><input id="vpn-hora" value="${vpn.hora_conexion}"></label>`,
        })}
        ${operationalField({
          icon: "fa-solid fa-signal",
          title: "Estado",
          sub: "Condicion operativa del enlace",
          fields: `<label class="operational-text-field"><span>Estado</span><select id="vpn-estado"><option value="operativo" ${vpn.estado === "operativo" ? "selected" : ""}>Operativo</option><option value="falla" ${vpn.estado === "falla" ? "selected" : ""}>Falla</option></select></label>`,
        })}
        ${operationalField({
          icon: "fa-solid fa-building-shield",
          title: "Proveedor",
          sub: "Entidad o servicio asociado",
          fields: `<label class="operational-text-field"><span>Proveedor</span><input id="vpn-prov" value="${vpn.proveedor}"></label>`,
        })}
        ${operationalField({
          icon: "fa-solid fa-laptop",
          title: "Dispositivo",
          sub: "Equipo usado para la conexion",
          fields: `<label class="operational-text-field"><span>Dispositivo</span><input id="vpn-disp" value="${vpn.dispositivo}"></label>`,
        })}
      </div>
    </div>
  `;
}

function sectionContent(id) {
  if (id === "switches") {
    return statusSection(id, recordDraft.switches, "asset-grid--switches");
  }
  if (id === "servidores") {
    return statusSection(id, recordDraft.servidores);
  }
  if (id === "servicios") {
    return statusSection(id, recordDraft.servicios);
  }
  if (id === "ups") {
    return `<div class="asset-grid">${recordDraft.ups.map(item => assetCard(item, id)).join("")}</div>`;
  }
  if (id === "backups") {
    const backup = recordDraft.backup;
    return backupSection(backup);
  }
  if (id === "ambiente") {
    const ambiente = recordDraft.ambiente;
    return ambienteSection(ambiente);
  }
  const vpn = recordDraft.vpn;
  return vpnSection(vpn);
}

function collectAssets(type) {
  return [...document.querySelectorAll(`[data-type="${type}"]`)].map(card => {
    const nombre = card.dataset.name;
    const estado = card.dataset.state || card.querySelector('[data-field="estado"]')?.value || "ok";
    const meta = card.dataset.meta || card.querySelector('[data-field="meta"]')?.value || "";
    const observacion = card.querySelector('[data-field="observacion"]')?.value || "";
    if (type === "switches") return { nombre, sede: meta || "DP", estado };
    if (type === "servidores") return { nombre, tipo: card.dataset.tipo || "Windows", rol: card.dataset.rol || "", estado };
    if (type === "servicios") return { nombre, url: card.dataset.url || "", estado };
    return { grupo: nombre, estado, observacion };
  });
}

export function bindRegistroEvents() {
  bindRecordAreaControls();
  updateStepperState();
  updatePrimaryAction();

  document.querySelectorAll(".stepper__item").forEach(step => {
    step.addEventListener("click", () => {
      syncActiveSection();
      goToSection(step.dataset.section);
    });
  });

  document.querySelector("#record-primary-action")?.addEventListener("click", async () => {
    syncActiveSection();
    const currentIndex = sections.findIndex(section => section.id === activeSectionId);
    if (currentIndex < sections.length - 1) {
      goToSection(sections[currentIndex + 1].id);
      return;
    }

    const fecha = document.querySelector("#record-date").value;
    recordDraft.fecha = fecha;
    recordDraft.backup.fecha = fecha;
    recordDraft.ambiente.fecha = fecha;
    recordDraft.vpn.fecha = fecha;
    const payload = {
      fecha,
      switches: recordDraft.switches,
      servidores: recordDraft.servidores,
      servicios: recordDraft.servicios,
      ups: recordDraft.ups,
      backup: recordDraft.backup,
      ambiente: recordDraft.ambiente,
      vpn: recordDraft.vpn,
    };
    await saveDailyRecord(payload).catch(() => []);
    document.querySelector("#record-message").textContent = "Registro simulado correctamente.";
  });
}

function bindStateToggles() {
  document.querySelectorAll(".state-toggle__btn").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".asset-card");
      const toggle = button.closest(".state-toggle");
      card.dataset.state = button.dataset.value;
      toggle.dataset.state = button.dataset.value;
      card.querySelectorAll(".state-toggle__btn").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      updateMarkAllOkState(card.dataset.type);
    });
  });
}

function bindMarkAllOk() {
  document.querySelectorAll("[data-mark-all-ok]").forEach(button => {
    button.addEventListener("click", () => {
      const type = button.dataset.markAllOk;
      markCardsOk(type);
      updateMarkAllOkState(type);
    });
  });
  document.querySelectorAll("[data-mark-all-ok]").forEach(button => {
    updateMarkAllOkState(button.dataset.markAllOk);
  });
}

function markCardsOk(type) {
  document.querySelectorAll(`[data-type="${type}"]`).forEach(card => {
    card.dataset.state = "ok";
    card.querySelector(".state-toggle")?.setAttribute("data-state", "ok");
    card.querySelectorAll(".state-toggle__btn").forEach(item => {
      item.classList.toggle("is-active", item.dataset.value === "ok");
    });
  });
}

function updateMarkAllOkState(type) {
  const button = document.querySelector(`[data-mark-all-ok="${type}"]`);
  if (!button) return;

  const cards = [...document.querySelectorAll(`[data-type="${type}"]`)];
  const allOk = cards.length > 0 && cards.every(card => (card.dataset.state || "ok") === "ok");
  button.classList.toggle("is-active", allOk);
  button.setAttribute("aria-pressed", String(allOk));
  button.innerHTML = allOk
    ? '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Todos OK'
    : '<i class="fa-solid fa-check-double" aria-hidden="true"></i> Marcar todos OK';
}

function bindLegacySelectState() {
  document.querySelectorAll('[data-field="estado"]').forEach(select => {
    select.addEventListener("change", () => {
      const card = select.closest(".asset-card, .ups-card");
      if (!card) return;
      card.dataset.state = select.value;
      const badgeEl = card.querySelector(".badge");
      if (badgeEl) badgeEl.outerHTML = badge(select.value);
      updateMarkAllOkState(card.dataset.type);
    });
  });
}

function bindRecordAreaControls() {
  bindStateToggles();
  bindUpsStateToggles();
  bindLegacySelectState();
  bindBackupProgress();
  bindMarkAllOk();
}

function bindUpsStateToggles() {
  document.querySelectorAll(".ups-state__btn").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".ups-card");
      const state = button.dataset.value;
      card.dataset.state = state;
      card.querySelector('[data-field="estado"]').value = state;
      card.querySelector(".ups-state").dataset.state = state;
      card.querySelectorAll(".ups-state__btn").forEach(item => item.classList.remove("is-active"));
      button.classList.add("is-active");
      const badgeEl = card.querySelector(".badge");
      if (badgeEl) badgeEl.outerHTML = badge(state);
    });
  });
}

function bindBackupProgress() {
  document.querySelectorAll("[data-backup-row]").forEach(row => {
    const okInput = document.querySelector(`#${row.dataset.okInput}`);
    const totalInput = document.querySelector(`#${row.dataset.totalInput}`);
    const update = () => updateBackupProgress(row);
    okInput?.addEventListener("input", update);
    totalInput?.addEventListener("input", update);
    update();
  });
}

function updateBackupProgress(row) {
  const okInput = document.querySelector(`#${row.dataset.okInput}`);
  const totalInput = document.querySelector(`#${row.dataset.totalInput}`);
  const ok = Number(okInput?.value || 0);
  const total = Number(totalInput?.value || 0);
  const pct = backupPct(ok, total);
  const status = backupStatus(pct);

  row.classList.remove("backup-row--ok", "backup-row--alert", "backup-row--fail");
  row.classList.add(`backup-row--${status}`);
  row.querySelector("[data-backup-pct]").textContent = `${pct}%`;
  row.querySelector("[data-backup-progress]").style.width = `${pct}%`;
  row.querySelector("[data-backup-copy]").textContent = `${ok} de ${total} procesos correctos`;
}

function syncActiveSection() {
  if (["switches", "servidores", "servicios", "ups"].includes(activeSectionId)) {
    recordDraft[activeSectionId] = collectAssets(activeSectionId);
  }
  if (activeSectionId === "backups") {
    recordDraft.backup = {
      ...recordDraft.backup,
      arcserve_exitosos: Number(document.querySelector("#arc-ok")?.value || 44),
      arcserve_total: Number(document.querySelector("#arc-total")?.value || 44),
      oracle_exitosos: Number(document.querySelector("#ora-ok")?.value || 25),
      oracle_total: Number(document.querySelector("#ora-total")?.value || 25),
      observaciones: document.querySelector("#backup-obs")?.value || "",
    };
  }
  if (activeSectionId === "ambiente") {
    recordDraft.ambiente = {
      ...recordDraft.ambiente,
      temperatura: Number(document.querySelector("#amb-temp")?.value || 20.8),
      humedad: Number(document.querySelector("#amb-hum")?.value || 59.2),
    };
  }
  if (activeSectionId === "vpn") {
    recordDraft.vpn = {
      ...recordDraft.vpn,
      hora_conexion: document.querySelector("#vpn-hora")?.value || "09:15 a.m.",
      estado: document.querySelector("#vpn-estado")?.value || "operativo",
      proveedor: document.querySelector("#vpn-prov")?.value || "Telefonica",
      dispositivo: document.querySelector("#vpn-disp")?.value || "PC HP408",
    };
  }
}

function goToSection(id) {
  activeSectionId = id;
  document.querySelector("#record-area").innerHTML = sectionContent(activeSectionId);
  bindRecordAreaControls();
  updateStepperState();
  updatePrimaryAction();
}

function updateStepperState() {
  const activeIndex = sections.findIndex(section => section.id === activeSectionId);
  const progress = sections.length > 1 ? activeIndex / (sections.length - 1) : 0;
  const stepper = document.querySelector(".stepper");
  stepper?.style.setProperty("--step-progress-scale", String(progress));
  document.querySelectorAll(".stepper__item").forEach((item, index) => {
    item.classList.toggle("is-active", index === activeIndex);
    item.classList.toggle("is-complete", index < activeIndex);
  });
}

function updatePrimaryAction() {
  const button = document.querySelector("#record-primary-action");
  if (!button) return;
  const activeIndex = sections.findIndex(section => section.id === activeSectionId);
  const isLast = activeIndex === sections.length - 1;
  button.innerHTML = isLast
    ? '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar registro'
    : 'Siguiente <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
}

export function registroView() {
  activeSectionId = "switches";
  recordDraft = createDefaultDraft();
  const today = currentWeekRange().today;
  return `
    <section class="record-page">
      <header class="record-head">
        <div>
          <h1 class="page-title">Nuevo Registro de monitoreo de infraestructura</h1>
        </div>
        <label class="record-date-field">
          <span>Fecha del registro</span>
          <input id="record-date" type="date" value="${today}">
        </label>
      </header>
      <section class="card">
        <div class="stepper" aria-label="Pasos del registro diario">
          ${sections.map((section, index) => `
            <button class="stepper__item ${index === 0 ? "is-active" : ""}" type="button" data-section="${section.id}">
              <span class="stepper__number">${index + 1}</span>
              <span class="stepper__label">${section.label}</span>
            </button>
          `).join("")}
        </div>
        <div class="record-area" id="record-area">${sectionContent("switches")}</div>
        <div class="record-actions">
          <span id="record-message" class="metric__sub"></span>
          <button class="btn btn--outline" type="button">Limpiar</button>
          <button class="btn btn--primary" id="record-primary-action" type="button">Siguiente <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
        </div>
      </section>
    </section>
  `;
}
