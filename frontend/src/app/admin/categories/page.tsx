'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category } from '@/types/category';
import { categoryService } from '@/services/category.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, values);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await categoryService.createCategory(values);
        toast.success('Categoría creada exitosamente');
      }
      setIsFormOpen(false);
      setEditingId(null);
      form.reset();
      loadCategories();
    } catch (error) {
      toast.error('Error al guardar la categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    form.reset({ name: category.name, description: category.description || '' });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Categoría eliminada exitosamente');
      loadCategories();
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };

  const cancelEdit = () => {
    setIsFormOpen(false);
    setEditingId(null);
    form.reset();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Categorías</h1>
          <p className="text-muted-foreground">Administra las categorías de productos</p>
        </div>
        {!isFormOpen && (
          <Button className="ml-auto gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4" /> Nueva Categoría
          </Button>
        )}
      </div>

      {isFormOpen && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</CardTitle>
            <CardDescription>
              {editingId ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría para tus productos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input {...form.register('name')} placeholder="Ej. Electrónica" />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Input {...form.register('description')} placeholder="Breve descripción..." />
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No hay categorías registradas.</p>
            <Button variant="outline" onClick={() => setIsFormOpen(true)}>
              Crear tu primera categoría
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="truncate">{category.description || 'Sin descripción'}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
