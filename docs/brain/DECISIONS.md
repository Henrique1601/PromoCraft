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

---

### ADR-012: Padrão Ouro de Modais com React Portal, Trava de Scroll e Design Refinado na Navbar (v1.5.2)
- **Contexto:** Relato de bug visual nos modais acionados pelos botões da navbar (`AiConciergeModal`, `SteamWishlistModal` e `PriceAlertModal`). O cabeçalho dos modais ficava cortado no topo da janela do navegador devido à criação de um *Containing Block* isolado decorrente de `backdrop-filter: blur(...)` e `sticky` no `<header>`, impedindo o comportamento correto de `position: fixed; inset: 0`.
- **Decisão:**
  1. **Teletransporte com React Portal:** Implementação de `createPortal(modalContent, document.body)` em todos os modais da aplicação com verificação segura de hidratação SSR (`mounted`).
  2. **Camada Global Z-Index e Scroll Seguro:** Elevação da camada para `z-[100]`, inclusão de `overflow-y-auto` no container externo e centralização vertical com `my-auto`, impedindo clipping em telas com altura reduzida (laptops, janelas restauradas, barras de favoritos duplas).
  3. **Trava de Scroll & Acessibilidade:** Bloqueio do scroll do `body` enquanto o modal estiver aberto e fechamento universal ao pressionar `Escape`.
  4. **Polish Visual dos Botões da Navbar:** Estilização com gradientes sutis, microinterações tátil no clique (`active:scale-[0.98]`), efeito glow e badges indicadores.
- **Status:** Aceito e Implementado.

---

### ADR-013: Implementação das Frentes Estratégicas 2 a 5 Gamer (v1.6.0)
- **Contexto:** Solicitação para implementação das melhorias nas Frentes 2 a 5: Design Gamer com fundo animado em páginas internas, toasts de notificação, Command Palette rápida (`Ctrl+K`), prateleira de jogos 100% grátis, Wishlist 2.0 com painel financeiro, suporte a Telegram e Schema.org JSON-LD para SEO.
- **Decisão:**
  1. **Frente 2 (Design Gamer & Toasts):**
     - Inclusão do `GsapBackground` nas páginas `/game/[id]` e `/wishlist` para atmosfera fluida e cinematográfica contínua.
     - Criação do `ToastProvider` e hook `useToast` para notificações toast flutuantes e táteis.
     - Simulação de preço à vista no Pix (10% OFF) e parcelamento sem juros na tabela comparativa de lojas.
  2. **Frente 3 (Descoberta & Command Palette):**
     - Criação do `CommandPalette.tsx` com atalho global `Ctrl+K` / `Cmd+K`, debounce de pesquisa e navegação por setas do teclado.
     - Prateleira de *Jogos 100% Grátis & Giveaways* na Home com ofertas zeradas da Epic e Steam.
  3. **Frente 4 (Wishlist 2.0 & Gamificação Financeira):**
     - Dashboard financeiro no topo da `/wishlist` com Valor no Menor Preço Hoje, Preço Cheio de Tabela e Economia Total Acumulada em R$ (-X% OFF).
     - Compartilhamento visual com resumo formatado de economia.
     - Suporte a alerta via Telegram Chat ID nos modais e na tabela do SQLite.
  4. **Frente 5 (Qualidade & SEO Rich Snippets):**
     - Inserção de dados estruturados Schema.org (`Product`, `AggregateOffer`) via JSON-LD em `/game/[id]`.
     - Tratamento resiliente de imagens em `DealCard.tsx` com fallback automático via `onError`.
     - Expansão da suíte para 30 testes unitários automatizados cobrindo métricas financeiras e giveaways.
- **Status:** Aceito e Implementado.


---

