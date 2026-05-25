# Auth Service

Microservicio de autenticación — Java 21 + Spring Boot 3.4.4

## Responsabilidades
- Registro de usuarios
- Login con JWT
- Refresh token
- Logout / revocación
- Consulta de usuario autenticado

## Tecnologías
- Java 21 LTS
- Spring Boot 3.4.4
- Spring Security
- JJWT 0.12.6
- PostgreSQL 16
- Maven

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | /auth/register | No | Registro |
| POST | /auth/login | No | Login |
| POST | /auth/refresh | No | Renovar token |
| POST | /auth/logout | Sí | Cerrar sesión |
| GET | /auth/me | Sí | Info del usuario |

## Ejecución local

```bash
mvn spring-boot:run
```

## Base de datos
- Puerto: 5433
- DB: auth_db
- Tablas: users, refresh_tokens
