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
