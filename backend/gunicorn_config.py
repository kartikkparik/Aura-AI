import os

# Gunicorn configuration for Aura AI single-instance production deployment
# Designed for standard low-cost / free-tier cloud containers (1 vCPU, 512MB - 1GB RAM)
bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"
workers = int(os.environ.get("WEB_CONCURRENCY", 2))
threads = int(os.environ.get("GUNICORN_THREADS", 4))
worker_class = "gthread"
timeout = 60
keepalive = 5
max_requests = 1000
max_requests_jitter = 100
accesslog = "-"
errorlog = "-"
loglevel = "info"
