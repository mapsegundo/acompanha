import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Plus, Calendar, Activity, AlertTriangle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"
import { calculateHealthStatus, getStatusColor, getBadgeVariant, getRecoveryColor, getRecoveryBadgeVariant, getRecoveryBadgeColorClasses, type RecoveryStatus } from "@/lib/monitoring"
import { SharedNotes } from "./shared-notes"
import { cn } from "@/lib/utils"

interface WeeklyCheckin {
    id: string
    created_at: string
    data: string
    peso: number
    qualidade_sono: number
    dor_muscular: number
    cansaco: number
    humor: number
    estresse: number
    libido: number
    erecao_matinal?: boolean | null
    lesao?: boolean | null
    ciclo_menstrual_alterado?: boolean | null
    recovery_score?: number | null
    recovery_status?: RecoveryStatus | null
    horas_treino_7d: number
}

function getStatusBg(status: string): string {
    const s = status.toLowerCase()
    if (s === "crítico") return "bg-red-600"
    if (s === "atenção") return "bg-amber-500"
    return "bg-emerald-600"
}

function getStatusText(status: string): string {
    const s = status.toLowerCase()
    if (s === "crítico") return "text-red-600"
    if (s === "atenção") return "text-amber-500"
    return "text-emerald-600"
}

interface MetricBarProps {
    label: string
    value: number
    isPositive: boolean
}

function MetricBar({ label, value, isPositive }: MetricBarProps) {
    const pct = (value / 10) * 100
    const good = isPositive ? value >= 7 : value <= 3
    const mid = isPositive ? value >= 4 && value < 7 : value > 3 && value < 7

    const barColor = good ? "bg-emerald-500" : mid ? "bg-amber-400" : "bg-red-500"

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                <span className="text-[11px] font-black tabular-nums">{value}/10</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all", barColor)}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}

export default async function PatientDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: patient } = await supabase
        .from('patients').select('*').eq('user_id', user.id).single()

    let checkins: WeeklyCheckin[] = []
    if (patient) {
        try {
            const { data, error } = await supabase
                .from('weekly_checkins')
                .select('*')
                .eq('patient_id', patient.id)
                .order('data', { ascending: false })
            if (error) throw error
            if (data) checkins = data as WeeklyCheckin[]
        } catch (error) {
            console.error('Error loading checkins:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black tracking-tight">Meus Acompanhamentos</h1>
                    {checkins.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Última sync: {format(parseISO(checkins[0].data), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                    )}
                </div>
            </div>

            {/* Shared Notes from Doctor */}
            {patient && <SharedNotes patientId={patient.id} />}

            {/* Empty state */}
            {checkins.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-muted/10 text-center">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Nenhum check-in encontrado</h3>
                    <p className="text-muted-foreground mb-4 text-sm">Realize seu primeiro acompanhamento semanal.</p>
                    <Link
                        href="/checkin"
                        className="h-12 px-6 rounded-2xl bg-foreground text-background font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
                    >
                        <Plus className="h-4 w-4" /> Realizar Check-in
                    </Link>
                </div>
            )}

            {/* Checkin cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {checkins.map((checkin) => {
                    const status = checkin.recovery_status || calculateHealthStatus(checkin, patient.sexo)
                    const statusColor = checkin.recovery_status
                        ? getRecoveryColor(checkin.recovery_status as RecoveryStatus)
                        : getStatusColor(status)
                    void getRecoveryBadgeVariant
                    void getBadgeVariant
                    void getRecoveryBadgeColorClasses
                    const statusBg = getStatusBg(status)
                    const statusTxt = getStatusText(status)
                    const isCritical = status.toLowerCase() === "crítico"
                    const isAttention = status.toLowerCase() === "atenção"

                    return (
                        <Card
                            key={checkin.id}
                            className="overflow-hidden border-0 shadow-sm"
                            style={{ borderLeft: `4px solid ${statusColor}` }}
                        >
                            <CardContent className="p-0">
                                {/* Top band: status + date */}
                                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {format(parseISO(checkin.data), "dd 'de' MMMM", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <div className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white", statusBg)}>
                                        {status}
                                    </div>
                                </div>

                                {/* Peso + Score */}
                                <div className="px-4 pb-3 flex items-end justify-between gap-2 min-w-0">
                                    <div className="min-w-0">
                                        <span className="text-2xl md:text-3xl font-black italic tabular-nums">{checkin.peso}</span>
                                        <span className="text-sm text-muted-foreground ml-1">kg</span>
                                    </div>
                                    {checkin.recovery_score != null && (
                                        <div className="text-right shrink-0">
                                            <span className={cn("text-xl md:text-2xl font-black tabular-nums", statusTxt)}>{checkin.recovery_score}</span>
                                            <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Recovery</p>
                                        </div>
                                    )}
                                </div>

                                {/* Metric bars */}
                                <div className="px-4 pb-4 space-y-2">
                                    <MetricBar label="Sono" value={checkin.qualidade_sono} isPositive={true} />
                                    <MetricBar label="Cansaço" value={checkin.cansaco} isPositive={false} />
                                    <MetricBar label="Humor" value={checkin.humor} isPositive={true} />
                                    <MetricBar label="Estresse" value={checkin.estresse} isPositive={false} />
                                </div>

                                {/* Risk indicators */}
                                {(isCritical || isAttention || checkin.lesao) && (
                                    <div className="px-4 pb-3 space-y-1.5">
                                        {checkin.lesao && (
                                            <div className="flex items-center gap-2 text-red-600 font-black uppercase text-[10px] bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
                                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Lesão ou Dor relatada
                                            </div>
                                        )}
                                        {checkin.ciclo_menstrual_alterado && patient.sexo === 'F' && (
                                            <div className="flex items-center gap-2 text-red-600 font-black uppercase text-[10px] bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
                                                <div className="h-2 w-2 rounded-full bg-red-600 shrink-0" /> Alteração Ciclo Menstrual
                                            </div>
                                        )}
                                        {!checkin.erecao_matinal && patient.sexo === 'M' && (
                                            <div className="flex items-center gap-2 text-amber-600 font-black uppercase text-[10px] bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                                                <div className="h-2 w-2 rounded-full bg-amber-600 shrink-0" /> Ausência Ereção Matinal
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="px-4 pb-4 pt-1 flex justify-between items-center border-t border-border/40">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                                        <CheckCircle className="h-3 w-3" />
                                        {format(parseISO(checkin.data), "eeee", { locale: ptBR })}
                                    </div>
                                    <Link
                                        href={`/checkin?id=${checkin.id}`}
                                        className="text-xs font-black uppercase text-blue-600 hover:underline min-h-[44px] flex items-center"
                                    >
                                        Editar
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* FAB - New checkin (mobile only) */}
            {checkins.length > 0 && (
                <Link
                    href="/checkin"
                    className="md:hidden fixed bottom-24 right-4 h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center shadow-xl z-40 active:scale-90 transition-transform"
                    aria-label="Novo check-in"
                >
                    <Plus className="h-6 w-6" />
                </Link>
            )}
        </div>
    )
}
