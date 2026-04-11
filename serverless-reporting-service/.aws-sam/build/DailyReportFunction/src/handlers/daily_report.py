"""
Lambda Handler: Generación automática de reporte diario.

Activación: CloudWatch Events / EventBridge Schedule (cron diario)
No requiere autenticación (es una ejecución programada del sistema).

Genera automáticamente un reporte del día anterior con todas las métricas
y lo persiste en reporting_db.
"""

from src.utils.response import success_response, error_response
from src.services.report_service import generate_daily_report


def handler(event, context):
    """Lambda handler para generación automática de reporte diario."""

    try:
        report = generate_daily_report()

        return success_response(
            {
                "message": "Reporte diario generado exitosamente",
                "report": report,
            },
            status_code=201,
        )

    except RuntimeError as e:
        return error_response(
            f"Error al generar reporte diario: {str(e)}",
            status_code=500,
        )
    except Exception as e:
        return error_response(
            f"Error interno en reporte diario: {str(e)}",
            status_code=500,
        )
