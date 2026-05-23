export interface ProductRaw {
  id?: string | number;
  product_id?: string | number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category_id?: string | number;
  categoryId?: string | number;
  active?: boolean;
  image_url?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  active: boolean;
  imageUrl?: string;
}

export function normalizeProduct(raw: ProductRaw): Product {
  const id = raw.id ?? raw.product_id ?? '';
  const price = parseFloat(String(raw.price || 0)) || 0;
  const categoryId = raw.categoryId ?? raw.category_id ?? '';
  
  // Si active no viene, asumimos true por defecto en un ecommerce a menos que se diga lo contrario, 
  // pero para seguridad asumamos true si el stock es > 0, o true de base.
  const active = raw.active !== undefined ? raw.active : true;

  return {
    id: String(id),
    name: raw.name || 'Sin nombre',
    description: raw.description || '',
    price,
    stock: Number(raw.stock) || 0,
    categoryId: String(categoryId),
    active,
    imageUrl: raw.imageUrl || raw.image_url,
  };
}
