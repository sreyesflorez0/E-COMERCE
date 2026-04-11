"""
Utilidades para construir respuestas HTTP consistentes.

Todos los handlers Lambda devuelven respuestas con el mismo formato,
facilitando la integración con API Gateway.
"""

import json
from typing import Any


def success_response(body: Any, status_code: int = 200) -> dict:
    """Construye una respuesta HTTP exitosa para API Gateway."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body, default=str, ensure_ascii=False),
    }


def error_response(message: str, status_code: int = 400) -> dict:
    """Construye una respuesta HTTP de error para API Gateway."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(
            {"error": message},
            default=str,
            ensure_ascii=False,
        ),
    }
