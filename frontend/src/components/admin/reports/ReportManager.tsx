'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/report.service';
import { GenerateReportForm } from './GenerateReportForm';
import { ReportList } from './ReportList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, RefreshCw, CalendarSync } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { GenerateReportRequest } from '@/types/report';

export function ReportManager() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-reports', filterType],
    queryFn: () => reportService.getReports(50, 0, filterType || undefined)
  });

  const generateMutation = useMutation({
    mutationFn: (req: GenerateReportRequest) => reportService.generateReport(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Reporte generado exitosamente');
    },
    onError: (error) => {
      const msg = isAxiosError(error) ? error.response?.data?.message : 'Error inesperado';
      toast.error(msg || 'Error al generar reporte');
    }
  });

  const dailyMutation = useMutation({
    mutationFn: () => reportService.generateDailyReport(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Reporte diario generado exitosamente');
    },
    onError: (error) => {
      const msg = isAxiosError(error) ? error.response?.data?.message : 'Error inesperado';
      toast.error(msg || 'Error al generar reporte diario');
    }
  });

  const handleGenerate = (req: GenerateReportRequest) => {
    generateMutation.mutate(req);
  };

  const handleGenerateDaily = () => {
    if (window.confirm('¿Seguro que deseas forzar la generación del reporte diario automático?')) {
      dailyMutation.mutate();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Reportes</h1>
          <p className="text-muted-foreground">Genera y visualiza reportes de métricas y ventas</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <select 
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="daily">Diario (Daily)</option>
                <option value="weekly">Semanal (Weekly)</option>
                <option value="on_demand">A demanda (On Demand)</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refrescar
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={handleGenerateDaily} disabled={dailyMutation.isPending}>
              {dailyMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CalendarSync className="h-4 w-4 mr-2" />}
              Forzar Diario
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : isError ? (
            <div className="text-center text-red-500 py-8 border rounded-md">Error al cargar la lista de reportes</div>
          ) : (
            <ReportList reports={data?.reports || []} />
          )}
        </div>

        <div>
          <GenerateReportForm onGenerate={handleGenerate} isGenerating={generateMutation.isPending} />
        </div>
      </div>
    </div>
  );
}
