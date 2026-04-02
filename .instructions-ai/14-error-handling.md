# 🚨 Gestion des Erreurs et Exceptions

**Version**: 2.0 | **Principes**: Robustesse, Traçabilité, Recovery

---

## 🎯 [OVERVIEW] Stratégie Globale d'Erreurs

### Hiérarchie d'Erreurs
```
┌─────────────────────────────┐
│   Exception (Python)        │
│   Error (JavaScript)        │
├─────────────────────────────┤
│   DomainException           │ Erreurs métier (validation)
├─────────────────────────────┤
│   ApplicationException      │ Erreurs applicatives (DB, API)
├─────────────────────────────┤
│   InfrastructureException   │ Erreurs infrastructure (réseau)
├─────────────────────────────┤
│   SystemException           │ Erreurs système critiques
└─────────────────────────────┘
```

### Principes Fondamentaux
1. **Fail Fast** : Détecter les erreurs au plus tôt
2. **Fail Loud** : Signaler clairement l'erreur
3. **Fail Safe** : Récupérer gracieusement quand possible
4. **Fail Logged** : Toujours logger avec contexte

---

## 🐍 [PYTHON] Gestion d'Erreurs Python

### Hiérarchie d'Exceptions Custom

```python
# base.py
class DarkmediaException(Exception):
    """Classe de base pour toutes les exceptions Darkmedia-X."""
    
    def __init__(self, message: str, code: str, details: dict = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> dict:
        """Conversion pour serialization (logs, API responses)."""
        return {
            "error": self.__class__.__name__,
            "code": self.code,
            "message": self.message,
            "details": self.details
        }


# domain_exceptions.py
class ValidationError(DarkmediaException):
    """Erreur de validation des données métier."""
    def __init__(self, field: str, message: str, value: any = None):
        super().__init__(
            message=f"Validation error on field '{field}': {message}",
            code="VALIDATION_ERROR",
            details={"field": field, "value": value}
        )


class DuplicateResourceError(DarkmediaException):
    """Ressource déjà existante."""
    def __init__(self, resource_type: str, identifier: str):
        super().__init__(
            message=f"{resource_type} with identifier '{identifier}' already exists",
            code="DUPLICATE_RESOURCE",
            details={"resource_type": resource_type, "identifier": identifier}
        )


class ResourceNotFoundError(DarkmediaException):
    """Ressource non trouvée."""
    def __init__(self, resource_type: str, identifier: str):
        super().__init__(
            message=f"{resource_type} with identifier '{identifier}' not found",
            code="RESOURCE_NOT_FOUND",
            details={"resource_type": resource_type, "identifier": identifier}
        )


# application_exceptions.py
class DatabaseError(DarkmediaException):
    """Erreur d'accès à la base de données."""
    def __init__(self, operation: str, reason: str):
        super().__init__(
            message=f"Database error during '{operation}': {reason}",
            code="DATABASE_ERROR",
            details={"operation": operation, "reason": reason}
        )


class ExternalAPIError(DarkmediaException):
    """Erreur lors de l'appel à une API externe."""
    def __init__(self, service: str, status_code: int, response: str):
        super().__init__(
            message=f"External API '{service}' returned {status_code}: {response}",
            code="EXTERNAL_API_ERROR",
            details={"service": service, "status_code": status_code}
        )


# infrastructure_exceptions.py
class NetworkError(DarkmediaException):
    """Erreur réseau."""
    def __init__(self, endpoint: str, reason: str):
        super().__init__(
            message=f"Network error connecting to '{endpoint}': {reason}",
            code="NETWORK_ERROR",
            details={"endpoint": endpoint}
        )


class TimeoutError(DarkmediaException):
    """Dépassement de délai."""
    def __init__(self, operation: str, timeout_ms: int):
        super().__init__(
            message=f"Operation '{operation}' timed out after {timeout_ms}ms",
            code="TIMEOUT",
            details={"operation": operation, "timeout_ms": timeout_ms}
        )
```

### Try/Catch/Finally Pattern

```python
import logging
from typing import Optional

logger = logging.getLogger(__name__)

def get_user_with_fallback(user_id: int) -> Optional[User]:
    """Récupère un utilisateur avec fallback gracieux."""
    
    try:
        # Tentative normale
        logger.debug(f"Fetching user {user_id} from database")
        user = db.users.get(user_id)
        
        if not user:
            raise ResourceNotFoundError("User", str(user_id))
        
        return user
    
    except ResourceNotFoundError as e:
        # Erreur métier — log warning et retour None
        logger.warning(f"User not found: {e.message}")
        return None
    
    except DatabaseError as e:
        # Erreur applicative — log error et relancer
        logger.error(f"Database error: {e.message}", extra={"details": e.details})
        raise  # Relancer pour que le caller gère
    
    except Exception as e:
        # Erreur inattendue — log exception complète
        logger.exception(f"Unexpected error fetching user {user_id}")
        raise DarkmediaException(
            message="Internal server error",
            code="INTERNAL_ERROR",
            details={"original_error": str(e)}
        )
    
    finally:
        # Nettoyage toujours exécuté
        logger.debug("User fetch operation completed")
```

