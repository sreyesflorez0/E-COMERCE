import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, ShoppingBag, BarChart3, Tags } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Panel Administrador</h1>
        <p className="text-muted-foreground mt-2">
          Gestión centralizada de la plataforma
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usuarios
            </CardTitle>
            <CardDescription>
              Gestión de cuentas y roles
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Administra clientes, vendedores y administradores.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/users" className="w-full">
              <Button className="w-full">Gestionar Usuarios</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Productos
            </CardTitle>
            <CardDescription>
              Catálogo general
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Supervisión y moderación de productos publicados.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/products" className="w-full">
              <Button className="w-full">Gestionar Productos</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-primary" />
              Categorías
            </CardTitle>
            <CardDescription>
              Clasificación de productos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Administra las categorías disponibles para el catálogo.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/categories" className="w-full">
              <Button className="w-full">Gestionar Categorías</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Órdenes
            </CardTitle>
            <CardDescription>
              Historial de compras
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Revisión de todas las transacciones de la plataforma.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/orders" className="w-full">
              <Button className="w-full">Gestionar Órdenes</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Pagos
            </CardTitle>
            <CardDescription>
              Historial de pagos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Revisión de transacciones y conciliaciones.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/payments" className="w-full">
              <Button className="w-full">Gestionar Pagos</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-primary/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Reportes
            </CardTitle>
            <CardDescription>
              Métricas y analíticas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Estadísticas globales de ventas y usuarios.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/reports" className="w-full">
              <Button className="w-full" variant="default">Gestionar Reportes</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
