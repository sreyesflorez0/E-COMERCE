import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, PlusCircle, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function VendorPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Panel Vendedor</h1>
        <p className="text-muted-foreground mt-2">
          Gestión de tu tienda y productos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Mis Productos
            </CardTitle>
            <CardDescription>
              Gestiona tu catálogo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Ver, editar y eliminar los productos que has publicado.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/vendor/products" className="w-full">
              <Button className="w-full">Ir a Productos</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Crear Producto
            </CardTitle>
            <CardDescription>
              Publica nuevos artículos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Añade nuevos productos a tu tienda para que los clientes los descubran.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/vendor/products" className="w-full">
              <Button className="w-full" variant="secondary">Crear Nuevo</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Inventario
            </CardTitle>
            <CardDescription>
              Control de existencias
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Revisa y actualiza el stock de tus productos.
            </p>
          </CardContent>
          <CardFooter>
            <Button disabled className="w-full">
              Disponible en próximas fases
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
