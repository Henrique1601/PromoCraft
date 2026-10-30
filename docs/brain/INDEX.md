# 🧠 Segundo Cérebro — PromoCraft

> **Base de Conhecimento Viva, Arquitetura e Memória Persistente do Projeto PromoCraft.**

---

## 🗺️ Índice Geral & Navegação Rápida

- [[DECISIONS|Histórico de Decisões Arquiteturais (ADRs)]]
- [[GOTCHAS|Armadilhas Conhecidas, Soluções & Lições Aprendidas]]

---

## 🎮 Visão Geral do Produto

O **PromoCraft** é um agregador e comparador em tempo real de promoções de jogos de PC com conversão automática de cotação USD para BRL, alertas de menor preço histórico, integração com Discord Webhooks, Telegram Bot e importação de listas de desejos públicas da Steam.

### Stack Tecnológica Principal
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Linguagem:** TypeScript 5
- **Estilização:** Tailwind CSS v4
- **Banco de Dados:** SQLite (`better-sqlite3`, WAL Mode)
- **APIs Externas:** CheapShark API, AwesomeAPI (Câmbio), Steam Community
- **Deploy:** Netlify ([promocraft.netlify.app](https://promocraft.netlify.app))
- **CI/CD:** GitHub Actions com Node.js 22 LTS
