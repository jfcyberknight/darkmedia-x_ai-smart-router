# 📊 Monitoring et Observabilité

**Version**: 2.0 | **Stack**: Prometheus, Grafana, ELK, Datadog

---

## 🎯 [OVERVIEW] Les 3 Piliers de l'Observabilité

### Logs
Enregistrements détaillés des événements applicatifs.

```python
# ✅ BON - Log structuré
logger.info("User login", extra={
    "user_id": 123,
    "ip_address": "192.168.1.1",
    "timestamp": datetime.utcnow().isoformat(),
    "duration_ms": 45
})

# ❌ MAUVAIS - Log non structuré
logger.info(f"User 123 logged in from 192.168.1.1 at {time.time()}")
```

### Metrics
Valeurs numériques mesurées au fil du temps.

```python
from prometheus_client import Counter, Histogram, Gauge

# Compteur
requests_total = Counter('http_requests_total', 'Total requests', ['method', 'endpoint'])
requests_total.labels(method='GET', endpoint='/api/users').inc()

# Histogramme (distributions)
request_duration = Histogram('http_request_duration_seconds', 'Request duration')
with request_duration.time():
    handle_request()

# Jauge (valeur instantanée)
active_connections = Gauge('active_connections', 'Active connections')
active_connections.set(42)
```

### Traces
Suivi détaillé du chemin d'une requête à travers le système.

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("get_user") as span:
    span.set_attribute("user.id", 123)
    
    with tracer.start_as_current_span("fetch_from_db") as child_span:
        user = db.users.find(123)
        child_span.set_attribute("db.rows", 1)
    
    return user
```

---

## 📝 [LOGGING] Logging Structuré

### Format Structuré JSON

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Formatter pour logs JSON."""
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Ajouter les extras
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'duration_ms'):
            log_data['duration_ms'] = record.duration_ms
        
        # Exception si présente
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Configuration
logger = logging.getLogger("app")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Logging Levels

```python
# ERROR — Erreurs critiques (action requise immédiate)
logger.error("Database connection failed", extra={"retry_count": 3})

# WARNING — Avertissements (attention requise)
logger.warning("Memory usage above 80%", extra={"memory_percent": 85})

# INFO — Événements importants (normal flow)
logger.info("User login successful", extra={"user_id": 123})

# DEBUG — Détails techniques (développement)
logger.debug("Query executed", extra={"query": "SELECT...", "duration_ms": 45})
```

### Correlation IDs

```python
from contextvars import ContextVar
import uuid

# Context var pour tracking
request_id_var: ContextVar[str] = ContextVar('request_id', default='')

def log_with_context(logger, message: str, level: str = "info"):
    """Log avec request ID automatique."""
    request_id = request_id_var.get()
    getattr(logger, level)(message, extra={"request_id": request_id})

# Middleware (Express/FastAPI)
@app.middleware
async def add_request_id(request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request_id_var.set(request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response
```

---

## 📈 [METRICS] Prometheus et Métriques

### Types de Métriques

```python
from prometheus_client import Counter, Histogram, Gauge, Summary

# 1. Counter — Augmente seulement
http_requests = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)
http_requests.labels(method='GET', endpoint='/api/users', status='200').inc()

# 2. Gauge — Peut augmenter ou diminuer
memory_usage = Gauge(
    'memory_usage_bytes',
    'Memory usage in bytes'
)
memory_usage.set(1073741824)  # 1GB

# 3. Histogram — Distribution de valeurs
request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    buckets=(0.1, 0.5, 1, 2, 5)  # Buckets personnalisés
)
with request_duration.time():
    handle_request()

# 4. Summary — Quantiles
response_size = Summary(
    'http_response_size_bytes',
    'HTTP response size'
)
response_size.observe(1024)
```

### Prometheus Scraping

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'api'
    static_configs:
      - targets: ['localhost:8000/metrics']
    scrape_interval: 10s
    scrape_timeout: 5s

  - job_name: 'database'
    static_configs:
      - targets: ['localhost:5432']
    metrics_path: '/metrics'

  - job_name: 'kubernetes'
    kubernetes_sd_configs:
      - role: pod
```

### Custom Metrics

```python
from prometheus_client import start_http_server
from fastapi import FastAPI
import time

app = FastAPI()

# Définir les métriques custom
api_calls = Counter('api_calls_total', 'Total API calls', ['endpoint'])
api_latency = Histogram('api_latency_seconds', 'API latency', ['endpoint'])
active_users = Gauge('active_users', 'Active users count')

@app.get("/api/users")
async def get_users():
    start = time.time()
    api_calls.labels(endpoint='/api/users').inc()
    
    # Logic...
    
    duration = time.time() - start
    api_latency.labels(endpoint='/api/users').observe(duration)
    
    return {"users": [...]}

# Exporter les métriques
@app.get("/metrics")
async def metrics():
    from prometheus_client import generate_latest
    return generate_latest()

# Ou avec server séparé
if __name__ == "__main__":
    start_http_server(8001)  # Port 8001 pour /metrics
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 📊 [GRAFANA] Dashboards et Alertes

### Dashboard JSON

```json
{
  "dashboard": {
    "title": "API Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "Errors"
          }
        ],
        "type": "stat",
        "thresholds": [
          {
            "value": 0.05,
            "color": "red"
          }
        ]
      },
      {
        "title": "Response Time P95",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)",
            "legendFormat": "P95"
          }
        ],
        "type": "gauge"
      }
    ]
  }
}
```

### Alertes Grafana

```yaml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
        labels:
          severity: critical

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s"
        labels:
          severity: warning

      - alert: HighMemoryUsage
        expr: memory_usage_bytes / 1073741824 > 0.8
        for: 5m
        annotations:
          summary: "Memory usage above 80%"
          description: "Memory: {{ $value | humanize }}GB"
        labels:
          severity: warning
