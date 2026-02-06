import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Calendar, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"
import { calculateHealthStatus, getStatusColor, getBadgeVariant } from "@/lib/monitoring"
import { SharedNotes } from "./shared-notes"

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
    erecao_matinal: boolean
    lesao: boolean
    ciclo_menstrual_alterado?: boolean
    horas_treino_7d: number
}

export default async function PatientDashboard() {
    const supabase = await createClient()

    // 1. Get logged user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Get Patient Data
    const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // 3. Get Checkins
    let checkins: WeeklyCheckin[] = []

    if (patient) {
        try {
            const { data, error } = await supabase
                .from('weekly_checkins')
                .select('*')
                .eq('patient_id', patient.id)
                .order('data', { ascending: false })

            if (error) {
                throw error
            }

            if (data) checkins = data as WeeklyCheckin[]
        } catch (error) {
            console.error('Error loading checkins:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Meus Acompanhamentos</h1>
                <Link href="/checkin">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Novo
                    </Button>
                </Link>
            </div>

            {/* Shared Notes from Doctor */}
            {patient && <SharedNotes patientId={patient.id} />}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {checkins.map((checkin) => {
                    const status = calculateHealthStatus(checkin, patient.sexo)
                    const statusColor = getStatusColor(status)
                    const statusBadge = getBadgeVariant(status)

                    return (
                        <Card key={checkin.id} className="hover:shadow-lg transition-all border-l-4"
                            style={{ borderLeftColor: statusColor }}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(parseISO(checkin.data), "dd 'de' MMMM", { locale: ptBR })}
                                </CardTitle>
                                <Badge variant={statusBadge} className="font-bold uppercase tracking-widest text-[10px]">
                                    {status}
                                </Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-2xl font-black flex items-center gap-2 text-slate-900 italic">
                                    {checkin.peso} kg
                                </div>
                                <div className="text-[11px] text-slate-600 font-bold space-y-3">
                                    {/* Linha 1: Saúde Básica */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex justify-between border-b border-slate-100 pb-1">
                                            <span className="text-slate-400 font-black uppercase tracking-tighter">Sono</span>
                                            <span className="text-slate-900 font-black">{checkin.qualidade_sono}/10</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-1">
                                            <span className="text-slate-400 font-black uppercase tracking-tighter">Fadiga</span>
                                            <span className="text-slate-900 font-black">{checkin.cansaco}/10</span>
                                        </div>
                                    </div>

                                    {/* Linha 2: Psicológico */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex justify-between border-b border-slate-100 pb-1">
                                            <span className="text-slate-400 font-black uppercase tracking-tighter">Humor</span>
                                            <span className="text-slate-900 font-black">{checkin.humor}/10</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-1">
                                            <span className="text-slate-400 font-black uppercase tracking-tighter">Stress</span>
                                            <span className="text-slate-900 font-black">{checkin.estresse}/10</span>
                                        </div>
                                    </div>

                                    {/* Linha 3: Recuperação & Hormonal */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex justify-between border-b border-slate-100 pb-1">
                                            <span className="text-slate-400 font-black uppercase tracking-tighter">Libido</span>
                                            <span className="text-slate-900 font-black font-mono">{checkin.libido}/10</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-100 pb-1">
                                            <span className="text-slate-400 font-black uppercase tracking-tighter">Treino</span>
                                            <span className="text-slate-900 font-black">{checkin.horas_treino_7d}h</span>
                                        </div>
                                    </div>

                                    {/* Indicadores de Risco */}
                                    <div className="space-y-2 pt-1">
                                        {checkin.lesao && (
                                            <div className="flex items-center gap-2 text-red-600 font-black uppercase text-[10px] bg-red-50 p-1.5 rounded-lg border border-red-100">
                                                <Activity className="h-3 w-3" /> Lesão ou Dor relatada
                                            </div>
                                        )}
                                        {checkin.ciclo_menstrual_alterado && patient.sexo === 'F' && (
                                            <div className="flex items-center gap-2 text-red-600 font-black uppercase text-[10px] bg-red-50 p-1.5 rounded-lg border border-red-100">
                                                <div className="h-1.5 w-1.5 rounded-full bg-red-600" /> Alteração Ciclo Menstrual
                                            </div>
                                        )}
                                        {!checkin.erecao_matinal && patient.sexo === 'M' && (
                                            <div className="flex items-center gap-2 text-orange-600 font-black uppercase text-[10px] bg-orange-50 p-1.5 rounded-lg border border-orange-100">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-600" /> Ausência Ereção Matinal
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <span className="text-[10px] text-slate-400 font-bold">Ref: {format(parseISO(checkin.data), "eeee", { locale: ptBR })}</span>
                                    <Link href={`/checkin?id=${checkin.id}`} className="text-xs text-blue-600 font-black uppercase hover:underline">
                                        Editar
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {checkins.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/10">
                        <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Nenhum check-in encontrado</h3>
                        <p className="text-muted-foreground mb-4">Realize seu primeiro acompanhamento semanal.</p>
                        <Link href="/checkin">
                            <Button>Realizar Check-in</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
