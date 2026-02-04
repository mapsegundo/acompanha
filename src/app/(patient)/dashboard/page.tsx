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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {checkins.map((checkin) => {
                    const status = calculateHealthStatus(checkin)
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
                            <CardContent>
                                <div className="text-2xl font-bold flex items-center gap-2">
                                    {checkin.peso} kg
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Sono: {checkin.qualidade_sono}/10</span>
                                        <span>Cansaço: {checkin.cansaco}/10</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Treino: {checkin.horas_treino_7d}h</span>
                                        {checkin.lesao && <span className="text-red-500 font-semibold truncate">Lesão/Incômodo</span>}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <Link href={`/checkin?id=${checkin.id}`} className="text-xs text-blue-500 hover:underline">
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
