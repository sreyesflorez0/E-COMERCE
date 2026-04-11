"""
Lambda Handler: Generación manual de reportes bajo demanda.

Endpoint: POST /reports/generate
Protegido: Solo usuarios con rol ADMIN

Recibe:
  - report_type: 'on_demand' | 'daily' | 'weekly'
  - start_date: fecha inicio (YYYY-MM-DD)
  - end_date: fecha fin (YYYY-MM-DD)
  - generated_by: UUID del administrador (se extrae del JWT)

Calcula métricas desde order_db y las persiste en reporting_db.
"""

import json
from datetime import date

from src.utils.auth import validate_admin_token
from src.utils.response import success_response, error_response
from src.services.report_service import generate_report


def handler(event, context):
    """Lambda handler para generación manual de reportes."""

    # 1. Validar autenticación y autorización (ADMIN)
    try:
        claims = validate_admin_token(event)
    except PermissionError as e:
        return error_response(str(e), status_code=403)

    # 2. Parsear body del request
    try:
        body = json.loads(event.get("body", "{}") or "{}")
    except json.JSONDecodeError:
        return error_response("El body del request debe ser JSON válido")

    # 3. Validar campos requeridos
    report_type = body.get("report_type", "on_demand")
    start_date_str = body.get("start_date")
    end_date_str = body.get("end_date")

    if not start_date_str or not end_date_str:
        return error_response(
            "Los campos 'start_date' y 'end_date' son requeridos (formato: YYYY-MM-DD)"
        )

    # 4. Parsear fechas
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
    except ValueError:
        return error_response(
            "Formato de fecha inválido. Use YYYY-MM-DD"
        )

    if start_date > end_date:
        return error_response("start_date no puede ser posterior a end_date")

    # 5. Obtener userId del token JWT (claim 'sub')
    generated_by = claims.get("sub")

    # 6. Generar reporte
    try:
        report = generate_report(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            generated_by=generated_by,
        )

        return success_response(
            {
                "message": "Reporte generado exitosamente",
                "report": report,
            },
            status_code=201,
        )

    except ValueError as e:
        return error_response(str(e), status_code=400)
    except RuntimeError as e:
        return error_response(str(e), status_code=500)
    except Exception as e:
        return error_response(
            f"Error interno al generar reporte: {str(e)}",
            status_code=500,
        )
