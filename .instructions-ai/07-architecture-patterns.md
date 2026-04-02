# 🏗️ Patterns d'Architecture et Design

**Version**: 2.0 | **Principes**: SOLID, Clean Code, DRY

---

## 🎯 [SOLID] Principes SOLID

### S - Single Responsibility Principle
Une classe = une responsabilité unique

```python
# ✅ BON - Responsabilités séparées
class UserValidator:
    def validate_email(self, email: str) -> bool:
        return "@" in email and "." in email

class UserRepository:
    def create(self, email: str) -> User:
        return self.db.insert("users", {"email": email})

class UserService:
    def __init__(self, validator, repo):
        self.validator = validator
        self.repo = repo
    
    def create_user(self, email: str) -> User:
        if not self.validator.validate_email(email):
            raise ValueError("Email invalide")
        return self.repo.create(email)

# ❌ MAUVAIS - Trop de responsabilités dans une classe
class UserManager:
    def create_user(self, email, password):
        # Validation, hashing, DB insert, email sending...
        pass
```

### O - Open/Closed Principle
Ouvert à l'extension, fermé à la modification

```typescript
// ✅ BON - Extensible sans modifier le code existant
interface ReportStrategy {
  generate(data: any[]): string;
}

class CSVReport implements ReportStrategy {
  generate(data: any[]): string {
    return data.map(row => Object.values(row).join(',')).join('\n');
  }
}

class JSONReport implements ReportStrategy {
  generate(data: any[]): string {
    return JSON.stringify(data, null, 2);
  }
}

class ReportGenerator {
  constructor(private strategy: ReportStrategy) {}
  generate(data: any[]): string {
    return this.strategy.generate(data);
  }
}

// Utilisation - on peut ajouter XMLReport sans modifier ReportGenerator
const csvReport = new ReportGenerator(new CSVReport());
const jsonReport = new ReportGenerator(new JSONReport());
```

### L - Liskov Substitution Principle
Les subclasses doivent être interchangeables avec la classe parente

```python
# ✅ BON - Subclasses substituables
class Animal:
    def make_sound(self) -> str:
        raise NotImplementedError

class Dog(Animal):
    def make_sound(self) -> str:
        return "Woof!"

class Cat(Animal):
    def make_sound(self) -> str:
        return "Meow!"

def animal_sound(animal: Animal) -> str:
    return animal.make_sound()

# Fonctionne avec n'importe quel Animal
print(animal_sound(Dog()))  # Woof!
print(animal_sound(Cat()))  # Meow!
```

### I - Interface Segregation Principle
Interfaces spécifiques plutôt que générales

```typescript
// ❌ MAUVAIS - Interface trop grosse
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  payTaxes(): void;
}

// ✅ BON - Interfaces ségrégées
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

class Human implements Workable, Eatable, Sleepable {
  work(): void { }
  eat(): void { }
  sleep(): void { }
}

class Robot implements Workable {
  work(): void { }
  // N'implémente pas eat() et sleep()
}
```

### D - Dependency Inversion Principle
Dépendre des abstractions, pas des implémentations concrètes

```python
# ✅ BON - Injection de dépendance
from abc import ABC, abstractmethod

class Database(ABC):
    @abstractmethod
    def query(self, sql: str):
        pass

class PostgresDB(Database):
    def query(self, sql: str):
        # Connexion PostgreSQL réelle
        pass

class MockDB(Database):
    def query(self, sql: str):
        # Mock pour les tests
        return []

class UserService:
    def __init__(self, db: Database):  # Dépend de l'abstraction
        self.db = db
    
    def get_user(self, user_id: int):
        return self.db.query(f"SELECT * FROM users WHERE id = {user_id}")

# Production
user_service = UserService(PostgresDB())

# Tests
user_service_test = UserService(MockDB())
```

---

## 🔄 [PATTERNS] Design Patterns Courants

### Singleton - Une seule instance globale
```python
# ✅ BON - Une seule instance partagée
class Database:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def query(self, sql: str):
        pass

# Même instance partout
db1 = Database()
db2 = Database()
assert db1 is db2  # True
```

### Factory - Créer objets sans spécifier les classes
```typescript
// ✅ BON - Déléguer la création
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

class FileLogger implements Logger {
  constructor(private filepath: string) {}
  log(message: string): void {
    // Écrire dans le fichier
  }
}

class LoggerFactory {
  static create(type: 'console' | 'file', filepath?: string): Logger {
    if (type === 'console') return new ConsoleLogger();
    if (type === 'file' && filepath) return new FileLogger(filepath);
    throw new Error('Unknown logger type');
  }
}

const logger = LoggerFactory.create('console');
```

