"""
Repositorio de consultas READ-ONLY a la base de datos del Order Service.

Este módulo consulta las tablas 'orders' y 'order_items' del Order Service
para calcular métricas de reportes. NO realiza escrituras.

Esquema consultado (de order_db):
  - orders: id, user_id, status, total, shipping_address, created_at
  - order_items: id, order_id, product_id, quantity, unit_price, subtotal
"""

from datetime import date
from src.db.connection import get_order_db_connection


def get_order_metrics(start_date: date, end_date: date) -> dict:
    """
    Calcula todas las métricas de órdenes para un rango de fechas.

    Se ejecutan varias consultas SQL sobre order_db en modo read-only.
    Todas las métricas se calculan en una sola conexión.

    Returns:
        dict con: total_orders, total_revenue, orders_by_status,
                  top_selling_products, most_active_users
    """
    conn = get_order_db_connection()
    try:
        with conn.cursor() as cur:
            # 1. Total de órdenes y total de ingresos
            cur.execute(
                """
                SELECT
                    COUNT(*)::int AS total_orders,
                    COALESCE(SUM(total), 0)::float AS total_revenue
                FROM orders
                WHERE created_at::date >= %s AND created_at::date <= %s
                """,
                (start_date, end_date),
            )
            summary = cur.fetchone()
            total_orders = summary["total_orders"]
            total_revenue = summary["total_revenue"]

            # 2. Órdenes agrupadas por estado
            cur.execute(
                """
                SELECT
                    status,
                    COUNT(*)::int AS count
                FROM orders
                WHERE created_at::date >= %s AND created_at::date <= %s
                GROUP BY status
                ORDER BY count DESC
                """,
                (start_date, end_date),
            )
            orders_by_status = {
                row["status"]: row["count"] for row in cur.fetchall()
            }

            # 3. Top 10 productos más vendidos (por cantidad total)
            cur.execute(
                """
                SELECT
                    oi.product_id::text,
                    SUM(oi.quantity)::int AS total_quantity,
                    SUM(oi.subtotal)::float AS total_sales
                FROM order_items oi
                JOIN orders o ON o.id = oi.order_id
                WHERE o.created_at::date >= %s AND o.created_at::date <= %s
                GROUP BY oi.product_id
                ORDER BY total_quantity DESC
                LIMIT 10
                """,
                (start_date, end_date),
            )
            top_selling_products = [
                {
                    "product_id": row["product_id"],
                    "total_quantity": row["total_quantity"],
                    "total_sales": row["total_sales"],
                }
                for row in cur.fetchall()
            ]

            # 4. Top 10 usuarios más activos (por cantidad de órdenes)
            cur.execute(
                """
                SELECT
                    user_id::text,
                    COUNT(*)::int AS order_count,
                    SUM(total)::float AS total_spent
                FROM orders
                WHERE created_at::date >= %s AND created_at::date <= %s
                GROUP BY user_id
                ORDER BY order_count DESC
                LIMIT 10
                """,
                (start_date, end_date),
            )
            most_active_users = [
                {
                    "user_id": row["user_id"],
                    "order_count": row["order_count"],
                    "total_spent": row["total_spent"],
                }
                for row in cur.fetchall()
            ]

        return {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "orders_by_status": orders_by_status,
            "top_selling_products": top_selling_products,
            "most_active_users": most_active_users,
        }

    finally:
        conn.close()
