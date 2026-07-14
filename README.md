# Monitoreo TI — Despacho Presidencial del Perú
## Guía de instalación completa (Windows Server / Linux)

---

# Subir cambios
git add .
git commit -m "xxxxxx"
git push origin main

## Arquitectura

```
Navegadores de la intranet
        │
        ▼
 Frontend HTML/JS  (puerto 8000 o Nginx/IIS)
        │
        ▼
  Backend FastAPI  (puerto 8000)
        │
        ▼
  PostgreSQL       (puerto 5432)
```

---

## 1. Requisitos previos

| Componente | Versión mínima |
|---|---|
| Python | 3.10+ |
| PostgreSQL | 13+ |
| Navegador intranet | Chrome / Edge / Firefox |

---

## 2. Preparar PostgreSQL

```sql
-- Conectarse como superusuario (psql -U postgres)
CREATE DATABASE monitoreo_ti;
CREATE USER monitoreo WITH PASSWORD '1234';
GRANT ALL PRIVILEGES ON DATABASE monitoreo_ti TO monitoreo;
\c monitoreo_ti
GRANT ALL ON SCHEMA public TO monitoreo;
```

> ⚠️ Cambia '1234' por una contraseña segura y NO subas este valor a Git.

## 2.1 Entornos de desarrollo y producción

- En desarrollo local usa `backend/.env` con `DEPLOY=desa`.
- En producción, NO debes almacenar credenciales en el repositorio.
- Define variables de entorno en el servidor:
  - `DEPLOY=prod`
  - `USERBD=tu_usuario_bd`
  - `PASSBD=tu_contraseña_bd`
  - `DB_HOST=ip_o_host_bd`
  - `DB_NAME=monitoreo_ti`
  - `DB_PORT=5432`
  - `CORS_ORIGINS=http://tu-servidor-intranet`
  - `SECRET_KEY=una_clave_larga_y_secreta`
  - `HOST=0.0.0.0`
  - `PORT=8000`

El backend falla al iniciar si `USERBD`, `PASSBD`, `DB_HOST` o `CORS_ORIGINS` no están definidos en `prod`.

---

## 3. Instalar el backend

### Windows Server

```bat
REM Abrir PowerShell como Administrador

REM Ir a la carpeta del proyecto
cd C:\monitoreo-ti\backend

REM Crear entorno virtual
python -m venv venv
venv\Scripts\activate

REM Instalar dependencias
pip install -r requirements.txt

REM Configurar base de datos
copy .env.example .env
REM Editar .env con Notepad y cambiar las credenciales

REM Iniciar el servidor (prueba)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Linux (Ubuntu/Debian)

```bash
cd /opt/monitoreo-ti/backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
nano .env  # Editar credenciales

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 4. Configurar como servicio (arranque automático)

### Windows — como servicio con NSSM

```bat
REM Descargar NSSM de https://nssm.cc/download
nssm install MonitoreoTI "C:\monitoreo-ti\backend\venv\Scripts\uvicorn.exe"
nssm set MonitoreoTI AppParameters "main:app --host 0.0.0.0 --port 8000"
nssm set MonitoreoTI AppDirectory "C:\monitoreo-ti\backend"
nssm start MonitoreoTI
```

### Linux — systemd

```bash
# /etc/systemd/system/monitoreo-ti.service
[Unit]
Description=Monitoreo TI API
After=network.target postgresql.service

[Service]
User=www-data
WorkingDirectory=/opt/monitoreo-ti/backend
Environment="PATH=/opt/monitoreo-ti/backend/venv/bin"
ExecStart=/opt/monitoreo-ti/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable monitoreo-ti
systemctl start monitoreo-ti
```

---

## 5. Servir el frontend

### Opción A — FastAPI sirve el frontend (más simple)
El backend ya incluye esta línea en `main.py`:
```python
app.mount("/", StaticFiles(directory="../frontend", html=True))
```
Acceder desde la intranet: `http://IP-DEL-SERVIDOR:8000`

### Opción B — IIS (Windows Server)
1. Copiar la carpeta `frontend/` a `C:\inetpub\wwwroot\monitoreo`
2. Crear sitio en IIS apuntando a esa carpeta
3. Acceder: `http://monitoreo.intranet.presidencia.gob.pe`

### Opción C — Nginx (Linux)
```nginx
server {
    listen 80;
    server_name monitoreo.intranet.presidencia.gob.pe;

    root /opt/monitoreo-ti/frontend;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8000/api/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 6. Verificar instalación

Abrir en el navegador:
- `http://localhost:8000/docs` → Documentación automática de la API (Swagger)
- `http://localhost:8000` → Dashboard
- `http://localhost:8000/ingresar.html` → Formulario de ingreso

---

## 7. Integración futura con Zabbix

Cuando estés listo para automatizar, crea un script en el servidor Zabbix:

```python
# zabbix_push.py — ejecutar como tarea programada o Action en Zabbix
import requests
from datetime import date

API = "http://IP-SERVIDOR-MONITOREO:8000/api/zabbix/push"

# Este script recoge datos de la API de Zabbix y los envía al sistema
payload = {
    "fecha": str(date.today()),
    "fuente": "zabbix",
    "hosts": [
        # Zabbix llena esto automáticamente consultando sus hosts
        {"nombre": "SW_CORE", "tipo": "switch", "sede": "DP", "estado": "ok"},
        # ... más hosts
    ]
}

r = requests.post(API, json=payload)
print(r.json())
```

El endpoint `/api/zabbix/push` ya está preparado y documentado en `main.py`.

---

## 8. Estructura de archivos

```
monitoreo-ti/
├── backend/
│   ├── main.py          ← API FastAPI (todos los endpoints)
│   ├── models.py        ← Tablas PostgreSQL
│   ├── schemas.py       ← Validación de datos
│   ├── requirements.txt ← Dependencias Python
│   └── .env             ← Credenciales (NO subir a Git)
├── frontend/
│   ├── index.html       ← Dashboard principal
│   ├── ingresar.html    ← Formulario de ingreso diario
│   └── js/
│       └── api.js       ← Cliente JavaScript
└── README.md
```

---

## 9. Flujo diario del técnico

1. Abrir `http://servidor/ingresar.html`
2. Verificar que la fecha sea correcta
3. Recorrer los 7 pasos (switches → servidores → servicios → backups → UPS → ambiente → VPN)
4. Usar **"Marcar todos OK"** si todo está bien, o marcar individualmente los que fallen
5. Revisar el resumen en el paso 8
6. Clic en **"Guardar registro del día"**
7. El dashboard se actualiza automáticamente

---

## Soporte

Para dudas técnicas, revisar primero:
- `http://localhost:8000/docs` — documentación interactiva de la API
- Logs del servicio: `journalctl -u monitoreo-ti -f` (Linux) o Event Viewer (Windows)
