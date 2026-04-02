# 📡 Standards API REST et GraphQL

**Version**: 2.0 | **Standards**: REST, GraphQL, Versioning, Rate-Limiting

---

## 🌐 [REST] Architecture REST

### Principes RESTful

```
GET    /api/users           → Lister tous les utilisateurs
GET    /api/users/123       → Récupérer un utilisateur
POST   /api/users           → Créer un utilisateur
PATCH  /api/users/123       → Mettre à jour partiellement
DELETE /api/users/123       → Supprimer un utilisateur
```

### Réponses Standardisées

```typescript
// ✅ BON - Format cohérent
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com"
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "request_id": "req_abc123xyz"
  }
}

// Avec pagination
{
  "status": "success",
  "data": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}

// Erreur
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email invalide",
    "details": [
      {
        "field": "email",
        "message": "Must be valid email format"
      }
    ]
  },
  "request_id": "req_abc123xyz"
}
```

### Status Codes

```
✅ 2xx — Succès
  200 OK                   → Requête réussie
  201 Created              → Ressource créée
  204 No Content           → Succès sans réponse

⚠️ 4xx — Erreur Client
  400 Bad Request          → Requête malformée
  401 Unauthorized         → Auth requise
  403 Forbidden            → Accès refusé
  404 Not Found            → Ressource inexistante
  409 Conflict             → Conflit (ex: doublon)
  422 Unprocessable Entity → Validation error

❌ 5xx — Erreur Serveur
  500 Internal Server Error → Erreur serveur
  503 Service Unavailable   → Maintenance
```

### Endpoints Best Practices

```typescript
// ✅ BON - Endpoints clairs et RESTful
GET    /api/v1/users
GET    /api/v1/users/{id}
POST   /api/v1/users
PATCH  /api/v1/users/{id}
DELETE /api/v1/users/{id}

// Sous-ressources
GET    /api/v1/users/{userId}/posts
POST   /api/v1/users/{userId}/posts
GET    /api/v1/users/{userId}/posts/{postId}

// Filtrage et tri
GET    /api/v1/users?status=active&role=admin&sort=-created_at&limit=20&offset=0

// Actions spéciales (rares)
POST   /api/v1/users/{id}/send-email      // Action spéciale
POST   /api/v1/users/{id}/reset-password  // Action spéciale

// ❌ MAUVAIS - RPC-like
GET    /api/getUsers
POST   /api/createUser
GET    /api/getUserById?id=123
POST   /api/deleteUser?id=123
```

### Pagination Standard

```typescript
// Requête
GET /api/v1/users?page=2&per_page=20

// Réponse
{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": true,
    "next_page": 3,
    "prev_page": 1
  }
}

// Offset/Limit (alternative)
GET /api/v1/users?offset=20&limit=20
```

---

## 📊 [GRAPHQL] Architecture GraphQL

### Schema GraphQL

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
}

type Query {
  # Récupérer un utilisateur
  user(id: ID!): User
  
  # Lister les utilisateurs avec filtrage
  users(
    filter: UserFilter
    sort: [UserSort!]
    pagination: Pagination
  ): UserConnection!
  
  # Recherche textuelle
  search(query: String!): [SearchResult!]!
}

type Mutation {
  # Créer un utilisateur
  createUser(input: CreateUserInput!): CreateUserPayload!
  
  # Mettre à jour un utilisateur
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  
  # Supprimer un utilisateur
  deleteUser(id: ID!): DeleteUserPayload!
  
  # Créer un post
  createPost(input: CreatePostInput!): CreatePostPayload!
}

type Subscription {
  # S'abonner aux nouveaux posts
  postCreated: Post!
  
  # S'abonner aux changements d'utilisateur
  userUpdated(id: ID!): User!
}

# Types d'entrée
input UserFilter {
  role: UserRole
  status: String
  search: String
}

input UserSort {
  field: String!
  direction: SortDirection!
}

enum SortDirection {
  ASC
  DESC
}

input Pagination {
  first: Int
  after: String
  last: Int
  before: String
}

# Types de sortie
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type CreateUserPayload {
  success: Boolean!
  user: User
  errors: [Error!]
}

type Error {
  message: String!
  code: String!
  field: String
}
```

### Requêtes GraphQL Efficaces

```graphql
# ✅ BON - Demander seulement les champs nécessaires
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}