### Observer - Notifier plusieurs objets
```python
# ✅ BON - Pattern publish-subscribe
class Subject:
    def __init__(self):
        self._observers = []
    
    def attach(self, observer):
        self._observers.append(observer)
    
    def detach(self, observer):
        self._observers.remove(observer)
    
    def notify(self, event):
        for observer in self._observers:
            observer.update(event)

class Observer:
    def update(self, event):
        raise NotImplementedError

class ConcreteObserver(Observer):
    def update(self, event):
        print(f"Observer received: {event}")

# Utilisation
subject = Subject()
obs1 = ConcreteObserver()
obs2 = ConcreteObserver()
subject.attach(obs1)
subject.attach(obs2)
subject.notify("event happened")  # Notifie tous
```

### Decorator - Ajouter fonctionnalités dynamiquement
```python
# ✅ BON - Wrapper pour ajouter comportement
def log_execution(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Finished {func.__name__}")
        return result
    return wrapper

@log_execution
def my_function(x):
    return x * 2

my_function(5)  # Logging automatique
```

### Strategy - Changer l'algorithme à l'exécution
```typescript
// ✅ BON - Sélectionner l'algorithme à l'exécution
interface SortStrategy {
  sort(data: number[]): number[];
}

class QuickSort implements SortStrategy {
  sort(data: number[]): number[] {
    # ...
    return data.sort();
  }
}

class BubbleSort implements SortStrategy {
  sort(data: number[]): number[] {
    # ...
    return data.sort();
  }
}

class Sorter {
  constructor(private strategy: SortStrategy) {}
  
  sort(data: number[]): number[] {
    return this.strategy.sort(data);
  }
}

const sorter = new Sorter(new QuickSort());
const sorted = sorter.sort([3, 1, 2]);  # Utilise QuickSort
```

---

## 📊 [DASHBOARDS] Dashboards as Complete Applications

**Loi Système** : Tout dashboard développé pour Darkmedia-X **DOIT** être une application structurée complète et non un simple fichier HTML statique.

### Architecture Requise
1. **Framework/Bundler** : Utiliser **Vite** (recommandé) ou **Next.js**.
2. **Structure de dossiers** :
   - `/src` : Code source (JS/TS)
   - `/src/components` : Composants UI réutilisables
   - `/src/styles` : Fichiers CSS (Vanilla CSS uniquement)
   - `/public` : Assets statiques
3. **Qualité** :
   - Gestion des dépendances via `pnpm`.
   - Linting (ESLint) et Formatting (Prettier) obligatoires.
   - Typescript fortement recommandé.
4. **Build** :
   - Capacité à générer un bundle optimisé (`pnpm build`).

### Exemple de Structure Standard
```
dashboard-project/
├── src/
│   ├── components/
│   │   ├── Sidebar.js
│   │   └── MetricCard.js
│   ├── styles/
│   │   ├── main.css
│   │   └── variables.css
│   ├── main.js
│   └── index.html
├── public/
├── package.json
├── vite.config.js
└── .gitignore
```

### Avantages
- Meilleure maintenabilité et scalabilité.
- Performance optimisée via bundling.
- Intégration facile de librairies de visualisation (D3, Chart.js).
- Pipeline CI/CD standardisé.

---

## 🏛️ [ARCHITECTURE] Patterns d'Architecture

### Layered Architecture (3-Tier)
```
┌──────────────────────────────────────┐
│   Presentation Layer                 │
│   (Controllers, Routes, API)          │
├──────────────────────────────────────┤
│   Business Logic Layer                │
│   (Services, Use Cases)               │
├──────────────────────────────────────┤
│   Data Access Layer                   │
│   (Repositories, ORM)                 │
├──────────────────────────────────────┤
│   Database Layer                      │
│   (PostgreSQL, MongoDB, etc.)         │
└──────────────────────────────────────┘
```

**Avantages**: Simple, facile à comprendre
**Inconvénients**: Peut devenir monolithique

### Microservices Architecture
```
┌──────────────┬──────────────┬──────────────┐
│ User Service │ Order Service│Payment Service│
├──────────────┼──────────────┼──────────────┤
│  User DB     │  Order DB    │ Payment DB   │
└──────────────┴──────────────┴──────────────┘
           ↓         ↓         ↓
        API Gateway
           ↓
       Message Queue
      (RabbitMQ, Kafka)
```

**Avantages**: Scalabilité, déploiement indépendant
**Inconvénients**: Complexité opérationnelle

