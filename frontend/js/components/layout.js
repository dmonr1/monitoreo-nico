import { menu } from "../data/catalog.js";

export function layout(activeRoute) {
  return `
    <aside class="sidebar">
      <div class="sidebar__top">
        <div class="brand">
          <div class="brand__copy">
            <div class="brand__title">UFIT</div>
            <div class="brand__sub">Monitoreo TI</div>
          </div>
        </div>
        <button class="sidebar-toggle" id="sidebar-toggle" type="button" aria-label="Contraer o expandir menú">
          <i class="fa-solid fa-angles-left"></i>
        </button>
      </div>

      <nav class="nav" aria-label="Navegación principal">
        ${menu.map(item => `
          <a class="nav__link ${item.route === activeRoute ? "is-active" : ""}" href="#/${item.route}" title="${item.label}">
            <i class="nav__ico ${item.icon}"></i>
            <span class="nav__text">${item.label}</span>
          </a>
        `).join("")}
      </nav>

      <div class="sidebar__status">
        <div class="status-line">
          <span class="status-dot"></span>
          <span class="status-text">Sistema activo</span>
        </div>
      </div>
    </aside>

    <section class="main-area">
      <header class="topbar">
        <label class="search" aria-label="Buscar">
          <input id="global-search" type="search" placeholder="Buscar sistemas o alertas...">
        </label>
        <div class="topbar__title">UFIT - Monitoreo TI</div>
        <div class="topbar__meta">
          <span>${new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</span>
          <i class="fa-regular fa-bell"></i>
        </div>
      </header>
      <main class="content" id="view"></main>
    </section>
  `;
}
