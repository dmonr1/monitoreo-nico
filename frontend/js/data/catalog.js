export const switches = [
  { nombre: "SW_CORE (G02)", sede: "DP" },
  { nombre: "SW_CORE - 2 (G02)", sede: "DP" },
  { nombre: "SWA_PGP1_CTELEF1", sede: "DP" },
  { nombre: "SWA_PGP1_CTELEF2", sede: "DP" },
  { nombre: "SW_VIDEOVIGILANCIA_C9200_P48", sede: "DP" },
  { nombre: "SWA_PGP1_ELECT", sede: "DP" },
  { nombre: "SWA_PGP1_ELECT_2", sede: "DP" },
  { nombre: "SWA_PGP3_DESAMPARADOS", sede: "DP" },
  { nombre: "SWA_PGP2_DESAM", sede: "DP" },
  { nombre: "SWA_PGP4_SCM_N_C9200_48P", sede: "DP" },
  { nombre: "SWA_PGP4_ASESORIA_C9200_48P", sede: "DP" },
  { nombre: "SWA_PGP3_ALOJ_C9200_48P", sede: "DP" },
  { nombre: "SW_PISO3_PCM_C9200_48P", sede: "PCM" },
  { nombre: "SW_EP_DTIS_3Piso", sede: "EP" },
  { nombre: "SW_LORETO_C9200_48P", sede: "LORETO" },
];

export const servidores = [
  { nombre: "DPSRVMAIL001", tipo: "Windows", rol: "Exchange" },
  { nombre: "DPSRVMAIL002", tipo: "Windows", rol: "Exchange" },
  { nombre: "DPCERSR001", tipo: "Windows", rol: "AD" },
  { nombre: "DPSRVDC001", tipo: "Windows", rol: "AD" },
  { nombre: "DPSRVDHCP001", tipo: "Windows", rol: "DHCP" },
  { nombre: "DPSRVNAS", tipo: "Windows", rol: "NAS" },
  { nombre: "Zabbix", tipo: "Linux", rol: "Monitoreo" },
  { nombre: "PortalWeb", tipo: "Linux", rol: "Web" },
  { nombre: "Mesaenlinea", tipo: "Linux", rol: "Aplicacion" },
  { nombre: "sgdprod", tipo: "Linux", rol: "Sistema" },
];

export const servicios = [
  { nombre: "Pagina principal", grupo: "Institucional", url: "https://www.gob.pe/presidencia/" },
  { nombre: "Agenda institucional", grupo: "Institucional", url: "https://www.gob.pe/institucion/presidencia/agenda" },
  { nombre: "Normas Legales", grupo: "Institucional", url: "https://www.gob.pe/institucion/presidencia/normas-legales" },
  { nombre: "Seguimiento de Tramites", grupo: "Tramite", url: "https://appw.presidencia.gob.pe/portalgob/consulta-expedientes/" },
  { nombre: "Mesa de Partes en Linea", grupo: "Tramite", url: "https://tramite.presidencia.gob.pe:8443/appmesapartesenlinea/inicio" },
  { nombre: "SGD Oficial", grupo: "Sistema", url: "https://sgdoficial.presidencia.gob.pe:8181/sisdoc/" },
  { nombre: "SGD Externo", grupo: "Sistema", url: "https://sgdex.presidencia.gob.pe:8181/sisdoc/" },
];

export const upsGrupos = [
  "Telefonia",
  "Modulo TV",
  "Electricidad",
  "Transporte",
  "Desamparados",
  "Asesores",
  "Loreto",
  "OACGD",
  "Alojamiento",
  "Azotea",
  "Consejo",
];

export const menu = [
  { route: "dashboard", label: "Dashboard", icon: "fa-solid fa-table-cells-large" },
  { route: "registro", label: "Registro diario", icon: "fa-solid fa-calendar-check" },
  { route: "consultas", label: "Consultas", icon: "fa-solid fa-clock-rotate-left" },
  { route: "reportes", label: "Reportes", icon: "fa-solid fa-chart-column" },
];