### Clean Architecture
```
┌────────────────────────────────────────┐
│          Entities (Domain)             │
│   (User, Order, Product models)        │
├────────────────────────────────────────┤
│     Use Cases (Application Logic)      │
│   (CreateUser, PlaceOrder)             │
├────────────────────────────────────────┤
│  Interface Adapters                    │
│  (Controllers, Gateways, Presenters)   │
├────────────────────────────────────────┤
│  Frameworks & Drivers                  │
│  (DB, Web Framework, External APIs)    │
└────────────────────────────────────────┘
```

**Avantages**: Très testable, indépendant de frameworks
**Inconvénients**: Peut être over-engineering pour petits projets

### CQRS (Command Query Responsibility Segregation)
```
Write Path (Commands)          Read Path (Queries)
    ↓                               ↓
Command Handler          Query Handler
    ↓                               ↓
Update Database          Read from Cache/Read DB
    ↓                               ↓
Publish Events           Return Results
    ↓
Event Handlers Update Cache
```

**Avantages**: Optimisation read/write, scalabilité
**Inconvénients**: Complexité, eventual consistency

---

## 📁 [PROJECT] Structure de Projet Standard

```
project/
├── src/
│   ├── domain/                    # Entities, Value Objects (cœur du métier)
│   │   ├── __init__.py
│   │   ├── user.py               # Entity User
│   │   ├── order.py              # Entity Order
│   │   └── exceptions.py          # Domain exceptions
│   │
│   ├── application/              # Use Cases, Application Services
│   │   ├── __init__.py
│   │   ├── user_service.py       # Service pour User
│   │   ├── order_service.py      # Service pour Order
│   │   └── dto/                  # Data Transfer Objects
│   │       └── user_dto.py
│   │
│   ├── infrastructure/           # Repositories, External APIs
│   │   ├── __init__.py
│   │   ├── repositories/
│   │   │   ├── user_repository.py
│   │   │   └── order_repository.py
│   │   ├── database.py           # Database connection
│   │   └── external_api.py       # External API clients
│   │
│   ├── presentation/             # Controllers, Routes
│   │   ├── __init__.py
│   │   ├── user_controller.py
│   │   ├── order_controller.py
│   │   └── middleware.py
│   │
│   └── main.py                   # Entry point
│
├── tests/
│   ├── unit/                     # Unit tests (sans dépendances)
│   │   └── test_user_service.py
│   ├── integration/              # Integration tests (avec DB)
│   │   └── test_user_repository.py
│   └── e2e/                      # End-to-end tests
│       └── test_user_workflow.py
│
├── docs/
│   └── ARCHITECTURE.md
│
├── .env.example
├── pyproject.toml
├── README.md
└── .pre-commit-config.yaml
```

---

## 🔌 [DI] Injection de Dépendances

### Container de DI Simple
```python
# ✅ BON - Container pour gérer les dépendances
from typing import Any, Dict

class DIContainer:
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._factories: Dict[str, callable] = {}
    
    def register(self, name: str, service: Any):
        """Enregistrer un service singleton."""
        self._services[name] = service
    
    def register_factory(self, name: str, factory: callable):
        """Enregistrer une factory (crée une nouvelle instance à chaque fois)."""
        self._factories[name] = factory
    
    def get(self, name: str) -> Any:
        """Récupérer un service."""
        if name in self._services:
            return self._services[name]
        if name in self._factories:
            return self._factories[name]()
        raise KeyError(f"Service '{name}' not registered")

# Utilisation
container = DIContainer()

# Enregistrer les dépendances
db = Database()
container.register('db', db)

user_repo = UserRepository(db)
container.register('user_repo', user_repo)

user_service = UserService(user_repo)
container.register('user_service', user_service)

# Utiliser
service = container.get('user_service')
```

### Dependency Injection Framework (Python)
```python
# Avec un framework comme dependency-injector
from dependency_injector import containers, providers

class Container(containers.DeclarativeContainer):
    config = providers.Configuration()
    
    database = providers.Singleton(
        Database,
        host=config.db.host,
        port=config.db.port
    )
    
    user_repository = providers.Factory(
        UserRepository,
        db=database
    )
    
    user_service = providers.Factory(
        UserService,
        repository=user_repository
    )

# Utilisation
container = Container()
service = container.user_service()
```

---

## ✅ Checklist Architecture

- [ ] Principes SOLID appliqués ✅
- [ ] Design Patterns appropriés utilisés ✅
- [ ] Architecture scalable et maintenable ✅
- [ ] Separation of Concerns respectée ✅
- [ ] Code testable (dépendances injectées) ✅
- [ ] Documentation Architecture présente ✅
- [ ] Pas de couplage fort ✅
- [ ] Erreurs et exceptions bien gérées ✅

---

**📌 Note**: Une bonne architecture facilite les tests, la maintenance et la scalabilité future.