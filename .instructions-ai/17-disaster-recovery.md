# 🆘 Plan de Récupération d'Urgence (DR)

**Version**: 2.0 | **Scope**: Backup, Failover, Business Continuity, RTO/RPO

---

## 🎯 [OVERVIEW] Stratégie Darkmedia-X

### RTO et RPO
```
RTO (Recovery Time Objective) = Temps max d'indisponibilité acceptable
RPO (Recovery Point Objective) = Données max acceptables à perdre

Darkmedia-X Standards:
- Production: RTO 1h, RPO 15min
- Staging: RTO 4h, RPO 1h
- Development: RTO 24h, RPO 24h
```

### Hiérarchie de Criticité
```
🔴 CRITIQUE (RTO 1h)
   - API principale
   - Base de données utilisateurs
   - Service Qdrant

🟠 IMPORTANT (RTO 4h)
   - Services secondaires
   - Analytics
   - Cache

🟡 NORMAL (RTO 24h)
   - Développement
   - Tests
   - Logs historiques
```

---

## 💾 [BACKUP] Stratégie de Sauvegarde

### PostgreSQL Backups

```bash
# Backup complet quotidien (21h00 UTC)
0 21 * * * pg_dump -U postgres my_db | gzip > /backups/pg_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz

# Backup transactionnel continu (WAL archiving)
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /wal_archive/%f'

# Point-in-time recovery (PITR)
pg_start_backup('backup_label')
cp -r /var/lib/postgresql/data /backups/data_$(date +%Y%m%d)
pg_stop_backup()
```

### Qdrant Vector Database

```python
# Backup automatique Qdrant
from qdrant_client import QdrantClient
from datetime import datetime
import shutil

class QdrantBackup:
    def __init__(self, client: QdrantClient, backup_dir: str):
        self.client = client
        self.backup_dir = backup_dir
    
    def full_backup(self) -> str:
        """Crée un backup complet de Qdrant."""
        timestamp = datetime.utcnow().isoformat()
        backup_path = f"{self.backup_dir}/qdrant_{timestamp}"
        
        # Créer le snapshot
        self.client.create_snapshot()
        
        # Compresser les données
        shutil.make_archive(backup_path, 'gz', '/var/lib/qdrant/storage')
        
        return backup_path
    
    def restore_backup(self, backup_path: str):
        """Restaure depuis un backup."""
        # Arrêter Qdrant
        # Extraire le backup
        shutil.unpack_archive(backup_path, '/var/lib/qdrant/storage')
        # Redémarrer Qdrant
        print(f"Restauré depuis {backup_path}")
```

### Stratégie 3-2-1

```
Règle 3-2-1:
- 3 copies des données
- 2 supports différents
- 1 hors site

Implémentation Darkmedia-X:
├── Backup 1: NAS local (quotidien)
├── Backup 2: AWS S3 (quotidien)
└── Backup 3: Glacier (hebdomadaire, archive)
```

### Retention Policy

```python
# Rétention des backups
RETENTION = {
    "daily": 7,      # 7 jours
    "weekly": 4,     # 4 semaines
    "monthly": 12,   # 12 mois
    "yearly": 7      # 7 ans (compliance)
}

def cleanup_old_backups():
    """Supprime les vieux backups selon la policy."""
    from datetime import datetime, timedelta
    import os
    
    backup_dir = "/backups"
    now = datetime.utcnow()
    
    for filename in os.listdir(backup_dir):
        filepath = os.path.join(backup_dir, filename)
        file_age = now - datetime.fromtimestamp(os.path.getctime(filepath))
        
        # Daily retention: 7 days
        if 'daily' in filename and file_age > timedelta(days=7):
            os.remove(filepath)
        # Weekly retention: 4 weeks
        elif 'weekly' in filename and file_age > timedelta(weeks=4):
            os.remove(filepath)
        # Monthly retention: 12 months
        elif 'monthly' in filename and file_age > timedelta(days=365):
            os.remove(filepath)
```

