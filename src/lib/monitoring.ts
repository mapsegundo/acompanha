
export type HealthStatus = 'Crítico' | 'Atenção' | 'Seguro' | 'Sem Dados';

export interface CheckinData {
    qualidade_sono: number | null
    dor_muscular: number | null
    cansaco: number | null
    humor: number | null
    estresse: number | null
    libido: number | null
    erecao_matinal?: boolean | null | undefined
    lesao?: boolean | null | undefined
    ciclo_menstrual_alterado?: boolean | null | undefined
    peso?: number | null
}

export function calculateHealthStatus(data: CheckinData | null | undefined, sexo?: string): HealthStatus {
    if (!data) return 'Sem Dados';

    const isWoman = sexo === 'F';
    const isMan = sexo === 'M';

    const isCritical =
        data.lesao === true ||
        (isWoman && data.ciclo_menstrual_alterado === true) ||
        (data.qualidade_sono !== null && data.qualidade_sono <= 3) ||
        (data.cansaco !== null && data.cansaco >= 8) ||
        (data.dor_muscular !== null && data.dor_muscular >= 8) ||
        (data.estresse !== null && data.estresse >= 8) ||
        (isMan && data.erecao_matinal === false) ||
        (data.humor !== null && data.humor <= 2) ||
        (data.libido !== null && data.libido <= 2);

    if (isCritical) return 'Crítico';

    // 2. WARNING (Yellow)
    const isWarning =
        (data.qualidade_sono !== null && data.qualidade_sono <= 5) ||
        (data.dor_muscular !== null && data.dor_muscular >= 7) ||
        (data.cansaco !== null && data.cansaco >= 7) ||
        (data.estresse !== null && data.estresse >= 8) ||
        (data.humor !== null && data.humor <= 4) ||
        (data.libido !== null && data.libido <= 5) ||
        (isMan && data.erecao_matinal === false);

    if (isWarning) return 'Atenção';

    // 3. SAFE (Green)
    return 'Seguro';
}

export function getStatusColor(status: HealthStatus): string {
    switch (status) {
        case 'Crítico': return '#ef4444'; // Red-600
        case 'Atenção': return '#f97316'; // Orange-500
        case 'Seguro': return '#22c55e'; // Green-500
        default: return '#94a3b8'; // Slate-400
    }
}

export function getBadgeVariant(status: HealthStatus): 'destructive' | 'secondary' | 'default' | 'outline' {
    switch (status) {
        case 'Crítico': return 'destructive';
        case 'Atenção': return 'secondary';
        case 'Seguro': return 'default';
        default: return 'outline';
    }
}

// Recovery Score Types
export type RecoveryStatus = 'Seguro' | 'Atenção' | 'Crítico';

export interface RecoveryScoreResult {
    score: number;
    status: RecoveryStatus;
    hooperIndex: number;
}

/**
 * Calculate Recovery Score based on Hooper Index
 * 
 * Hooper Index is widely used in longitudinal monitoring for detecting 
 * overtraining and accumulated fatigue in athletes.
 * 
 * Formula:
 * 1. HI = fatigue + stress + muscle_pain + (10 - sleep)
 * 2. RecoveryBase = 100 - (HI * 2.5)
 * 3. Adjustment = ((mood - 5) * 2) + ((libido - 5) * 1)
 * 4. If injury: -12 points, max = 70
 * 5. Clamp [0, 100]
 */