### ADR-014: Suíte Gamer Completa: Requisitos de Sistema Hardware, Gamificação da Wishlist, Modo Versus, Câmbio Multi-Moedas e Central de Giveaways ao Vivo (v1.7.0)
- **Contexto:** Solicitação para implementação de todas as 5 novas frentes de inovação gamer (A até E), transformando o PromoCraft em uma plataforma de inteligência de compras e hardware completa para PC Gamers.
- **Decisão:**
  1. **Frente A (Hardware & Requisitos de Sistema - "Roda no Meu PC?"):**
     - Endpoint `/api/steam/specs` que consulta a Steam Store API oficial (`appdetails`), realizando cache de 24 horas por jogo e normalizando especificações mínimas e recomendadas.
     - Componente `SystemRequirementsCard.tsx` integrado na página `/game/[id]` com alternância entre abas de especificações Mínimas e Recomendadas em design escuro refinado.
     - Novo tópico rápido de filtragem `steam_deck` ("🔋 Steam Deck & Portáteis") na `SidebarFilters.tsx`.
  2. **Frente B (Gamificação & Conquistas de Economia Gamer):**
     - Componente `WishlistAchievements.tsx` integrado na `/wishlist`.
     - Sistema de 6 badges dinâmicos baseados no comportamento financeiro do gamer: *Sniper de Recordes*, *Mão de Vaca Lendário*, *Cidadão da Valve*, *Mestre do Orçamento*, *Guardião de Preço* e *Caçador de Freebies*.
     - Sistema de Nível Gamer (Nível 1 a 5) com pontuação XP, cálculo de progresso percentual e títulos dinâmicos.
  3. **Frente C (Comparador Lado a Lado - Modo Versus):**
     - Modal interativo `GameVersusModal.tsx` acionado pelo botão `GameVersusButton.tsx` no cabeçalho do jogo.
     - Busca em tempo real pelo segundo jogo via `/api/deals?title=...` com sugestões pré-configuradas.
     - Duelo direto exibindo Menor Preço Atual, Preço no Pix (-10%), Desconto %, Recorde Histórico e veredito inteligente de quem vence a disputa de preço.
     - Implementação com `createPortal(content, document.body)` para evitar bloqueio por containing block e isolamento de contexto.
  4. **Frente D (Câmbio Global Multi-Moedas Instantâneo):**
     - Expansão do módulo `src/lib/currency.ts` com tipagem `CurrencyCode` (`BRL`, `USD`, `EUR`), dicionário de moedas e formatador `formatCurrencyPrice`.
     - Componente `CurrencySelector.tsx` com bandeiras (`🇧🇷 BRL`, `🇺🇸 USD`, `🇪🇺 EUR`), dropdown acessível, persistência no `localStorage` e disparo de evento `currency-changed`.
  5. **Frente E (Central de Giveaways ao Vivo):**
     - Rota `/api/giveaways/route.ts` que integra a GamerPower API para jogos de PC com cache TTL de 10 minutos e fallback automático.
     - Modal `GiveawaysModal.tsx` com teletransporte React Portal, campo de busca em tempo real, badges de plataformas autorizadas (Epic Games, Steam, GOG) e links diretos para resgate oficial.
     - Botão com pulso esmeralda ao vivo "🎁 Giveaways" e seletor de moedas na barra superior (`HomeClientControls.tsx`).
  6. **Governança & Testes:**
     - Incremento semântico de versão no `package.json` para `1.7.0`.
     - Expansão da suíte de testes unitários para 37 testes automatizados (`node --test test/**/*.test.mjs`), todos passando com 100% de sucesso.
- **Status:** Aceito e Implementado.


---