---

## 🔄 [FAILOVER] Basculement Automatique

### Database Failover avec PostgreSQL

```yaml
# patroni configuration (pour HA PostgreSQL)
scope: postgres
namespace: /darkmedia/postgres
name: postgres-1

restapi:
  listen: 0.0.0.0:8008
  connect_address: 10.0.0.1:8008

etcd:
  hosts:
  - 10.0.0.1:2379
  - 10.0.0.2:2379
  - 10.0.0.3:2379

postgresql:
  data_dir: /var/lib/postgresql/14/main
  parameters:
    wal_level: replica
    max_wal_senders: 10
    wal_keep_segments: 1000

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      use_slots: true
```

### Application Healthcheck

```python
from fastapi import FastAPI, status
from sqlalchemy import text
import logging

app = FastAPI()
logger = logging.getLogger(__name__)

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint."""
    try:
        # Vérifier DB
        db_health = await check_database()
        
        # Vérifier Qdrant
        qdrant_health = await check_qdrant()
        
        # Vérifier Redis
        redis_health = await check_redis()
        
        all_healthy = all([db_health, qdrant_health, redis_health])
        
        return {
            "status": "healthy" if all_healthy else "degraded",
            "components": {
                "database": db_health,
                "qdrant": qdrant_health,
                "redis": redis_health
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}, 503

async def check_database() -> bool:
    """Vérifie la connexion DB."""
    try:
        async with db.connection() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        return False

async def check_qdrant() -> bool:
    """Vérifie Qdrant."""
    try:
        collections = qdrant_client.get_collections()
        return len(collections.collections) > 0
    except Exception as e:
        logger.error(f"Qdrant check failed: {e}")
        return False

async def check_redis() -> bool:
    """Vérifie Redis."""
    try:
        redis_client.ping()
        return True
    except Exception as e:
        logger.error(f"Redis check failed: {e}")
        return False
```

### Kubernetes Pod Autorestart

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: api:latest
        
        # Liveness probe (restart if unhealthy)
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        
        # Readiness probe (remove from load balancer if not ready)
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
```

---

## 📋 [RECOVERY] Procédures de Récupération

### Database Recovery

```bash
#!/bin/bash
# recovery.sh - Récupère une base de données

BACKUP_FILE=$1
DB_NAME="my_database"
DB_USER="postgres"

echo "🔄 Démarrage de la récupération..."

# 1. Arrêter l'application
echo "1️⃣ Arrêt de l'application"
systemctl stop api

# 2. Faire un backup du state actuel (pour audit)
echo "2️⃣ Backup du state actuel"
pg_dump -U $DB_USER $DB_NAME | gzip > /backups/pre_recovery_$(date +%Y%m%d_%H%M%S).sql.gz

# 3. Restaurer depuis le backup
echo "3️⃣ Restauration depuis $BACKUP_FILE"
gunzip < "$BACKUP_FILE" | psql -U $DB_USER $DB_NAME

# 4. Vérifier l'intégrité
echo "4️⃣ Vérification de l'intégrité"
psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"

# 5. Redémarrer l'application
echo "5️⃣ Redémarrage de l'application"
systemctl start api

