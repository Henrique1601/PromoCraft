# 🧠 Memória do Projeto PromoCraft — Roadmap & Entregas

Este arquivo documenta as decisões arquiteturais, o histórico de entregas e o backlog de sugestões futuras consolidadas pelo `global-master-agent` e `memory-architect-agent`.

---

## ✅ Entregas Concluídas (v1.1.0)

1. **🤖 Assistente de Decisão de Compra com IA / Algorítmico (`DealVerdictCard`)**:
   - Diagnóstico em tempo real na página do jogo comparando o menor preço histórico e desconto atual com vereditos de *Compra Obrigatória*, *Bom Preço* e *Aguarde a Próxima Sale*.
2. **🏷️ Rastreador de Cupons de Desconto Ativos (`CouponTracker`)**:
   - Tabela e badges com cupons para Nuuvem (`NUUVALE`), Green Man Gaming (`SAVE15`) e Fanatical (`FANATICAL10`) com cópia em 1 clique.
3. **🎮 Badge de Compatibilidade com Steam Deck & PCs Portáteis (`SteamDeckBadge`)**:
   - Status visual para portáteis (Steam Deck, ROG Ally, Legion Go) com atalhos diretos para ProtonDB e loja Steam.
4. **🚀 SEO Dinâmico, Open Graph & Social Cards (`generateMetadata`, `sitemap.ts`, `robots.ts`)**:
   - Cartões sociais ricos ao compartilhar links de jogos no Discord, WhatsApp e Twitter, além de indexação contínua no Google.
5. **👥 Compartilhamento Social de Wishlist (`handleShareWishlist`)**:
   - Botão de compartilhamento direto com suporte à Web Share API e fallback para cópia de link.
6. **🎨 Identidade Visual & UI/UX Polish**:
   - Incorporação da logo oficial (`public/logo-mark.png`) no cabeçalho das páginas e favicons com design gamer dark/emerald.
7. **🛡️ Wishlist Híbrida Resiliente (LocalStorage + API)**:
   - Armazenamento offline instantâneo no cliente com sincronização em segundo plano, resistente a ambientes serverless efêmeros.
8. **🧪 Suíte de Testes Automatizados Unitários (`test/logic.test.mjs`)**:
   - Testes com `node:test` para resolução de links de lojas, regras do assistente de compra e fallback cambial, integrados ao CI/CD no GitHub Actions.

---

## 🔮 Backlog de Sugestões Futuras (v1.2+)

1. **☁️ Autenticação Social & Sincronização em Nuvem (Postgres/Supabase)**:
   - Login com Discord / Google / Steam para manter a Wishlist sincronizada entre o computador e o celular (PWA).
2. **🔔 Notificações Nativas Web Push**:
   - Alertas diretos no navegador sem precisar de Discord Webhook ou Telegram.

---

## 🌐 Estado Atual em Produção
- **URL Oficial:** [https://promocraft.netlify.app](https://promocraft.netlify.app)
- **Repositório:** [https://github.com/Henrique1601/PromoCraft](https://github.com/Henrique1601/PromoCraft)
