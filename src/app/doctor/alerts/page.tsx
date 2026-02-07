import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, ArrowRight, Activity, Zap, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { format, parseISO, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { calculateHealthStatus, getCriticalRiskMessage, getWarningRiskMessage } from "@/lib/monitoring"

interface AlertItem {
    id: string
    patientId: string
    patientName: string
    type: string
    severity: 'Vermelho' | 'Amarelo'
    message: string
    date: string
    metric: string
    details?: {
        sono: number
        cansaco: number
        estresse: number
        humor: number
        dor: number
        libido: number
        lesao: boolean
    }
}

export default async function AlertsPage() {
    const supabase = await createClient()
    const sevenDaysAgoOffset = subDays(new Date(), 7).toISOString().split('T')[0]

    // Fetch patients and their recent check-ins
    const { data: patients } = await supabase
        .from('patients')
        .select(`
            id,
            nome,
            sexo,
            weekly_checkins (
                id,
                data,
                qualidade_sono,
                dor_muscular,
                cansaco,
                estresse,
                humor,
                libido,
                erecao_matinal,
                lesao,
                ciclo_menstrual_alterado
            )
        `)

    const activeAlerts: AlertItem[] = []

    interface WeeklyCheckin {
        id: string
        data: string
        qualidade_sono: number
        dor_muscular: number
        cansaco: number
        estresse: number
        humor: number
        libido: number
        erecao_matinal: boolean | null
        lesao: boolean
        ciclo_menstrual_alterado: boolean | null
    }

    interface Patient {
        id: string
        nome: string
        sexo: 'M' | 'F'
        weekly_checkins: WeeklyCheckin[]
    }

    patients?.forEach((patient: Patient) => {
        const recentCheckins = patient.weekly_checkins
            ?.filter((c) => c.data >= sevenDaysAgoOffset)
            .sort((a, b) => b.data.localeCompare(a.data)) // Get most recent first

        if (!recentCheckins || recentCheckins.length === 0) return

        const latest = recentCheckins[0]

        const status = calculateHealthStatus(latest, patient.sexo)

        if (status === 'Crítico') {
            const reasons = []
            const riskMessages: string[] = []
            const metrics = []

            if (latest.lesao) {
                reasons.push('lesão/dor relatada')
                riskMessages.push(getCriticalRiskMessage('lesao'))
                metrics.push({ label: 'Lesão', value: 'Sim', critical: true })
            }
            if (latest.ciclo_menstrual_alterado && patient.sexo === 'F') {
                reasons.push('alteração no ciclo menstrual')
                riskMessages.push(getCriticalRiskMessage('ciclo_alterado'))
                metrics.push({ label: 'Ciclo Alterado', value: 'Sim', critical: true })
            }
            if (latest.qualidade_sono <= 3) {
                reasons.push('sono péssimo')
                riskMessages.push(getCriticalRiskMessage('sono_critico'))
                metrics.push({ label: 'Sono', value: `${latest.qualidade_sono}/10`, critical: true })
            }
            if (latest.cansaco >= 8) {
                reasons.push('cansaço extremo')
                riskMessages.push(getCriticalRiskMessage('cansaco_critico'))
                metrics.push({ label: 'Cansaço', value: `${latest.cansaco}/10`, critical: true })
            }
            if (latest.dor_muscular >= 8) {
                reasons.push('dor muscular aguda')
                riskMessages.push(getCriticalRiskMessage('dor_critica'))
                metrics.push({ label: 'Dor', value: `${latest.dor_muscular}/10`, critical: true })
            }
            if (latest.estresse >= 8) {
                reasons.push('estresse muito alto')
                riskMessages.push(getCriticalRiskMessage('estresse_critico'))
                metrics.push({ label: 'Estresse', value: `${latest.estresse}/10`, critical: true })
            }
            if (latest.humor <= 2) {
                reasons.push('humor muito baixo')
                riskMessages.push(getCriticalRiskMessage('humor_critico'))
                metrics.push({ label: 'Humor', value: `${latest.humor}/10`, critical: true })
            }
            if (latest.libido <= 2) {
                reasons.push('libido muito baixa')
                riskMessages.push(getCriticalRiskMessage('libido_critica'))
                metrics.push({ label: 'Libido', value: `${latest.libido}/10`, critical: true })
            }
            if (latest.erecao_matinal === false && patient.sexo === 'M') {
                reasons.push('ausência de ereção matinal')
                riskMessages.push(getCriticalRiskMessage('erecao_matinal_ausente'))
                metrics.push({ label: 'Ereção Matinal', value: 'Não', critical: true })
            }

            activeAlerts.push({
                id: `crit-${latest.id}`,
                patientId: patient.id,
                patientName: patient.nome || "Atleta",
                type: "Risco Crítico",
                severity: "Vermelho",
                message: riskMessages.join(' '),
                date: latest.data,
                metric: "Saúde Geral",
                details: {
                    sono: latest.qualidade_sono,
                    cansaco: latest.cansaco,
                    estresse: latest.estresse,
                    humor: latest.humor,
                    dor: latest.dor_muscular,
                    libido: latest.libido,
                    lesao: latest.lesao
                }
            })
        } else if (status === 'Atenção') {
            const reasons = []
            const riskMessages: string[] = []
            const metrics = []

            if (latest.qualidade_sono <= 5) {
                reasons.push('sono insuficiente')
                riskMessages.push(getWarningRiskMessage('sono_atencao'))
                metrics.push({ label: 'Sono', value: `${latest.qualidade_sono}/10`, critical: false })
            }
            if (latest.dor_muscular >= 7) {
                reasons.push('dor persistente')
                riskMessages.push(getWarningRiskMessage('dor_atencao'))
                metrics.push({ label: 'Dor', value: `${latest.dor_muscular}/10`, critical: false })
            }
            if (latest.cansaco >= 7) {
                reasons.push('fadiga elevada')
                riskMessages.push(getWarningRiskMessage('cansaco_atencao'))
                metrics.push({ label: 'Cansaço', value: `${latest.cansaco}/10`, critical: false })
            }
            if (latest.estresse >= 8) {
                reasons.push('estresse alto')
                riskMessages.push(getWarningRiskMessage('estresse_atencao'))
                metrics.push({ label: 'Estresse', value: `${latest.estresse}/10`, critical: false })
            }
            if (latest.humor <= 4) {
                reasons.push('humor deprimido')
                riskMessages.push(getWarningRiskMessage('humor_atencao'))
                metrics.push({ label: 'Humor', value: `${latest.humor}/10`, critical: false })
            }
            if (latest.libido <= 5) {
                reasons.push('libido reduzida')
                riskMessages.push(getWarningRiskMessage('libido_atencao'))
                metrics.push({ label: 'Libido', value: `${latest.libido}/10`, critical: false })
            }
            if (latest.erecao_matinal === false && patient.sexo === 'M') {
                reasons.push('ausência de ereção matinal')
                riskMessages.push(getWarningRiskMessage('erecao_matinal_atencao'))
                metrics.push({ label: 'Ereção Matinal', value: 'Não', critical: false })
            }

            activeAlerts.push({
                id: `warn-${latest.id}`,
                patientId: patient.id,
                patientName: patient.nome || "Atleta",
                type: "Atenção Necessária",
                severity: "Amarelo",
                message: riskMessages.join(' '),
                date: latest.data,
                metric: "Monitoramento",
                details: {
                    sono: latest.qualidade_sono,
                    cansaco: latest.cansaco,
                    estresse: latest.estresse,
                    humor: latest.humor,
                    dor: latest.dor_muscular,
                    libido: latest.libido,
                    lesao: latest.lesao
                }
            })
        }
    })

    // Sort alerts by date (most recent first) and severity
    activeAlerts.sort((a, b) => {
        if (a.severity === 'Vermelho' && b.severity !== 'Vermelho') return -1
        if (a.severity !== 'Vermelho' && b.severity === 'Vermelho') return 1
        return b.date.localeCompare(a.date)
    })

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 italic">Alertas Clínicos</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium italic">
                    Eventos detectados nos últimos 7 dias que requerem intervenção ou monitoramento próximo.
                </p>
            </div>

            <div className="grid gap-3 sm:gap-4">
                {activeAlerts.map((alert) => (
                    <Card key={alert.id} className={`overflow-hidden transition-all hover:shadow-lg border-l-4 sm:border-l-8 ${alert.severity === 'Vermelho'
                        ? 'border-l-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-red-100/50 dark:shadow-none'
                        : 'border-l-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-orange-100/50 dark:shadow-none'
                        }`}>
                        <div className="p-4 sm:p-6 flex flex-col gap-4">
                            <div className="flex gap-3 sm:gap-5 items-start">
                                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${alert.severity === 'Vermelho' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                    }`}>
                                    {alert.severity === 'Vermelho' ? <Zap className="h-4 w-4 sm:h-6 sm:w-6" /> : <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6" />}
                                </div>
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <h3 className={`font-black text-base sm:text-xl tracking-tight ${alert.severity === 'Vermelho' ? 'text-red-900' : 'text-orange-900'}`}>
                                            {alert.type.toUpperCase()}
                                        </h3>
                                        <Badge variant={alert.severity === 'Vermelho' ? 'destructive' : 'secondary'} className={`h-5 sm:h-6 text-[9px] sm:text-[10px] px-1.5 sm:px-2 uppercase font-black tracking-wide sm:tracking-widest ${alert.severity === 'Amarelo' ? 'bg-orange-200 text-orange-900 border-orange-300' : ''
                                            }`}>
                                            {alert.severity === 'Vermelho' ? 'CRÍTICO' : 'ATENÇÃO'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
                                        {alert.message}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 sm:gap-x-5 text-[10px] sm:text-xs pt-1 sm:pt-2">
                                        <span className={`inline-flex items-center gap-1 sm:gap-1.5 font-black uppercase tracking-wider ${alert.severity === 'Vermelho' ? 'text-red-600' : 'text-orange-600'
                                            }`}>
                                            <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {alert.metric}
                                        </span>
                                        <span className="flex items-center gap-1 sm:gap-1.5 text-slate-500 font-bold">
                                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {format(parseISO(alert.date), "dd/MM", { locale: ptBR })}
                                        </span>
                                        <span className="flex items-center gap-1 sm:gap-1.5 text-slate-500 font-bold">
                                            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> <span className="text-slate-900 font-black truncate max-w-[100px] sm:max-w-none">{alert.patientName}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:self-end">
                                <Link href={`/doctor/patients/${alert.patientId}`}>
                                    <Button variant="default" size="sm" className={`w-full sm:w-auto px-4 sm:px-6 font-black gap-2 h-9 sm:h-11 text-xs sm:text-sm transition-all hover:scale-105 ${alert.severity === 'Vermelho' ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-200' : 'bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-200'
                                        }`}>
                                        VER PRONTUÁRIO
                                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                </Link>

                            </div>
                        </div>
                    </Card>
                ))}

                {activeAlerts.length === 0 && (
                    <Card className="border-dashed py-16">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
                            </div>
                            <h3 className="text-xl font-semibold">Tudo sob controle</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                Nenhum paciente apresentou métricas fora da normalidade nos últimos 7 dias.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
