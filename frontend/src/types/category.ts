export interface CategoryRaw {
  id?: string | number;
  category_id?: string | number;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export function normalizeCategory(raw: CategoryRaw): Category {
  const id = raw.id ?? raw.category_id ?? '';
  return {
    id: String(id),
    name: raw.name || 'Sin nombre',
    description: raw.description,
  };
}
