export type ClinicalStatus = "Crítico" | "Atenção" | "Seguro" | "Sem Dados"

export type CriticalReasonKey =
  | "lesao"
  | "ciclo_alterado"
  | "sono_critico"
  | "cansaco_critico"
  | "dor_critica"
  | "humor_critico"
  | "libido_critica"

export type WarningReasonKey =
  | "sono_atencao"
  | "dor_atencao"
  | "cansaco_atencao"
  | "estresse_atencao"
  | "humor_atencao"
  | "libido_atencao"
  | "erecao_matinal_atencao"

export type ClinicalReasonKey = CriticalReasonKey | WarningReasonKey

export interface ClinicalCheckinData {
  qualidade_sono: number | null
  dor_muscular: number | null
  cansaco: number | null
  humor: number | null
  estresse: number | null
  libido: number | null
  erecao_matinal?: boolean | null | undefined
  lesao?: boolean | null | undefined
  ciclo_menstrual_alterado?: boolean | null | undefined
}

export const CLINICAL_RULES = {
  critical: {
    sonoMax: 3,
    cansacoMin: 9,
    dorMin: 9,
    humorMax: 2,
    libidoMax: 2,
  },
  warning: {
    sonoMax: 5,
    cansacoMin: 7,
    dorMin: 7,
    estresseMin: 8,
    humorMax: 4,
    libidoMax: 5,
  },
} as const

export interface ClinicalEvaluation {
  status: ClinicalStatus
  criticalReasons: CriticalReasonKey[]
  warningReasons: WarningReasonKey[]
}

export function evaluateClinicalStatus(
  data: ClinicalCheckinData | null | undefined,
  sexo?: string
): ClinicalEvaluation {
  if (!data) {
    return {
      status: "Sem Dados",
      criticalReasons: [],
      warningReasons: [],
    }
  }

  const isWoman = sexo === "F"
  const isMan = sexo === "M"

  const criticalReasons: CriticalReasonKey[] = []
  if (data.lesao === true) criticalReasons.push("lesao")
  if (isWoman && data.ciclo_menstrual_alterado === true) criticalReasons.push("ciclo_alterado")
  if (data.qualidade_sono !== null && data.qualidade_sono <= CLINICAL_RULES.critical.sonoMax) criticalReasons.push("sono_critico")
  if (data.cansaco !== null && data.cansaco >= CLINICAL_RULES.critical.cansacoMin) criticalReasons.push("cansaco_critico")
  if (data.dor_muscular !== null && data.dor_muscular >= CLINICAL_RULES.critical.dorMin) criticalReasons.push("dor_critica")
  if (data.humor !== null && data.humor <= CLINICAL_RULES.critical.humorMax) criticalReasons.push("humor_critico")
  if (data.libido !== null && data.libido <= CLINICAL_RULES.critical.libidoMax) criticalReasons.push("libido_critica")

  if (criticalReasons.length > 0) {
    return {
      status: "Crítico",
      criticalReasons,
      warningReasons: [],
    }
  }

  const warningReasons: WarningReasonKey[] = []
  if (data.qualidade_sono !== null && data.qualidade_sono <= CLINICAL_RULES.warning.sonoMax) warningReasons.push("sono_atencao")
  if (data.dor_muscular !== null && data.dor_muscular >= CLINICAL_RULES.warning.dorMin) warningReasons.push("dor_atencao")
  if (data.cansaco !== null && data.cansaco >= CLINICAL_RULES.warning.cansacoMin) warningReasons.push("cansaco_atencao")
  if (data.estresse !== null && data.estresse >= CLINICAL_RULES.warning.estresseMin) warningReasons.push("estresse_atencao")
  if (data.humor !== null && data.humor <= CLINICAL_RULES.warning.humorMax) warningReasons.push("humor_atencao")
  if (data.libido !== null && data.libido <= CLINICAL_RULES.warning.libidoMax) warningReasons.push("libido_atencao")
  if (isMan && data.erecao_matinal === false) warningReasons.push("erecao_matinal_atencao")

  if (warningReasons.length > 0) {
    return {
      status: "Atenção",
      criticalReasons: [],
      warningReasons,
    }
  }

  return {
    status: "Seguro",
    criticalReasons: [],
    warningReasons: [],
  }
}
