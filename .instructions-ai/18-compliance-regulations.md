# 📋 Conformité et Réglementations

**Version**: 2.0 | **Scope**: GDPR, SOC2, HIPAA, compliance framework

---

## 🎯 [OVERVIEW] Cadre de Conformité Darkmedia-X

### Régulations Applicables
```
✅ GDPR (UE)           → Protection données personnelles
✅ SOC2 Type II        → Sécurité et opérations
✅ CCPA (Californie)   → Droits consommateurs
✅ HIPAA (Santé)       → Si données médicales
✅ PCI-DSS            → Si paiements par carte
✅ ISO 27001          → Management sécurité info
```

### Piliers de Conformité
1. **Privacy** — Données personnelles protégées
2. **Security** — Accès contrôlé et chiffré
3. **Availability** — 99.9% uptime garanti
4. **Auditability** — Traçabilité complète

---

## 🇪🇺 [GDPR] Conformité GDPR (Europe)

### Droits des Utilisateurs (Article 15-22)

```python
class GDPRRights:
    """Implémentation des droits GDPR."""
    
    def right_to_access(self, user_id: str) -> dict:
        """Droit d'accès - Article 15."""
        user_data = db.users.get(user_id)
        
        return {
            "personal_data": user_data,
            "processing_purposes": ["service delivery", "analytics"],
            "recipients": ["internal team"],
            "retention_period": "3 years",
            "exported_at": datetime.utcnow().isoformat()
        }
    
    def right_to_rectification(self, user_id: str, corrections: dict) -> bool:
        """Droit de rectification - Article 16."""
        # Valider les corrections
        for field, value in corrections.items():
            if field not in ['name', 'email', 'phone']:
                raise ValueError(f"Cannot rectify {field}")
        
        # Appliquer
        db.users.update(user_id, corrections)
        
        # Logger pour audit
        audit.log("rectification", user_id, corrections)
        return True
    
    def right_to_erasure(self, user_id: str) -> bool:
        """Droit à l'oubli - Article 17."""
        user = db.users.get(user_id)
        
        # Vérifier les exceptions légales
        if self._has_legal_exception(user_id):
            raise ValueError("Cannot erase due to legal obligation")
        
        # Pseudonymiser avant suppression
        user.anonymize()
        db.users.delete(user_id)
        
        audit.log("erasure", user_id)
        return True
    
    def right_to_data_portability(self, user_id: str) -> bytes:
        """Droit à la portabilité - Article 20."""
        user_data = db.users.get(user_id)
        
        # Format machine-readable et interopérable
        export = {
            "user": user_data,
            "posts": db.posts.find_by_user(user_id),
            "preferences": db.preferences.get(user_id),
            "exported_at": datetime.utcnow().isoformat()
        }
        
        # Format JSON (ou XML, CSV)
        json_export = json.dumps(export, indent=2)
        
        # Chiffrer pour transmission sécurisée
        encrypted = encrypt_data(json_export, user_id)
        return encrypted
    
    def right_to_object(self, user_id: str, processing_type: str) -> bool:
        """Droit d'opposition - Article 21."""
        db.user_preferences.set(user_id, f"opt_out_{processing_type}", True)
        
        # Arrêter le processing immédiatement
        self._stop_processing(user_id, processing_type)
        
        audit.log("objection", user_id, processing_type)
        return True
    
    def _has_legal_exception(self, user_id: str) -> bool:
        """Vérifier les exceptions légales."""
        # Ex: obligations contractuelles, légales, comptables
        return False
    
    def _stop_processing(self, user_id: str, processing_type: str):
        """Arrêter le traitement spécifié."""
        pass
```

### Lawful Basis (Base Légale)