# 6. Vérifier la santé
echo "6️⃣ Vérification du health"
curl -f http://localhost:3000/health && echo "✅ Recovery réussie!" || echo "❌ Health check échoué"
```

### Application Recovery

```python
# recovery_manager.py
class RecoveryManager:
    """Gère la récupération suite à une panne."""
    
    def __init__(self, backup_dir: str):
        self.backup_dir = backup_dir
        self.logger = logging.getLogger(__name__)
    
    def check_recovery_needed(self) -> bool:
        """Vérifie si une récupération est nécessaire."""
        try:
            # Vérifier la DB
            with db.connection() as conn:
                conn.execute("SELECT 1")
            return False  # Pas de récupération nécessaire
        except Exception as e:
            self.logger.error(f"Database unavailable: {e}")
            return True
    
    def perform_recovery(self):
        """Exécute la récupération."""
        self.logger.warning("⚠️ Performing automatic recovery...")
        
        try:
            # 1. Lister les backups disponibles
            backups = self.list_backups()
            if not backups:
                raise Exception("Aucun backup disponible")
            
            # 2. Utiliser le backup le plus récent
            latest_backup = backups[-1]
            self.logger.info(f"Utilisation du backup: {latest_backup}")
            
            # 3. Restaurer
            self.restore_backup(latest_backup)
            
            # 4. Vérifier
            if self.verify_recovery():
                self.logger.info("✅ Recovery réussie!")
                return True
            else:
                self.logger.error("❌ Vérification échouée")
                return False
        
        except Exception as e:
            self.logger.error(f"Recovery failed: {e}")
            raise
    
    def list_backups(self) -> list:
        """Liste les backups disponibles."""
        import os
        from datetime import datetime
        
        backups = []
        for filename in os.listdir(self.backup_dir):
            if filename.endswith('.gz'):
                filepath = os.path.join(self.backup_dir, filename)
                mtime = os.path.getmtime(filepath)
                backups.append((filepath, datetime.fromtimestamp(mtime)))
        
        # Trier par date
        return [b[0] for b in sorted(backups, key=lambda x: x[1])]
    
    def restore_backup(self, backup_path: str):
        """Restaure un backup."""
        import subprocess
        
        self.logger.info(f"Restauration en cours: {backup_path}")
        
        restore_cmd = f"gunzip < {backup_path} | psql -U postgres my_db"
        result = subprocess.run(restore_cmd, shell=True, capture_output=True)
        
        if result.returncode != 0:
            raise Exception(f"Restauration échouée: {result.stderr}")
    
    def verify_recovery(self) -> bool:
        """Vérifie que la récupération est réussie."""
        try:
            with db.connection() as conn:
                result = conn.execute("SELECT COUNT(*) FROM users")
                count = result.scalar()
                
            self.logger.info(f"Base contient {count} utilisateurs")
            return count > 0
        except Exception as e:
            self.logger.error(f"Vérification échouée: {e}")
            return False
```

---

## 🧪 [TESTING] Test des Backups

### Backup Restore Testing

```bash
#!/bin/bash
# test_backups.sh - Teste que les backups peuvent être restaurés

TEST_DB="test_restore_$(date +%s)"

echo "🧪 Test de restauration de backup..."

# 1. Créer une DB de test
echo "1️⃣ Création DB de test: $TEST_DB"
createdb -U postgres $TEST_DB

# 2. Restaurer le backup
echo "2️⃣ Restauration du backup"
gunzip < /backups/latest_backup.sql.gz | psql -U postgres $TEST_DB

# 3. Vérifier l'intégrité
echo "3️⃣ Vérification de l'intégrité"
psql -U postgres -d $TEST_DB -c "
  SELECT 
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname='public') as table_count,
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM posts) as post_count;
"

# 4. Nettoyer
echo "4️⃣ Nettoyage"
dropdb -U postgres $TEST_DB

echo "✅ Test de backup réussi!"
```

### Failover Drill

```yaml
# failover_drill.yml - Teste le failover automatique
apiVersion: batch/v1
kind: CronJob
metadata:
  name: failover-drill
