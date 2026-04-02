# 🗄️ Standards Base de Données

**Version**: 2.0 | **Couverts**: SQL, NoSQL, ORM, Migrations, Indexation

---

## 🏗️ [DESIGN] Principes de Design de Base de Données

### Normalisation (Database Design)

```
BCNF (Boyce-Codd Normal Form) — Objectif idéal pour SQL

Règles:
1. Atomic values (1NF)
2. Full functional dependency (2NF)
3. No transitive dependency (3NF)
4. No anomalies (BCNF)

✅ BON — Table normalisée
users:
  - id (PK)
  - email (UNIQUE)
  - name
  - created_at

posts:
  - id (PK)
  - user_id (FK → users.id)
  - title
  - content
  - created_at

❌ MAUVAIS — Dénormalisé
users:
  - id
  - email
  - name
  - post_titles (TEXT array)  # Dénormalisé!
  - post_count (INTEGER)      # Redondant!
```

### Denormalization (Performance Trade-off)

```sql
-- ✅ BON — Dénormalisé seulement si performant
-- Table posts avec dénormalisation contrôlée
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    -- Dénormalisation intentionnelle pour performance
    user_name VARCHAR(255),  -- Cache du users.name
    user_email VARCHAR(255), -- Cache du users.email
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pour maintenir la cohérence
CREATE TRIGGER update_post_user_info
AFTER UPDATE ON users
FOR EACH ROW
UPDATE posts SET user_name = NEW.name, user_email = NEW.email
WHERE user_id = NEW.id;
```

---

## 🐘 [SQL] Standards PostgreSQL

### Configuration Initiale

```bash
# Installation
sudo apt-get install postgresql postgresql-contrib

# Création de la base
createdb my_project_db
createuser my_user -P  # Prompt pour password

# Configuration .env
DATABASE_URL=postgresql://my_user:password@localhost:5432/my_project_db
```

### Connection Pool

```python
# ✅ BON — Connection pooling avec psycopg2-pool
from psycopg_pool import ConnectionPool

pool = ConnectionPool(
    conninfo="dbname=my_project_db user=my_user password=secret host=localhost",
    min_size=5,
    max_size=20,
)

# Utilisation
with pool.connection() as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM users WHERE id = %s", (1,))
        result = cur.fetchone()
```

### Parameterized Queries (Anti-SQL Injection)

```python
# ❌ MAUVAIS — SQL Injection!
query = f"SELECT * FROM users WHERE id = {user_id}"
cursor.execute(query)

# ✅ BON — Parameterized
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_id,))
```

### Schema Migrations avec Alembic

```bash
# Installation
pip install alembic

# Initialiser
alembic init migrations

# Créer une migration
alembic revision --autogenerate -m "add users table"

# Appliquer les migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Migration Example

```python
# migrations/versions/001_create_users.py
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_table('users')
```

### Indexation (Performance)

```sql
-- ✅ Index sur colonnes fréquemment recherchées
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- ✅ Index composé pour requêtes multi-colonnes
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- ✅ Index partiel (pour subset de données)
CREATE INDEX idx_active_users ON users(id) WHERE is_active = true;

-- ✅ Index full-text pour recherche textuelle
CREATE INDEX idx_posts_content_fts ON posts USING GIN(to_tsvector('french', content));

-- ⚠️  ATTENTION — Trop d'index ralentit les writes!
```

### Constraints et Validation

```sql
-- ✅ BON — Constraints au niveau base de données
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL CHECK (length(name) > 0),
    age INTEGER CHECK (age >= 0 AND age <= 150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Unique constraint
    UNIQUE(email, organization_id)
);
```

---

## 🍃 [ORM] Utiliser un ORM

### SQLAlchemy (Python)

```python
# ✅ BON — ORM pour requêtes sûres
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    content = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    author = relationship("User", back_populates="posts")

# Utilisation
engine = create_engine("postgresql://user:password@localhost/db")
Session = sessionmaker(bind=engine)
session = Session()

# Créer un utilisateur
user = User(email="alice@example.com", name="Alice")
session.add(user)
session.commit()

# Requête
user = session.query(User).filter(User.email == "alice@example.com").first()

# Relationship
for post in user.posts:
    print(post.title)
