import { layout } from "./components/layout.js";
import { bindConsultasEvents, consultasView } from "./pages/consultas.js";
import { dashboardView } from "./pages/dashboard.js";
import { bindRegistroEvents, registroView } from "./pages/registro.js";
import { reportesView } from "./pages/reportes.js";

const routes = {
  dashboard: dashboardView,
  registro: registroView,
  consultas: consultasView,
  reportes: reportesView,
};

function currentRoute() {
  const route = window.location.hash.replace("#/", "").split("?")[0];
  return routes[route] ? route : "dashboard";
}

async function render() {
  const route = currentRoute();
  const app = document.querySelector("#app");
  app.innerHTML = layout(route);
  applySidebarState();

  const view = document.querySelector("#view");
  view.className = `content content--${route}`;
  view.innerHTML = `<div class="empty-state">Cargando vista...</div>`;
  view.innerHTML = await routes[route]();

  if (route === "registro") bindRegistroEvents();
  if (route === "consultas") bindConsultasEvents();
  bindSearch();
  bindSidebarToggle();
}

function bindSearch() {
  const input = document.querySelector("#global-search");
  input?.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    document.querySelectorAll(".table tbody tr, .asset-card, .quick-row").forEach(row => {
      row.style.display = !term || row.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });
}

function applySidebarState() {
  const app = document.querySelector("#app");
  const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
  app?.classList.toggle("is-sidebar-collapsed", collapsed);
}

function bindSidebarToggle() {
  const button = document.querySelector("#sidebar-toggle");
  const app = document.querySelector("#app");
  button?.addEventListener("click", () => {
    const collapsed = !app.classList.contains("is-sidebar-collapsed");
    app.classList.toggle("is-sidebar-collapsed", collapsed);
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  });
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
