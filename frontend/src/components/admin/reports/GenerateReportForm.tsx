'use client';

import { useForm } from 'react-query'; // No, wait, I'll use react-hook-form
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { GenerateReportRequest } from '@/types/report';

const schema = z.object({
  report_type: z.enum(['daily', 'weekly', 'on_demand']),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
}).refine(data => data.start_date <= data.end_date, {
  message: "La fecha inicial no puede ser posterior a la fecha final",
  path: ["end_date"]
});

interface Props {
  onGenerate: (data: GenerateReportRequest) => void;
  isGenerating: boolean;
}

export function GenerateReportForm({ onGenerate, isGenerating }: Props) {
  const { register, handleSubmit, formState: { errors } } = useHookForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      report_type: 'on_demand',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generar Reporte Manual</CardTitle>
        <CardDescription>Genera un reporte de ventas bajo demanda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report_type">Tipo de Reporte</Label>
            <select
              {...register('report_type')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="on_demand">A Demanda (On Demand)</option>
              <option value="daily">Diario (Daily)</option>
              <option value="weekly">Semanal (Weekly)</option>
            </select>
            {errors.report_type && <p className="text-red-500 text-xs">{errors.report_type.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha Inicio</Label>
              <Input type="date" {...register('start_date')} />
              {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input type="date" {...register('end_date')} />
              {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date.message}</p>}
            </div>
          </div>

          <Button type="submit" disabled={isGenerating} className="w-full">
            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</> : 'Generar Reporte'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