```

---

## 🔍 [TRACING] Distributed Tracing

### OpenTelemetry Setup

```python
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

# Exporter vers Jaeger
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

# Setup tracer
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

# Auto-instrumentation
FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument(engine=db_engine)

tracer = trace.get_tracer(__name__)
```

### Tracing Manual

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id: int):
    """Tracer une opération complexe."""
    
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        span.set_attribute("order.status", "processing")
        
        # Validate
        with tracer.start_as_current_span("validate_order") as child:
            is_valid = validate(order_id)
            child.set_attribute("validation.result", is_valid)
        
        # Payment
        with tracer.start_as_current_span("process_payment") as child:
            payment_id = process_payment(order_id)
            child.set_attribute("payment.id", payment_id)
        
        # Shipping
        with tracer.start_as_current_span("arrange_shipping") as child:
            shipping_id = arrange_shipping(order_id)
            child.set_attribute("shipping.id", shipping_id)
        
        span.set_attribute("order.status", "completed")
        return shipping_id
```

---

## 🚨 [ALERTING] Notification et Escalade

### Alert Manager Configuration

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
      group_wait: 0s
      repeat_interval: 5m
    
    - match:
        severity: warning
      receiver: 'warnings'
      group_wait: 30s

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'critical'
    slack_configs:
      - channel: '#critical-alerts'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
  
  - name: 'warnings'
    slack_configs:
      - channel: '#warnings'
```

### Custom Alert Handler

```python
from enum import Enum

class AlertSeverity(Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class AlertManager:
    """Gère les alertes et escalades."""
    
    def __init__(self):
        self.alerts = {}
    
    def send_alert(self, 
                   name: str, 
                   message: str, 
                   severity: AlertSeverity,
                   context: dict = None):
        """Envoie une alerte."""
        
        alert = {
            "name": name,
            "message": message,
            "severity": severity.value,
            "context": context or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Route basée sur severity
        if severity == AlertSeverity.CRITICAL:
            self._send_pagerduty(alert)
            self._send_slack(alert, channel="#critical-alerts")
            self._send_email(alert, recipients=["oncall@company.com"])
        
        elif severity == AlertSeverity.WARNING:
            self._send_slack(alert, channel="#warnings")
        
        else:
            self._send_slack(alert, channel="#info")
        
        # Store pour historique
        self.alerts[name] = alert
    
    def _send_slack(self, alert: dict, channel: str):
        # Slack implementation
        pass
    
    def _send_pagerduty(self, alert: dict):
        # PagerDuty implementation
        pass
    
    def _send_email(self, alert: dict, recipients: list):
        # Email implementation
        pass

# Utilisation
alert_manager = AlertManager()

try:
    critical_operation()
except Exception as e:
    alert_manager.send_alert(
        name="critical_operation_failed",
        message=f"Operation failed: {str(e)}",
        severity=AlertSeverity.CRITICAL,
        context={"error": str(e), "operation": "critical_operation"}
    )
```

---

## 📊 [SLO] Service Level Objectives

### Définir les SLOs

```yaml
# SLOs pour API
slos:
  - name: "API Availability"
    target: 99.9  # 99.9% uptime
    window: monthly
    metric: "rate(http_requests_total[5m])"
    threshold: "> 0.999"
  
  - name: "API Latency"
    target: 95  # 95% des requêtes < 500ms
    window: monthly
    metric: "histogram_quantile(0.95, http_request_duration_seconds)"
    threshold: "< 0.5"  # 500ms
  
  - name: "Error Rate"
    target: 99.9  # 99.9% des requêtes réussissent
    window: monthly
    metric: "rate(http_requests_total{status!~\"5..\"}[5m])"
    threshold: "> 0.999"
```

### Error Budget

```python
class ErrorBudget:
    """Gère le budget d'erreurs pour les déploiements."""
    
    def __init__(self, slo_target: float = 0.999, window_hours: int = 720):
        self.slo_target = slo_target      # 99.9%
        self.window_hours = window_hours  # 30 jours
        self.error_budget = 1 - slo_target  # 0.001 = 0.1%
    
    def available_downtime_minutes(self) -> float:
        """Downtime autorisé en minutes."""
        total_minutes = self.window_hours * 60
        return total_minutes * self.error_budget
    
    def can_deploy(self, current_error_rate: float) -> bool:
        """Vérifier si on peut déployer."""
        remaining_budget = self.error_budget - current_error_rate
        return remaining_budget > 0
    
    def get_status(self) -> dict:
        """Status du budget."""
        return {
            "slo_target": f"{self.slo_target * 100}%",
            "error_budget": f"{self.error_budget * 100}%",
            "available_downtime_minutes": self.available_downtime_minutes()
        }

# Utilisation
budget = ErrorBudget(slo_target=0.999, window_hours=720)
print(budget.get_status())
# {'slo_target': '99.9%', 'error_budget': '0.1%', 'available_downtime_minutes': 43.2}
```

---

## ✅ Checklist Observabilité

- [ ] Logging structuré JSON ✅
- [ ] Correlation IDs en place ✅
- [ ] Prometheus metrics configurées ✅
- [ ] Grafana dashboards créés ✅
- [ ] Alertes définies (criticité) ✅
- [ ] Distributed tracing (Jaeger) ✅
- [ ] SLOs documentés ✅
- [ ] Error budgets calculés ✅
- [ ] Monitoring alerts actives ✅
- [ ] Escalade procedures documentées ✅

---

**📌 Note**: Observabilité = visibilité = confiabilité = SLO atteints.