# E-Commerce Frontend - Fase 1

Este proyecto es la base frontend para el sistema E-Commerce. Está construido utilizando Next.js 15 (App Router), TypeScript, TailwindCSS y Zustand.

## Requisitos

- Node.js 18+ (Recomendado 20+)
- NPM o Yarn

## Instalación

1. Asegúrate de estar en la carpeta `frontend/`.
2. Instala las dependencias:

```bash
npm install
```

## Configuración de Entorno

Asegúrate de que el archivo `.env.local` exista en la raíz del proyecto `frontend/` y tenga la siguiente configuración para apuntar al API Gateway:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Desarrollo Local

Para correr el frontend localmente:

```bash
npm run dev
```

El proyecto se levantará en [http://localhost:3000](http://localhost:3000).

## Conexión al Backend

1. Asegúrate de que el **API Gateway** y los demás microservicios estén corriendo mediante `docker-compose up` en la raíz principal del proyecto.
2. El frontend se comunica **exclusivamente** con el API Gateway en el puerto `8080`.
3. Ningún request va directamente a microservicios individuales (8081, 8082, etc.).

## Pruebas de Autenticación (Login / Register)

1. Navega a `http://localhost:3000/register` para crear una cuenta (esto llamará a `POST /api/auth/register`).
2. Luego, ve a `http://localhost:3000/login` e ingresa con las credenciales.
3. Al loguearte, el sistema guarda el token en memoria persistente (Zustand) e inyecta el `Authorization: Bearer <token>` en cada request.
4. Serás redirigido al `/dashboard`, que es una **ruta protegida**.

## Route Guard

El sistema cuenta con un `RouteGuard` integrado en el `MainLayout` que:
- Detecta si estás autenticado.
- Si intentas entrar a `/dashboard` sin sesión, te redirige a `/login`.
- Si intentas entrar a `/login` o `/register` con sesión activa, te redirige a `/dashboard`.

## Comandos Útiles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run start`: Inicia el servidor de producción.
- `npm run lint`: Ejecuta ESLint para revisar el código.
