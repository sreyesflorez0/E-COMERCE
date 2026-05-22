FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema útiles
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Usar gunicorn para producción o app.main para desarrollo
CMD ["gunicorn", "--bind", "0.0.0.0:8087", "app.main:app"]
