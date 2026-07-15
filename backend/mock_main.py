"""Backend mock para disenar el frontend sin conexion a PostgreSQL."""

from __future__ import annotations

import os
from datetime import date, timedelta
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    from backend.mock_data import (
        mock_access_points,
        mock_ambiente,
        mock_backups,
        mock_biometricos,
        mock_hardware,
        mock_radioenlaces,
        mock_resumen,
        mock_servidores,
        mock_servicios,
        mock_switches,
        mock_ups,
        mock_vpn,
    )
except ModuleNotFoundError:
    from mock_data import (
        mock_access_points,
        mock_ambiente,
        mock_backups,
        mock_biometricos,
        mock_hardware,
        mock_radioenlaces,
        mock_resumen,
        mock_servidores,
        mock_servicios,
        mock_switches,
        mock_ups,
        mock_vpn,
    )


app = FastAPI(
    title="Monitoreo TI - Mock API",
    description="API ficticia compatible con el frontend, sin base de datos.",
    version="1.0.0-mock",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def default_range(fecha_inicio: Optional[date], fecha_fin: Optional[date]) -> tuple[date, date]:
    today = date.today()
    if not fecha_inicio:
        fecha_inicio = today - timedelta(days=today.weekday())
    if not fecha_fin:
        fecha_fin = today
    return fecha_inicio, fecha_fin


@app.get("/api/health", tags=["Mock"])
def health():
    return {"ok": True, "mode": "mock", "message": "Backend ficticio activo"}


@app.get("/api/resumen", tags=["Resumen"])
def get_resumen(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_resumen(fecha_inicio, fecha_fin)


@app.get("/api/switches", tags=["Switches"])
def get_switches(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_switches(fecha_inicio, fecha_fin)


@app.post("/api/switches", tags=["Switches"])
def post_switches(data: dict):
    return {"ok": True, "mock": True, "creados": len(data.get("registros", [])), "fecha": data.get("fecha")}


@app.get("/api/servidores", tags=["Servidores"])
def get_servidores(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    tipo: Optional[str] = None,
):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_servidores(fecha_inicio, fecha_fin, tipo)


@app.post("/api/servidores", tags=["Servidores"])
def post_servidores(data: dict):
    return {"ok": True, "mock": True, "creados": len(data.get("registros", [])), "fecha": data.get("fecha")}


@app.get("/api/servicios", tags=["Servicios"])
def get_servicios(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_servicios(fecha_inicio, fecha_fin)


@app.post("/api/servicios", tags=["Servicios"])
def post_servicios(data: dict):
    return {"ok": True, "mock": True, "creados": len(data.get("registros", [])), "fecha": data.get("fecha")}


@app.get("/api/backups", tags=["Backups"])
def get_backups(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_backups(fecha_inicio, fecha_fin)


@app.post("/api/backups", tags=["Backups"])
def post_backups(data: dict):
    return {"ok": True, "mock": True, "fecha": data.get("fecha")}


@app.get("/api/ups", tags=["UPS"])
def get_ups(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_ups(fecha_inicio, fecha_fin)


@app.post("/api/ups", tags=["UPS"])
def post_ups(data: dict):
    return {"ok": True, "mock": True, "creados": len(data.get("registros", [])), "fecha": data.get("fecha")}


@app.get("/api/radioenlaces", tags=["Infraestructura"])
def get_radioenlaces(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_radioenlaces(fecha_inicio, fecha_fin)


@app.get("/api/biometricos", tags=["Infraestructura"])
def get_biometricos(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_biometricos(fecha_inicio, fecha_fin)


@app.get("/api/hardware", tags=["Infraestructura"])
def get_hardware(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_hardware(fecha_inicio, fecha_fin)


@app.get("/api/access-points", tags=["Infraestructura"])
def get_access_points(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_access_points(fecha_inicio, fecha_fin)


@app.get("/api/ambiente", tags=["Ambiente"])
def get_ambiente(dias: int = Query(default=30, ge=1, le=365)):
    return mock_ambiente(dias)


@app.post("/api/ambiente", tags=["Ambiente"])
def post_ambiente(data: dict):
    return {"ok": True, "mock": True, "fecha": data.get("fecha")}


@app.get("/api/vpn", tags=["VPN"])
def get_vpn(fecha_inicio: Optional[date] = None, fecha_fin: Optional[date] = None):
    fecha_inicio, fecha_fin = default_range(fecha_inicio, fecha_fin)
    return mock_vpn(fecha_inicio, fecha_fin)


@app.post("/api/vpn", tags=["VPN"])
def post_vpn(data: dict):
    return {"ok": True, "mock": True, "fecha": data.get("fecha")}


@app.post("/api/zabbix/push", tags=["Zabbix"])
def zabbix_push(data: dict):
    return {
        "ok": True,
        "mock": True,
        "procesados": len(data.get("hosts", [])),
        "fuente": data.get("fuente", "manual"),
        "fecha": data.get("fecha", str(date.today())),
    }


frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
