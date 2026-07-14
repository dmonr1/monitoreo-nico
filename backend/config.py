"""Configuración de entornos para el backend."""

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
DOTENV_PATH = BASE_DIR / ".env"

# Carga .env sólo si existe; en producción se deben usar variables de entorno del servidor.
if DOTENV_PATH.exists():
    load_dotenv(dotenv_path=DOTENV_PATH)

DEPLOY = os.getenv("DEPLOY", "desa").lower()

DB_USER = os.getenv("USERBD")
DB_PASSWORD = os.getenv("PASSBD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME", "monitoreo_ti")
DB_PORT = os.getenv("DB_PORT", "5432")

if DEPLOY == "prod":
    if not all([DB_USER, DB_PASSWORD, DB_HOST]):
        raise RuntimeError("En prod debe definir USERBD, PASSBD y DB_HOST")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DB_USER = DB_USER or "monitoreo"
    DB_PASSWORD = DB_PASSWORD or "monitoreo123"
    DB_HOST = DB_HOST or "localhost"
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

SECRET_KEY = os.getenv("SECRET_KEY", "cambia-esta-clave-en-produccion")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

cors_origins_raw = os.getenv("CORS_ORIGINS")
if cors_origins_raw:
    CORS_ORIGINS = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
else:
    if DEPLOY == "prod":
        raise RuntimeError("CORS_ORIGINS debe estar definido en producción")
    CORS_ORIGINS = ["*"]

DEBUG = DEPLOY != "prod"
