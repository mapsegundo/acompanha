# 🏥 ACOMPANHA

> **Plataforma de acompanhamento clínico e esportivo longitudinal para alta performance.**

[![Site](https://img.shields.io/badge/Official_Site-acompanha.online-blue?style=for-the-badge&logo=vercel)](https://acompanha.online)
[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

## 🚀 Sobre o Projeto

O **Acompanha** é um MVP (Mínimo Produto Viável) projetado para transformar a relação entre médicos e atletas/pacientes. Através de registros semanais precisos, a plataforma permite identificar tendências de saúde, fadiga e bem-estar antes que se tornem problemas clínicos.

### 🌟 Diferenciais
- **Monitoramento Longitudinal**: Dados que contam uma história ao longo do tempo.
- **Recovery Score Inteligente**: Score preditivo (0-100) que combina 6 fatores fisiológicos para avaliar capacidade de recuperação.
- **Alertas Inteligentes**: Sistema de cores (Verde/Amarelo/Vermelho) para triagem rápida.
- **Identidade Visual Moderna**: Interface focada em usabilidade e clareza de dados.

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Typography & Components do shadcn/ui.
- **Backend/DB**: Supabase (Auth, Postgres, RLS, Triggers).
- **Charts**: Recharts para visualizações interativas.
- **PDF Reports**: jsPDF + autoTable para geração de relatórios clínicos.
- **Icons**: Lucide React.

## 📱 Funcionalidades

### Para Atletas (Pacientes)
- **Check-in Dinâmico**: Registro semanal completo de sono, estresse, libido, dor muscular, humor e saúde física.
- **Dashboard de Evolução**: Visualize suas métricas e Recovery Score em tempo real.
- **Perfil Personalizado**: Controle total sobre seus dados pessoais e histórico.
- **Orientações Médicas**: Acesso a notas compartilhadas pelo médico responsável.

### Para Médicos (MD)
- **Recovery Score System**: 
  - Score automático (0-100) calculado via trigger SQL
  - Pesos científicos: Sono (25%), Cansaço (20%), Estresse (15%), Humor (15%), Dor (15%), Libido (10%)
  - Status visual: Seguro (≥80), Atenção (60-79), Crítico (<60)
  - Página dedicada explicando metodologia completa
- **Central de Alertas**: Foco imediato em pacientes com sinais críticos.
- **Análise Profunda**: 
  - Gráficos de evolução temporal (peso, sono, cansaço, etc.)
  - Tabela de histórico de lesões com relatos detalhados
  - Visualização de tendências e padrões
- **Gestão de Pacientes**: Lista organizada por risco clínico e última interação.
- **Notas Clínicas**: 
  - Sistema completo de anotações por paciente
  - Controle de visibilidade (privado/compartilhado)
  - Normalização automática de joins do Supabase
- **Relatórios PDF**: 
  - Geração automática com dados do paciente
  - Estatísticas resumidas dos últimos check-ins
  - Histórico completo de lesões relatadas
  - Tabelas detalhadas de métricas ao longo do tempo

## 🏗️ Configuração Local

1.  **Clone o repositório**
2.  **Instale as dependências**: `npm install`
3.  **Ambiente**: Crie um `.env.local` com as chaves do Supabase.
4.  **Database**: Execute os scripts em `supabase/migrations/` no seu projeto Supabase (inclui triggers para Recovery Score).
5.  **Execução**: `npm run dev`
6.  **Lint/Type Check**: `npm run lint` e `npx tsc --noEmit`

## 📊 Recovery Score

O Recovery Score é calculado automaticamente via SQL trigger a cada check-in:

```sql
Recovery Score = 
  (0.25 × sono) + 
  (0.20 × (10 - cansaço)) + 
  (0.15 × (10 - estresse)) + 
  (0.15 × humor) + 
  (0.15 × (10 - dor)) + 
  (0.10 × libido)
```

**Interpretação:**
- **80-100 (Verde)**: Seguro - Capacidade total de recuperação
- **60-79 (Amarelo)**: Atenção - Monitoramento recomendado  
- **0-59 (Vermelho)**: Crítico - Intervenção necessária

---

Desenvolvido para profissionais que buscam excelência no acompanhamento de saúde.

**Acesse agora:** [https://acompanha.online](https://acompanha.online)
