# 🚨 Gotchas, Armadilhas & Lições Aprendidas — PromoCraft

Este documento registra armadilhas técnicas superadas e instruções preventivas para manter o projeto estável.

---

### 1. Requisito de Versão do Node (Node 22+)
- **Sintoma:** Alertas `EBADENGINE Unsupported engine` ou quebra na compilação do runner GitHub Actions.
- **Causa Raiz:** As versões recentes de `@prisma/cli-engine@0.9.0`, `@prisma/composer`, `better-sqlite3@13.0.3` e `prisma@8.0.0-rc.28` exigem explicitamente Node `>=22.12.0` ou `>=22`.
- **Prevenção:** Manter sempre `node-version: 22` nos workflows do GitHub Actions e utilizar Node 22+ em desenvolvimento local.

---

### 2. Sincronização do `package-lock.json` e Diferenças Cross-Platform
- **Sintoma:** Erro `npm error code EUSAGE: npm ci can only install packages when your package.json and package-lock.json are in sync`.
- **Causa Raiz:** Alterações nos metadados de `package.json` sem executar `npm install --package-lock-only`, somado a dependências nativas opcionais do Tailwind CSS Oxide que possuem binários distintos para Windows x64 e Linux x64.
- **Prevenção:** 
  1. Sempre rodar `npm install --package-lock-only` após alterar o `package.json`.
  2. No workflow de CI do GitHub Actions, utilizar a instrução resiliente `npm ci || npm install` para recuperar automaticamente diferenças de plataforma.

---

### 3. Execução do PowerShell no Windows (ExecutionPolicy)
- **Sintoma:** Erro `npm : O arquivo npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada neste sistema`.
- **Solução:** Chamar explicitamente `npm.cmd` em shells PowerShell no Windows.

---

### 4. Postinstall do Prisma em Ambientes sem Prisma Global
- **Sintoma:** Mensagem de erro durante instalação de pacotes caso o CLI do Prisma não esteja acessível.
- **Prevenção:** O script de postinstall em `package.json` possui proteção de saída neutra: `"postinstall": "prisma skills sync || exit 0"`.