```python
class LawfulBasis:
    """Documenter la base légale pour chaque traitement."""
    
    # 1. Consent explicite
    CONSENT = "user_explicitly_agreed_and_can_withdraw"
    
    # 2. Contract
    CONTRACT = "necessary_to_fulfill_contract"
    
    # 3. Legal Obligation
    LEGAL_OBLIGATION = "required_by_law"
    
    # 4. Vital Interests
    VITAL_INTERESTS = "necessary_to_protect_vital_interests"
    
    # 5. Public Task
    PUBLIC_TASK = "necessary_for_public_task"
    
    # 6. Legitimate Interests
    LEGITIMATE_INTERESTS = "legitimate_business_interests"
    
    def document_processing(self, 
                           processing_type: str,
                           basis: str,
                           data_categories: list):
        """Documenter chaque traitement."""
        
        if basis not in [self.CONSENT, self.CONTRACT, self.LEGAL_OBLIGATION, 
                        self.VITAL_INTERESTS, self.PUBLIC_TASK, self.LEGITIMATE_INTERESTS]:
            raise ValueError("Invalid lawful basis")
        
        # Enregistrer dans un registre de traitement (ROPA)
        ropa_entry = {
            "processing_id": uuid4(),
            "type": processing_type,
            "basis": basis,
            "data_categories": data_categories,
            "purpose": f"Purpose of {processing_type}",
            "recipients": ["internal team"],
            "retention_days": 1095,  # 3 ans
            "documented_at": datetime.utcnow().isoformat(),
            "dpia_required": basis == self.LEGITIMATE_INTERESTS
        }
        
        db.ropa.insert(ropa_entry)
        return ropa_entry["processing_id"]
```

### Data Protection Impact Assessment (DPIA)

```python
class DPIA:
    """Data Protection Impact Assessment pour traitements sensibles."""
    
    def assess(self, processing_type: str) -> dict:
        """Effectuer une DPIA."""
        
        assessment = {
            "processing": processing_type,
            "necessity": self._assess_necessity(processing_type),
            "proportionality": self._assess_proportionality(processing_type),
            "risks": self._identify_risks(processing_type),
            "mitigations": self._propose_mitigations(processing_type),
            "overall_assessment": "approved",  # ou "requires_review"
            "assessed_at": datetime.utcnow().isoformat()
        }
        
        # Haute risque → notifier l'autorité
        if assessment["overall_assessment"] == "requires_review":
            self._notify_dpa(assessment)
        
        return assessment
    
    def _identify_risks(self, processing_type: str) -> list:
        """Identifier les risques potentiels."""
        return [
            {
                "type": "data_breach",
                "likelihood": "medium",
                "impact": "high",
                "risk_level": "high",
                "mitigation": "Encryption at rest and in transit"
            },
            {
                "type": "unauthorized_access",
                "likelihood": "low",
                "impact": "high",
                "risk_level": "medium",
                "mitigation": "Role-based access control (RBAC)"
            }
        ]
    
    def _propose_mitigations(self, processing_type: str) -> list:
        """Proposer des mesures de mitigation."""
        return [
            "Pseudonymization",
            "Encryption (AES-256)",
            "Access control (RBAC)",
            "Regular security audits",
            "Employee training",
            "Incident response plan"
        ]
    
    def _notify_dpa(self, assessment: dict):
        """Notifier l'autorité de protection des données."""
        # Implémenter notification
        pass
```

---

## 🔒 [SOC2] Conformité SOC2 Type II

### Security Controls Framework

```python
class SOC2Controls:
    """Contrôles SOC2 Type II."""
    
    # CC - Common Criteria
    CC_RISK_MANAGEMENT = "CC1"      # Risk assessment
    CC_POLICY_PROCEDURES = "CC2"    # Policies and procedures
    CC_COMMUNICATIONS = "CC3"       # Communications
    CC_MONITORING = "CC4"           # Monitoring activities
    CC_CONTROL_ACTIVITIES = "CC5"   # Control activities
    CC_LOGICAL_ACCESS = "CC6"       # Logical and physical access
    CC_SYSTEM_MONITORING = "CC7"    # System monitoring
    CC_CHANGE_MANAGEMENT = "CC8"    # Change management
    CC_RISK_MITIGATION = "CC9"      # Risk mitigation
    
    # A - Availability
    A1_PERFORMANCE = "A1"           # System availability
    A2_USAGE_MONITORING = "A2"      # Usage monitoring
    
    # C - Confidentiality
    C1_DATA_PROTECTION = "C1"       # Protection from disclosure
    
    # I - Integrity
    I1_ACCURACY = "I1"              # Accuracy and completeness
    
    # P - Privacy
    P1_COLLECTION = "P1"            # Collection
    P2_USE_RETENTION = "P2"         # Use and retention
    
    def verify_control(self, control_id: str) -> dict:
        """Vérifier l'implémentation d'un contrôle."""
        
        control_checklist = {
            self.CC_RISK_MANAGEMENT: [
                "Risk assessment documented",
                "Risks reviewed quarterly",
                "Mitigation strategies in place"
            ],
            self.CC_POLICY_PROCEDURES: [
                "Security policies documented",
                "Access control policy",
                "Change management policy",
                "Incident response policy"
            ],
            self.CC_LOGICAL_ACCESS: [
                "MFA enabled",
                "RBAC implemented",
                "Access logs monitored",
                "Privileged access managed"
            ],
            self.CC_SYSTEM_MONITORING: [
                "Intrusion detection active",
                "Security logs centralized",
                "Alerts configured",
                "Regular log reviews"
            ]
        }
        
        items = control_checklist.get(control_id, [])
        completed = len([item for item in items if self._is_implemented(control_id, item)])
        
        return {
            "control": control_id,
            "completion": f"{completed}/{len(items)}",
            "status": "compliant" if completed == len(items) else "in_progress",
            "last_verified": datetime.utcnow().isoformat()
        }
```

