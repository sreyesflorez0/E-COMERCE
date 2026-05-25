"""
Script de prueba local para el Serverless Reporting Service.

Ejecuta los 4 handlers Lambda directamente sin necesidad de AWS SAM CLI.
Simula eventos de API Gateway y muestra los resultados en consola.

Prerequisitos:
  1. Docker con los contenedores de base de datos corriendo:
     - reporting-db (puerto 5437) — docker-compose -f docker-compose.reporting.yml up -d
     - order-db (puerto 5436) — desde el docker-compose.yml principal
  2. Tablas creadas: python scripts/init_db.py
  3. Dependencias instaladas: pip install -r requirements.txt
  4. Archivo .env configurado (copiar de .env.example)

Uso:
  cd serverless-reporting-service
  python scripts/test_local.py
"""

import os
import sys
import json
import time
from datetime import date, timedelta, datetime
from uuid import uuid4

# Ajustar path para imports del proyecto
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Cargar variables de entorno
from dotenv import load_dotenv
load_dotenv(
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
)

# Importar módulo JWT para generar un token de prueba
import jwt as pyjwt


# ======================== UTILIDADES ========================

def generate_test_admin_token() -> str:
    """Genera un token JWT de prueba con rol ADMIN."""
    secret = os.environ.get(
        "JWT_SECRET",
        "ecommerce-super-secret-jwt-key-change-this-in-production-must-be-256-bits",
    )
    algorithm = os.environ.get("JWT_ALGORITHM", "HS512")

    payload = {
        "sub": str(uuid4()),  # userId simulado
        "email": "admin@ecommerce.com",
        "role": "ADMIN",
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,  # Expira en 1 hora
    }

    token = pyjwt.encode(payload, secret, algorithm=algorithm)
    return token


def print_separator():
    print("\n" + "=" * 70 + "\n")


def print_response(name: str, response: dict):
    """Muestra la respuesta de un handler de forma legible."""
    status = response.get("statusCode", "?")
    body = json.loads(response.get("body", "{}"))

    status_icon = "✅" if status < 400 else "❌"
    print(f"{status_icon} {name}")
    print(f"   Status: {status}")
    print(f"   Body:   {json.dumps(body, indent=2, ensure_ascii=False, default=str)}")


# ======================== TESTS ========================

def test_generate_report(token: str) -> dict:
    """Test 1: Generar reporte bajo demanda."""
    from src.handlers.generate_report import handler

    today = date.today()
    thirty_days_ago = today - timedelta(days=30)

    event = {
        "httpMethod": "POST",
        "path": "/reports/generate",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        "body": json.dumps({
            "report_type": "on_demand",
            "start_date": thirty_days_ago.isoformat(),
            "end_date": today.isoformat(),
        }),
    }

    print("📊 Test 1: Generar reporte bajo demanda (on_demand)")
    print(f"   Rango: {thirty_days_ago} → {today}")

    response = handler(event, None)
    print_response("Generar reporte", response)
    return response


def test_generate_report_no_auth():
    """Test 2: Intentar generar reporte sin autenticación (debe fallar)."""
    from src.handlers.generate_report import handler

    event = {
        "httpMethod": "POST",
        "path": "/reports/generate",
        "headers": {},
        "body": json.dumps({
            "report_type": "on_demand",
            "start_date": "2026-01-01",
            "end_date": "2026-04-06",
        }),
    }

    print("🔒 Test 2: Generar reporte SIN autenticación (debe retornar 403)")

    response = handler(event, None)
    print_response("Sin autenticación", response)

    assert response["statusCode"] == 403, "Debería retornar 403"
    print("   ✅ Verificación: Acceso denegado correctamente")
    return response


def test_generate_report_invalid_dates(token: str):
    """Test 3: Generar reporte con fechas inválidas (debe fallar)."""
    from src.handlers.generate_report import handler

    event = {
        "httpMethod": "POST",
        "path": "/reports/generate",
        "headers": {
            "Authorization": f"Bearer {token}",
        },
        "body": json.dumps({
            "report_type": "on_demand",
            "start_date": "2026-12-31",
            "end_date": "2026-01-01",
        }),
    }

    print("📅 Test 3: Generar reporte con fechas invertidas (debe retornar 400)")

    response = handler(event, None)
    print_response("Fechas inválidas", response)

    assert response["statusCode"] == 400, "Debería retornar 400"
    print("   ✅ Verificación: Validación de fechas correcta")
    return response