### Context Manager pour Ressources

```python
from contextlib import contextmanager
from typing import Generator

@contextmanager
def database_transaction() -> Generator:
    """Context manager pour les transactions DB."""
    session = None
    try:
        session = db.Session()
        yield session
        session.commit()
    except Exception as e:
        if session:
            session.rollback()
        logger.error(f"Transaction failed: {e}")
        raise
    finally:
        if session:
            session.close()


# Utilisation
def create_user_and_profile(email: str, name: str):
    with database_transaction() as session:
        user = User(email=email, name=name)
        session.add(user)
        session.flush()
        
        profile = UserProfile(user_id=user.id)
        session.add(profile)
        # Commit automatique à la sortie du context
```

### Retry Logic avec Exponential Backoff

```python
import time
from functools import wraps

def retry_with_backoff(
    max_attempts: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Décorateur pour retry avec exponential backoff."""
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 0
            delay = initial_delay
            
            while attempt < max_attempts:
                try:
                    return func(*args, **kwargs)
                
                except exceptions as e:
                    attempt += 1
                    if attempt >= max_attempts:
                        logger.error(
                            f"{func.__name__} failed after {max_attempts} attempts",
                            extra={"last_error": str(e)}
                        )
                        raise
                    
                    logger.warning(
                        f"{func.__name__} attempt {attempt} failed, retrying in {delay}s",
                        extra={"error": str(e)}
                    )
                    time.sleep(delay)
                    delay *= backoff_factor
            
            return None
        
        return wrapper
    return decorator


# Utilisation
@retry_with_backoff(
    max_attempts=3,
    initial_delay=0.5,
    exceptions=(NetworkError, TimeoutError)
)
def call_external_api(endpoint: str) -> dict:
    """Appel API avec retry automatique."""
    response = requests.get(endpoint, timeout=5)
    if response.status_code >= 500:
        raise ExternalAPIError(endpoint, response.status_code, response.text)
    return response.json()
```

---

## 📜 [JAVASCRIPT] Gestion d'Erreurs JavaScript/TypeScript

### Hiérarchie d'Erreurs Custom

```typescript
// errors/base.ts
export class DarkmediaError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// errors/domain.ts
export class ValidationError extends DarkmediaError {
  constructor(field: string, message: string, value?: any) {
    super(
      `Validation error on field '${field}': ${message}`,
      'VALIDATION_ERROR',
      400,
      { field, value }
    );
  }
}

export class DuplicateResourceError extends DarkmediaError {
  constructor(resourceType: string, identifier: string) {
    super(
      `${resourceType} with identifier '${identifier}' already exists`,
      'DUPLICATE_RESOURCE',
      409,
      { resourceType, identifier }
    );
  }
}

export class ResourceNotFoundError extends DarkmediaError {
  constructor(resourceType: string, identifier: string) {
    super(
      `${resourceType} with identifier '${identifier}' not found`,
      'RESOURCE_NOT_FOUND',
      404,
      { resourceType, identifier }
    );
  }
}

// errors/application.ts
export class DatabaseError extends DarkmediaError {
  constructor(operation: string, reason: string) {
    super(
      `Database error during '${operation}': ${reason}`,
      'DATABASE_ERROR',
      500,
      { operation, reason }
    );
  }
}

export class ExternalAPIError extends DarkmediaError {
  constructor(service: string, statusCode: number, response: string) {
    super(
      `External API '${service}' returned ${statusCode}: ${response}`,
      'EXTERNAL_API_ERROR',
      502,
      { service, statusCode }
    );
  }
}
```

### Async/Await Error Handling

```typescript
// ✅ BON — Gestion d'erreurs complète
async function getUserWithFallback(userId: number): Promise<User | null> {
  try {
    logger.debug(`Fetching user ${userId}`);
    const user = await db.users.findById(userId);

    if (!user) {
      throw new ResourceNotFoundError('User', String(userId));
    }

    return user;
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      logger.warn(`User not found: ${error.message}`);
      return null;
    }

    if (error instanceof DatabaseError) {
      logger.error(`Database error: ${error.message}`, { details: error.details });
      throw error;  // Relancer
    }

    // Erreur inattendue
    logger.error(`Unexpected error fetching user ${userId}`, { error });
    throw new DarkmediaError(
      'Internal server error',
      'INTERNAL_ERROR',
      500,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}

// ✅ BON — Promise.all avec gestion d'erreurs
async function fetchUserAndPosts(userId: number) {
  try {
    const [user, posts] = await Promise.all([
      db.users.findById(userId),
      db.posts.findByUserId(userId),
    ]);

    if (!user) {
      throw new ResourceNotFoundError('User', String(userId));
    }

    return { user, posts };
  } catch (error) {
    if (error instanceof DarkmediaError) {
      throw error;
    }
    throw new DatabaseError('fetch user and posts', String(error));
  }
}
```

