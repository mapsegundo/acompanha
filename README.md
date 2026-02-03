# ACOMPANHA

Sistema de acompanhamento clínico e esportivo longitudinal.

## Sobre o Projeto

O Acompanha é uma plataforma desenvolvida para conectar médicos e pacientes, facilitando o monitoramento contínuo de indicadores de saúde, treinos e bem-estar.

### Funcionalidades
- **Pacientes**: Check-in semanal interativo (físico, sono, mental), histórico evolutivo e dashboard visual.
- **Médicos**: Painel de controle com alertas automáticos (status verde, amarelo, vermelho), lista de pacientes e gráficos de tendências.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (Postgres, Auth, RLS, Edge Functions)
- **Deploy**: Vercel ready

## Estrutura do Banco de Dados

- `patients`: Perfil do usuário.
- `weekly_checkins`: Registros longitudinais.
- `doctors`: Perfil médico e permissões administrativas.
- `RLS (Row Level Security)`: Garante que pacientes vejam apenas seus dados e médicos vejam seus pacientes.

## Configuração Local

1. **Clone o repositório**
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz com suas chaves do Supabase:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   ```
4. **Banco de Dados**:
   Execute os scripts SQL localizados em `supabase/` no SQL Editor do Supabase.
5. **Rode o projeto**:
   ```bash
   npm run dev
   ```

## Deploy

O projeto é otimizado para deploy na Vercel. Lembre-se de configurar as variáveis de ambiente no painel da Vercel.

---
Desenvolvido como MVP para monitoramento de saúde de alta performance.
