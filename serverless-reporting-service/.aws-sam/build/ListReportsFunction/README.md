# ☁️ Serverless Reporting Service

**Microservicio serverless para generación de reportes de ventas y métricas de la plataforma e-commerce.**

---

## 📋 Descripción

El Serverless Reporting Service es un componente **independiente** del sistema e-commerce, desarrollado con **Python** y diseñado para ejecutarse en **AWS Lambda**. Genera reportes consolidados de ventas, métricas de órdenes y actividad de usuarios.

### Características principales

- ✅ Generación de reportes bajo demanda (administrador)
- ✅ Generación automática de reportes diarios (schedule)
- ✅ Consulta de historial de reportes con paginación
- ✅ Consulta de detalle de reporte con métricas
- ✅ Protección JWT para rol ADMIN
- ✅ Base de datos propia (PostgreSQL) — patrón Database per Service
- ✅ Lectura read-only de la base de datos del Order Service
- ✅ Pruebas locales con **SAM CLI + Insomnia** o con **script Python directo**

### Métricas calculadas

| Métrica | Descripción |
|---|---|
| `total_orders` | Número total de órdenes en el período |
| `total_revenue` | Ingresos totales generados |
| `orders_status_*` | Órdenes agrupadas por estado (CREATED, PAID, CANCELLED) |
| `top_selling_products` | Top 10 productos más vendidos por cantidad |
| `most_active_users` | Top 10 usuarios con más órdenes |

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────┐
│        Sistema Existente (NO MODIFICADO)  │
│                                          │
│  ┌───────────┐     ┌──────────┐          │
│  │Order Svc  │────►│ order_db │          │
│  │  :8084    │     │ PG :5436 │◄── READ-ONLY
│  └───────────┘     └──────────┘     │    │
└──────────────────────────────────────┼────┘
                                      │
┌─────────────────────────────────────┼────┐
│   Serverless Reporting Service (NUEVO)   │
│                                     │    │
│  ┌────────────────┐                 │    │
│  │ generate_report│─────────────────┘    │
│  │ daily_report   │                      │
│  │ list_reports   │───┐                  │
│  │ get_report     │   │                  │
│  └────────────────┘   │                  │
│       Lambda          ▼                  │
│              ┌──────────────┐            │
│              │ reporting_db │            │
│              │   PG :5437   │            │
│              └──────────────┘            │
└──────────────────────────────────────────┘
```

### Estrategia de integración

El servicio se conecta en **modo lectura** (read-only) a la base de datos del Order Service (`order_db`) para calcular métricas. **No modifica** ningún dato del Order Service.

Los reportes generados se persisten en su propia base de datos (`reporting_db`), cumpliendo el patrón **Database per Service**.

---

## 📁 Estructura del Proyecto

```
serverless-reporting-service/
├── src/
│   ├── handlers/
│   │   ├── generate_report.py    # POST /reports/generate (ADMIN)
│   │   ├── daily_report.py       # POST /reports/daily + Schedule cron
│   │   ├── list_reports.py       # GET /reports (ADMIN)
│   │   └── get_report.py         # GET /reports/{id} (ADMIN)
│   ├── services/
│   │   └── report_service.py     # Lógica de negocio
│   ├── repositories/
│   │   ├── order_repository.py   # Consultas READ-ONLY a order_db
│   │   └── report_repository.py  # CRUD en reporting_db
│   ├── db/
│   │   └── connection.py         # Conexiones PostgreSQL
│   ├── models/
│   │   └── report.py             # Modelos de datos
│   └── utils/
│       ├── auth.py               # Validación JWT (HS512)
│       └── response.py           # Helpers de respuesta HTTP
├── events/                       # Eventos de prueba para SAM invoke
├── sql/
│   └── 001_create_tables.sql     # Schema de reporting_db
├── scripts/
│   ├── init_db.py                # Inicialización de tablas
│   └── test_local.py             # Pruebas locales (sin SAM CLI)
├── docker-compose.reporting.yml  # Docker Compose solo para reporting_db
├── template.yaml                 # AWS SAM template
├── env.json                      # Variables de entorno para SAM local
├── requirements.txt              # Dependencias Python
├── .env.example                  # Variables de entorno (script directo)
└── README.md                     # Este archivo
```

---

## 🔒 Seguridad

- **JWT Validation**: Valida tokens usando el mismo `JWT_SECRET` y algoritmo (HS512) que el Auth Service
- **Rol ADMIN**: Solo usuarios con rol ADMIN pueden generar y consultar reportes
- **Read-Only**: La conexión a `order_db` usa el flag `default_transaction_read_only=on`
- **Claims JWT**: Se extraen `sub` (userId), `email`, `role` del token

---

## 📡 Endpoints API

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/reports/generate` | ✅ ADMIN | Generar reporte bajo demanda |
| POST | `/reports/daily` | ❌ | Generar reporte diario manualmente |
| GET | `/reports` | ✅ ADMIN | Listar reportes generados |
| GET | `/reports/{id}` | ✅ ADMIN | Detalle de reporte con métricas |
| — | *Schedule cron* | — | Reporte diario automático (AWS) |

