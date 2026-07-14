"""
Esquemas Pydantic para validación de datos
"""
from pydantic import BaseModel
from datetime import date
from typing import Optional, List


class EstadoItem(BaseModel):
    nombre: str
    estado: str
    sede: Optional[str] = "DP"
    rol: Optional[str] = ""
    tipo: Optional[str] = ""


class RegistroDiarioCreate(BaseModel):
    fecha: date
    switches: List[EstadoItem] = []
    servidores: List[EstadoItem] = []
    servicios: List[EstadoItem] = []


class RegistroDiarioOut(BaseModel):
    fecha: date
    total_ok: int
    total_fail: int


class ResumenSemana(BaseModel):
    periodo_inicio: date
    periodo_fin: date
    switches_ok: int
    switches_total: int
    servidores_ok: int
    servidores_total: int
    servicios_ok: int
    servicios_total: int
