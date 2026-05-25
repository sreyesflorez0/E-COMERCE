import { ProductManager } from '@/components/admin/ProductManager';

export default function VendorProductsPage() {
  return <ProductManager role="VENDOR" backUrl="/vendor" />;
}
