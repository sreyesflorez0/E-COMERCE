"""
Repositorio para operaciones CRUD en la base de datos del Reporting Service.

Opera sobre las tablas 'reports' y 'report_details' en reporting_db.
Este es el único módulo que ESCRIBE en una base de datos.
"""

from datetime import date
from uuid import UUID
from typing import Optional
from src.db.connection import get_reporting_db_connection
from src.models.report import Report, ReportDetail


def save_report(report: Report, details: list[dict]) -> Report:
    """
    Persiste un reporte y sus métricas/detalles en reporting_db.

    Args:
        report: Datos del reporte a guardar.
        details: Lista de dicts con metric, value, description.

    Returns:
        Report con id y generated_at asignados por la base de datos.
    """
    conn = get_reporting_db_connection()
    try:
        with conn.cursor() as cur:
            # Insertar reporte principal
            cur.execute(
                """
                INSERT INTO reports (report_type, start_date, end_date, generated_by, status)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, generated_at
                """,
                (
                    report.report_type,
                    report.start_date,
                    report.end_date,
                    str(report.generated_by) if report.generated_by else None,
                    report.status,
                ),
            )
            row = cur.fetchone()
            report.id = row["id"]
            report.generated_at = row["generated_at"]

            # Insertar cada detalle/métrica
            report.details = []
            for detail in details:
                cur.execute(
                    """
                    INSERT INTO report_details (report_id, metric, value, description)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        str(report.id),
                        detail["metric"],
                        detail["value"],
                        detail.get("description", ""),
                    ),
                )
                detail_row = cur.fetchone()
                report.details.append(
                    ReportDetail(
                        id=detail_row["id"],
                        report_id=report.id,
                        metric=detail["metric"],
                        value=detail["value"],
                        description=detail.get("description", ""),
                    )
                )

            conn.commit()
        return report

    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def find_all_reports(
    limit: int = 50, offset: int = 0, report_type: Optional[str] = None
) -> list[dict]:
    """
    Lista reportes generados con paginación y filtro opcional por tipo.

    Returns:
        Lista de reportes (sin detalles) ordenados por fecha de generación descendente.
    """
    conn = get_reporting_db_connection()
    try:
        with conn.cursor() as cur:
            if report_type:
                cur.execute(
                    """
                    SELECT id, report_type, start_date, end_date,
                           generated_at, generated_by, status
                    FROM reports
                    WHERE report_type = %s
                    ORDER BY generated_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (report_type, limit, offset),
                )
            else:
                cur.execute(
                    """
                    SELECT id, report_type, start_date, end_date,
                           generated_at, generated_by, status
                    FROM reports
                    ORDER BY generated_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    (limit, offset),
                )
            rows = cur.fetchall()

            return [
                {
                    "id": str(r["id"]),
                    "report_type": r["report_type"],
                    "start_date": r["start_date"].isoformat(),
                    "end_date": r["end_date"].isoformat(),
                    "generated_at": r["generated_at"].isoformat(),
                    "generated_by": str(r["generated_by"]) if r["generated_by"] else None,
                    "status": r["status"],
                }
                for r in rows
            ]
    finally:
        conn.close()


def find_report_by_id(report_id: str) -> Optional[dict]:
    """
    Busca un reporte por ID e incluye todos sus detalles/métricas.

    Returns:
        dict con el reporte y sus detalles, o None si no existe.
    """
    conn = get_reporting_db_connection()
    try:
        with conn.cursor() as cur:
            # Buscar reporte
            cur.execute(
                """
                SELECT id, report_type, start_date, end_date,
                       generated_at, generated_by, status
                FROM reports
                WHERE id = %s
                """,
                (report_id,),
            )
            report_row = cur.fetchone()

            if not report_row:
                return None

            # Buscar detalles asociados
            cur.execute(
                """
                SELECT id, report_id, metric, value, description
                FROM report_details
                WHERE report_id = %s
                ORDER BY metric
                """,
                (report_id,),
            )
            detail_rows = cur.fetchall()

            return {
                "id": str(report_row["id"]),
                "report_type": report_row["report_type"],
                "start_date": report_row["start_date"].isoformat(),
                "end_date": report_row["end_date"].isoformat(),
                "generated_at": report_row["generated_at"].isoformat(),
                "generated_by": str(report_row["generated_by"]) if report_row["generated_by"] else None,
                "status": report_row["status"],
                "details": [
                    {
                        "id": str(d["id"]),
                        "report_id": str(d["report_id"]),
                        "metric": d["metric"],
                        "value": float(d["value"]),
                        "description": d["description"],
                    }
                    for d in detail_rows
                ],
            }
    finally:
        conn.close()
