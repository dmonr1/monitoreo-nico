"""
Monitoreo TI — Despacho Presidencial del Perú
Backend API con FastAPI + PostgreSQL
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, datetime, timedelta
from typing import Optional, List

from backend.config import CORS_ORIGINS
from backend.models import (
    Base, engine, get_db,
    Switch, Servidor, Servicio,
    Backup, UPS, Ambiente, VPN, AccessPoint
)
from backend.schemas import (
    RegistroDiarioCreate, RegistroDiarioOut,
    ResumenSemana, EstadoItem
)

# ── Crear tablas si no existen ──────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Monitoreo TI — Despacho Presidencial",
    description="API para el sistema de monitoreo de infraestructura TI",
    version="1.0.0"
)

# ── CORS: permite que el frontend (mismo servidor) consuma la API ───────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE SWITCHES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/switches", tags=["Switches"])
def get_switches(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Obtiene historial de switches con filtro opcional de fechas."""
    q = db.query(Switch)
    if fecha_inicio:
        q = q.filter(Switch.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(Switch.fecha <= fecha_fin)
    return q.order_by(Switch.fecha.desc()).all()


@app.post("/api/switches", tags=["Switches"])
def registrar_switches(data: dict, db: Session = Depends(get_db)):
    """
    Registra el estado diario de switches.
    Payload esperado:
    {
      "fecha": "2026-03-21",
      "registros": [
        {"nombre": "SW_CORE (G02)", "sede": "DP", "estado": "ok"},
        ...
      ]
    }
    """
    fecha = date.fromisoformat(data["fecha"])
    creados = 0
    for r in data.get("registros", []):
        sw = db.query(Switch).filter(
            Switch.fecha == fecha,
            Switch.nombre == r["nombre"]
        ).first()
        if sw:
            sw.estado = r["estado"]
        else:
            sw = Switch(fecha=fecha, nombre=r["nombre"],
                        sede=r.get("sede", "DP"), estado=r["estado"])
            db.add(sw)
            creados += 1
    db.commit()
    return {"ok": True, "creados": creados, "fecha": str(fecha)}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE SERVIDORES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/servidores", tags=["Servidores"])
def get_servidores(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    tipo: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Servidor)
    if fecha_inicio:
        q = q.filter(Servidor.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(Servidor.fecha <= fecha_fin)
    if tipo:
        q = q.filter(Servidor.tipo == tipo)
    return q.order_by(Servidor.fecha.desc()).all()


@app.post("/api/servidores", tags=["Servidores"])
def registrar_servidores(data: dict, db: Session = Depends(get_db)):
    """
    Payload:
    {
      "fecha": "2026-03-21",
      "registros": [
        {"nombre": "DPSRVMAIL001", "tipo": "Windows", "rol": "Exchange", "estado": "ok"},
        ...
      ]
    }
    """
    fecha = date.fromisoformat(data["fecha"])
    for r in data.get("registros", []):
        srv = db.query(Servidor).filter(
            Servidor.fecha == fecha,
            Servidor.nombre == r["nombre"]
        ).first()
        if srv:
            srv.estado = r["estado"]
        else:
            srv = Servidor(
                fecha=fecha, nombre=r["nombre"],
                tipo=r.get("tipo", "Windows"),
                rol=r.get("rol", ""),
                estado=r["estado"]
            )
            db.add(srv)
    db.commit()
    return {"ok": True}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE SERVICIOS WEB
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/servicios", tags=["Servicios"])
def get_servicios(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Servicio)
    if fecha_inicio:
        q = q.filter(Servicio.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(Servicio.fecha <= fecha_fin)
    return q.order_by(Servicio.fecha.desc()).all()


@app.post("/api/servicios", tags=["Servicios"])
def registrar_servicios(data: dict, db: Session = Depends(get_db)):
    """
    Payload:
    {
      "fecha": "2026-03-21",
      "registros": [
        {"nombre": "Página principal", "url": "https://...", "estado": "ok"},
        ...
      ]
    }
    """
    fecha = date.fromisoformat(data["fecha"])
    for r in data.get("registros", []):
        svc = db.query(Servicio).filter(
            Servicio.fecha == fecha,
            Servicio.nombre == r["nombre"]
        ).first()
        if svc:
            svc.estado = r["estado"]
        else:
            svc = Servicio(
                fecha=fecha, nombre=r["nombre"],
                url=r.get("url", ""), estado=r["estado"]
            )
            db.add(svc)
    db.commit()
    return {"ok": True}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE BACKUP
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/backups", tags=["Backups"])
def get_backups(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Backup)
    if fecha_inicio:
        q = q.filter(Backup.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(Backup.fecha <= fecha_fin)
    return q.order_by(Backup.fecha.desc()).all()


@app.post("/api/backups", tags=["Backups"])
def registrar_backup(data: dict, db: Session = Depends(get_db)):
    """
    Payload:
    {
      "fecha": "2026-03-21",
      "arcserve_exitosos": 44,
      "arcserve_total": 44,
      "oracle_exitosos": 25,
      "oracle_total": 25,
      "observaciones": ""
    }
    """
    fecha = date.fromisoformat(data["fecha"])
    bk = db.query(Backup).filter(Backup.fecha == fecha).first()
    if bk:
        bk.arcserve_exitosos = data.get("arcserve_exitosos", bk.arcserve_exitosos)
        bk.arcserve_total    = data.get("arcserve_total",    bk.arcserve_total)
        bk.oracle_exitosos   = data.get("oracle_exitosos",   bk.oracle_exitosos)
        bk.oracle_total      = data.get("oracle_total",      bk.oracle_total)
        bk.observaciones     = data.get("observaciones",     bk.observaciones)
    else:
        bk = Backup(
            fecha=fecha,
            arcserve_exitosos=data.get("arcserve_exitosos", 0),
            arcserve_total   =data.get("arcserve_total", 44),
            oracle_exitosos  =data.get("oracle_exitosos", 0),
            oracle_total     =data.get("oracle_total", 25),
            observaciones    =data.get("observaciones", "")
        )
        db.add(bk)
    db.commit()
    return {"ok": True}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE UPS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/ups", tags=["UPS"])
def get_ups(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    q = db.query(UPS)
    if fecha_inicio:
        q = q.filter(UPS.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(UPS.fecha <= fecha_fin)
    return q.order_by(UPS.fecha.desc()).all()


@app.post("/api/ups", tags=["UPS"])
def registrar_ups(data: dict, db: Session = Depends(get_db)):
    """
    Payload:
    {
      "fecha": "2026-03-21",
      "registros": [
        {"grupo": "OACGD", "estado": "alert", "observacion": "Mantenimiento correctivo"},
        {"grupo": "Telefonía", "estado": "ok", "observacion": ""},
        ...
      ]
    }
    """
    fecha = date.fromisoformat(data["fecha"])
    for r in data.get("registros", []):
        ups = db.query(UPS).filter(
            UPS.fecha == fecha,
            UPS.grupo == r["grupo"]
        ).first()
        if ups:
            ups.estado      = r["estado"]
            ups.observacion = r.get("observacion", "")
        else:
            ups = UPS(
                fecha=fecha,
                grupo=r["grupo"],
                estado=r["estado"],
                observacion=r.get("observacion", "")
            )
            db.add(ups)
    db.commit()
    return {"ok": True}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE AMBIENTE (Temperatura / Humedad)
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/ambiente", tags=["Ambiente"])
def get_ambiente(
    dias: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    desde = date.today() - timedelta(days=dias)
    return db.query(Ambiente).filter(
        Ambiente.fecha >= desde
    ).order_by(Ambiente.fecha).all()


@app.post("/api/ambiente", tags=["Ambiente"])
def registrar_ambiente(data: dict, db: Session = Depends(get_db)):
    """
    Payload:
    {
      "fecha": "2026-03-21",
      "temperatura": 20.8,
      "humedad": 59.2
    }
    """
    fecha = date.fromisoformat(data["fecha"])
    amb = db.query(Ambiente).filter(Ambiente.fecha == fecha).first()
    if amb:
        amb.temperatura = data["temperatura"]
        amb.humedad     = data["humedad"]
    else:
        amb = Ambiente(
            fecha=fecha,
            temperatura=data["temperatura"],
            humedad=data["humedad"]
        )
        db.add(amb)
    db.commit()
    return {"ok": True}


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE VPN
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/vpn", tags=["VPN"])
def get_vpn(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    q = db.query(VPN)
    if fecha_inicio:
        q = q.filter(VPN.fecha >= fecha_inicio)
    if fecha_fin:
        q = q.filter(VPN.fecha <= fecha_fin)
    return q.order_by(VPN.fecha.desc()).all()


@app.post("/api/vpn", tags=["VPN"])
def registrar_vpn(data: dict, db: Session = Depends(get_db)):
    """
    Payload:
    {
      "fecha": "2026-03-21",
      "hora_conexion": "09:15 a.m.",
      "estado": "operativo",
      "proveedor": "Telefónica",
      "dispositivo": "PC HP408"
    }
    """
    fecha = date.fromisoformat(data["fecha"])
    vpn = db.query(VPN).filter(VPN.fecha == fecha).first()
    if vpn:
        vpn.hora_conexion = data.get("hora_conexion", vpn.hora_conexion)
        vpn.estado        = data.get("estado", vpn.estado)
    else:
        vpn = VPN(
            fecha=fecha,
            hora_conexion=data.get("hora_conexion", ""),
            estado=data.get("estado", "operativo"),
            proveedor=data.get("proveedor", "Telefónica"),
            dispositivo=data.get("dispositivo", "PC HP408")
        )
        db.add(vpn)
    db.commit()
    return {"ok": True}


# ══════════════════════════════════════════════════════════════════════════════
# RESUMEN — endpoint principal del dashboard
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/resumen", tags=["Resumen"])
def get_resumen(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Devuelve un resumen consolidado de todos los sistemas para
    el rango de fechas indicado. Si no se pasa rango, usa la
    semana actual (lunes a hoy).
    """
    hoy = date.today()
    if not fecha_inicio:
        fecha_inicio = hoy - timedelta(days=hoy.weekday())
    if not fecha_fin:
        fecha_fin = hoy

    def pct(ok, total):
        return round(ok / total * 100, 1) if total > 0 else 0

    # Switches
    sw_total  = db.query(Switch).filter(Switch.fecha.between(fecha_inicio, fecha_fin)).count()
    sw_ok     = db.query(Switch).filter(Switch.fecha.between(fecha_inicio, fecha_fin), Switch.estado == "ok").count()

    # Servidores
    srv_total = db.query(Servidor).filter(Servidor.fecha.between(fecha_inicio, fecha_fin)).count()
    srv_ok    = db.query(Servidor).filter(Servidor.fecha.between(fecha_inicio, fecha_fin), Servidor.estado == "ok").count()

    # Servicios
    svc_total = db.query(Servicio).filter(Servicio.fecha.between(fecha_inicio, fecha_fin)).count()
    svc_ok    = db.query(Servicio).filter(Servicio.fecha.between(fecha_inicio, fecha_fin), Servicio.estado == "ok").count()

    # UPS alertas
    ups_alert = db.query(UPS).filter(
        UPS.fecha.between(fecha_inicio, fecha_fin),
        UPS.estado == "alert"
    ).all()

    # Backups
    backups = db.query(Backup).filter(Backup.fecha.between(fecha_inicio, fecha_fin)).all()
    arc_ok  = sum(b.arcserve_exitosos for b in backups)
    arc_tot = sum(b.arcserve_total    for b in backups)
    ora_ok  = sum(b.oracle_exitosos   for b in backups)
    ora_tot = sum(b.oracle_total      for b in backups)

    # Ambiente
    amb = db.query(Ambiente).filter(
        Ambiente.fecha.between(fecha_inicio, fecha_fin)
    ).order_by(Ambiente.fecha).all()

    # VPN
    vpn_dias = db.query(VPN).filter(
        VPN.fecha.between(fecha_inicio, fecha_fin),
        VPN.estado == "operativo"
    ).count()

    return {
        "periodo": {"inicio": str(fecha_inicio), "fin": str(fecha_fin)},
        "switches":  {"ok": sw_ok,  "total": sw_total,  "pct": pct(sw_ok, sw_total)},
        "servidores":{"ok": srv_ok, "total": srv_total, "pct": pct(srv_ok, srv_total)},
        "servicios": {"ok": svc_ok, "total": svc_total, "pct": pct(svc_ok, svc_total)},
        "ups_alertas": [{"grupo": u.grupo, "fecha": str(u.fecha), "obs": u.observacion} for u in ups_alert],
        "backups": {
            "arcserve": {"ok": arc_ok, "total": arc_tot, "pct": pct(arc_ok, arc_tot)},
            "oracle":   {"ok": ora_ok, "total": ora_tot, "pct": pct(ora_ok, ora_tot)},
        },
        "ambiente": [{"fecha": str(a.fecha), "temperatura": a.temperatura, "humedad": a.humedad} for a in amb],
        "vpn_dias_operativos": vpn_dias,
    }


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINT ZABBIX — para integración futura
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/zabbix/push", tags=["Zabbix"])
def zabbix_push(data: dict, db: Session = Depends(get_db)):
    """
    Endpoint preparado para recibir datos desde un script Zabbix.
    El script en Zabbix hará: POST /api/zabbix/push con el payload
    del estado de cada host monitoreado.

    Ejemplo de payload que enviará Zabbix:
    {
      "fecha": "2026-03-21",
      "fuente": "zabbix",
      "hosts": [
        {"nombre": "SW_CORE", "tipo": "switch", "sede": "DP", "estado": "ok"},
        {"nombre": "DPSRVMAIL001", "tipo": "servidor", "rol": "Exchange", "so": "Windows", "estado": "ok"},
        {"nombre": "Página principal", "tipo": "servicio", "url": "https://...", "estado": "ok"},
        {"nombre": "ARCSERVE", "tipo": "backup_arcserve", "exitosos": 44, "total": 44},
        {"nombre": "ORACLE", "tipo": "backup_oracle", "exitosos": 25, "total": 25},
        {"nombre": "SW_CORE_TEMP", "tipo": "ambiente", "temperatura": 20.8, "humedad": 59.2},
        {"nombre": "UPS_OACGD", "tipo": "ups", "grupo": "OACGD", "estado": "alert"}
      ]
    }
    """
    fecha = date.fromisoformat(data.get("fecha", str(date.today())))
    procesados = 0

    for host in data.get("hosts", []):
        tipo = host.get("tipo", "")

        if tipo == "switch":
            sw = db.query(Switch).filter(Switch.fecha == fecha, Switch.nombre == host["nombre"]).first()
            if sw:
                sw.estado = host["estado"]
            else:
                db.add(Switch(fecha=fecha, nombre=host["nombre"], sede=host.get("sede","DP"), estado=host["estado"]))
            procesados += 1

        elif tipo == "servidor":
            srv = db.query(Servidor).filter(Servidor.fecha == fecha, Servidor.nombre == host["nombre"]).first()
            if srv:
                srv.estado = host["estado"]
            else:
                db.add(Servidor(fecha=fecha, nombre=host["nombre"],
                                tipo=host.get("so","Windows"), rol=host.get("rol",""), estado=host["estado"]))
            procesados += 1

        elif tipo == "servicio":
            svc = db.query(Servicio).filter(Servicio.fecha == fecha, Servicio.nombre == host["nombre"]).first()
            if svc:
                svc.estado = host["estado"]
            else:
                db.add(Servicio(fecha=fecha, nombre=host["nombre"], url=host.get("url",""), estado=host["estado"]))
            procesados += 1

        elif tipo == "backup_arcserve":
            bk = db.query(Backup).filter(Backup.fecha == fecha).first()
            if bk:
                bk.arcserve_exitosos = host.get("exitosos", bk.arcserve_exitosos)
                bk.arcserve_total    = host.get("total",    bk.arcserve_total)
            else:
                db.add(Backup(fecha=fecha, arcserve_exitosos=host.get("exitosos",0),
                              arcserve_total=host.get("total",44), oracle_exitosos=0, oracle_total=25))
            procesados += 1

        elif tipo == "backup_oracle":
            bk = db.query(Backup).filter(Backup.fecha == fecha).first()
            if bk:
                bk.oracle_exitosos = host.get("exitosos", bk.oracle_exitosos)
                bk.oracle_total    = host.get("total",    bk.oracle_total)
            else:
                db.add(Backup(fecha=fecha, arcserve_exitosos=0, arcserve_total=44,
                              oracle_exitosos=host.get("exitosos",0), oracle_total=host.get("total",25)))
            procesados += 1

        elif tipo == "ambiente":
            amb = db.query(Ambiente).filter(Ambiente.fecha == fecha).first()
            if amb:
                amb.temperatura = host.get("temperatura", amb.temperatura)
                amb.humedad     = host.get("humedad",     amb.humedad)
            else:
                db.add(Ambiente(fecha=fecha, temperatura=host.get("temperatura",21.0), humedad=host.get("humedad",59.0)))
            procesados += 1

        elif tipo == "ups":
            ups = db.query(UPS).filter(UPS.fecha == fecha, UPS.grupo == host.get("grupo","")).first()
            if ups:
                ups.estado = host["estado"]
            else:
                db.add(UPS(fecha=fecha, grupo=host.get("grupo",""), estado=host["estado"], observacion=""))
            procesados += 1

    db.commit()
    return {"ok": True, "procesados": procesados, "fuente": data.get("fuente","manual"), "fecha": str(fecha)}


# ══════════════════════════════════════════════════════════════════════════════
# Servir frontend estático (producción)
# ══════════════════════════════════════════════════════════════════════════════
import os
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
