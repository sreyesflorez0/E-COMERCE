# User Service

Microservicio de perfiles y direcciones — Java 21 + Spring Boot 3.4.4

## Responsabilidades
- Gestión de perfil de usuario
- CRUD de direcciones
- Auto-creación de perfil en primer acceso

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | /users/me | Ver perfil (auto-crea si no existe) |
| PUT | /users/me | Actualizar perfil |
| GET | /users/addresses | Listar direcciones |
| POST | /users/addresses | Agregar dirección |
| PUT | /users/addresses/{id} | Actualizar dirección |
| DELETE | /users/addresses/{id} | Eliminar dirección |

Todos los endpoints requieren autenticación JWT.

## Base de datos
- Puerto: 5434
- DB: user_db
- Tablas: user_profiles, addresses
