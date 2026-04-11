"""
Capa de servicio (lógica de negocio) del Serverless Reporting Service.

Orquesta la generación de reportes:
1. Consulta métricas desde order_db (read-only)
2. Transforma las métricas en detalles de reporte
3. Persiste el reporte y sus detalles en reporting_db
"""

import json
from datetime import date, timedelta
from uuid import UUID
from typing import Optional

from src.repositories.order_repository import get_order_metrics
from src.repositories.report_repository import (
    save_report,
    find_all_reports,
    find_report_by_id,
)
from src.models.report import Report


def generate_report(
    report_type: str,
    start_date: date,
    end_date: date,
    generated_by: Optional[str] = None,
) -> dict:
    """
    Genera un reporte completo con métricas calculadas desde order_db.

    Proceso:
    1. Validar parámetros de entrada
    2. Consultar métricas de órdenes en el rango de fechas
    3. Transformar métricas en filas de report_details
    4. Guardar reporte y detalles en reporting_db
    5. Retornar el reporte completo como diccionario

    Args:
        report_type: Tipo de reporte ('daily', 'weekly', 'on_demand')
        start_date: Fecha de inicio del rango
        end_date: Fecha de fin del rango
        generated_by: UUID del administrador que solicita el reporte (opcional)

    Returns:
        dict con el reporte generado y todas sus métricas
    """
    # Validar tipo de reporte
    valid_types = ("daily", "weekly", "on_demand")
    if report_type not in valid_types:
        raise ValueError(
            f"report_type inválido: '{report_type}'. Valores permitidos: {valid_types}"
        )

    # Validar rango de fechas
    if start_date > end_date:
        raise ValueError("start_date no puede ser posterior a end_date")

    # Paso 1: Consultar métricas desde order_db (read-only)
    try:
        metrics = get_order_metrics(start_date, end_date)
    except Exception as e:
        # Si falla la conexión a order_db, guardar reporte como 'failed'
        failed_report = Report(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            generated_by=UUID(generated_by) if generated_by else None,
            status="failed",
        )
        save_report(failed_report, [
            {
                "metric": "error",
                "value": 0,
                "description": f"Error al consultar order_db: {str(e)}",
            }
        ])
        raise RuntimeError(f"Error al consultar métricas de órdenes: {str(e)}") from e

    # Paso 2: Transformar métricas en detalles de reporte
    details = _build_report_details(metrics)

    # Paso 3: Crear y guardar el reporte
    report = Report(
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        generated_by=UUID(generated_by) if generated_by else None,
        status="generated",
    )

    saved_report = save_report(report, details)
    return saved_report.to_dict()


def generate_daily_report() -> dict:
    """
    Genera un reporte diario automático para el día anterior.

    Se ejecuta como tarea programada (CloudWatch Events / EventBridge).
    El rango es el día completo de ayer.
    """
    yesterday = date.today() - timedelta(days=1)
    return generate_report(
        report_type="daily",
        start_date=yesterday,
        end_date=yesterday,
        generated_by=None,  # Generado automáticamente, sin usuario
    )


def list_reports(
    limit: int = 50, offset: int = 0, report_type: Optional[str] = None
) -> list[dict]:
    """Lista reportes generados con paginación opcional."""
    return find_all_reports(limit=limit, offset=offset, report_type=report_type)


def get_report(report_id: str) -> Optional[dict]:
    """Obtiene un reporte específico con todos sus detalles."""
    return find_report_by_id(report_id)


def _build_report_details(metrics: dict) -> list[dict]:
    """
    Transforma las métricas crudas de order_db en filas de report_details.

    Cada métrica se convierte en una fila con: metric, value, description.
    Las métricas complejas (listas, dicts) se serializan como JSON en description.
    """
    details = []

    # Métrica: Total de órdenes
    details.append({
        "metric": "total_orders",
        "value": metrics.get("total_orders", 0),
        "description": "Número total de órdenes en el período",
    })

    # Métrica: Ingresos totales
    details.append({
        "metric": "total_revenue",
        "value": metrics.get("total_revenue", 0),
        "description": "Ingresos totales generados en el período",
    })

    # Métrica: Órdenes por estado
    orders_by_status = metrics.get("orders_by_status", {})
    for status, count in orders_by_status.items():
        details.append({
            "metric": f"orders_status_{status.lower()}",
            "value": count,
            "description": f"Órdenes con estado {status}",
        })

    # Métrica: Productos más vendidos (top 10)
    top_products = metrics.get("top_selling_products", [])
    if top_products:
        # Guardar el resumen general como una métrica
        details.append({
            "metric": "top_selling_products",
            "value": len(top_products),
            "description": json.dumps(top_products, default=str),
        })

    # Métrica: Usuarios más activos (top 10)
    active_users = metrics.get("most_active_users", [])
    if active_users:
        details.append({
            "metric": "most_active_users",
            "value": len(active_users),
            "description": json.dumps(active_users, default=str),
        })

    return details
