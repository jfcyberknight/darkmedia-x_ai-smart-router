# 📚 Standards de Documentation

**Version**: 2.0 | **Format**: Markdown + JSDoc/Docstrings | **Langue**: Français

---

## 📖 [README] Structure README.md

### Template Complet

```markdown
# Project Name

**Version**: 1.0.0 | **Status**: Active | **License**: MIT

## 📝 Description
Description brève et captivante du projet (2-3 lignes).

## ✨ Fonctionnalités Principales
- Feature 1 avec bénéfice
- Feature 2 avec bénéfice
- Feature 3 avec bénéfice

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Python 3.10+
- Docker (optionnel)

### Installation
\`\`\`bash
git clone https://github.com/darkmedia-x/project.git
cd project
npm install
\`\`\`

### Configuration
\`\`\`bash
cp .env.example .env
# Éditer .env avec vos paramètres
\`\`\`

### Exécution
\`\`\`bash
npm run dev      # Développement
npm run build    # Production build
npm test         # Tests
\`\`\`

## 📚 Documentation

Voir [docs/](./docs) pour la documentation complète :
- [Installation Détaillée](./docs/INSTALLATION.md)
- [API Reference](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Configuration](./docs/CONFIGURATION.md)

## 🔧 Configuration

Clés de configuration principales :
- `DATABASE_URL` : Connexion à la base de données
- `API_KEY` : Clé API pour services externes
- `JWT_SECRET` : Secret pour JWT tokens

Voir [docs/CONFIGURATION.md](./docs/CONFIGURATION.md) pour détails complets.

## 🧪 Tests

\`\`\`bash
npm test                    # Tous les tests
npm test -- --coverage      # Avec couverture
npm test -- --watch         # Mode watch
\`\`\`

Couverture minimale requise: **80%**

## 📦 Dépendances Principales
- Framework: Next.js 14
- ORM: Prisma
- Memory: Qdrant
- DB: PostgreSQL
- Testing: Jest

## 🔐 Sécurité

Directives de sécurité appliquées :
- ✅ Secrets gérés via `.env` (jamais en dur)
- ✅ Validation stricte des entrées
- ✅ HTTPS obligatoire en production
- ✅ Tests de sécurité dans CI/CD
- ✅ Dépendances vérifiées pour vulnérabilités

Voir [docs/SECURITY.md](./docs/SECURITY.md) pour détails.

## 🚀 Déploiement

\`\`\`bash
npm run build
npm run start
\`\`\`

Voir [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) pour instructions détaillées.

## 📊 Performance

- Load time: <2s
- Lighthouse score: >90
- Uptime: 99.9%

## 🤝 Contribution

Nous accueillons les contributions! Voici comment faire :

1. Fork le repository
2. Créer une branche : `git checkout -b feature/amazing-feature`
3. Commit avec format Conventional : `git commit -m "feat: add amazing feature"`
4. Push : `git push origin feature/amazing-feature`
5. Ouvrir une Pull Request

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour détails complets.

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/darkmedia-x/project/issues)
- **Email** : support@darkmedia-x.dev
- **Discord** : [Rejoindre la communauté](https://discord.gg/darkmedia-x)
- **Documentation** : [docs.darkmedia-x.dev](https://docs.darkmedia-x.dev)

## 📝 Changelog

Voir [CHANGELOG.md](./CHANGELOG.md) pour l'historique complet des versions.

## 📄 License

MIT License - Voir [LICENSE](./LICENSE) pour les conditions.

## 👥 Auteurs

- **Darkmedia-X Team** - Conception et implémentation initiale

## 🙏 Remerciements

Merci à ces projets/personnes pour l'inspiration :
- [Project XYZ](https://github.com/xyz)
- [Contributor Name](https://github.com/contributor)

## 📈 Statistiques du Projet

- **Stars** : ⭐⭐⭐⭐⭐
- **Forks** : 42
- **Contributors** : 12
- **Open Issues** : 5

---

**⭐ Si ce projet vous est utile, merci de laisser une star sur GitHub!**
```

