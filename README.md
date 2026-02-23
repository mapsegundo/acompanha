# ACOMPANHA

Plataforma web para acompanhamento clinico e esportivo longitudinal, conectando medicos e pacientes com check-ins semanais, alertas e analise de tendencia.

Site: https://acompanha.online

## Visao geral

O sistema possui dois portais:

- Portal do paciente: registro semanal de saude, medicao corporal, comparacao de fotos, evolucao e documentos.
- Portal medico: dashboard de risco, lista de pacientes, prontuario completo, notas clinicas, documentos e relatorio PDF.

## Funcionalidades principais

### Paciente

- Autenticacao: login, cadastro, recuperacao e reset de senha.
- Check-in semanal em etapas.
- Dashboard com historico de check-ins e status de saude.
- Pagina de evolucao com grafico de peso, gordura e massa magra.
- Modulo de medicoes corporais com foto.
- Comparacao de fotos e medidas lado a lado.
- Pagina de documentos enviados pelo medico.
- Notas compartilhadas pelo medico.

### Medico

- Dashboard com total de pacientes, alertas criticos e taxa de resposta.
- Lista de pacientes com busca, ordenacao, paginacao e filtro por ativos/inativos.
- Ativar e desativar paciente no prontuario.
- Prontuario com:
  - resumo semanal comparativo,
  - graficos de metricas,
  - historico detalhado,
  - medicoes corporais,
  - comparacao de fotos,
  - notas clinicas.
- Gestao de documentos por paciente (upload, download e exclusao).
- Relatorio PDF do paciente.
- Pagina de alertas clinicos com priorizacao por severidade.

### Admin

- Cadastro e gerenciamento de modalidades e fases de temporada.
- Vinculacao de medico existente via endpoint administrativo.

## Regras clinicas e score

As regras de classificacao de status clinico estao centralizadas em:

- `src/lib/clinical-rules.ts`

Essa e a fonte unica para thresholds e avaliacao de status (`Crítico`, `Atenção`, `Seguro`, `Sem Dados`), usada por dashboard, lista de pacientes e alertas.

O Recovery Score e calculado em:

- `src/lib/monitoring.ts`

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui + Radix
- Supabase (Auth, Postgres, Storage, RLS)
- Recharts
- jsPDF + jspdf-autotable

## Requisitos

- Node.js 20+
- npm 10+
- Projeto Supabase configurado

## Configuracao local

### 1) Instalar dependencias

```bash
npm install
```

### 2) Configurar variaveis de ambiente

Use o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Variaveis usadas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (apenas servidor)

Opcional (quando habilitado no projeto):

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### 3) Aplicar migrations no Supabase

Executar os SQLs da pasta `supabase/migrations`:

- `apply_admin_rls.sql`
- `fix_doctor_rls_circular.sql`
- `measurements_migration.sql`
- `patient_notes_migration.sql`
- `patient_notes_delete_policy.sql`
- `patient_status_and_documents.sql`
- `recovery_score_migration.sql`
- `recalculate_recovery_scores.sql`

### 4) Rodar o projeto

```bash
npm run dev
```

## Qualidade

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Estrutura relevante

```text
src/
  app/
    (auth)/
    (patient)/
    doctor/
    api/
  components/
    dashboard/
    measurements/
    ui/
  lib/
    clinical-rules.ts
    monitoring.ts
    supabase/
supabase/
  migrations/
```

## Seguranca

- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no cliente.
- O endpoint admin usa service role e deve ser acessivel somente por usuarios autorizados.
- RLS e policies estao versionadas nas migrations SQL.

## Status do projeto

Produto em evolucao continua, com foco em qualidade clinica, UX e consistencia de regras de negocio.