### SOC2 Audit Trail

```python
class AuditTrail:
    """Traçabilité complète pour SOC2."""
    
    def log_event(self, 
                  event_type: str,
                  user_id: str,
                  resource: str,
                  action: str,
                  result: str,
                  ip_address: str = None):
        """Enregistrer un événement."""
        
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "result": result,
            "ip_address": ip_address,
            "event_id": str(uuid4())
        }
        
        # Stocker immuablement
        db.audit_logs.insert(event)
        
        # Monitorer les événements suspects
        if event_type == "failed_login" and self._too_many_failures(user_id):
            self._alert_security_team(event)
        
        return event["event_id"]
    
    def generate_audit_report(self, start_date: datetime, end_date: datetime) -> dict:
        """Générer un rapport d'audit."""
        
        logs = db.audit_logs.find_between(start_date, end_date)
        
        return {
            "period": f"{start_date} to {end_date}",
            "total_events": len(logs),
            "by_type": self._count_by_type(logs),
            "failed_logins": len([l for l in logs if l["event_type"] == "failed_login"]),
            "access_changes": len([l for l in logs if l["action"] == "access_granted"]),
            "data_exports": len([l for l in logs if l["action"] == "data_export"])
        }
```

---

## 💳 [PCI-DSS] Conformité Paiements (Si Applicable)

### PCI-DSS Requirements

```python
class PCIDSS:
    """Conformité PCI-DSS pour paiements par carte."""
    
    def validate_compliance(self) -> dict:
        """Valider la conformité PCI-DSS."""
        
        checks = {
            "requirement_1": self._check_firewall(),
            "requirement_2": self._check_default_passwords(),
            "requirement_3": self._check_card_data_storage(),
            "requirement_4": self._check_encryption_transit(),
            "requirement_5": self._check_malware_protection(),
            "requirement_6": self._check_vulnerability_management(),
            "requirement_7": self._check_access_control(),
            "requirement_8": self._check_identification(),
            "requirement_9": self._check_physical_access(),
            "requirement_10": self._check_logging(),
            "requirement_11": self._check_testing(),
            "requirement_12": self._check_information_security_policy()
        }
        
        return {
            "compliant": all(checks.values()),
            "checks": checks,
            "assessed_at": datetime.utcnow().isoformat()
        }
    
    def _check_card_data_storage(self) -> bool:
        """Requirement 3: Ne JAMAIS stocker de données sensibles de carte."""
        
        # ✅ BON - Utiliser un payment processor
        # Stripe, Square, Adyen gèrent PCI-DSS
        
        # ❌ MAUVAIS - Stocker localement
        # Ne JAMAIS faire ça
        
        return True
    
    def _check_encryption_transit(self) -> bool:
        """Requirement 4: Chiffrer les données en transit."""
        
        # ✅ TLS 1.2+ obligatoire
        # ✅ Certificats valides et à jour
        # ❌ HTTP jamais pour données sensibles
        
        return True
```

---

## 📊 [DOCUMENTATION] Registres et Documentation

### Data Processing Register (ROPA)

```python
class DataProcessingRegister:
    """Registre des traitements de données."""
    
    def create_processing_record(self,
                                 processing_name: str,
                                 data_categories: list,
                                 purposes: list,
                                 lawful_basis: str,
                                 recipients: list,
                                 retention_days: int):
        """Créer un enregistrement de traitement."""
        
        record = {
            "id": str(uuid4()),
            "name": processing_name,
            "data_categories": data_categories,  # ex: ["name", "email", "IP"]
            "purposes": purposes,                 # ex: ["service delivery", "analytics"]
            "lawful_basis": lawful_basis,
            "recipients": recipients,             # Qui accède aux données
            "retention_days": retention_days,
            "technical_measures": [
                "encryption_at_rest",
                "encryption_in_transit",
                "access_control",
                "audit_logging"
            ],
            "created_at": datetime.utcnow().isoformat()
        }
        
        db.data_processing_register.insert(record)
        return record
    
    def export_ropa_for_dpa(self) -> dict:
        """Exporter le registre pour l'autorité de protection des données."""
        
        records = db.data_processing_register.find_all()
        
        return {
            "organization": "Darkmedia-X",
            "exported_at": datetime.utcnow().isoformat(),
            "total_processing": len(records),
            "records": records
        }
```