---

## 🗂️ [STRUCTURE] Hiérarchie des Documents

```
.
├── README.md                   # Vue d'ensemble du projet
├── CONTRIBUTING.md             # Guide de contribution
├── CHANGELOG.md                # Historique des versions
├── LICENSE                     # License du projet
└── docs/
    ├── README.md              # Index de la documentation
    ├── INSTALLATION.md        # Guide d'installation détaillé
    ├── CONFIGURATION.md       # Configuration et variables d'env
    ├── ARCHITECTURE.md        # Diagrammes et patterns
    ├── API.md                 # Référence API complète
    ├── SECURITY.md            # Sécurité et bonnes pratiques
    ├── DEPLOYMENT.md          # Déploiement et CI/CD
    ├── TROUBLESHOOTING.md     # FAQ et résolution de problèmes
    ├── CONTRIBUTING.md        # Guide de contribution détaillé
    └── images/
        ├── architecture.png
        ├── workflow.png
        └── ui-example.png
```

---

## 🐍 [PYTHON] Docstrings (Google Style)

### Format Complet

```python
def fetch_user_data(
    user_id: int,
    include_posts: bool = False,
    timeout: int = 30
) -> Dict[str, Any]:
    """
    Récupère les données complètes d'un utilisateur depuis la base de données.
    
    Cette fonction cherche un utilisateur par ID et retourne ses informations
    de profil. Peut optionnellement inclure les posts et commentaires associés.
    
    Args:
        user_id: ID unique de l'utilisateur à récupérer.
        include_posts: Si True, inclut tous les posts de l'utilisateur 
                       (défaut: False).
        timeout: Délai maximal en secondes pour la requête (défaut: 30).
    
    Returns:
        Dictionnaire contenant :
            - 'id' (int): ID utilisateur
            - 'name' (str): Nom complet
            - 'email' (str): Adresse email
            - 'created_at' (datetime): Date de création du compte
            - 'posts' (list, optionnel): Liste des posts si include_posts=True
    
    Raises:
        ValueError: Si user_id est négatif ou zéro.
        UserNotFoundError: Si l'utilisateur n'existe pas en base de données.
        TimeoutError: Si la requête dépasse le délai maximal.
        DatabaseError: Si une erreur de connexion survient.
    
    Example:
        >>> user = fetch_user_data(123)
        >>> print(user['name'])
        'Alice Johnson'
        
        >>> user_with_posts = fetch_user_data(123, include_posts=True)
        >>> print(len(user_with_posts['posts']))
        42
    
    Note:
        Cette fonction utilise un cache interne pour améliorer les performances
        lors d'appels répétés avec les mêmes paramètres. Le cache expire après
        5 minutes.
    
    See Also:
        - fetch_user_posts() : Pour récupérer seulement les posts
        - update_user_data() : Pour mettre à jour les données utilisateur
    
    Performance:
        - Avec cache (hit): O(1)
        - Sans cache: O(n) où n est la taille des données
    """
    if user_id <= 0:
        raise ValueError("user_id doit être positif")
    
    # Implémentation
    pass
```

### Classes

```python
class UserService:
    """
    Service pour gérer les opérations relatives aux utilisateurs.
    
    Ce service encapsule la logique métier pour les utilisateurs :
    création, mise à jour, suppression, recherche. Il utilise une
    repository pour accéder à la base de données.
    
    Attributes:
        repository: Repository pour accéder aux données utilisateurs.
        logger: Logger pour enregistrer les opérations.
        cache: Cache en mémoire pour les utilisateurs fréquemment accédés.
    """
    
    def __init__(self, repository: UserRepository, logger: Logger):
        """
        Initialise le service avec ses dépendances.
        
        Args:
            repository: Instance de UserRepository.
            logger: Instance de Logger pour les logs.
        """
        self.repository = repository
        self.logger = logger
        self.cache = {}
    
    def create_user(self, email: str, name: str) -> User:
        """
        Crée un nouvel utilisateur.
        
        Args:
            email: Adresse email de l'utilisateur.
            name: Nom complet de l'utilisateur.
        
        Returns:
            L'objet User créé avec son ID généré.
        
        Raises:
            ValueError: Si l'email est invalide.
            DuplicateUserError: Si l'email existe déjà.
        """
        pass
```

