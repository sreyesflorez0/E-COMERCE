-- ==============================================================
-- Serverless Reporting Service — Database Schema
-- Base de datos: reporting_db (PostgreSQL)
-- Alineado con la documentación original del proyecto e-commerce
-- ==============================================================

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla principal de reportes generados
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'on_demand')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT now(),
    generated_by UUID,
    status VARCHAR(10) NOT NULL CHECK (status IN ('generated', 'failed'))
);

-- Tabla de métricas/detalles asociados a cada reporte
CREATE TABLE IF NOT EXISTS report_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    metric VARCHAR(50) NOT NULL,
    value NUMERIC(12,2) NOT NULL DEFAULT 0,
    description TEXT
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_report_details_report_id ON report_details(report_id);