spec:
  schedule: "0 2 * * 0"  # Chaque dimanche à 2h du matin
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: failover-test
            image: failover-tester:latest
            env:
            - name: PRIMARY_DB
              value: "primary.example.com"
            - name: SECONDARY_DB
              value: "secondary.example.com"
            command:
            - /bin/sh
            - -c
            - |
              echo "🧪 Starting failover drill..."
              
              # 1. Test primary
              if ! nc -z $PRIMARY_DB 5432; then
                echo "❌ Primary DB unreachable"
                exit 1
              fi
              
              # 2. Simulate primary failure
              echo "Simulating primary failure..."
              # ... fail primary temporarily ...
              
              # 3. Test failover to secondary
              if ! nc -z $SECONDARY_DB 5432; then
                echo "❌ Failover failed"
                exit 1
              fi
              
              # 4. Restore primary
              echo "Restoring primary..."
              # ... restore primary ...
              
              echo "✅ Failover drill successful"
          restartPolicy: Never
```

---

## 📊 [MONITORING] Monitoring de la Santé

### Backup Monitoring

```python
# backup_monitor.py
import logging
from datetime import datetime, timedelta

class BackupMonitor:
    """Monitoring des backups."""
    
    def __init__(self, backup_dir: str, max_age_hours: int = 25):
        self.backup_dir = backup_dir
        self.max_age = timedelta(hours=max_age_hours)
        self.logger = logging.getLogger(__name__)
    
    def check_backup_freshness(self) -> dict:
        """Vérifie que les backups sont à jour."""
        import os
        
        now = datetime.utcnow()
        results = {
            "status": "ok",
            "backups": [],
            "alerts": []
        }
        
        for filename in os.listdir(self.backup_dir):
            if filename.endswith('.gz'):
                filepath = os.path.join(self.backup_dir, filename)
                mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                age = now - mtime
                size_mb = os.path.getsize(filepath) / (1024 * 1024)
                
                backup_info = {
                    "name": filename,
                    "age_hours": age.total_seconds() / 3600,
                    "size_mb": size_mb,
                    "timestamp": mtime.isoformat()
                }
                results["backups"].append(backup_info)
                
                # Alerte si trop vieux
                if age > self.max_age:
                    results["status"] = "warning"
                    results["alerts"].append(
                        f"Backup {filename} est trop vieux ({age.days} jours)"
                    )
        
        # Alerte si pas de backup récent
        if not results["backups"]:
            results["status"] = "critical"
            results["alerts"].append("Aucun backup trouvé!")
        
        return results
    
    def generate_alert(self, alert: str):
        """Génère une alerte (email, Slack, etc.)."""
        self.logger.warning(f"🚨 {alert}")
        
        # Intégration Slack
        # ... envoyer message Slack ...
        
        # Intégration Email
        # ... envoyer email ...
```

### Prometheus Alerts

```yaml
groups:
- name: backup_alerts
  interval: 30s
  rules:
  
  - alert: BackupTooOld
    expr: time() - backup_last_timestamp > 86400  # > 24h
    for: 1h
    annotations:
      summary: "Backup trop vieux"
      description: "Dernier backup date de {{ $value | humanizeDuration }} ago"
  
  - alert: BackupStorageFull
    expr: backup_storage_used_bytes / backup_storage_total_bytes > 0.9
    for: 30m
    annotations:
      summary: "Stockage de backup à 90%"
      description: "Espace disque de backup presque plein"
  
  - alert: RecoveryFailed
    expr: last_recovery_successful == 0
    for: 5m
    annotations:
      summary: "Récupération échouée"
      description: "La dernière tentative de récupération a échoué"
```

---

## 📋 Checklist DR

- [ ] Backups automatisés quotidiens ✅
- [ ] Rétention policy définie ✅
- [ ] Backups testés mensuellement ✅
- [ ] RTO/RPO documentés ✅
- [ ] Failover automatique en place ✅
- [ ] Health checks configurés ✅
- [ ] Runbook de récupération ✅
- [ ] Monitoring des backups ✅
- [ ] Alertes configurées ✅
- [ ] Équipe formée au DR ✅
- [ ] Tests de failover réguliers ✅
- [ ] Backup hors site (S3/Glacier) ✅

---

**📌 Note**: Un plan DR est inutile s'il n'est pas testé régulièrement. Failover drill = tous les mois!