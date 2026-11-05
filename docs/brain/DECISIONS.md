# 🏛️ Histórico de Decisões Arquiteturais (ADRs) — PromoCraft

Este documento registra as decisões estratégicas e arquiteturais adotadas no desenvolvimento do PromoCraft.

---

### ADR-001: Next.js 16 App Router + Tailwind v4 + SQLite Local
- **Contexto:** Necessidade de renderização híbrida rápida (SSR/ISR) para páginas de promoções e jogos com baixo custo de hospedagem.
- **Decisão:** Uso do Next.js 16 com Turbopack, Tailwind CSS v4 para estilização com classes utilitárias modernas e SQLite (`better-sqlite3`) para persistência local rápida em WAL Mode.
- **Status:** Aceito e Implementado.

---

### ADR-002: Arquitetura Double-Gate (Portão 0 & Portão Final Git Master)
- **Contexto:** Garantir que o trabalho entre múltiplos ambientes (PC Trabalho vs PC Pessoal) não cause descompassos, divergências ou commits sem testes.
- **Decisão:** Toda tarefa se inicia verificando alterações remotas no GitHub (`git fetch origin`) antes do alinhamento técnico e encerra com validação técnica, testes, commit convencional e push.
- **Status:** Aceito e Padronizado.

---

### ADR-003: Governança Padrão Ouro de Repositório e Documentação
- **Contexto:** O repositório precisa ter identidade visual oficial, badges, documentação técnica clara e licença aberta formal.
- **Decisão:** Adotar a licença MIT oficial (2026), logo visual oficial (`public/logo.png`), badges dinâmicos, diagrama Mermaid de fluxo de dados e `.env.example`.
- **Status:** Aceito e Implementado.

---

### ADR-004: Segundo Cérebro Persistente e Zero Amnésia Local
- **Contexto:** Prevenir perda de contexto histórico sobre gotchas técnicos, dependências e decisões entre sessões de agentes.
- **Decisão:** Instituição do diretório `docs/brain/` contendo `INDEX.md`, `DECISIONS.md` e `GOTCHAS.md` navegáveis via wikilinks.
- **Status:** Aceito e Padronizado.

---

### ADR-005: Pipeline CI/CD com Node.js 22 LTS e Instalação Híbrida Resiliente
- **Contexto:** Dependências modernas como `@prisma/cli-engine`, `prisma@8` e `better-sqlite3@13` requerem Node `>=22.12.0`. Além disso, binários nativos de compilação do Tailwind Oxide diferem entre plataformas (Windows vs Linux).
- **Decisão:** Fixar `node-version: 22` no GitHub Actions runner (`ubuntu-latest`) e utilizar o comando resiliente `npm ci || npm install` para assegurar compatibilidade total entre os ambientes.
- **Status:** Aceito e Implementado.

---

### ADR-006: Assistente de Compra, SEO Dinâmico, Wishlist Híbrida e Testes Nativos (v1.1.0)
- **Contexto:** Melhorar a experiência gamer, o compartilhamento social viral e a retenção de usuários, além de garantir tolerância a falhas em ambientes serverless efêmeros e testes automáticos no CI/CD.
- **Decisão:**
  1. Criação do `DealVerdictCard` para análise de preço vs histórico, `CouponTracker` para cupons em 1 clique e `SteamDeckBadge` para jogos em PCs portáteis.
  2. Implementação de `generateMetadata`, `sitemap.ts` e `robots.ts` para SEO e rich social previews.
  3. Adoção da Wishlist Híbrida (`localStorage` prioritário com sincronização na API de banco), garantindo disponibilidade offline contínua.
  4. Implementação de suíte de testes com `node:test` nativo sem overhead de dependências externas.
- **Status:** Aceito e Implementado.

---