---

## 🚀 Pruebas Locales con SAM CLI + Insomnia (RECOMENDADO)

Esta es la forma principal de probar el servicio localmente. SAM CLI emula API Gateway + Lambda y levanta una API HTTP real en `http://127.0.0.1:3000`.

### Orden correcto de prueba local (Resumen)

1. `docker-compose up -d` (en E-COMERCE para levantar el backend principal)
2. `docker-compose -f docker-compose.reporting.yml up -d` (en serverless-reporting-service)
3. `sam build`
4. `sam local start-api --env-vars env.json`
5. `python scripts/generate_token.py` (para generar token ADMIN)
6. Probar endpoints en Insomnia

A continuación los detalles paso a paso:

### Requisitos previos

- **Docker Desktop** corriendo
- **AWS SAM CLI** instalado ([guía de instalación](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- **Python 3.11+**
- **Insomnia** (o cualquier cliente HTTP)
- Los 4 microservicios originales funcionando (`docker-compose up` del proyecto principal)

### Paso 1: Levantar las bases de datos

```bash
# Desde la raíz del proyecto — levantar los 4 servicios originales (incluye order_db en :5436)
cd E-COMERCE
docker-compose up -d

# Levantar reporting_db (separado, en :5437)
cd serverless-reporting-service
docker-compose -f docker-compose.reporting.yml up -d
```

### Paso 2: Build con SAM

```bash
cd serverless-reporting-service
sam build
```

### Paso 3: Levantar la API local

```bash
sam local start-api --env-vars env.json
```

> SAM levantará un servidor HTTP en **http://127.0.0.1:3000** que emula API Gateway.
> La primera invocación descarga la imagen Docker de Lambda y puede tardar unos segundos.

### Paso 4: Obtener un token JWT de ADMIN

Para probar los endpoints protegidos necesitas un token JWT válido del Auth Service. Hay dos opciones:

**Opción A: Desde el Auth Service (recomendado)**

```bash
# 1. Registrar un usuario ADMIN (si no existe)
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123","role":"ADMIN"}'

# 2. Login para obtener el token
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123"}'

# Copiar el accessToken de la respuesta
```

**Opción B: Generar un token de prueba con Python**

```bash
cd serverless-reporting-service
python scripts/generate_token.py
```

### Paso 5: Probar en Insomnia

Una vez que SAM esté corriendo y tengas un token, usa estos requests:

---

### 📝 Ejemplos de Requests para Insomnia

#### 1. POST — Generar reporte bajo demanda

```
POST http://127.0.0.1:3000/reports/generate
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <TU_TOKEN_JWT_ADMIN>
```

**Body (JSON):**
```json
{
  "report_type": "on_demand",
  "start_date": "2026-01-01",
  "end_date": "2026-04-06"
}
```

**Respuesta esperada (201):**
```json
{
  "message": "Reporte generado exitosamente",
  "report": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "report_type": "on_demand",
    "start_date": "2026-01-01",
    "end_date": "2026-04-06",
    "generated_at": "2026-04-06T14:30:00.123456",
    "generated_by": "admin-uuid",
    "status": "generated",
    "details": [
      {"metric": "total_orders", "value": 15.0, "description": "Número total de órdenes en el período"},
      {"metric": "total_revenue", "value": 1250.50, "description": "Ingresos totales generados en el período"},
      {"metric": "orders_status_created", "value": 8.0, "description": "Órdenes con estado CREATED"},
      {"metric": "orders_status_paid", "value": 5.0, "description": "Órdenes con estado PAID"},
      {"metric": "top_selling_products", "value": 3.0, "description": "[...]"},
      {"metric": "most_active_users", "value": 2.0, "description": "[...]"}
    ]
  }
}
```

---

#### 2. POST — Generar reporte diario

```
POST http://127.0.0.1:3000/reports/daily
```

**Headers:** ninguno requerido (no requiere autenticación, es un trigger del sistema)

**Body:** vacío

**Respuesta esperada (201):**
```json
{
  "message": "Reporte diario generado exitosamente",
  "report": {
    "id": "...",
    "report_type": "daily",
    "start_date": "2026-04-05",
    "end_date": "2026-04-05",
    "status": "generated",
    "details": [...]
  }
}
```

---

#### 3. GET — Listar reportes

```
GET http://127.0.0.1:3000/reports
```

**Headers:**
```
Authorization: Bearer <TU_TOKEN_JWT_ADMIN>
```

**Query params opcionales:**
- `?limit=10`
- `?offset=0`
- `?report_type=on_demand`

Ejemplo completo: `GET http://127.0.0.1:3000/reports?limit=10&offset=0`

**Respuesta esperada (200):**
```json
{
  "message": "Reportes consultados exitosamente",
  "count": 2,
  "limit": 10,
  "offset": 0,
  "reports": [
    {
      "id": "...",
      "report_type": "on_demand",
      "start_date": "2026-01-01",
      "end_date": "2026-04-06",
      "generated_at": "2026-04-06T14:30:00",
      "generated_by": "admin-uuid",
      "status": "generated"
    },
    {
      "id": "...",
      "report_type": "daily",
      "start_date": "2026-04-05",
      "end_date": "2026-04-05",
      "generated_at": "2026-04-06T06:00:00",
      "generated_by": null,
      "status": "generated"
    }
  ]
}
```

---

#### 4. GET — Detalle de un reporte

```
GET http://127.0.0.1:3000/reports/{id}
```

Reemplaza `{id}` con el UUID real obtenido de los endpoints anteriores.

**Headers:**
```
Authorization: Bearer <TU_TOKEN_JWT_ADMIN>
```

Ejemplo: `GET http://127.0.0.1:3000/reports/550e8400-e29b-41d4-a716-446655440000`

**Respuesta esperada (200):**
```json
{
  "message": "Reporte encontrado",
  "report": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "report_type": "on_demand",
    "start_date": "2026-01-01",
    "end_date": "2026-04-06",
    "generated_at": "2026-04-06T14:30:00",
    "generated_by": "admin-uuid",
    "status": "generated",
    "details": [
      {"id": "...", "report_id": "...", "metric": "total_orders", "value": 15.0, "description": "..."},
      {"id": "...", "report_id": "...", "metric": "total_revenue", "value": 1250.50, "description": "..."}
    ]
  }
}
```

---

#### 5. Errores esperados

**Sin token (403):**
```
GET http://127.0.0.1:3000/reports
# Sin header Authorization → 403 "Token de autenticación requerido"
```

**Reporte no encontrado (404):**
```
GET http://127.0.0.1:3000/reports/00000000-0000-0000-0000-000000000000
# Con token válido → 404 "Reporte con id '...' no encontrado"
```

**Fechas inválidas (400):**
```
POST http://127.0.0.1:3000/reports/generate
Body: {"report_type": "on_demand", "start_date": "2026-12-31", "end_date": "2026-01-01"}
# → 400 "start_date no puede ser posterior a end_date"
```

---

### 🚨 Problemas comunes

- **SAM CLI no instalado**: Si aparece el error `sam: command not found`, asegúrate de haber instalado AWS SAM CLI y tenerlo en tu PATH de Windows.
- **Docker Desktop apagado**: `sam local start-api` fallará indicando que no puede conectar con el daemon de Docker. Enciende Docker Desktop antes de correr SAM.
- **Puertos 5436 o 5437 ocupados**: Asegúrate de apagar instancias locales de PostgreSQL que puedan estar usando esos puertos antes de ejecutar `docker-compose`.
- **Token inválido o expirado**: El endpoint responderá con `403`. Ejecuta de nuevo `python scripts/generate_token.py` para obtener un token fresco válido por 24 horas.
- **Uso de `host.docker.internal`**: Este host especial es ideal y está pensado para Windows / Docker Desktop. En Linux puro de forma nativa, es posible que el contenedor falle al conectarse a la capa base, requiriendo usar el gateway de la subred docker en el `env.json`.

---

## 🐍 Pruebas Locales con Script Python (alternativa sin SAM)

Si no tienes SAM CLI instalado, puedes probar directamente con Python:

```bash
cd serverless-reporting-service
cp .env.example .env
pip install -r requirements.txt
docker-compose -f docker-compose.reporting.yml up -d
python scripts/test_local.py
```

Este script ejecuta **7 pruebas** que cubren todos los flujos.

---

## ☁️ Despliegue en AWS (opcional)

```bash
cd serverless-reporting-service
sam build
sam deploy --guided
```

Al hacer `sam deploy --guided` se solicitan los parámetros de conexión. En producción, se recomienda usar **AWS Secrets Manager** o **SSM Parameter Store**.

---

## 🗄️ Base de Datos

### Schema — reporting_db

```sql
TABLE: reports
├── id UUID PRIMARY KEY
├── report_type VARCHAR(20) CHECK IN ('daily','weekly','on_demand')
├── start_date DATE NOT NULL
├── end_date DATE NOT NULL
├── generated_at TIMESTAMP DEFAULT now()
├── generated_by UUID
└── status VARCHAR(10) CHECK IN ('generated','failed')

TABLE: report_details
├── id UUID PRIMARY KEY
├── report_id UUID FOREIGN KEY → reports(id)
├── metric VARCHAR(50)
├── value NUMERIC(12,2)
└── description TEXT
```

### Conexiones a bases de datos

| Base de datos | Puerto | Modo | Propósito |
|---|---|---|---|
| `reporting_db` | 5437 | Read/Write | Persistencia de reportes y métricas |
| `order_db` | 5436 | **Read-Only** | Consulta de órdenes para métricas |

> **Nota sobre SAM local:** SAM ejecuta Lambda dentro de Docker. Por eso el archivo `env.json` usa `host.docker.internal` en lugar de `localhost` como host de las bases de datos. Esto permite que los contenedores Lambda accedan a los puertos de la máquina host (ideal para pruebas locales en Windows utilizando Docker Desktop).

---

## ⚠️ Importante — Integración con el Proyecto Actual

1. **Los 4 microservicios actuales (Auth, User, Product, Order) NO se modifican**
2. Este servicio se agrega como una **pieza independiente** al proyecto
3. No se modifica el `docker-compose.yml` principal
4. No se modifica el archivo `.env` raíz del proyecto
5. La conexión a `order_db` es estrictamente **read-only**
6. No se usa RabbitMQ en esta versión MVP

---

## 🛠️ Tecnologías

| Componente | Tecnología | Versión |
|---|---|---|
| Runtime | Python | 3.11 |
| Serverless | AWS Lambda + SAM | Latest |
| Base de datos | PostgreSQL | 16 Alpine |
| JWT | PyJWT | 2.9.0 |
| DB Driver | psycopg2-binary | 2.9.9 |
| Config | python-dotenv | 1.0.1 |
| Contenedores | Docker + Compose | v3.9 |
| Pruebas locales | SAM CLI + Insomnia | Latest |