export function calculateRecoveryScore(data: CheckinData): RecoveryScoreResult {
    // Default values for missing data
    const fatigue = data.cansaco ?? 5;
    const stress = data.estresse ?? 5;
    const musclePain = data.dor_muscular ?? 5;
    const sleep = data.qualidade_sono ?? 5;
    const mood = data.humor ?? 5;
    const libido = data.libido ?? 5;
    const hasInjury = data.lesao ?? false;

    // Step 1: Calculate Hooper Index
    // HI = fadiga + estresse + dor_muscular + (10 - sono)
    const hooperIndex = fatigue + stress + musclePain + (10 - sleep);

    // Step 2: Convert to Recovery Score base (0-100)
    // HI ranges 0-40, RecoveryBase = 100 - (HI * 2.5)
    const recoveryBase = 100 - (hooperIndex * 2.5);

    // Step 3: Apply adjustments for mood and libido
    // Adjustment = ((humor - 5) * 2) + ((libido - 5) * 1)
    const adjustment = ((mood - 5) * 2) + ((libido - 5) * 1);
    let finalScore = recoveryBase + adjustment;

    // Step 4: Penalty for injury
    if (hasInjury) {
        finalScore = finalScore - 12;
        // Cap at 70 max when injured
        if (finalScore > 70) {
            finalScore = 70;
        }
    }

    // Step 5: Clamp to 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));

    // Determine status
    let status: RecoveryStatus;
    if (finalScore >= 80) {
        status = 'Seguro';
    } else if (finalScore >= 60) {
        status = 'Atenção';
    } else {
        status = 'Crítico';
    }

    return {
        score: Math.round(finalScore),
        status,
        hooperIndex
    };
}

export function getRecoveryColor(status: RecoveryStatus): string {
    switch (status) {
        case 'Seguro': return '#22c55e';   // Green-500
        case 'Atenção': return '#f97316';  // Orange-500
        case 'Crítico': return '#ef4444';  // Red-500
    }
}

export function getRecoveryBadgeVariant(status: RecoveryStatus): 'default' | 'secondary' | 'destructive' {
    switch (status) {
        case 'Seguro': return 'default';
        case 'Atenção': return 'secondary';
        case 'Crítico': return 'destructive';
    }
}

// Get custom color classes for recovery status badges
export function getRecoveryBadgeColorClasses(status: RecoveryStatus): string {
    switch (status) {
        case 'Seguro':
            return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100';
        case 'Atenção':
            return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100';
        case 'Crítico':
            return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100';
    }
}

// Get detailed risk message for critical metrics
export function getCriticalRiskMessage(metric: string): string {
    switch (metric) {
        case 'lesao':
            return '🚨 Lesão ativa - Risco de agravamento. Avaliação médica e ajuste de carga necessários.';
        case 'sono_critico':
            return '😴 Sono inadequado - Risco de fadiga crônica, menor performance cognitiva e comprometimento da recuperação muscular.';
        case 'cansaco_critico':
            return '⚡ Fadiga extrema - Possível overtraining. Redução imediata de carga recomendada.';
        case 'dor_critica':
            return '💪 DOMS severa - Risco elevado de lesão. Recuperação ativa e redução de volume necessários.';
        case 'estresse_critico':
            return '🧠 Estresse muito alto - Impacto severo no sistema imune e recuperação. Intervenção necessária.';
        case 'humor_critico':
            return '😔 Estado emocional crítico - Risco de burnout e abandono do treinamento.';
        case 'libido_critica':
            return '🔋 Supressão hormonal severa - Forte indicador de overtraining sistêmico.';
        case 'erecao_matinal_ausente':
            return '🌅 Ausência de ereção matinal - Possível supressão de testosterona, sinal de fadiga sistêmica.';
        case 'ciclo_alterado':
            return '🩸 Alteração hormonal - Possível RED-S (Deficiência Energética Relativa no Esporte). Avaliação médica urgente.';
        default:
            return 'Métrica crítica detectada.';
    }
}

// Get detailed risk message for warning metrics
export function getWarningRiskMessage(metric: string): string {
    switch (metric) {
        case 'sono_atencao':
            return '😴 Sono abaixo do ideal - Pode comprometer recuperação e performance.';
        case 'dor_atencao':
            return '💪 Dor muscular persistente - Monitorar para evitar agravamento.';
        case 'cansaco_atencao':
            return '⚡ Fadiga elevada - Atenção para sinais de overreaching.';
        case 'estresse_atencao':
            return '🧠 Estresse alto - Pode impactar sistema imune e recuperação.';
        case 'humor_atencao':
            return '😐 Humor deprimido - Monitorar estado psicológico do atleta.';
        case 'libido_atencao':
            return '🔋 Libido reduzida - Possível sinal inicial de fadiga sistêmica.';
        case 'erecao_matinal_atencao':
            return '🌅 Ausência de ereção matinal - Monitorar balanço hormonal.';
        default:
            return 'Sinal de alerta identificado.';
    }
}