```

### Prisma (JavaScript/TypeScript)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
  posts Post[]
  createdAt DateTime @default(now())
}

model Post {
  id    Int     @id @default(autoincrement())
  title String
  content String
  author User    @relation(fields: [userId], references: [id])
  userId Int
  createdAt DateTime @default(now())
}
```

```typescript
// Utilisation
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Créer
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
    posts: {
      create: [
        { title: 'Post 1', content: 'Content 1' }
      ]
    }
  }
});

// Requête
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
  include: { posts: true }
});

// Update
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Alice Updated' }
});

// Delete
await prisma.user.delete({
  where: { id: 1 }
});
```

---

## 🔄 [TRANSACTIONS] Transactions et Atomicité

### ACID Guarantees

```python
# ✅ BON — Transaction atomique
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)
session = Session()

try:
    # Multiple operations — all or nothing
    user = User(email="bob@example.com", name="Bob")
    session.add(user)
    session.flush()  # Get the user ID
    
    post = Post(title="My Post", content="Content", user_id=user.id)
    session.add(post)
    
    session.commit()  # ACID guarantee
except Exception as e:
    session.rollback()  # Tout est annulé en cas d'erreur
    raise
finally:
    session.close()
```

### Isolation Levels

```sql
-- ✅ DEFAULT — READ COMMITTED (bon compromis)
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- SERIALIZABLE — Strictest (lent mais sûr)
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- REPEATABLE READ — Bon pour reports
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

---

## 🗝️ [RELATIONSHIPS] Relations et Foreign Keys

### One-to-Many

```python
# ✅ BON — One user has many posts
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="posts")
```

### Many-to-Many

```python
# ✅ BON — Many students have many courses
association_table = Table(
    'student_course',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True)
    courses = relationship("Course", secondary=association_table)

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    students = relationship("Student", secondary=association_table)
```

### Cascading Deletes

```python
# ✅ BON — Cascade delete pour intégrité référentielle
user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
# Si user est supprimé, tous ses posts sont supprimés aussi
```

---

## 📊 [OPTIMIZATION] Optimisation des Requêtes

### N+1 Query Problem

```python
# ❌ MAUVAIS — N+1 queries (lent!)
users = session.query(User).all()
for user in users:
    print(user.posts)  # 1 query par user = N+1!

# ✅ BON — Eager loading
users = session.query(User).options(joinedload(User.posts)).all()
for user in users:
    print(user.posts)  # Déjà chargé!
```

### Pagination

```python
# ✅ BON — Pagination pour grandes datasets
page = 1
per_page = 20

users = session.query(User)\
    .offset((page - 1) * per_page)\
    .limit(per_page)\
    .all()
```

### Bulk Operations

```python
# ✅ BON — Bulk insert (beaucoup plus rapide)
users = [
    User(email=f"user{i}@example.com", name=f"User{i}")
    for i in range(1000)
]
session.add_all(users)
session.commit()

# ✅ BON — Bulk update
session.query(User).filter(User.is_active == False).update({User.deleted_at: datetime.now()})
session.commit()
```

### Query Analysis

```sql
-- ✅ Analyser les requêtes lentes
EXPLAIN ANALYZE
SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC;

-- Résultat montre le plan d'exécution et le temps réel
```

---

## 🔐 [BACKUP] Sauvegarde et Récupération

### Backup Réguliers

```bash
# ✅ BON — Backup complet
pg_dump -U user -h localhost my_database > backup_$(date +%Y%m%d_%H%M%S).sql

# ✅ BON — Backup compressé
pg_dump -U user -h localhost my_database | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# ✅ BON — Restauration
psql -U user -h localhost my_database < backup.sql
```

### Automatisation avec Cron

```bash
# Ajouter au crontab
0 2 * * * pg_dump -U postgres my_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Nettoyer les vieux backups (>30 jours)
0 3 * * * find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

---

## ✅ Checklist Base de Données

- [ ] Schema normalisé (BCNF) ✅
- [ ] Foreign keys avec constraints ✅
- [ ] Indexes sur colonnes recherchées ✅
- [ ] Migrations versionnées (Alembic) ✅
- [ ] Connection pooling activé ✅
- [ ] ORM utilisé (pas de raw SQL) ✅
- [ ] Queries optimisées (pas de N+1) ✅
- [ ] Transactions ACID pour opérations critiques ✅
- [ ] Backups automatisés et testés ✅
- [ ] Monitoring et alertes en place ✅

---

**📌 Note**: Une bonne DB foundation = application scalable et maintenable.