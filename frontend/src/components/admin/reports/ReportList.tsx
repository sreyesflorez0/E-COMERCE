'use client';

import { AdminReport } from '@/types/report';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';

interface Props {
  reports: AdminReport[];
}

export function ReportList({ reports }: Props) {
  if (reports.length === 0) {
    return <div className="text-center text-muted-foreground py-12 border rounded-md">No se encontraron reportes</div>;
  }

  return (
    <div className="w-full overflow-auto rounded-md border">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground border-b">
          <tr>
            <th className="px-4 py-3 font-medium">Report ID</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Período</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Creado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]" title={report.id}>
                {report.id}
              </td>
              <td className="px-4 py-3 font-semibold uppercase text-xs">
                {report.report_type}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs">
                {report.start_date} <br/> {report.end_date}
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  report.status === 'generated' ? 'bg-green-100 text-green-800' :
                  report.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(report.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/reports/${report.id}`}>
                  <Button variant="outline" size="sm" className="h-8">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
