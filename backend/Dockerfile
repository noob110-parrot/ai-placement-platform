# Stage 1: builder
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt && python -m spacy download en_core_web_sm

# Stage 2: production
FROM python:3.11-slim AS production
RUN groupadd -r placement && useradd -r -g placement placement
WORKDIR /app
RUN apt-get update && apt-get install -y libpq-dev curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /root/.local /home/placement/.local
ENV PATH=/home/placement/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY --chown=placement:placement . .
USER placement
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--log-level", "info"]