def test_daily_report():
    """Test 4: Generar reporte diario automático."""
    from src.handlers.daily_report import handler

    event = {
        "source": "aws.events",
        "detail-type": "Scheduled Event",
        "detail": {},
    }

    yesterday = date.today() - timedelta(days=1)
    print(f"📆 Test 4: Generar reporte diario automático (fecha: {yesterday})")

    response = handler(event, None)
    print_response("Reporte diario", response)
    return response


def test_list_reports(token: str):
    """Test 5: Listar reportes generados."""
    from src.handlers.list_reports import handler

    event = {
        "httpMethod": "GET",
        "path": "/reports",
        "headers": {
            "Authorization": f"Bearer {token}",
        },
        "queryStringParameters": {
            "limit": "10",
            "offset": "0",
        },
    }

    print("📋 Test 5: Listar reportes generados")

    response = handler(event, None)
    print_response("Listar reportes", response)
    return response


def test_get_report(token: str, report_id: str):
    """Test 6: Consultar detalle de un reporte específico."""
    from src.handlers.get_report import handler

    event = {
        "httpMethod": "GET",
        "path": f"/reports/{report_id}",
        "headers": {
            "Authorization": f"Bearer {token}",
        },
        "pathParameters": {
            "id": report_id,
        },
    }

    print(f"🔍 Test 6: Consultar detalle del reporte {report_id[:8]}...")

    response = handler(event, None)
    print_response("Detalle de reporte", response)
    return response


def test_get_report_not_found(token: str):
    """Test 7: Consultar reporte inexistente (debe retornar 404)."""
    from src.handlers.get_report import handler

    fake_id = "00000000-0000-0000-0000-000000000000"
    event = {
        "httpMethod": "GET",
        "path": f"/reports/{fake_id}",
        "headers": {
            "Authorization": f"Bearer {token}",
        },
        "pathParameters": {
            "id": fake_id,
        },
    }

    print("🔍 Test 7: Consultar reporte inexistente (debe retornar 404)")

    response = handler(event, None)
    print_response("Reporte no encontrado", response)

    assert response["statusCode"] == 404, "Debería retornar 404"
    print("   ✅ Verificación: 404 correctamente")
    return response


# ======================== MAIN ========================

def main():
    print("=" * 70)
    print("  🧪 SERVERLESS REPORTING SERVICE — PRUEBAS LOCALES")
    print("=" * 70)
    print()
    print(f"  Hora: {datetime.now().isoformat()}")
    print(f"  Reporting DB: {os.environ.get('REPORTING_DB_HOST', 'localhost')}:{os.environ.get('REPORTING_DB_PORT', '5437')}")
    print(f"  Order DB:     {os.environ.get('ORDER_DB_HOST', 'localhost')}:{os.environ.get('ORDER_DB_PORT', '5436')}")
    print()

    # Generar token JWT de prueba con rol ADMIN
    token = generate_test_admin_token()
    print(f"  🔑 Token ADMIN generado para pruebas")

    # ---- Ejecutar tests ----

    print_separator()
    test_generate_report_no_auth()

    print_separator()
    test_generate_report_invalid_dates(token)

    print_separator()
    gen_response = test_generate_report(token)

    # Extraer report_id para usarlo en test de detalle
    report_id = None
    if gen_response.get("statusCode") == 201:
        body = json.loads(gen_response["body"])
        report_id = body.get("report", {}).get("id")

    print_separator()
    test_daily_report()

    print_separator()
    test_list_reports(token)

    print_separator()
    if report_id:
        test_get_report(token, report_id)
    else:
        print("⚠️  Saltando test de detalle: no se pudo obtener report_id")

    print_separator()
    test_get_report_not_found(token)

    print_separator()
    print("=" * 70)
    print("  ✅ TODAS LAS PRUEBAS COMPLETADAS")
    print("=" * 70)


if __name__ == "__main__":
    main()
