import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, Calendar, ArrowRight, Activity, Moon, Zap, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { format, parseISO, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { calculateHealthStatus } from "@/lib/monitoring"

interface AlertItem {
    id: string
    patientId: string
    patientName: string
    type: string
    severity: 'Vermelho' | 'Amarelo'
    message: string
    date: string
    metric: string
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

    patients?.forEach(patient => {
        const recentCheckins = patient.weekly_checkins
            ?.filter((c: any) => c.data >= sevenDaysAgoOffset)
            .sort((a: any, b: any) => b.data.localeCompare(a.data)) // Get most recent first

        if (!recentCheckins || recentCheckins.length === 0) return

        const latest = recentCheckins[0] as any

        const status = calculateHealthStatus(latest)

        if (status === 'Crítico') {
            const reasons = []
            if (latest.lesao) reasons.push('lesão/dor relatada')
            if (latest.ciclo_menstrual_alterado) reasons.push('alteração no ciclo menstrual')
            if (latest.qualidade_sono <= 3) reasons.push('sono péssimo')
            if (latest.cansaco >= 9) reasons.push('cansaço extremo')
            if (latest.dor_muscular >= 9) reasons.push('dor muscular aguda')
            if (latest.humor <= 2) reasons.push('humor muito baixo')
            if (latest.libido <= 2) reasons.push('libido muito baixa')

            activeAlerts.push({
                id: `crit-${latest.id}`,
                patientId: patient.id,
                patientName: patient.nome || "Atleta",
                type: "Risco Crítico",
                severity: "Vermelho",
                message: `Métricas críticas detectadas: ${reasons.join(', ')}.`,
                date: latest.data,
                metric: "Saúde Geral"
            })
        } else if (status === 'Atenção') {
            const reasons = []
            if (latest.qualidade_sono <= 5) reasons.push('sono insuficiente')
            if (latest.dor_muscular >= 7) reasons.push('dor persistente')
            if (latest.cansaco >= 7) reasons.push('fadiga elevada')
            if (latest.estresse >= 8) reasons.push('estresse alto')
            if (latest.humor <= 4) reasons.push('humor deprimido')
            if (latest.libido <= 5) reasons.push('libido reduzida')
            if (latest.erecao_matinal === false) reasons.push('ausência de ereção matinal')

            activeAlerts.push({
                id: `warn-${latest.id}`,
                patientId: patient.id,
                patientName: patient.nome || "Atleta",
                type: "Atenção Necessária",
                severity: "Amarelo",
                message: `Sinais de alerta identificados: ${reasons.join(', ')}.`,
                date: latest.data,
                metric: "Monitoramento"
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic">Alertas Clínicos</h1>
                <p className="text-muted-foreground mt-1 font-medium italic">
                    Eventos detectados nos últimos 7 dias que requerem intervenção ou monitoramento próximo.
                </p>
            </div>

            <div className="grid gap-4">
                {activeAlerts.map((alert) => (
                    <Card key={alert.id} className={`overflow-hidden transition-all hover:shadow-lg border-l-8 ${alert.severity === 'Vermelho'
                        ? 'border-l-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-red-100/50 dark:shadow-none'
                        : 'border-l-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-orange-100/50 dark:shadow-none'
                        }`}>
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex gap-5 items-start">
                                <div className={`p-3 rounded-2xl hidden sm:flex items-center justify-center shrink-0 ${alert.severity === 'Vermelho' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                    }`}>
                                    {alert.severity === 'Vermelho' ? <Zap className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`font-black text-xl tracking-tight ${alert.severity === 'Vermelho' ? 'text-red-900' : 'text-orange-900'}`}>
                                            {alert.type.toUpperCase()}
                                        </h3>
                                        <Badge variant={alert.severity === 'Vermelho' ? 'destructive' : 'secondary'} className={`h-6 text-[10px] px-2 uppercase font-black tracking-widest ${alert.severity === 'Amarelo' ? 'bg-orange-200 text-orange-900 border-orange-300' : ''
                                            }`}>
                                            {alert.severity === 'Vermelho' ? 'CRÍTICO' : 'ATENÇÃO'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed font-bold max-w-xl">
                                        {alert.message}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs pt-2">
                                        <span className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider ${alert.severity === 'Vermelho' ? 'text-red-600' : 'text-orange-600'
                                            }`}>
                                            <Activity className="h-3.5 w-3.5" /> {alert.metric}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                                            <Calendar className="h-3.5 w-3.5" /> {format(parseISO(alert.date), "dd 'de' MMMM", { locale: ptBR })}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                                            <User className="h-3.5 w-3.5" /> ATLETA: <span className="text-slate-900 underline decoration-slate-300 decoration-2 underline-offset-4 font-black">{alert.patientName.toUpperCase()}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                                <Link href={`/doctor/patients/${alert.patientId}`}>
                                    <Button variant="default" size="sm" className={`w-full sm:w-auto px-6 font-black gap-2 h-11 transition-all hover:scale-105 ${alert.severity === 'Vermelho' ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-200' : 'bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-200'
                                        }`}>
                                        ANALISAR PRONTUÁRIO
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="w-full sm:w-auto font-bold text-slate-500 hover:bg-slate-100 h-11">
                                    IGNORAR
                                </Button>
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
