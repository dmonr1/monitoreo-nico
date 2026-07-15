export function badge(status) {
  const value = String(status || "info").toLowerCase();
  const map = {
    ok: ["badge--ok", "OK"],
    operativo: ["badge--ok", "OK"],
    alert: ["badge--warn", "ALERT"],
    warning: ["badge--warn", "ALERT"],
    fail: ["badge--fail", "FAIL"],
    falla: ["badge--fail", "FAIL"],
    info: ["badge--info", "INFO"],
  };
  const [className, label] = map[value] || map.info;
  return `<span class="badge ${className}">${label}</span>`;
}

export function metric({ label, value, sub, status = "info" }) {
  return `
    <article class="card metric metric--${status}">
      <div class="metric__label">${label}</div>
      <div class="metric__value">${value}</div>
      <div class="metric__sub">${sub}</div>
    </article>
  `;
}

export function card(title, body, action = "") {
  return `
    <section class="card">
      <div class="card__head">
        <div class="card__title">${title}</div>
        ${action}
      </div>
      <div class="card__body">${body}</div>
    </section>
  `;
}

export function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table class="table">
        <thead><tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

export function progress(label, pct, tone = "var(--primary)") {
  const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
  return `
    <div class="progress">
      <div class="progress__top"><span>${label}</span><span>${safePct.toFixed(1)}%</span></div>
      <div class="progress__track"><div class="progress__fill" style="width:${safePct}%;background:${tone}"></div></div>
    </div>
  `;
}

export function bars(values) {
  return `
    <div class="bar-chart">
      ${values.map((value, index) => `
        <div class="bar ${index === 4 ? "bar--warn" : ""}" title="${value}%" style="height:${value}%"></div>
      `).join("")}
    </div>
  `;
}

export function sparkline(points) {
  const width = 260;
  const height = 50;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point - min) / Math.max(1, max - min)) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${coords}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `;
}

export function pageHeader({ kicker, title, subtitle, actions = "" }) {
  return `
    <header class="page-head">
      <div>
        <div class="page-kicker">${kicker}</div>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">${subtitle}</p>
      </div>
      ${actions}
    </header>
  `;
}
