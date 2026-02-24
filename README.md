<div align="center">

# Acompanha MD
**Plataforma de Monitoramento Clínico e Esportivo Longitudinal de Alta Performance**

[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

🌐 **Site Oficial:** [acompanha.online](https://acompanha.online)

</div>

---

## 📖 Visão Geral

**Acompanha MD** é um ecossistema digital avançado desenhado para revolucionar o acompanhamento de pacientes e atletas. A plataforma preenche a lacuna entre as consultas presenciais através de check-ins semanais estruturados, permitindo que a equipe médica identifique precocemente sinais de regressão, risco de lesão ou declínio na saúde mental e física. 

Com uma interface responsiva, tema adaptável (*Dark/Light Mode*) elaborado com a biblioteca UI **shadcn/ui** e tipografia **Inter**, o sistema entrega uma experiência *premium*, focada em acessibilidade e legibilidade de dados clínicos de alta densidade.

---

## ✨ Ecossistema da Plataforma

O Acompanha MD é arquitetado em dois portais principais, com rigoroso controle de acesso baseado em *Row Level Security* (RLS) do Supabase.

### 🧑‍⚕️ Portal Médico (Doctor)
Painel de controle analítico voltado para a rápida tomada de decisão clínica.
- **Dashboard Estratégico**: Visão panorâmica da base de pacientes, alertas críticos de saúde e taxas de engajamento (resposta).
- **Lista de Pacientes**: Motor de busca e filtragem robusto, segmentando pacientes por *status* ativo/inativo e nível de prioridade clínica.
- **Prontuário Longitudinal Completo**:
  - Resumo comparativo semanal.
  - Oito gráficos independentes de métricas vitais (Sono, Cansaço, Estresse, Humor, Dor, Libido, Peso, Treino).
  - Módulo de medições corporais com comparador visual (fotos lado a lado).
  - Bloco de notas clínicas integradas e seguras.
- **Gestão Documental**: Upload e compartilhamento de exames, laudos e dietas diretamente com o paciente.
- **Relatórios**: Geração automatizada de laudos em PDF via `jsPDF` sumarizando a evolução do paciente.

### 🏃 Portal do Paciente (Patient)
Ambiente pessoal, acolhedor e seguro para a auto-declaração de saúde.
- **Check-in Semanal Simplificado**: Formulário responsivo com indicadores de bem-estar de 1 a 10.
- **Dashboard de Evolução**: Gráficos de fácil compreensão sobre progressão de peso corporal, massa magra e percentual de gordura.
- **Módulo de Medição**: Upload seguro de fotos semanais para avaliação física.
- **Acesso Documental e Notas**: Recebimento de orientações e documentos do médico responsável.
- **Autenticação Segura**: Recuperação de senha autônoma.

---

## 🧠 Motor de Regras Clínicas (Clinical Rules)

A inteligência da plataforma reside em sua fonte única da verdade para classificação de risco clínico, centralizada em `src/lib/clinical-rules.ts`.

A tríade de *Status* Clínico:
- 🔴 **Crítico:** Lesões reportadas, sono exíguo (≤3), dores ou cansaço extremos (≥9), entre outros de instabilidade aguda.
- 🟡 **Atenção:** Sinais de alerta moderados como estresse elevado, distúrbios leves de sono ou fadiga acentuada.
- 🟢 **Seguro:** Todos os parâmetros dentro de limiares saudáveis e operacionais.

> **💡 Nota Técnica:** O cálculo longitudinal do *Recovery Score* obedece a um algoritmo customizado em `src/lib/monitoring.ts`, responsável por ditar orientações visuais nos gráficos (Recharts) e painéis de atendimento.

---

## 🛠️ Stack Tecnológica & Arquitetura

O projeto utiliza o que há de mais moderno no ecossistema React.

| Camada | Tecnologia | Propósito / Função |
|---|---|---|
| **Core & Roteamento** | `Next.js 16 (App Router)` | Renderização híbrida (SSR/CSR), performance e rotas baseadas no sistema de arquivos estrito. |
| **Linguagem** | `React 19` + `TypeScript 5` | Tipagem forte e prevenção de erros em tempo de compilação. |
| **Estilização & UI** | `Tailwind CSS 4` + `shadcn/ui` | Construção de interface sofisticada de utilitários css com componentes Radix sem cabeçalho e variáveis de tema em Oklch. |
| **BaaS & Backend** | `Supabase` | Autenticação, Banco de Dados Relacional PostgreSQL, Storage de imagens e RLS Policies. |
| **Data Viz** | `Recharts` | Mapas e gráficos interativos para evolução paramétrica. |

---

## ⚙️ Ambiente de Desenvolvimento e Configuração

### 1. Pré-Requisitos
- **Node.js**: v20 ou superior.
- **Gerenciador de Pacotes**: npm v10+.
- **Banco de Dados**: Um projeto configurado no [Supabase](https://supabase.com).

### 2. Instalação e Inicialização

```bash
# Clone o repositório e instale as dependências
npm install
```

### 3. Variáveis de Ambiente
Crie e preencha o arquivo `.env.local` na raiz do projeto copiando os exemplares listados em `.env.local.example`:

```bash
cp .env.local.example .env.local
```

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública anônima |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (apenas server-side / endpoints admin) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | *(Opcional)* Chave de proteção anti-bot / Cloudflare Turnstile |

### 4. Migrações de Banco de Dados
Aplica a estrutura arquitetural, segurança RLS e tabelas executando os scripts localizados em `supabase/migrations/` em ordem, ou através do CLI do Supabase. Arquivos cruciais incluem `patient_notes_migration.sql` e a infraestrutura do `recovery_score`.

### 5. Iniciar o Servidor

```bash
npm run dev
# O aplicativo iniciará em http://localhost:3000
```

---

## 🔒 Segurança e Melhores Práticas

- **Proteção do Service Role**: A chave `SUPABASE_SERVICE_ROLE_KEY` e operações administrativas de criação de usuários bypassam RLS e são restritas **exclusivamente** às "Server Actions" ou "Route Handlers". Não devem ser expostas no cliente *sob nenhuma hipótese*.
- **Row Level Security (RLS)**: Cada médico e paciente consome apenas os dados a eles pertencentes ou condicionalmente interligados por chaves estrangeiras.
- **Qualidade de Código**: Pipelines internos de validação via ESLint 9 rigoroso de TypeScript (*strict mode*).

Para rodar checagens estáticas:
```bash
npm run lint         # Verificação visual e sintática
npx tsc --noEmit     # Análise de compilação e tipagem
```

---
<div align="center">
  <p>Construído pela equipe técnica do <strong>Acompanha MD</strong></p>
</div>
