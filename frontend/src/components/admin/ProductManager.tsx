'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(2, 'Descripción requerida'),
  price: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
  categoryId: z.string().min(1, 'Categoría requerida'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductManagerProps {
  role: 'ADMIN' | 'VENDOR';
  backUrl: string;
}

export function ProductManager({ role, backUrl }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<z.input<typeof productSchema>, any, z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', description: '', price: 0, stock: 0, categoryId: '' },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (editingId) {
        await productService.updateProduct(editingId, values);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productService.createProduct(values);
        toast.success('Producto creado exitosamente');
      }
      setIsFormOpen(false);
      setEditingId(null);
      form.reset();
      loadData();
    } catch (error) {
      toast.error('Error al guardar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Producto eliminado exitosamente');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const cancelEdit = () => {
    setIsFormOpen(false);
    setEditingId(null);
    form.reset();
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href={backUrl}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">Administra tu catálogo de productos</p>
        </div>
        {!isFormOpen && (
          <Button className="ml-auto gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo Producto
          </Button>
        )}
      </div>

      {role === 'VENDOR' && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 rounded-md flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>
            Estás viendo todos los productos. Si ves productos de otros vendedores, esto se debe a que la restricción
            de visualización por vendedor debe ser aplicada en el Backend. Como frontend, mostramos lo que la API
            devuelve.
          </p>
        </div>
      )}

      {isFormOpen && (
        <Card className="mb-8 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
            <CardDescription>
              {editingId ? 'Modifica los datos del producto' : 'Añade un nuevo producto a la tienda'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input {...form.register('name')} placeholder="Ej. Smartphone XYZ" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    {...form.register('categoryId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Precio ($)</label>
                  <Input type="number" step="0.01" {...form.register('price')} placeholder="0.00" />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock</label>
                  <Input type="number" {...form.register('stock')} placeholder="0" />
                  {form.formState.errors.stock && (
                    <p className="text-sm text-destructive">{form.formState.errors.stock.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input {...form.register('description')} placeholder="Descripción detallada del producto..." />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!isFormOpen && (
        <div className="mb-6 max-w-sm">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron productos con esa búsqueda.' : 'No hay productos registrados.'}
            </p>
            {!searchTerm && !isFormOpen && (
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                Crear el primer producto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const cat = categories.find((c) => c.id === product.categoryId);
            return (
              <Card key={product.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1" title={product.name}>
                      {product.name}
                    </CardTitle>
                    <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                  </div>
                  <CardDescription className="text-xs">
                    Categoría: {cat ? cat.name : 'Desconocida'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2" title={product.description}>
                    {product.description}
                  </p>
                  <div className="mt-2 text-sm font-medium">
                    Stock: <span className={product.stock > 0 ? 'text-green-600' : 'text-destructive'}>{product.stock}</span>
                  </div>
                </CardContent>
                <CardContent className="pt-0 flex justify-end gap-2 border-t mt-4 pt-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
