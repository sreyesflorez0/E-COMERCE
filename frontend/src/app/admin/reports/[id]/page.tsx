import { ReportDetail } from '@/components/admin/reports/ReportDetail';

export default async function AdminReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReportDetail id={id} />;
}