### Express Error Middleware

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { DarkmediaError } from '../errors';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Logger l'erreur
  logger.error('Request error', {
    path: req.path,
    method: req.method,
    error: error instanceof DarkmediaError ? error.toJSON() : String(error),
  });

  // Gérer les erreurs connues
  if (error instanceof DarkmediaError) {
    return res.status(error.statusCode).json(error.toJSON());
  }

  // Erreur inconnue
  const genericError = new DarkmediaError(
    'Internal server error',
    'INTERNAL_ERROR',
    500
  );
  return res.status(500).json(genericError.toJSON());
}

// app.ts
app.use(errorHandler);
```

### Retry avec Exponential Backoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000,
  backoffFactor: number = 2
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt >= maxAttempts) {
        logger.error(`Operation failed after ${maxAttempts} attempts`, { error });
        throw error;
      }

      logger.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms`,
        { error }
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }

  throw new Error('Unexpected state');
}

// Utilisation
const data = await retryWithBackoff(
  () => callExternalAPI('/endpoint'),
  3,
  500,
  2
);
```

---

## 🔵 [POWERSHELL] Gestion d'Erreurs PowerShell

### Try/Catch/Finally

```powershell
# ✅ BON — Gestion complète d'erreurs
function Get-UserSafe {
    [CmdletBinding()]
    param([int]$UserId)

    try {
        Write-Verbose "Fetching user $UserId"
        $user = Get-User -Id $UserId -ErrorAction Stop

        if (-not $user) {
            throw "User not found"
        }

        return $user
    }
    catch [System.Management.Automation.ItemNotFoundException] {
        Write-Warning "User not found: $_"
        return $null
    }
    catch {
        Write-Error "Error fetching user: $_"
        throw
    }
    finally {
        Write-Verbose "Operation completed"
    }
}
```

### Error Action Preference

```powershell
# ✅ Définir localement pour chaque fonction
function Process-Data {
    param([string]$Path)
    
    $ErrorActionPreference = "Stop"
    
    try {
        $data = Get-Content -Path $Path
        # Continue seulement si lecture réussie
    }
    catch {
        Write-Error "Cannot read file: $_"
        return
    }
}
```

### Retry Logic

```powershell
function Invoke-WithRetry {
    param(
        [scriptblock]$ScriptBlock,
        [int]$MaxAttempts = 3,
        [int]$DelayMs = 1000
    )

    $attempt = 0

    while ($attempt -lt $MaxAttempts) {
        try {
            Write-Verbose "Attempt $($attempt + 1) of $MaxAttempts"
            return & $ScriptBlock
        }
        catch {
            $attempt++
            if ($attempt -ge $MaxAttempts) {
                throw "Operation failed after $MaxAttempts attempts: $_"
            }

            Write-Warning "Attempt $attempt failed, retrying in ${DelayMs}ms"
            Start-Sleep -Milliseconds $DelayMs
        }
    }
}
```

---

## 📊 [LOGGING] Logging Structuré d'Erreurs

### Contexte Enrichi

```python
import logging
import json
from contextvars import ContextVar

# Context var pour tracking des requêtes
request_id_var: ContextVar[str] = ContextVar('request_id', default='')

class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def error(self, message: str, **kwargs):
        """Log une erreur avec contexte."""
        context = {
            'message': message,
            'request_id': request_id_var.get(),
            'timestamp': datetime.utcnow().isoformat(),
            **kwargs
        }
        self.logger.error(json.dumps(context))
    
    def warning(self, message: str, **kwargs):
        """Log un avertissement."""
        context = {
            'message': message,
            'request_id': request_id_var.get(),
            **kwargs
        }
        self.logger.warning(json.dumps(context))
    
    def info(self, message: str, **kwargs):
        """Log une info."""
        context = {
            'message': message,
            'request_id': request_id_var.get(),
            **kwargs
        }
        self.logger.info(json.dumps(context))


# Utilisation
logger = StructuredLogger(__name__)

try:
    result = process_data()
except ValidationError as e:
    logger.error(
        "Validation failed",
        error_code=e.code,
        field=e.details.get('field'),
        value=e.details.get('value')
    )
```

---

## ✅ Checklist Gestion d'Erreurs

- [ ] Hiérarchie d'exceptions définie ✅
- [ ] Try/Catch/Finally utilisé correctement ✅
- [ ] Pas d'exceptions silencieuses ✅
- [ ] Logging avec contexte enrichi ✅
- [ ] Retry logic pour opérations transientes ✅
- [ ] Error codes standardisés ✅
- [ ] Messages d'erreur clairs pour utilisateurs ✅
- [ ] Stack traces en logs (pas en frontend) ✅
- [ ] Timeouts configurés ✅
- [ ] Circuit breaker pour appels externes ✅

---

**📌 Note**: Bonne gestion d'erreurs = système robuste et maintenable.