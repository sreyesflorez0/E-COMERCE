"""
Modelos de datos del Serverless Reporting Service.

Define las estructuras de datos para reportes y sus detalles/métricas,
alineados con las tablas reports y report_details de la documentación.
"""

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional
from uuid import UUID


@dataclass
class ReportDetail:
    """Representa una métrica individual dentro de un reporte."""
    id: Optional[UUID] = None
    report_id: Optional[UUID] = None
    metric: str = ""
    value: float = 0.0
    description: str = ""


@dataclass
class Report:
    """Representa un reporte generado con sus métricas."""
    id: Optional[UUID] = None
    report_type: str = "on_demand"  # 'daily', 'weekly', 'on_demand'
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    generated_at: Optional[datetime] = None
    generated_by: Optional[UUID] = None
    status: str = "generated"  # 'generated', 'failed'
    details: list[ReportDetail] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convierte el reporte a diccionario serializable para la respuesta JSON."""
        return {
            "id": str(self.id) if self.id else None,
            "report_type": self.report_type,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "generated_by": str(self.generated_by) if self.generated_by else None,
            "status": self.status,
            "details": [
                {
                    "id": str(d.id) if d.id else None,
                    "report_id": str(d.report_id) if d.report_id else None,
                    "metric": d.metric,
                    "value": float(d.value),
                    "description": d.description,
                }
                for d in self.details
            ],
        }
