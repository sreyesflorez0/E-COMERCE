"""
Módulo de conexión a bases de datos PostgreSQL.

Gestiona dos conexiones independientes:
- reporting_db: base de datos propia del Reporting Service (lectura/escritura)
- order_db: base de datos del Order Service existente (solo lectura)
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor


def _get_env(key: str, default: str = "") -> str:
    """Obtiene una variable de entorno con valor por defecto."""
    return os.environ.get(key, default)


def get_reporting_db_connection():
    """
    Conexión a la base de datos propia del Reporting Service.
    Se usa para guardar y consultar reportes generados.
    """
    print("REPORTING_DB_HOST =", _get_env("REPORTING_DB_HOST", "localhost"))
    print("ORDER_DB_HOST =", _get_env("ORDER_DB_HOST", "localhost"))
    return psycopg2.connect(
        host=_get_env("REPORTING_DB_HOST", "localhost"),
        port=int(_get_env("REPORTING_DB_PORT", "5437")),
        dbname=_get_env("REPORTING_DB_NAME", "reporting_db"),
        user=_get_env("REPORTING_DB_USER", "reporting_user"),
        password=_get_env("REPORTING_DB_PASSWORD", "reporting_pass"),
        cursor_factory=RealDictCursor,
    )


def get_order_db_connection():
    """
    Conexión READ-ONLY a la base de datos del Order Service.
    Se usa para consultar órdenes y calcular métricas.

    IMPORTANTE: Esta conexión solo realiza operaciones SELECT.
    No modifica la base de datos del Order Service.
    """
    print("REPORTING_DB_HOST =", _get_env("REPORTING_DB_HOST", "localhost"))
    print("ORDER_DB_HOST =", _get_env("ORDER_DB_HOST", "localhost"))
    return psycopg2.connect(
        host=_get_env("ORDER_DB_HOST", "localhost"),
        port=int(_get_env("ORDER_DB_PORT", "5436")),
        dbname=_get_env("ORDER_DB_NAME", "order_db"),
        user=_get_env("ORDER_DB_USER", "order_user"),
        password=_get_env("ORDER_DB_PASSWORD", "order_pass"),
        cursor_factory=RealDictCursor,
        options="-c default_transaction_read_only=on",
    )
