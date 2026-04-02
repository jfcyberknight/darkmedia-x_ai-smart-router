# 🐳 DevOps et Infrastructure

**Version**: 2.0 | **Stack**: Docker, Kubernetes, IaC, Monitoring

---

## 🐳 [DOCKER] Containerization

### Dockerfile Optimisé

```dockerfile
# Multi-stage build pour réduire la taille
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app

# Créer un utilisateur non-root pour sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copier depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Utiliser l'utilisateur non-root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Python Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Créer utilisateur non-root
RUN useradd -m -u 1001 appuser

# Copier requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier l'application
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0"]
```

### .dockerignore

```
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
.env.local
.vscode
.idea
__pycache__
*.pyc
.pytest_cache
.coverage
venv
.DS_Store
```

---

## 🐳 [DOCKER-COMPOSE] Orchestration Locale

### docker-compose.yml Complet

```yaml
version: '3.9'

services:
  # API Application
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: darkmedia-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/darkmedia
      - QDRANT_URL=http://qdrant:6333
      - JWT_SECRET=${JWT_SECRET}
      - API_KEY=${API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      qdrant:
        condition: service_started
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - darkmedia-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: darkmedia-postgres
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=darkmedia
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - darkmedia-network
    restart: unless-stopped

  # Qdrant Vector Database
  qdrant:
    image: qdrant/qdrant:latest
    container_name: darkmedia-qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT_API_KEY=${QDRANT_API_KEY}
    networks:
      - darkmedia-network
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: darkmedia-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - darkmedia-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    restart: unless-stopped

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: darkmedia-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - darkmedia-network
    restart: unless-stopped

  # Monitoring - Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: darkmedia-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana-provisioning:/etc/grafana/provisioning
    depends_on:
      - prometheus
    networks:
      - darkmedia-network
    restart: unless-stopped

volumes:
  postgres_data:
  qdrant_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  darkmedia-network:
    driver: bridge
```

---

## ☸️ [KUBERNETES] Orchestration Production

### Namespace et ConfigMap

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: darkmedia

---

apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: darkmedia
data:
  DATABASE_HOST: postgres.darkmedia.svc.cluster.local
  DATABASE_PORT: "5432"
  QDRANT_URL: http://qdrant.darkmedia.svc.cluster.local:6333
  REDIS_HOST: redis.darkmedia.svc.cluster.local
```

### Secret pour Credentials

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: darkmedia
type: Opaque
stringData:
  DATABASE_PASSWORD: ${DB_PASSWORD}
  JWT_SECRET: ${JWT_SECRET}
  API_KEY: ${API_KEY}
  QDRANT_API_KEY: ${QDRANT_API_KEY}
```

### Deployment API

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: darkmedia
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      # Security Context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001

      containers:
      - name: api
        image: darkmedia/api:latest
        imagePullPolicy: IfNotPresent
        
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        
        # Environment Variables
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
        
        # Resource Limits
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi
        
        # Health Checks
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        # Security Context
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        
        # Volume Mounts
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /app/logs
      
      # Volumes
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
      
      # Affinity
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - api
              topologyKey: kubernetes.io/hostname
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: darkmedia
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: darkmedia
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.darkmedia-x.dev
    secretName: api-tls
  rules:
  - host: api.darkmedia-x.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
```

---

## 📝 [IaC] Infrastructure as Code

### Terraform - Provider

```hcl
terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
  
  backend "s3" {
    bucket         = "darkmedia-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.main.token
}
```

### Terraform - EKS Cluster

```hcl
resource "aws_eks_cluster" "main" {
  name            = "darkmedia-eks"
  role_arn        = aws_iam_role.eks_cluster.arn
  version         = "1.28"

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs     = ["0.0.0.0/0"]
  }

  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]

  tags = {
    Name        = "darkmedia-eks"
    Environment = var.environment
  }
}

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "darkmedia-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 3
  }

  instance_types = ["t3.medium"]

  depends_on = [aws_iam_role_policy_attachment.eks_worker_node_policy]

  tags = {
    Name = "darkmedia-node-group"
  }
}
```

### Terraform - Variables

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "subnet_ids" {
  description = "Subnet IDs for EKS"
  type        = list(string)
  validation {
    condition     = length(var.subnet_ids) >= 2
    error_message = "At least 2 subnets are required."
  }
}
```

---

## 📊 [MONITORING] Observabilité

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'darkmedia-prod'
    environment: 'production'

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'kubernetes-apiservers'
    kubernetes_sd_configs:
      - role: endpoints
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

  - job_name: 'kubernetes-nodes'
    kubernetes_sd_configs:
      - role: node
    scheme: https
    tls_config:
      ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
    bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - '/etc/prometheus/rules/*.yml'
```

### Alert Rules

```yaml
groups:
  - name: darkmedia
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
        for: 5m
        annotations:
          summary: "Pod is crash looping"
          description: "Pod {{ $labels.pod }} in {{ $labels.namespace }}"

      - alert: DiskSpaceRunningOut
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 10m
        annotations:
          summary: "Disk space running out"
          description: "Less than 10% disk space available on {{ $labels.instance }}"
```

---

## 🔄 [CI/CD] GitHub Actions Avancé

### Build et Push Docker

```yaml
name: Build and Push Docker

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/api
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=ghcr.io/${{ github.repository }}/api:buildcache
          cache-to: type=registry,ref=ghcr.io/${{ github.repository }}/api:buildcache,mode=max
```

### Deploy to Kubernetes

```yaml
name: Deploy to Kubernetes

on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        run: |
          mkdir -p ~/.kube
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > ~/.kube/config
          chmod 600 ~/.kube/config

      - name: Update image
        run: |
          kubectl set image deployment/api \
            api=ghcr.io/${{ github.repository }}/api:${{ github.ref_name }} \
            -n darkmedia

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/api -n darkmedia --timeout=5m

      - name: Run smoke tests
        run: |
          kubectl run smoke-test \
            --image=curlimages/curl \
            --rm -i --restart=Never \
            -- curl -f http://api.darkmedia.svc.cluster.local/health
```

---

## ✅ Checklist DevOps

- [ ] Dockerfile optimisé (multi-stage) ✅
- [ ] docker-compose.yml pour local ✅
- [ ] .dockerignore configuré ✅
- [ ] Kubernetes manifests pour prod ✅
- [ ] Health checks configurés ✅
- [ ] Resource limits définis ✅
- [ ] Security context appliqué ✅
- [ ] Terraform IaC pour infrastructure ✅
- [ ] Monitoring (Prometheus + Grafana) ✅
- [ ] CI/CD avec GitHub Actions ✅
- [ ] Secrets gérés sécurisément ✅
- [ ] Rollout/rollback stratégie ✅

---

**📌 Note**: Infrastructure as Code = répétabilité, versionning et compliance garantis.