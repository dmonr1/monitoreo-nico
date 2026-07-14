"""
Modelos de base de datos — SQLAlchemy + PostgreSQL
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, Date, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from backend.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── SWITCHES ─────────────────────────────────────────────────────────────────
class Switch(Base):
    __tablename__ = "switches"
    id     = Column(Integer, primary_key=True, index=True)
    fecha  = Column(Date, nullable=False, index=True)
    nombre = Column(String(120), nullable=False)
    sede   = Column(String(20), default="DP")
    estado = Column(String(20), default="ok")   # ok | fail | na


# ─── SERVIDORES ───────────────────────────────────────────────────────────────
class Servidor(Base):
    __tablename__ = "servidores"
    id     = Column(Integer, primary_key=True, index=True)
    fecha  = Column(Date, nullable=False, index=True)
    nombre = Column(String(120), nullable=False)
    tipo   = Column(String(20), default="Windows")   # Windows | Linux
    rol    = Column(String(60), default="")
    estado = Column(String(20), default="ok")


# ─── SERVICIOS WEB ────────────────────────────────────────────────────────────
class Servicio(Base):
    __tablename__ = "servicios"
    id     = Column(Integer, primary_key=True, index=True)
    fecha  = Column(Date, nullable=False, index=True)
    nombre = Column(String(120), nullable=False)
    url    = Column(Text, default="")
    estado = Column(String(20), default="ok")


# ─── BACKUPS ──────────────────────────────────────────────────────────────────
class Backup(Base):
    __tablename__ = "backups"
    id                = Column(Integer, primary_key=True, index=True)
    fecha             = Column(Date, nullable=False, unique=True, index=True)
    arcserve_exitosos = Column(Integer, default=0)
    arcserve_total    = Column(Integer, default=44)
    oracle_exitosos   = Column(Integer, default=0)
    oracle_total      = Column(Integer, default=25)
    observaciones     = Column(Text, default="")


# ─── UPS ──────────────────────────────────────────────────────────────────────
class UPS(Base):
    __tablename__ = "ups"
    id          = Column(Integer, primary_key=True, index=True)
    fecha       = Column(Date, nullable=False, index=True)
    grupo       = Column(String(80), nullable=False)
    estado      = Column(String(20), default="ok")   # ok | alert | fail
    observacion = Column(Text, default="")


# ─── AMBIENTE ─────────────────────────────────────────────────────────────────
class Ambiente(Base):
    __tablename__ = "ambiente"
    id          = Column(Integer, primary_key=True, index=True)
    fecha       = Column(Date, nullable=False, unique=True, index=True)
    temperatura = Column(Float, nullable=False)
    humedad     = Column(Float, nullable=False)


# ─── VPN ──────────────────────────────────────────────────────────────────────
class VPN(Base):
    __tablename__ = "vpn"
    id            = Column(Integer, primary_key=True, index=True)
    fecha         = Column(Date, nullable=False, unique=True, index=True)
    hora_conexion = Column(String(20), default="")
    estado        = Column(String(20), default="operativo")
    proveedor     = Column(String(60), default="Telefónica")
    dispositivo   = Column(String(60), default="PC HP408")


# ─── ACCESS POINTS ────────────────────────────────────────────────────────────
class AccessPoint(Base):
    __tablename__ = "access_points"
    id     = Column(Integer, primary_key=True, index=True)
    fecha  = Column(Date, nullable=False, index=True)
    nombre = Column(String(120), nullable=False)
    estado = Column(String(20), default="ok")