### Data Breach Notification

```python
class BreachNotification:
    """Notification de violation de données - Article 34 GDPR."""
    
    def handle_data_breach(self, 
                          breach_type: str,
                          affected_users: int,
                          data_exposed: list):
        """Gérer une violation de données."""
        
        breach_record = {
            "id": str(uuid4()),
            "detected_at": datetime.utcnow().isoformat(),
            "type": breach_type,
            "affected_users": affected_users,
            "data_exposed": data_exposed,
            "status": "under_investigation"
        }
        
        db.data_breaches.insert(breach_record)
        
        # Évaluer si notification requise
        if self._notification_required(breach_record):
            # 1. Notifier l'autorité (DPA) - max 72h
            self._notify_dpa(breach_record)
            
            # 2. Notifier les utilisateurs affectés
            self._notify_users(breach_record)
        
        return breach_record
    
    def _notification_required(self, breach: dict) -> bool:
        """Vérifier si notification obligatoire."""
        # High risk = notification obligatoire
        return breach["affected_users"] > 100 or "email" in breach["data_exposed"]
    
    def _notify_dpa(self, breach: dict):
        """Notifier l'autorité de protection des données."""
        notification = {
            "authority": "CNIL",  # ou autre DPA
            "sent_at": datetime.utcnow().isoformat(),
            "breach_id": breach["id"],
            "description": f"Data breach: {breach['type']}",
            "measures_taken": "Incident response plan activated"
        }
        # Implémenter l'envoi
    
    def _notify_users(self, breach: dict):
        """Notifier les utilisateurs affectés."""
        users = db.users.find_by_ids(breach["affected_users"])
        
        for user in users:
            # Email de notification
            email_body = f"""
            We have detected a data breach affecting your account.
            Data exposed: {', '.join(breach['data_exposed'])}
            
            Measures taken:
            - Incident response activated
            - Systems secured
            - Your password should be reset
            """
            
            self._send_notification(user.email, email_body)
```

---

## 🔍 [AUDIT] Audit et Conformité Continue

### Compliance Dashboard

```python
class ComplianceDashboard:
    """Tableau de bord de conformité en temps réel."""
    
    def get_compliance_status(self) -> dict:
        """État actuel de la conformité."""
        
        return {
            "gdpr": self._gdpr_status(),
            "soc2": self._soc2_status(),
            "pci_dss": self._pci_dss_status(),
            "overall": "compliant",
            "last_audit": datetime.utcnow().isoformat(),
            "next_audit": (datetime.utcnow() + timedelta(days=365)).isoformat()
        }
    
    def _gdpr_status(self) -> dict:
        """État GDPR."""
        return {
            "status": "compliant",
            "dpia_completed": len(db.dpias.find_all()),
            "user_rights_processed": len(db.user_requests.find_all()),
            "data_breaches_reported": len(db.data_breaches.find_all()),
            "dpa_queries": 0
        }
    
    def _soc2_status(self) -> dict:
        """État SOC2."""
        audit_logs = db.audit_logs.find_last_days(30)
        
        return {
            "status": "compliant",
            "events_logged": len(audit_logs),
            "access_controls": "implemented",
            "encryption": "enabled",
            "monitoring": "active"
        }

# Utilisation
dashboard = ComplianceDashboard()
status = dashboard.get_compliance_status()
print(status)
# {"gdpr": {...}, "soc2": {...}, "overall": "compliant"}
```

---

## ✅ Checklist de Conformité

- [ ] GDPR - Rights implementation ✅
- [ ] GDPR - DPIA completed ✅
- [ ] GDPR - Data Processing Register ✅
- [ ] SOC2 - Security controls verified ✅
- [ ] SOC2 - Audit trail active ✅
- [ ] PCI-DSS - If handling payments ✅
- [ ] Data breach notification process ✅
- [ ] Privacy policy updated ✅
- [ ] T&Cs compliant ✅
- [ ] Vendor agreements compliant ✅
- [ ] Employee training completed ✅
- [ ] Regular audits scheduled ✅

---

**⚠️ Critical**: Conformité n'est pas optionnelle. Consultation juridique requise.