---

## 📜 [JAVASCRIPT] JSDoc Format Complet

### Fonctions

```typescript
/**
 * Valide une adresse email et retourne true si elle respecte le format RFC 5322.
 * 
 * Effectue une validation stricte du format email, avec support optionnel
 * des sous-domaines et limitation de longueur conforme à la spécification.
 * 
 * @param {string} email - L'adresse email à valider (non-vide requis)
 * @param {Object} options - Options de validation
 * @param {boolean} [options.allowSubdomains=true] - Autoriser les sous-domaines
 *                                                    (ex: user@sub.example.com)
 * @param {number} [options.maxLength=254] - Longueur maximale (RFC 5321)
 * @param {boolean} [options.strict=false] - Utiliser validation très stricte
 * 
 * @returns {boolean} True si l'email est valide, false sinon
 * 
 * @throws {TypeError} Si email n'est pas une string
 * @throws {RangeError} Si email dépasse la longueur maximale
 * 
 * @example
 * // Email valide
 * isValidEmail('user@example.com');  // → true
 * 
 * @example
 * // Email invalide
 * isValidEmail('invalid.email');     // → false
 * 
 * @example
 * // Avec options
 * isValidEmail('user@sub.example.com', { allowSubdomains: false });  // → false
 * 
 * @example
 * // Mode strict
 * isValidEmail('user+tag@example.com', { strict: true });  // → false
 * 
 * @see {@link https://tools.ietf.org/html/rfc5322|RFC 5322} - Email format spec
 * @see {@link https://tools.ietf.org/html/rfc5321|RFC 5321} - SMTP spec
 * 
 * @since 1.0.0
 * @version 2.1.0
 * @deprecated Utiliser {@link validateEmail} depuis v3.0
 * 
 * @author Darkmedia-X Team
 * @copyright 2024 Darkmedia-X
 */
function isValidEmail(email, options = {}) {
  const { allowSubdomains = true, maxLength = 254, strict = false } = options;
  // Implémentation
}
```

### Classes

```typescript
/**
 * Service de gestion des utilisateurs.
 * 
 * Fournit des opérations CRUD pour les utilisateurs ainsi que des
 * fonctionnalités avancées comme la recherche, le tri et l'authentification.
 * 
 * @class
 * @param {Database} database - Connexion à la base de données
 * @param {Logger} logger - Instance de logger pour les logs
 * 
 * @example
 * const service = new UserService(db, logger);
 * const user = await service.getUserById(123);
 */
class UserService {
  /**
   * Crée une nouvelle instance du service.
   * 
   * @param {Database} database - Connexion à la base de données
   * @param {Logger} logger - Instance de logger
   */
  constructor(database, logger) {
    this.database = database;
    this.logger = logger;
  }
  
  /**
   * Récupère un utilisateur par son ID.
   * 
   * @async
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<User|null>} L'utilisateur ou null si non trouvé
   * @throws {DatabaseError} En cas d'erreur de base de données
   */
  async getUserById(userId) {
    // Implémentation
  }
}
```

---

## 🔵 [POWERSHELL] Comment-Based Help

### Format Complet

