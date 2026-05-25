"""
Módulo de autenticación JWT para el Serverless Reporting Service.

Valida tokens JWT usando el mismo secreto y algoritmo que el Auth Service
(Java / Spring Boot con JJWT). El Auth Service usa:
  - Keys.hmacShaKeyFor(secret.getBytes(UTF_8)) con JJWT
  - Con clave >= 64 bytes, JJWT selecciona automáticamente HS512
  - Claims: sub (userId), email, role, iat, exp

Este módulo replica esa validación en Python con PyJWT.
"""

import os
import jwt


# Configuración JWT — debe coincidir con el Auth Service
JWT_SECRET = os.environ.get(
    "JWT_SECRET",
    "ecommerce-super-secret-jwt-key-change-this-in-production-must-be-256-bits",
)
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS512")


def validate_admin_token(event: dict) -> dict:
    """
    Extrae y valida el token JWT del header Authorization.
    Verifica que el usuario tenga rol ADMIN.

    Args:
        event: Evento de API Gateway con headers.

    Returns:
        dict con las claims del token si es válido y es ADMIN.

    Raises:
        PermissionError: Si el token es inválido, falta, o el rol no es ADMIN.
    """
    # Extraer header Authorization
    headers = event.get("headers", {}) or {}

    # API Gateway puede enviar headers en minúsculas o mixtas
    auth_header = headers.get("Authorization") or headers.get("authorization", "")

    if not auth_header:
        raise PermissionError("Token de autenticación requerido")

    # Formato esperado: "Bearer <token>"
    parts = auth_header.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise PermissionError("Formato de token inválido. Use: Bearer <token>")

    token = parts[1]

    try:
        # Decodificar y validar el token con el mismo secreto y algoritmo
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise PermissionError("Token expirado")
    except jwt.InvalidTokenError as e:
        raise PermissionError(f"Token inválido: {str(e)}")

    # Verificar rol ADMIN
    role = payload.get("role", "")
    if role != "ADMIN":
        raise PermissionError(
            f"Acceso denegado. Se requiere rol ADMIN, rol actual: {role}"
        )

    return payload
