"""
Lambda Handler: Listar reportes generados.

Endpoint: GET /reports
Protegido: Solo usuarios con rol ADMIN

Soporta paginación y filtro por tipo de reporte:
  - Query params: limit, offset, report_type
"""

from src.utils.auth import validate_admin_token
from src.utils.response import success_response, error_response
from src.services.report_service import list_reports


def handler(event, context):
    """Lambda handler para listar reportes generados."""

    # 1. Validar autenticación y autorización (ADMIN)
    try:
        validate_admin_token(event)
    except PermissionError as e:
        return error_response(str(e), status_code=403)

    # 2. Extraer query parameters con valores por defecto
    params = event.get("queryStringParameters") or {}

    try:
        limit = int(params.get("limit", 50))
        offset = int(params.get("offset", 0))
    except ValueError:
        return error_response("Los parámetros 'limit' y 'offset' deben ser números enteros")

    if limit < 1 or limit > 100:
        return error_response("El parámetro 'limit' debe estar entre 1 y 100")
    if offset < 0:
        return error_response("El parámetro 'offset' no puede ser negativo")

    report_type = params.get("report_type")
    if report_type and report_type not in ("daily", "weekly", "on_demand"):
        return error_response(
            "report_type inválido. Valores permitidos: daily, weekly, on_demand"
        )

    # 3. Consultar reportes
    try:
        reports = list_reports(
            limit=limit,
            offset=offset,
            report_type=report_type,
        )

        return success_response({
            "message": "Reportes consultados exitosamente",
            "count": len(reports),
            "limit": limit,
            "offset": offset,
            "reports": reports,
        })

    except Exception as e:
        return error_response(
            f"Error al consultar reportes: {str(e)}",
            status_code=500,
        )
