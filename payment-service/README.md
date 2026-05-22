# Payment Service

Microservicio de pagos en Python + FastAPI + PostgreSQL.

## Ejecución Local
1. `python -m venv venv`
2. `source venv/bin/activate`  (O en windows `.\venv\Scripts\activate`)
3. `pip install -r requirements.txt`
4. `cp .env.example .env` (Ajusta la URL de base de datos)
5. `uvicorn app.main:app --reload --port 8086`
