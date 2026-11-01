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

---

### 5. CheapShark API vs Marketplaces Cinzentos (GamersGate vs Eneba/Kinguin)
- **Sintoma:** Tentativa de buscar ofertas da Eneba ou Kinguin na API do CheapShark resulta em ausência de dados.
- **Causa Raiz:** A CheapShark mantém contratos de conformidade estritos com publishers e distribuidoras (Valve, CD Projekt, Capcom, etc.), agregando exclusivamente revendedores autorizados (GamersGate `storeID: 2`, Steam `storeID: 1`, GMG `storeID: 3`, Humble `storeID: 11`). Marketplaces de terceiros (mercado cinza/P2P) são banidos de suas rotas.
- **Solução:** Modelo híbrido à la GG.deals: GamersGate é consumida nativamente via API CheapShark com ID `2`, enquanto Eneba, Kinguin e Nuuvem são integradas via deep links de busca parametrizada no componente `MarketplaceLinksCard` com disclaimer de procedência.

---

### 6. GSAP no Next.js App Router e React 19 (SSR, StrictMode & Cleanup)
- **Sintoma:** Exceções do tipo `ReferenceError: window is not defined` ou animações acumulando/vazando memória em re-renderizações do React.
- **Causa Raiz:** O GSAP manipula a árvore DOM real e não pode ser executado no ambiente de renderização do servidor Node.js (SSR). Ademais, no React 18/19 com Strict Mode, os efeitos de montagem rodam duas vezes para detectar vazamentos.
- **Solução:** Sempre declarar `'use client'` nos componentes animados, instanciar tweens e timelines dentro de `useEffect` utilizando o padrão `gsap.context((self) => { ... }, containerRef)` e retornar obrigatoriamente `ctx.revert()` na função de cleanup do hook. Verificar preferência de movimento reduzido com `window.matchMedia('(prefers-reduced-motion: reduce)')`.

---

### 7. Tipagem Estrita em Parâmetros de Consulta (`DealsQueryParams`)
- **Sintoma:** Falha no step de `Build Next.js Application` do GitHub Actions com erro `Type 'string' is not assignable to type 'number'` ao invocar `fetchDeals`.
- **Causa Raiz:** A interface `DealsQueryParams` em `src/lib/cheapshark.ts` define propriedades numéricas estritas (`upperPrice?: number`, `lowerPrice?: number`, `steamRating?: number`). A passagem de literais de string (como `'6'`) é rejeitada pelo compilador TypeScript no build estrito do CI.
- **Prevenção:** Utilizar sempre números literais (`upperPrice: 6`) ou coerção numérica explícita (`Number(val)` / `parseFloat(val)`).
