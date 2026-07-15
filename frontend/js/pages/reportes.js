import { getDashboardData } from "../services/api.js";
import { card, metric, pageHeader, progress, sparkline } from "../components/ui.js";

function fallbackReport() {
  return {
    resumen: {
      switches: { pct: 98.4 },
      servidores: { pct: 97.8 },
      servicios: { pct: 99.1 },
      backups: { arcserve: { pct: 100 }, oracle: { pct: 98.7 } },
      ups_alertas: [{ grupo: "OACGD" }],
      vpn_dias_operativos: 4,
    },
  };
}

export async function reportesView() {
  const data = await getDashboardData().catch(() => fallbackReport());
  const r = data.resumen;

  return `
    ${pageHeader({
      kicker: "Reportes",
      title: "Informes operativos",
      subtitle: "Resumen semanal preparado para revisión técnica, exportación y seguimiento de continuidad.",
      actions: `<button class="btn btn--primary">Preparar PDF</button>`,
    })}

    <section class="grid grid--3">
      ${metric({ label: "Disponibilidad red", value: `${r.switches.pct}%`, sub: "Switches y radioenlaces", status: "ok" })}
      ${metric({ label: "Servicios", value: `${r.servicios.pct}%`, sub: "Portales y aplicativos", status: "ok" })}
      ${metric({ label: "Alertas UPS", value: r.ups_alertas.length, sub: "Alertas de infraestructura", status: r.ups_alertas.length ? "warn" : "ok" })}
    </section>

    <section class="grid grid--2 section-gap">
      ${card("Resumen semanal", `
        <div class="progress-list">
          ${progress("Switches", r.switches.pct, "var(--primary)")}
          ${progress("Servidores", r.servidores.pct, "var(--info)")}
          ${progress("Servicios web", r.servicios.pct, "var(--ok)")}
          ${progress("Backup Arcserve", r.backups.arcserve.pct, "var(--ok)")}
          ${progress("Backup Oracle", r.backups.oracle.pct, "var(--warn)")}
        </div>
      `)}
      ${card("Tendencia de disponibilidad", `
        <div class="report-card">
          <div class="metric__value">98.2%</div>
          <div class="metric__sub">Promedio referencial de los últimos registros</div>
          ${sparkline([94, 95, 98, 97, 99, 96, 98, 99, 98])}
        </div>
      `)}
    </section>

    <section class="section-gap">
      <div class="print-note">
        La vista de reportes queda preparada para conectar exportación PDF/Excel. Por ahora usa datos ficticios compatibles con el backend mock y mantiene una lectura ejecutiva del estado semanal.
      </div>
    </section>
  `;
}