### ADR-007: Clean Code de Filtros, Formatação Cambial Centralizada e Polish Visual com Skeletons (v1.2.0)
- **Contexto:** Reduzir débito técnico no gerenciamento de estados do feed (anti-pattern de 9 parâmetros posicionais), eliminar formatações duplicadas de preço e elevar o acabamento visual da aplicação ao nível Linear/Steam.
- **Decisão:**
  1. Criação do contrato tipado `FilterState` e dispatcher imutável `applyFilters(partialUpdate)` em `DealsFeed.tsx`.
  2. Centralização da conversão e formatação monetária em `formatBRL` no módulo `currency.ts` com cobertura de testes unitários.
  3. Criação do componente `DealSkeleton` para carregamento suave sem layout shift.
  4. Correção tipográfica em `globals.css` garantindo o uso do `Geist Sans`, gradiente de ambient mesh glow e scrollbar estilizada.
- **Status:** Aceito e Implementado.

---

### ADR-008: Expansão de Lojas com GamersGate Nativa e Comparador de Marketplaces Híbrido (Eneba / Nuuvem / Kinguin) (v1.3.0)
- **Contexto:** Demanda dos usuários por expansão de lojas, especificamente GamersGate e marketplaces populares como Eneba e Kinguin. A CheapShark agrega apenas lojas 100% autorizadas pelas desenvolvedoras (por compliance), deixando marketplaces P2P fora de sua API pública.
- **Decisão:**
  1. **GamersGate Nativa (`storeID: 2`):** Ativada nos filtros rápidos e dropdowns do feed principal (`DealsFeed.tsx`), com resolução de link direto oficial em `links.ts`.
  2. **Comparador Híbrido de Marketplaces (`MarketplaceLinksCard.tsx`):** Adicionado à página de detalhes do jogo (`/game/[id]`), permitindo checar ofertas em tempo real na Eneba, Nuuvem e Kinguin com 1 clique.
  3. **Transparência e Procedência Gamer:** Inclusão de badges de distinção (Revendedor Oficial vs Marketplace de Chaves) e aviso de responsabilidade gamer orientando conferência de reputação de vendedores e taxas de pagamento.
  4. **Testes Unitários:** Expansão de `test/logic.test.mjs` para validar resolução de URLs da GamersGate, Humble Store e provedores de marketplace externo.
- **Status:** Aceito e Implementado.

---

### ADR-009: Redesign Gamer Moderno Inspirado na Nuuvem, Fundo Animado com GSAP, Tópicos Temáticos e Sidebar Multifacetada (v1.4.0)
- **Contexto:** Demanda por transformar a interface do PromoCraft em uma vitrine sedutora e moderna de alta conversão para gamers (referência direta: `nuuvem.com/br-pt`), substituindo o visual básico por atmosfera imersiva, prateleiras temáticas, fundo animado fluido e controle avançado de filtros.
- **Decisão:**
  1. **Fundo Animado com GSAP (`GsapBackground.tsx`):** Base escura gamer (`#090b0e`), grid isométrico sutil e orbes de luz fluida (esmeralda, ciano e violeta) animados com GSAP, com respeito a `prefers-reduced-motion` e cleanup estrito em `ctx.revert()`.
  2. **Hero Showcase Cinematográfico (`HeroShowcase.tsx`):** Vitrine interativa de super destaques estilo Nuuvem/Steam com transições GSAP, arte de fundo com desfoque cinematográfico, badge de desconto vibrante, cotação dupla BRL/USD, CTAs proeminentes e navegação por miniaturas.
  3. **Prateleiras Temáticas por Tópicos (`TopicsShelf.tsx`):** Coleções com rolagem horizontal suave para "Super Ofertas & Recordes Históricos (70%+ OFF)" e "Baratos Imperdíveis (Até R$ 30)".
  4. **Sidebar Multifacetada (`SidebarFilters.tsx`):** Navegação lateral completa com coleções temáticas, lojas com logos oficiais, faixas de preço regionalizadas em Reais (BRL), filtros de avaliação da comunidade e suporte a drawer no mobile.
  5. **Cards Elegantes e Sedutores (`DealCard.tsx`):** Efeito hover refinado com iluminação de borda, badges com gradiente energético, selos de lojas oficiais, compatibilidade Steam Deck e ações rápidas ("Comparar" e "Ir à Loja").
  6. **Testes Unitários Automatizados:** Testes expandidos em `test/logic.test.mjs` cobrindo conversão de faixas de preço em Reais e categorização de super negócios.
- **Status:** Aceito e Implementado.

