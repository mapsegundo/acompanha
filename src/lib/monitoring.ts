import {
  evaluateClinicalStatus,
  type ClinicalCheckinData,
  type ClinicalStatus,
  type CriticalReasonKey,
  type WarningReasonKey,
} from "@/lib/clinical-rules"

export type HealthStatus = ClinicalStatus

export interface CheckinData extends ClinicalCheckinData {
  peso?: number | null
}

export function calculateHealthStatus(data: CheckinData | null | undefined, sexo?: string): HealthStatus {
  return evaluateClinicalStatus(data, sexo).status
}

export function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case "Crítico":
      return "#ef4444"
    case "Atenção":
      return "#f97316"
    case "Seguro":
      return "#22c55e"
    default:
      return "#94a3b8"
  }
}

export function getBadgeVariant(status: HealthStatus): "destructive" | "secondary" | "default" | "outline" {
  switch (status) {
    case "Crítico":
      return "destructive"
    case "Atenção":
      return "secondary"
    case "Seguro":
      return "default"
    default:
      return "outline"
  }
}

export function getHealthBadgeColorClasses(status: HealthStatus): string {
  switch (status) {
    case "Seguro":
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
    case "Atenção":
      return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"
    case "Crítico":
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100"
  }
}

export type RecoveryStatus = "Seguro" | "Atenção" | "Crítico"

export interface RecoveryScoreResult {
  score: number
  status: RecoveryStatus
  hooperIndex: number
}

export function calculateRecoveryScore(data: CheckinData): RecoveryScoreResult {
  const fatigue = data.cansaco ?? 5
  const stress = data.estresse ?? 5
  const musclePain = data.dor_muscular ?? 5
  const sleep = data.qualidade_sono ?? 5
  const mood = data.humor ?? 5
  const libido = data.libido ?? 5
  const hasInjury = data.lesao ?? false

  const hooperIndex = fatigue + stress + musclePain + (10 - sleep)
  const recoveryBase = 100 - hooperIndex * 2.5
  const adjustment = (mood - 5) * 2 + (libido - 5) * 1
  let finalScore = recoveryBase + adjustment

  if (hasInjury) {
    finalScore = finalScore - 12
    if (finalScore > 70) {
      finalScore = 70
    }
  }

  finalScore = Math.max(0, Math.min(100, finalScore))

  let status: RecoveryStatus
  if (finalScore >= 80) {
    status = "Seguro"
  } else if (finalScore >= 60) {
    status = "Atenção"
  } else {
    status = "Crítico"
  }

  return {
    score: Math.round(finalScore),
    status,
    hooperIndex,
  }
}

export function getRecoveryColor(status: RecoveryStatus): string {
  switch (status) {
    case "Seguro":
      return "#22c55e"
    case "Atenção":
      return "#f97316"
    case "Crítico":
      return "#ef4444"
  }
}

export function getRecoveryBadgeVariant(status: RecoveryStatus): "default" | "secondary" | "destructive" {
  switch (status) {
    case "Seguro":
      return "default"
    case "Atenção":
      return "secondary"
    case "Crítico":
      return "destructive"
  }
}

export function getRecoveryBadgeColorClasses(status: RecoveryStatus): string {
  switch (status) {
    case "Seguro":
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
    case "Atenção":
      return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"
    case "Crítico":
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
  }
}

export function getCriticalRiskMessage(metric: CriticalReasonKey | string): string {
  switch (metric) {
    case "lesao":
      return "Lesão ativa: risco de agravamento. Avaliação médica e ajuste de carga necessários."
    case "sono_critico":
      return "Sono inadequado: risco de fadiga crônica e recuperação muscular comprometida."
    case "cansaco_critico":
      return "Fadiga extrema: possível overtraining. Redução imediata de carga recomendada."
    case "dor_critica":
      return "Dor muscular severa: risco elevado de lesão. Recuperação ativa recomendada."
    case "humor_critico":
      return "Estado emocional crítico: risco de burnout e queda de adesão ao treino."
    case "libido_critica":
      return "Supressão hormonal severa: possível sinal de overtraining sistêmico."
    case "ciclo_alterado":
      return "Alteração hormonal importante: possível RED-S. Avaliação médica urgente."
    default:
      return "Métrica crítica detectada."
  }
}

export function getWarningRiskMessage(metric: WarningReasonKey | string): string {
  switch (metric) {
    case "sono_atencao":
      return "Sono abaixo do ideal. Pode comprometer recuperação e performance."
    case "dor_atencao":
      return "Dor muscular persistente. Monitorar para evitar agravamento."
    case "cansaco_atencao":
      return "Fadiga elevada. Atenção para sinais de overreaching."
    case "estresse_atencao":
      return "Estresse alto. Pode impactar sistema imune e recuperação."
    case "humor_atencao":
      return "Humor deprimido. Monitorar estado psicológico do atleta."
    case "libido_atencao":
      return "Libido reduzida. Possível sinal inicial de fadiga sistêmica."
    case "erecao_matinal_atencao":
      return "Ausência de ereção matinal. Monitorar balanço hormonal."
    default:
      return "Sinal de alerta identificado."
  }
}
