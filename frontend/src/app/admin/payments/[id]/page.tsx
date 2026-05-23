import { PaymentDetail } from '@/components/admin/payments/PaymentDetail';

export default async function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaymentDetail id={id} />;
}