---

### ADR-010: Implementação das 5 Frentes Estratégicas Gamer (v1.5.0)
- **Contexto:** Elevar o PromoCraft ao status de plataforma definitiva gamer, fornecendo ferramentas práticas diárias de economia e descoberta além do agregador de preços.
- **Decisão:**
  1. **Frente 1 (Descoberta & Steam Sync):** Criação do modal `SteamWishlistModal.tsx` para sincronização de lista de desejos do Steam em 1 clique e inclusão da seção de Gêneros Populares na `SidebarFilters.tsx`.
  2. **Frente 2 (Motor de Alertas Reais de Preço):** Criação do modal `PriceAlertModal.tsx` integrado aos cards de jogos, com suporte a Webhooks do Discord e teste instantâneo de notificação.
  3. **Frente 3 (PromoCraft AI Concierge):** Endpoint semântico `/api/ai-concierge` e modal interativo `AiConciergeModal.tsx` para busca em linguagem natural com justificativas gamer e pontuação inteligente.
  4. **Frente 4 (PWA Completo & Suporte Steam Deck):** Configuração do `manifest.json` com ícones dedicados e criação do `BottomNav.tsx` para navegação touch fluida em dispositivos móveis e navegadores portáteis.
  5. **Frente 5 (Regionalização Financeira Pix & Parcelamento):** Módulo `payment.ts` com cálculo de 10% de desconto à vista no Pix, parcelamento em até 3x sem juros e estimativa transparente de taxas em marketplaces.
  6. **Controles Globais:** Integração na Navbar através do componente `HomeClientControls.tsx`.
  7. **Cobertura de Testes:** Expansão para 20 testes unitários automatizados cobrindo cálculo financeiro Pix, parcelamento e estimativas de taxas.
- **Status:** Aceito e Implementado.

---

### ADR-011: Resiliência de SQLite em Serverless e Importação Robusta da Wishlist Steam (v1.5.1)
- **Contexto:** A rota `/api/wishlist/import-steam` apresentava erro 500 no ambiente serverless (Netlify). As causas identificadas foram: (1) filesystem `/var/task` estritamente read-only, falhando na escrita do SQLite em `data/promocraft.db`, (2) incompatibilidade com identificadores numéricos SteamID64 (17 dígitos), que requerem a rota `/wishlist/profiles/` e não `/wishlist/id/`, e (3) falhas de parsing JSON com `res.json()` ao receber respostas HTML de redirecionamento ou páginas privadas da Steam.
- **Decisão:**
  1. **SQLite Resiliente em Serverless (`src/lib/db.ts`):** Detecção automática de ambiente serverless (`NETLIFY`, `AWS_LAMBDA_FUNCTION_NAME`, `VERCEL`, `LAMBDA_TASK_ROOT`) gravando em `/tmp/promocraft.db`, com fallback instantâneo e gracioso para `:memory:` caso o acesso a disco seja bloqueado.
  2. **Módulo de Integração Steam (`src/lib/steam.ts`):** Funções utilitárias puras `parseSteamInput`, `getSteamWishlistUrls` e `parseSteamWishlistJson`. Suporte completo e transparente a Vanity URLs e perfis com SteamID64 de 17 dígitos, com estratégia de fallback mútuo entre `/id/` e `/profiles/`.
  3. **Tolerância a Falhas & Wishlist Híbrida (`/api/wishlist/import-steam` e `SteamWishlistModal.tsx`):** A rota de API retorna os objetos estruturados dos jogos com status 200 (ou mensagens descritivas amigáveis em caso de wishlist vazia/privada). Qualquer indisponibilidade de banco de dados não quebra a resposta HTTP, e o frontend grava imediatamente os itens importados no `localStorage` do cliente sob a chave `promocraft_wishlist_v1`.
  4. **Sincronização em Tempo Real:** Evento global customizado `wishlist-updated` e listener de `storage` para sincronizar automaticamente páginas, modais e contadores sem recarregamento forçado.
  5. **Cobertura de Testes Unitários:** Expansão da suíte para 27 testes unitários automatizados em `test/logic.test.mjs`.
- **Status:** Aceito e Implementado.
