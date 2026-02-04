import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Calendar, Activity, UserCircle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert"

interface WeeklyCheckin {
    id: string
    created_at: string
    data: string
    peso: number
    cansaco: number
    dor_muscular: number
    qualidade_sono: number
    horas_treino_7d: number
    lesao: boolean
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
                    // Determine Status (This logic implies backend or edge function should calculate it)
                    // For now, let's infer based on 'qualidade_sono' and 'dor_muscular' as simple heuristic if no explicit 'status' field,
                    // BUT: user prompt implies there is mock with status. Database schema might not have 'status' column yet.
                    // Let's assume we want to show raw data for now or a visual indicator.

                    // Simple heuristic for UI demo if status column doesn't exist on checkin table
                    const isGood = checkin.qualidade_sono >= 7 && checkin.dor_muscular <= 3
                    const isBad = checkin.qualidade_sono <= 4 || checkin.dor_muscular >= 8

                    const statusColor = isGood ? 'Verde' : isBad ? 'Vermelho' : 'Amarelo'
                    const statusBadge = isGood ? 'default' : isBad ? 'destructive' : 'secondary'
                    const borderColors = {
                        'Verde': '#22c55e',
                        'Amarelo': '#eab308',
                        'Vermelho': '#ef4444'
                    }

                    return (
                        <Card key={checkin.id} className="hover:shadow-lg transition-shadow border-l-4"
                            style={{ borderLeftColor: borderColors[statusColor] }}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(parseISO(checkin.data), "dd 'de' MMMM", { locale: ptBR })}
                                </CardTitle>
                                <Badge variant={statusBadge}>
                                    {statusColor}
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
                                        {checkin.lesao && <span className="text-red-500 font-semibold">Lesão Relatada</span>}
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
