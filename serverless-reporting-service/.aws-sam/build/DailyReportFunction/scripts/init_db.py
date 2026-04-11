"""
Script para inicializar las tablas del Reporting Service en PostgreSQL.

Prerequisitos:
  - Docker con reporting-db corriendo en puerto 5437
  - pip install psycopg2-binary python-dotenv

Uso:
  cd serverless-reporting-service
  python scripts/init_db.py
"""

import os
import sys

# Ajustar path para imports del proyecto
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv(
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
)


def init_database():
    """Ejecuta el script SQL para crear las tablas en reporting_db."""

    # Ruta al archivo SQL
    sql_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "sql",
        "001_create_tables.sql",
    )

    # Leer SQL
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Conectar a reporting_db
    conn = psycopg2.connect(
        host=os.environ.get("REPORTING_DB_HOST", "localhost"),
        port=int(os.environ.get("REPORTING_DB_PORT", "5437")),
        dbname=os.environ.get("REPORTING_DB_NAME", "reporting_db"),
        user=os.environ.get("REPORTING_DB_USER", "reporting_user"),
        password=os.environ.get("REPORTING_DB_PASSWORD", "reporting_pass"),
    )

    try:
        with conn.cursor() as cur:
            cur.execute(sql_content)
        conn.commit()
        print("✅ Tablas creadas exitosamente en reporting_db")
        print("   - reports")
        print("   - report_details")
        print(f"   Host: {os.environ.get('REPORTING_DB_HOST', 'localhost')}")
        print(f"   Puerto: {os.environ.get('REPORTING_DB_PORT', '5437')}")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error al crear tablas: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    print("🔧 Inicializando base de datos del Reporting Service...")
    print()
    init_database()
