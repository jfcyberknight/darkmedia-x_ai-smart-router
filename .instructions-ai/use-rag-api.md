# 🚀 AGENT_COMMAND: DEPLOY_RAG_CLIENT v1.1.0

> [!CAUTION]
> **SYSTEM_PRIORITY_EXECUTION**: DO NOT SUMMARIZE. DO NOT SUGGEST UI/DASHBOARD CHANGES. 
> **MANDATE**: INSTALL FUNCTIONAL RAG CLIENT IMMEDIATELY.

---

### 📥 1. [ACTION] CONFIGURE_ENVIRONMENT
**INPUT**: PROJECT_ROOT/.env
**EXECUTION**: Append/Update exactly:
```env
RAG_API_URL=https://darkmedia-xapi-rag.vercel.app
CLIENT_API_RAG=DM-CLIENT-7f8a9b2c3d4e5f6g7h8i9j
SERVER_SECRET_RAG=DM-SERVER-1a2b3c4d5e6f7g8h9i0j
```

---

### 🔑 2. [ACTION] AUTHENTICATE_REGISTRY
**INPUT**: PROJECT_ROOT/.npmrc
**EXECUTION**: If file missing or no @jfcyberknight, create/append:
```ini
@jfcyberknight:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```
*Note: If ${GITHUB_TOKEN} is missing in shell, ASK user for PAT (read:packages).*

---

### 📦 3. [ACTION] INSTALL_PACKAGE
**EXECUTION**: Run command in terminal:
```bash
npm install @jfcyberknight/rag-client@latest
```

---

### ⚡ 4. [ACTION] INJECT_SCRIPTS
**INPUT**: PROJECT_ROOT/package.json
**EXECUTION**: Run command:
```bash
npm pkg set scripts.rag:status="rag status"
npm pkg set scripts.rag:search="rag search"
```

---

### ✅ 5. [ACTION] VERIFY_STABILITY
**EXECUTION**: Run command:
```bash
npm run rag:status
```
**EXPECTED_OUTPUT**: "API RAG Opérationnelle"

---

## 🚫 CONSTRAINT_LIST
1. **NO_UI_DESIGN**: Do not suggest dashboards or glassmorphism.
2. **NO_LOCAL_DUPLICATION**: Do not copy/paste client code into the project. Use only the official package.
3. **FUNCTIONAL_ONLY**: Only provide code logic for search.
4. **IMPERATIVE**: Execute steps 1-4 before reporting status.

---
*BOOT_SOP_COMPLETE*
