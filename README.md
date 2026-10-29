# 🎮 PromoCraft

> **Agregador e comparador em tempo real de promoções de jogos para PC com conversão BRL, histórico de menor preço e alertas inteligentes.**

![PromoCraft Preview](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Netlify Ready](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=for-the-badge&logo=netlify)

---

## 🌐 Produção (Live Demo)

O projeto está oficialmente online em:  
👉 **[https://promocraft.netlify.app](https://promocraft.netlify.app)**

---

## ⚡ Principais Funcionalidades

- **🔥 Feed Unificado de Ofertas**: Agregação de mais de 30 lojas oficiais de jogos para PC (Steam, Green Man Gaming, Nuuvem, GOG, Epic Games Store, Fanatical, etc.).
- **⚖️ Comparador Lado a Lado (`/game/[id]`)**: Tabela comparativa em tempo real com preços em cada loja parceira e links diretos para ativação.
- **📉 Menor Preço Histórico**: Destaque para o recorde histórico de preço mais baixo já registrado e a data em que ocorreu.
- **💵 Conversão BRL em Tempo Real**: Cotação automática do dólar comercial via API de câmbio com cache inteligente.
- **🎁 Filtro 100% Grátis**: Botão rápido para encontrar resgates gratuitos e brindes temporários.
- **❤️ Wishlist & Alertas de Preço**: Salve jogos na lista de desejos e defina uma meta de valor para monitoramento contínuo.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, ISR)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Engine de Dados**: CheapShark API + AwesomeAPI (Câmbio)
- **Banco Local**: SQLite com `better-sqlite3` (WAL Mode)
- **Deploy**: Preparado com `@netlify/plugin-nextjs` e `netlify.toml`

---

## 🚀 Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/Henrique1601/PromoCraft.git
cd PromoCraft
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador:
```
http://localhost:3000
```

---

## ☁️ Deploy no Netlify

O projeto já possui o arquivo `netlify.toml` configurado. Basta conectar o repositório no [Netlify](https://app.netlify.com) para deploys automáticos em cada `git push`.