### ADR-015: Master Plan PromoCraft v2.0 — Pilares 1 a 5 Completos
- **Contexto:** Solicitação da execução completa dos 5 pilares estratégicos de evolução do produto para consolidar o PromoCraft como plataforma líder de inteligência de compras e PC Gaming.
- **Decisões:**
  1. **Pilar 1 (Arquitetura de Dados & Resiliência Offline):**
     - Módulo `src/lib/offlineCache.ts` implementando camada de cache local com TTL dinâmico de 15 minutos para acelerar pesquisas e navegação sem re-fetching redundante.
  2. **Pilar 2 (Design Gamer & Microinterações A+):**
     - Módulo `src/lib/gameMetrics.ts` com cálculo de Custo por Hora de Jogo (estimativa de campanha via HowLongToBeat heurística/base curada).
     - Componente `CostPerHourBadge.tsx` integrado nos cards do feed (`DealCard.tsx`) e na página interna (`/game/[id]`).
     - Componente `BudgetSlider.tsx` na `SidebarFilters.tsx` permitindo ao usuário filtrar visualmente pelo valor em mãos ("Tenho até R$ X").
     - Componente `EditionBadge.tsx` identificando edições GOTY, Complete, Deluxe e Ultimate.
  3. **Pilar 3 (IA Preditiva & Inteligência Financeira Gamer):**
     - Previsor sazonal `predictSaleTiming` e componente `DealPredictorBadge.tsx` integrando datas das grandes Steam Sales anuais com probabilidade e veredito ("Compre Agora" vs "Espere a Sale").
     - Priorizador de lista de desejos `WishlistPriorityTamer.tsx` em `/wishlist` calculando pontuação matemática de oportunidade para ranquear o que comprar primeiro no backlog.
  4. **Pilar 4 (Comunidade, Social & Co-op Deals):**
     - Componente `CommunityVibeTracker.tsx` com termômetro social de 3 reações (🔥 Compra Obrigatória, ⚖️ Só na Promoção, 💀 Passe Longe) e contadores com persistência no `localStorage`.
     - Modal `CoopMatcherModal.tsx` ("🎮 Co-op") na barra superior para descoberta de ofertas cooperativas para jogar com amigos.
     - Modal `ShareableDealModal.tsx` com visual estilizado gamer para compartilhamento em redes sociais, Discord e WhatsApp.
  5. **Pilar 5 (Handheld & Big Picture Mode para Steam Deck / TV):**
     - Componente `GamepadControllerListener.tsx` que detecta controles físicos via Gamepad API nativa e exibe HUD de sincronização de controle.
     - Módulo `src/lib/notifications.ts` com integração da Web Notifications API do navegador para alertas locais de preço.
  6. **Governança & Portão Final:**
     - Incremento de versão para `2.0.0` no `package.json`.
     - Expansão da suíte para 44 testes unitários automatizados em `test/logic.test.mjs`.
- **Status:** Aceito e Implementado.


---

