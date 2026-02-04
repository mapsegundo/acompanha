-- Adiciona a coluna de alteração do ciclo menstrual na tabela de check-ins semanais
ALTER TABLE public.weekly_checkins 
ADD COLUMN IF NOT EXISTS ciclo_menstrual_alterado BOOLEAN DEFAULT FALSE;
