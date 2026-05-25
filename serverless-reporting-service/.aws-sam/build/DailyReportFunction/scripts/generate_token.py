"""
Script para generar un token JWT de prueba con rol ADMIN.

Genera un token compatible con el Auth Service del proyecto
para probar los endpoints protegidos del Reporting Service.

Uso:
  cd serverless-reporting-service
  python scripts/generate_token.py

Luego copia el token y úsalo en Insomnia como:
  Authorization: Bearer <TOKEN>
"""

import os
import sys
import time
from uuid import uuid4

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv(
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
)

import jwt


def generate_admin_token():
    """Genera un token JWT de prueba con rol ADMIN (válido por 24 horas)."""
    secret = os.environ.get(
        "JWT_SECRET",
        "ecommerce-super-secret-jwt-key-change-this-in-production-must-be-256-bits",
    )
    algorithm = os.environ.get("JWT_ALGORITHM", "HS512")

    admin_id = str(uuid4())
    now = int(time.time())

    payload = {
        "sub": admin_id,
        "email": "admin@ecommerce.com",
        "role": "ADMIN",
        "iat": now,
        "exp": now + 86400,  # 24 horas
    }

    token = jwt.encode(payload, secret, algorithm=algorithm)

    print("=" * 70)
    print("  🔑 TOKEN JWT DE PRUEBA — ROL ADMIN")
    print("=" * 70)
    print()
    print(f"  User ID:   {admin_id}")
    print(f"  Email:     admin@ecommerce.com")
    print(f"  Rol:       ADMIN")
    print(f"  Algoritmo: {algorithm}")
    print(f"  Expira en: 24 horas")
    print()
    print("  Token:")
    print(f"  {token}")
    print()
    print("  Para usar en Insomnia o curl:")
    print(f"  Authorization: Bearer {token}")
    print()
    print("=" * 70)

    return token


if __name__ == "__main__":
    generate_admin_token()
