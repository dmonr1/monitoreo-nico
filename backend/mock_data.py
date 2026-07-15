"""Datos ficticios para trabajar el frontend sin PostgreSQL.

Este modulo replica la forma de respuesta que espera el dashboard actual.
No reemplaza al backend real; lo usa `mock_main.py` para desarrollo visual.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable


SW_CENTRAL = [
    ("SW_CORE (G02)", "DP"),
    ("SW_CORE - 2 (G02)", "DP"),
    ("SWA_PGP1_CTELEF1", "DP"),
    ("SWA_PGP1_CTELEF2", "DP"),
    ("SW_VIDEOVIGILANCIA_C9200_P48", "DP"),
    ("SWA_PGP1_ELECT", "DP"),
    ("SWA_PGP1_ELECT_2", "DP"),
    ("SWA_PGP3_DESAMPARADOS", "DP"),
    ("SWA_PGP2_DESAM", "DP"),
    ("SWA_PGP4_SCM_N_C9200_48P", "DP"),
    ("SWA_PGP4_ASESORIA_C9200_48P", "DP"),
    ("SWA_PGP3_ALOJ_C9200_48P", "DP"),
    ("SWA_PGP3_ALOJAMIENTO_1", "DP"),
    ("SWA_PGP1_CD_ADM", "DP"),
    ("SWD_PGP1_CCC2960XR-48FPD-I (1)", "DP"),
    ("SWD_PGP1_CCC2960XR-48FPD-I (2)", "DP"),
    ("SWA_PGP1_CENTRO_COMPUTO (1)", "DP"),
    ("SWA_PGP1_CENTRO_COMPUTO (2)", "DP"),
    ("SWA_PGP1_CC1_DMZ", "DP"),
    ("SW_DISTRO_9500 (1)", "DP"),
    ("SW_DISTRO_9500 (2)", "DP"),
    ("SWA_PGP4_AZOTEA_C9200_48P", "DP"),
    ("SWA_PGP1_TRANS_C9200_48P", "DP"),
    ("SWA_PGP2_MTV", "DP"),
    ("SW_PALACIO_LORETO (Extreme Ntwks)", "DP"),
    ("SW_PISO3_RESIDENCIA", "DP"),
    ("SWA_G08_AZOTEA", "DP"),
]

SW_SEDES = [
    ("SW_PISO3_PCM_C9200_48P", "PCM"),
    ("SW_EP_DTIS_3Piso", "EP"),
    ("SWA_EPP2_ORH_C9200_48P", "EP"),
    ("SW_EDIF_PALACIO_2PISO_35 (HPE)", "EP"),
    ("SWA_EPP1_TRAMITE_EP_C9200_48P", "EP"),
    ("SWA_EPP2_CONTABILIDAD_C9200_48P", "EP"),
    ("SWA_VICEPRESIDENCIA", "EP"),
    ("SW_LORETO_C9200_48P", "LORETO"),
]

SERVIDORES_WINDOWS = [
    ("DPSRVMAIL001", "Exchange"),
    ("DPSRVMAIL002", "Exchange"),
    ("DP_P09_FS", "File Server"),
    ("DPCERSR014", "File Server"),
    ("DPCERSR001", "AD"),
    ("DPSRVDC001", "AD"),
    ("DPSRVDC002", "AD"),
    ("VIPCERSR001", "AD"),
    ("VIPSRVDC001", "AD"),
    ("VIPSRVDC002", "AD"),
    ("DPSRVDHCP001", "DHCP"),
    ("DPSRVDHCP002", "DHCP"),
    ("dpcersrSIAD", "SIAD"),
    ("dpcersrSIGAMEF", "SIGAMEF"),
    ("SIAF (blade12)", "SIAF"),
    ("DPSRVAV001", "Antivirus"),
    ("DPCERAPPW1", "App"),
    ("dpcersr007NET", "App"),
    ("dpcerintra", "Intranet"),
    ("DPCERSR005", "App"),
    ("dpp05hp", "App"),
    ("DPSRVNAS", "NAS"),
    ("DPCERCONTROL", "Control"),
    ("MYQLDB01", "MySQL"),
    ("RSYSLOG", "Syslog"),
]

SERVIDORES_LINUX = [
    "Eventos",
    "Convocatorias",
    "PortalWeb",
    "Transparencia",
    "ARCSERVER",
    "Zabbix",
    "Abastecimientos",
    "FILESERVER001",
    "FILESERVER002",
    "Arcserve",
    "ServerLog",
    "AULA VIRTUAL",
    "DPSRVAPP007",
    "Mesavirtual",
    "Mesaenlinea",
    "sgdprod",
    "Verif_Doc",
]

SERVICIOS = [
    ("Pagina principal", "https://www.gob.pe/presidencia/"),
    ("Agenda Presidencial", "https://www.gob.pe/institucion/presidencia/agenda"),
    ("Normas Legales", "https://www.gob.pe/institucion/presidencia/normas-legales"),
    ("Seguimiento de Tramites", "https://appw.presidencia.gob.pe/portalgob/consulta-expedientes/"),
    ("Verificacion de Documento", "http://app.presidencia.gob.pe/VerificaDocumentoDP/faces/inicio/detalle.xhtml"),
    ("Mesa de Partes en Linea", "https://tramite.presidencia.gob.pe:8443/appmesapartesenlinea/inicio"),
    ("Portal Transparencia", "http://www.transparencia.gob.pe/"),
    ("Consulta de Visitas", "http://www.transparencia.gob.pe/reportes_directos/"),
    ("Convocatorias", "https://www.presidencia.gob.pe/portalgob/convocatorias"),
    ("SIGDP", "https://appw1.presidencia.gob.pe/sigdp/"),
    ("Intranet DP", "http://intradp01.presidencia.gob.pe/"),
    ("SGD Oficial", "https://sgdoficial.presidencia.gob.pe:8181/sisdoc/login.do"),
    ("SISCOVI", "https://appw1.presidencia.gob.pe/viaticos/"),
    ("Atencion al Ciudadano", "https://www.gob.pe/844"),
    ("SGD Externo", "https://sgdex.presidencia.gob.pe:8181/sisdoc/login.do"),
    ("Mesavirtual", "https://mesavirtual.presidencia.gob.pe"),
]

UPS_GRUPOS = [
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
]

RADIOENLACES = [
    "Radioenlace 1 - SW_Alojamiento (10.100.0.16)",
    "Radioenlace 2 - SW_Loreto (10.100.0.182)",
]

BIOMETRICOS = [
    "RELOJ_DESAMPARADOS",
    "RELOJ_EDIFICIO_PALACIO",
    "RELOJ_ALA_ESTE",
    "RELOJ_LORETO",
]

HARDWARE = [
    {"nombre": "05 Servidores Lenovo", "hd_total": 10},
    {"nombre": "DPSRVNAS", "hd_total": 8},
    {"nombre": "ARCSERBACKUP", "hd_total": 6},
]

ACCESS_POINTS = [
    "P1_1 Garita Seguridad",
    "P1_2 Desarrollo",
    "P1_3 Coord. Metas y Celulares",
    "P1_4 Sala de Espera",
    "P1_5 Cronistas",
    "P2_1 Residencia Mampara",
    "P2_2 Sala Reuniones (Vicepres.)",
    "P2_3 Residencia Piscina",
    "P2_4 Residencia Rampa",
    "P2_5 Consejeros",
    "P2_6 Residencia Sala Espera",
    "P2_7 Residencia Kitchen",
    "P2_8 Secretaria General",
    "P2_9 Sala Reunion Secretaria",
    "P2_10 Salon Elespuru",
    "P2_11 Salon Sevillano",
    "P2_12 Salon Grau",
    "P2_13 Salon Quinonez",
    "P2_14 Salon Bolognesi",
    "P2_15 Sec. de la Presidencia",
    "P2_16 Salon Dorado",
    "P2_17 Salon Tupac Amaru A",
    "P2_18 Salon Tupac Amaru B",
    "P2_19 Teatro",
    "P2_20 Gran Comedor A",
    "P2_21 Gran Comedor B",
    "P2_22 Prensa y Television",
    "P3_1 Residencia Sala de Cine",
    "P3_2 Subsecretaria",
    "P3_3 Oficina SCM",
    "P3_4 Gran Hall",
    "P3_5 Consejo de Ministros A",
    "P3_6 Consejo de Ministros B",
    "P4_1 Prensa",
    "P4_2 Pasadizo",
    "P4_3 OGA",
]


def each_day(fecha_inicio: date, fecha_fin: date) -> Iterable[date]:
    current = fecha_inicio
    while current <= fecha_fin:
        yield current
        current += timedelta(days=1)


def pct(ok: int, total: int) -> float:
    return round(ok / total * 100, 1) if total else 0


def status_for(day: date, name: str, salt: int = 0) -> str:
    marker = day.toordinal() + len(name) + salt
    if marker % 29 == 0:
        return "fail"
    return "ok"


def ups_status_for(day: date, group: str) -> str:
    marker = day.toordinal() + len(group)
    if group == "OACGD" and marker % 3 != 0:
        return "alert"
    if marker % 31 == 0:
        return "fail"
    return "ok"


def mock_switches(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        for nombre, sede in [*SW_CENTRAL, *SW_SEDES]:
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "nombre": nombre,
                "sede": sede,
                "estado": status_for(day, nombre),
            })
    return rows


def mock_servidores(fecha_inicio: date, fecha_fin: date, tipo: str | None = None) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        if tipo in (None, "Windows"):
            for nombre, rol in SERVIDORES_WINDOWS:
                rows.append({
                    "id": len(rows) + 1,
                    "fecha": str(day),
                    "nombre": nombre,
                    "tipo": "Windows",
                    "rol": rol,
                    "estado": status_for(day, nombre, salt=3),
                })
        if tipo in (None, "Linux"):
            for nombre in SERVIDORES_LINUX:
                rows.append({
                    "id": len(rows) + 1,
                    "fecha": str(day),
                    "nombre": nombre,
                    "tipo": "Linux",
                    "rol": "",
                    "estado": status_for(day, nombre, salt=9),
                })
    return rows


def mock_servicios(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        for nombre, url in SERVICIOS:
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "nombre": nombre,
                "url": url,
                "estado": status_for(day, nombre, salt=15),
            })
    return rows


def mock_backups(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        arc_total = 44
        ora_total = 25
        arc_ok = arc_total - (1 if day.toordinal() % 7 == 0 else 0)
        ora_ok = ora_total - (1 if day.toordinal() % 11 == 0 else 0)
        obs = "" if arc_ok == arc_total and ora_ok == ora_total else "Revision programada por job incompleto"
        rows.append({
            "id": len(rows) + 1,
            "fecha": str(day),
            "arcserve_exitosos": arc_ok,
            "arcserve_total": arc_total,
            "oracle_exitosos": ora_ok,
            "oracle_total": ora_total,
            "observaciones": obs,
        })
    return rows


def mock_ups(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        for grupo in UPS_GRUPOS:
            estado = ups_status_for(day, grupo)
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "grupo": grupo,
                "estado": estado,
                "observacion": "Mantenimiento correctivo pendiente" if estado == "alert" else "",
            })
    return rows


def mock_radioenlaces(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        for nombre in RADIOENLACES:
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "nombre": nombre,
                "tipo": "radioenlace",
                "estado": status_for(day, nombre, salt=21),
            })
    return rows


def mock_biometricos(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        for nombre in BIOMETRICOS:
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "nombre": nombre,
                "tipo": "reloj_biometrico",
                "estado": status_for(day, nombre, salt=27),
            })
    return rows


def mock_hardware(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        for item in HARDWARE:
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "nombre": item["nombre"],
                "hd_total": item["hd_total"],
                "hd_ok": item["hd_total"] - (1 if status_for(day, item["nombre"], salt=33) == "fail" else 0),
                "estado": status_for(day, item["nombre"], salt=33),
            })
    return rows


def mock_access_points(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        for nombre in ACCESS_POINTS:
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "nombre": nombre,
                "tipo": "access_point",
                "estado": status_for(day, nombre, salt=39),
            })
        for nombre in RADIOENLACES:
            rows.append({
                "id": len(rows) + 1,
                "fecha": str(day),
                "nombre": nombre.replace(" - ", " - Sede "),
                "tipo": "radioenlace",
                "estado": status_for(day, nombre, salt=21),
            })
    return rows


def mock_ambiente(dias: int) -> list[dict]:
    today = date.today()
    start = today - timedelta(days=dias - 1)
    rows = []
    for index, day in enumerate(each_day(start, today)):
        rows.append({
            "id": index + 1,
            "fecha": str(day),
            "temperatura": round(20.4 + ((index % 8) * 0.23), 2),
            "humedad": round(58.4 + ((index % 6) * 0.35), 2),
        })
    return rows


def mock_vpn(fecha_inicio: date, fecha_fin: date) -> list[dict]:
    rows = []
    for day in each_day(fecha_inicio, fecha_fin):
        operativo = day.toordinal() % 13 != 0
        rows.append({
            "id": len(rows) + 1,
            "fecha": str(day),
            "hora_conexion": "09:15 a.m." if operativo else "",
            "estado": "operativo" if operativo else "falla",
            "proveedor": "Telefonica",
            "dispositivo": "PC HP408",
        })
    return rows


def mock_resumen(fecha_inicio: date, fecha_fin: date) -> dict:
    switches = mock_switches(fecha_inicio, fecha_fin)
    servidores = mock_servidores(fecha_inicio, fecha_fin)
    servicios = mock_servicios(fecha_inicio, fecha_fin)
    backups = mock_backups(fecha_inicio, fecha_fin)
    ups = mock_ups(fecha_inicio, fecha_fin)
    radioenlaces = mock_radioenlaces(fecha_inicio, fecha_fin)
    biometricos = mock_biometricos(fecha_inicio, fecha_fin)
    hardware = mock_hardware(fecha_inicio, fecha_fin)
    access_points = mock_access_points(fecha_inicio, fecha_fin)
    ambiente = [
        row for row in mock_ambiente(60)
        if fecha_inicio <= date.fromisoformat(row["fecha"]) <= fecha_fin
    ]
    vpn = mock_vpn(fecha_inicio, fecha_fin)

    sw_ok = sum(1 for row in switches if row["estado"] == "ok")
    srv_ok = sum(1 for row in servidores if row["estado"] == "ok")
    svc_ok = sum(1 for row in servicios if row["estado"] == "ok")
    arc_ok = sum(row["arcserve_exitosos"] for row in backups)
    arc_total = sum(row["arcserve_total"] for row in backups)
    ora_ok = sum(row["oracle_exitosos"] for row in backups)
    ora_total = sum(row["oracle_total"] for row in backups)
    ap_ok = sum(1 for row in access_points if row["estado"] == "ok")
    hw_ok = sum(1 for row in hardware if row["estado"] == "ok")

    return {
        "periodo": {"inicio": str(fecha_inicio), "fin": str(fecha_fin)},
        "switches": {"ok": sw_ok, "total": len(switches), "pct": pct(sw_ok, len(switches))},
        "servidores": {"ok": srv_ok, "total": len(servidores), "pct": pct(srv_ok, len(servidores))},
        "servicios": {"ok": svc_ok, "total": len(servicios), "pct": pct(svc_ok, len(servicios))},
        "ups_alertas": [
            {"grupo": row["grupo"], "fecha": row["fecha"], "obs": row["observacion"]}
            for row in ups
            if row["estado"] == "alert"
        ],
        "backups": {
            "arcserve": {"ok": arc_ok, "total": arc_total, "pct": pct(arc_ok, arc_total)},
            "oracle": {"ok": ora_ok, "total": ora_total, "pct": pct(ora_ok, ora_total)},
        },
        "radioenlaces": radioenlaces,
        "biometricos": biometricos,
        "hardware": {
            "ok": hw_ok,
            "total": len(hardware),
            "pct": pct(hw_ok, len(hardware)),
            "items": hardware,
        },
        "access_points": {
            "ok": ap_ok,
            "total": len(access_points),
            "pct": pct(ap_ok, len(access_points)),
            "items": access_points,
        },
        "ambiente": ambiente,
        "vpn_dias_operativos": sum(1 for row in vpn if row["estado"] == "operativo"),
    }
