"""
Lambda Handler: Consultar detalle de un reporte específico.

Endpoint: GET /reports/{id}
Protegido: Solo usuarios con rol ADMIN

Retorna el reporte con todas sus métricas asociadas (report_details).
"""

from src.utils.auth import validate_admin_token
from src.utils.response import success_response, error_response
from src.services.report_service import get_report


def handler(event, context):
    """Lambda handler para consultar un reporte por ID."""

    # 1. Validar autenticación y autorización (ADMIN)
    try:
        validate_admin_token(event)
    except PermissionError as e:
        return error_response(str(e), status_code=403)

    # 2. Extraer report_id de los path parameters
    path_params = event.get("pathParameters") or {}
    report_id = path_params.get("id")

    if not report_id:
        return error_response("El parámetro 'id' es requerido en la URL")

    # Validar formato UUID básico
    report_id = report_id.strip()
    if len(report_id) != 36 or report_id.count("-") != 4:
        return error_response("El 'id' debe ser un UUID válido")

    # 3. Buscar reporte
    try:
        report = get_report(report_id)

        if not report:
            return error_response(
                f"Reporte con id '{report_id}' no encontrado",
                status_code=404,
            )

        return success_response({
            "message": "Reporte encontrado",
            "report": report,
        })

    except Exception as e:
        return error_response(
            f"Error al consultar reporte: {str(e)}",
            status_code=500,
        )