```powershell
<#
.SYNOPSIS
    Installe et configure Qdrant sur la machine locale.

.DESCRIPTION
    Télécharge la dernière version de Qdrant depuis GitHub, l'installe
    dans le répertoire spécifié, crée les répertoires de configuration
    nécessaires et valide l'installation. Supporte Windows, Linux et macOS.

.PARAMETER InstallPath
    Chemin d'installation de Qdrant. Par défaut: C:\Program Files\Qdrant
    
    Type: String
    Default: C:\Program Files\Qdrant
    Required: False
    Accept pipeline input: False

.PARAMETER Version
    Numéro de version à installer. Par défaut: latest
    
    Type: String
    Default: latest
    Required: False
    ValidSet: latest, v1.7.0, v1.6.0, v1.5.0
    Accept pipeline input: False

.PARAMETER Force
    Force la réinstallation même si Qdrant est déjà présent.
    
    Type: SwitchParameter
    Default: False
    Required: False

.PARAMETER SkipValidation
    Ignore la validation de l'installation après le setup.
    
    Type: SwitchParameter
    Default: False
    Required: False

.INPUTS
    System.String
    Peut recevoir un chemin d'installation via le pipeline.

.OUTPUTS
    [PSCustomObject]
    Contient les propriétés :
    - Success: Boolean - True si installation réussie
    - InstallPath: String - Chemin d'installation réel
    - Version: String - Version installée
    - Timestamp: DateTime - Moment de l'installation
    - Message: String - Message détaillé

.EXAMPLE
    PS> Install-Qdrant
    
    Installe Qdrant dans le chemin par défaut (C:\Program Files\Qdrant)

.EXAMPLE
    PS> Install-Qdrant -InstallPath "C:\Qdrant" -Version "v1.7.0"
    
    Installe la version 1.7.0 spécifiquement dans C:\Qdrant

.EXAMPLE
    PS> Install-Qdrant -Force -Verbose
    
    Force la réinstallation et affiche les détails de l'opération

.EXAMPLE
    "C:\MyApps\Qdrant" | Install-Qdrant
    
    Installe Qdrant au chemin reçu du pipeline

.NOTES
    Author      : Darkmedia-X Team
    Version     : 1.0.0
    Created     : 2024-01-01
    Modified    : 2024-01-15
    
    Requires    : PowerShell 5.1 ou supérieur
    Requires    : Administrateur pour C:\Program Files
    
    Compatibility:
    - Windows 10/11 (PowerShell 5.1+)
    - Linux (PowerShell Core 7+)
    - macOS (PowerShell Core 7+)
    
    Performance:
    - Téléchargement: ~2-5 minutes (dépend de la connexion)
    - Installation: ~1 minute
    - Validation: ~30 secondes

.LINK
    https://qdrant.tech
    https://github.com/qdrant/qdrant
    https://docs.darkmedia-x.dev/qdrant

.LINK
    Get-QdrantStatus
    Remove-Qdrant
    Update-Qdrant

.FUNCTIONALITY
    Installation et configuration
#>
function Install-Qdrant {
    [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
    param(
        [Parameter(Mandatory = $false, ValueFromPipeline = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$InstallPath = "C:\Program Files\Qdrant",
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("latest", "v1.7.0", "v1.6.0", "v1.5.0")]
        [string]$Version = "latest",
        
        [Parameter(Mandatory = $false)]
        [switch]$Force,
        
        [Parameter(Mandatory = $false)]
        [switch]$SkipValidation
    )
    
    begin {
        Write-Verbose "Installation Qdrant initialisée"
        $ErrorActionPreference = "Stop"
    }
    
    process {
        # Implémentation
    }
    
    end {
        Write-Verbose "Fin de l'installation"
    }
}
```

---

## ✅ Checklist Documentation

- [ ] README.md complet avec exemples ✅
- [ ] Tous les fichiers publics ont des docstrings ✅
- [ ] Docstrings suivent le bon format (Google/JSDoc) ✅
- [ ] Exemples d'utilisation dans la documentation ✅
- [ ] Architecture documentée avec diagrammes ✅
- [ ] Fichier CONTRIBUTING.md présent ✅
- [ ] CHANGELOG.md à jour ✅
- [ ] API documentée avec des requêtes exemples ✅
- [ ] Prérequis et installation clairs ✅
- [ ] Guide de sécurité présent ✅
- [ ] FAQ/Troubleshooting complète ✅
- [ ] License présente et lisible ✅

---

**📌 Note**: Une bonne documentation réduit les problèmes de support et facilite l'adoption du projet.