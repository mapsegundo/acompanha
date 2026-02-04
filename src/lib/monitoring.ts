
export type HealthStatus = 'Crítico' | 'Atenção' | 'Seguro' | 'Sem Dados';

export interface CheckinData {
    qualidade_sono: number;
    dor_muscular: number;
    cansaco: number;
    humor: number;
    estresse: number;
    libido: number;
    erecao_matinal: boolean;
    lesao: boolean;
    ciclo_menstrual_alterado?: boolean;
}

export function calculateHealthStatus(data: CheckinData | null | undefined): HealthStatus {
    if (!data) return 'Sem Dados';

    // 1. CRITICAL (Red)
    const isCritical =
        data.lesao === true ||
        data.ciclo_menstrual_alterado === true ||
        data.qualidade_sono <= 3 ||
        data.dor_muscular >= 9 ||
        data.cansaco >= 9 ||
        data.humor <= 2 ||
        data.libido <= 2;

    if (isCritical) return 'Crítico';

    // 2. WARNING (Yellow)
    const isWarning =
        data.qualidade_sono <= 5 ||
        data.dor_muscular >= 7 ||
        data.cansaco >= 7 ||
        data.estresse >= 8 ||
        data.humor <= 4 ||
        data.libido <= 5 ||
        data.erecao_matinal === false;

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
