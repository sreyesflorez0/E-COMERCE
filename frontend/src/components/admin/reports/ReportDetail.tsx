'use client';

import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ReportDetail({ id }: { id: string }) {
  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['admin-report', id],
    queryFn: () => reportService.getReportById(id)
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (isError || !report) return <div className="text-center text-red-500 py-8">Reporte no encontrado o error de carga.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" /> Detalle de Reporte
          </h1>
          <p className="text-muted-foreground font-mono text-sm">{report.id}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Información General</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Tipo de Reporte:</span>
            <span className="font-semibold uppercase">{report.report_type}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Estado:</span>
            <span className={`font-semibold ${report.status === 'generated' ? 'text-green-600' : report.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
              {report.status}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Fecha Inicio:</span>
            <span>{report.start_date}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Fecha Fin:</span>
            <span>{report.end_date}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Generado por:</span>
            <span className="font-mono text-xs">{report.generated_by || 'Sistema Automático'}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Fecha de Creación:</span>
            <span>{new Date(report.created_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Métricas del Reporte</h2>
      
      {(!report.report_details || report.report_details.length === 0) ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">No hay métricas disponibles</div>
      ) : (
        <div className="grid gap-4">
          {report.report_details.map((detail, index) => {
            let isJson = false;
            let formattedJson = detail.description;
            try {
              if (detail.description.startsWith('[') || detail.description.startsWith('{')) {
                const parsed = JSON.parse(detail.description);
                formattedJson = JSON.stringify(parsed, null, 2);
                isJson = true;
              }
            } catch (e) {
              // Ignore and display as regular string
            }

            return (
              <Card key={index}>
                <CardHeader className="py-3 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md font-mono text-primary">{detail.metric}</CardTitle>
                    <span className="font-bold text-lg bg-primary/10 text-primary px-3 py-1 rounded-md">
                      {detail.value}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {isJson ? (
                    <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-60">
                      {formattedJson}
                    </pre>
                  ) : (
                    <p className="text-sm text-foreground">{detail.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