### ADR-016: Sidebar Global por Seções, Navbar Despoluída e Vitrine Widescreen (v2.1.0)
- **Contexto:** Relato de poluição visual na barra de navegação superior (mais de 10 elementos espremidos na horizontal) e ausência de imagens de capa em primeiro plano no carrossel de destaques (`HeroShowcase`), gerando uma grande lacuna escura no painel principal, além de sobreposição de modais.
- **Decisões:**
  1. **CleanNavbar (`src/components/CleanNavbar.tsx`):**
     - Remoção dos 6 botões utilitários empilhados da barra superior.
     - Layout minimalista e espaçoso contendo apenas: Menu Hambúrguer (mobile), Logo PromoCraft, Busca Rápida Ctrl+K, Câmbio USD/BRL, Seletor de Moeda e Link para Wishlist.
  2. **GlobalSidebar (`src/components/GlobalSidebar.tsx`):**
     - Estruturação de uma barra lateral para todo o site organizada em 7 seções especializadas:
       - *Seção 1 (Ferramentas & IA Gamer):* IA Concierge, Co-op Radar, Giveaways ao Vivo (com indicador pulsante) e Sincronizar Steam.
       - *Seção 2 (Coleções do Catálogo):* Todos os Jogos, Super Descontos 70%+, Menor Preço Histórico, Até R$ 30, Jogos AAA, Steam Deck e 100% Grátis.
       - *Seção 3 (Gêneros Populares):* Ação, RPG, Estratégia, Terror, Indie, Roguelike, Soulslike, Cooperativo.
       - *Seção 4 (Orçamento no Bolso):* Slider interativo de R$ 10 a R$ 200 via `BudgetSlider`.
       - *Seção 5 (Lojas Oficiais):* Filtros diretos com badges oficiais das revendedoras autorizadas.
       - *Seção 6 (Minha Área):* Acesso rápido à Wishlist e Alertas.
       - *Seção 7 (Garantia & Rodapé):* Selo de Lojas 100% Oficiais e metadados.
     - Suporte nativo tanto para desktop (barra fixa lateral com sticky scrolling) quanto mobile (drawer deslizante com overlay e backdrop-blur).
  3. **Contexto Reativo de Filtros (`src/context/CatalogFilterContext.tsx`):**
     - Compartilhamento de estado unificado entre `GlobalSidebar` e `DealsFeed`.
     - Eliminação de sidebars duplicadas dentro da área de feed no desktop, expandindo o catálogo para 100% da largura útil disponível.
  4. **HeroShowcase Widescreen (`src/components/HeroShowcase.tsx`):**
     - Adição de imagem de capa em primeiro plano formato 16:9 widescreen para o jogo ativo.
     - Resolução automática de artes oficiais da Steam via `steamAppID` com fallback seguro para `thumb`.
     - Elevação da opacidade do background dinâmico para 35%, eliminando a lacuna preta no lado esquerdo da vitrine.
  5. **Governança & Qualidade:**
     - Incremento de versão para `2.1.0` no `package.json`.
     - Expansão da suíte para 50 testes unitários automatizados passando com 100% de sucesso.
- **Status:** Aceito e Implementado.


---

### ADR-017: Migração Resiliente de Importação da Wishlist Steam para IWishlistService (v2.1.1)
- **Contexto:** Usuários relataram que a importação de listas de desejos da Steam falhava sistematicamente com a mensagem "perfil privado/nenhum jogo encontrado", mesmo com perfis e detalhes de jogos 100% públicos. Investigação técnica revelou que a Valve desativou o endpoint AJAX não-oficial `wishlistdata/?p=0`, passando a retornar páginas HTML renderizadas por SSR da nova loja React (status 200, Content-Type text/html), o que quebrava o parsing JSON no backend.
- **Decisões:**
  1. **Resolução de Vanity URLs & XML Parsing:**
     - Implementado utilitário `resolveSteamId64` em `src/lib/steam.ts` para converter vanity handles e links customizados em SteamID64 de 17 dígitos via XML nativo da comunidade Steam (`https://steamcommunity.com/id/<vanity>/?xml=1`), sem necessidade de chaves privadas de API.
  2. **Consumo da Steam Web API Oficial:**
     - Adoção do serviço oficial `https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=<steamid64>` com fallback para `GetWishlistSortedFiltered/v1`, retornando os `appid`s com 100% de precisão para wishlists públicas.
     - Suporte transparente para a variável de ambiente opcional `STEAM_API_KEY`.
  3. **Pipeline Duplo de Enriquecimento CheapShark & Steam Store:**
     - Busca primária no CheapShark por `steamAppID` para vinculação direta com ofertas e preços promocionais.
     - Fallback enriquecido via Steam Store App Details (`https://store.steampowered.com/api/appdetails?appids=<appid>&l=brazilian`) para títulos legados ou não indexados no CheapShark, garantindo que nenhum jogo da lista de desejos seja descartado.
  4. **Governança & Testes:**
     - Incremento de versão para `2.1.1` no `package.json`.
     - Expansão da suíte para 54 testes unitários automatizados cobrindo normalização de URLs com `/wishlist`, extração XML de SteamID64 e sanitização do `IWishlistService`.
- **Status:** Aceito e Implementado.