# ✅ BON - Avec variables
query GetUsers($filter: UserFilter, $limit: Int) {
  users(filter: $filter, pagination: {first: $limit}) {
    edges {
      node {
        id
        name
        email
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# ❌ MAUVAIS - Récupère tout
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
      content
      comments {
        id
        text
        author { ... }
      }
    }
    # ... tous les champs
  }
}
```

---

## 🔐 [VERSIONING] Gestion des Versions

### URL Versioning

```
GET /api/v1/users      → Version 1
GET /api/v2/users      → Version 2
GET /api/v3/users      → Version 3 (latest)
```

### Header Versioning

```
GET /api/users
Accept: application/vnd.darkmedia.v2+json
```

### Migration Strategy

```
v1: Stable, supporté
v2: Stable, supporté
v3: Latest, recommandé
v4: En développement

Deprecation:
v1 → v2: Annoncé 6 mois avant
v2 → v3: Annoncé 6 mois avant
```

---

## 🚦 [RATELIMIT] Rate Limiting

### Headers

```
X-RateLimit-Limit: 1000         → Requêtes max par minute
X-RateLimit-Remaining: 999       → Requêtes restantes
X-RateLimit-Reset: 1609459200   → Unix timestamp reset

429 Too Many Requests
Retry-After: 60                  → Attendre 60 secondes
```

### Stratégies

```python
# ✅ BON - Token bucket
class RateLimiter:
    def __init__(self, rate: int, period: int):
        self.rate = rate        # Tokens par period
        self.period = period    # Secondes
        self.tokens = rate
        self.last_update = time.time()
    
    def is_allowed(self, user_id: str) -> bool:
        now = time.time()
        elapsed = now - self.last_update
        
        # Ajouter les tokens gagnés
        self.tokens += elapsed * (self.rate / self.period)
        self.tokens = min(self.tokens, self.rate)
        self.last_update = now
        
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
```

---

## 🔑 [AUTH] Authentification et Autorisation

### Bearer Token (JWT)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Token Structure:
{
  "sub": "user_id",
  "iat": 1609459200,
  "exp": 1609545600,
  "role": "user",
  "permissions": ["read:posts", "write:posts"]
}
```

### OAuth2 / OpenID Connect

```
1. Client redirige vers auth provider
2. User se connecte
3. Provider retourne auth code
4. Client échange code pour token
5. Client utilise token pour API
```

### Scopes GraphQL

```graphql
directive @auth(requires: [String!]!) on FIELD_DEFINITION

type Query {
  secretData: String @auth(requires: ["admin"])
  myProfile: User @auth(requires: ["user"])
}
```

---

## 📝 [DOCUMENTATION] Documentation API

### OpenAPI / Swagger

```yaml
openapi: 3.0.0
info:
  title: Darkmedia API
  version: 1.0.0
  description: API principale de Darkmedia-X

servers:
  - url: https://api.darkmedia-x.dev/v1

paths:
  /users:
    get:
      summary: Lister les utilisateurs
      parameters:
        - name: page
          in: query
          schema: { type: integer }
        - name: per_page
          in: query
          schema: { type: integer }
      responses:
        '200':
          description: Liste des utilisateurs
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/User' }
                  pagination: { $ref: '#/components/schemas/Pagination' }
    post:
      summary: Créer un utilisateur
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateUserInput' }
      responses:
        '201':
          description: Utilisateur créé
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
        '400':
          description: Données invalides

components:
  schemas:
    User:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        email: { type: string, format: email }
      required: [id, name, email]
    
    CreateUserInput:
      type: object
      properties:
        name: { type: string, minLength: 1 }
        email: { type: string, format: email }
      required: [name, email]
```

### Documentation Interactive

```bash
# Swagger UI
GET /api/docs

# GraphQL Playground
GET /graphql
```

---

## ✅ Checklist API

- [ ] Endpoints RESTful bien nommés ✅
- [ ] Status codes corrects ✅
- [ ] Réponses standardisées ✅
- [ ] Pagination implémentée ✅
- [ ] Filtrage et tri ✅
- [ ] Rate limiting actif ✅
- [ ] Authentication (JWT/OAuth2) ✅
- [ ] Versioning API ✅
- [ ] Documentation (Swagger/GraphQL) ✅
- [ ] Error handling robuste ✅
- [ ] CORS configuré ✅
- [ ] Caching headers ✅

---

**📌 Note**: Une bonne API = adoption facile et maintenance simplifiée.