import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, AlertTriangle, ArrowRight, Calendar, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format, parseISO, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { calculateHealthStatus, getBadgeVariant, CheckinData } from "@/lib/monitoring"

interface WeeklyCheckin extends CheckinData {
    id: string
    data: string
}

interface PatientWithCheckins {
    id: string
    nome: string
    email: string
    sexo: 'M' | 'F'
    sport_modalities: { nome: string } | null
    season_phases: { nome: string } | null
    weekly_checkins: WeeklyCheckin[]
}

export default async function DoctorDashboard() {
    const supabase = await createClient()
    const sevenDaysAgo = subDays(new Date(), 7).toISOString()

    // 1. Fetch patients with their latest check-in
    // We fetch more than 5 to calculate stats accurately, then limit for the table
    const { data: allPatients } = await supabase
        .from('patients')
        .select(`
            *,
            sexo,
            sport_modalities (nome),
            season_phases (nome),
            weekly_checkins (
                id,
                data,
                qualidade_sono,
                dor_muscular,
                cansaco,
                humor,
                estresse,
                libido,
                erecao_matinal,
                lesao,
                ciclo_menstrual_alterado
            )
        `)
        .order('created_at', { ascending: false })

    const patients = allPatients?.slice(0, 5) || []
    const totalPatients = allPatients?.length || 0

    // 2. Calculate Stats
    let criticalAlerts = 0
    let patientsWithRecentCheckin = 0

        ; (allPatients as PatientWithCheckins[] | null)?.forEach((patient) => {
            // Sort check-ins by date descending to get most recent first
            const sortedCheckins = patient.weekly_checkins?.sort((a, b) => b.data.localeCompare(a.data)) || []

            // Find latest check-in in the last 7 days
            const recentCheckins = sortedCheckins.filter((c) => c.data >= sevenDaysAgo.split('T')[0])

            if (recentCheckins && recentCheckins.length > 0) {
                patientsWithRecentCheckin++

                // Logic matching the alerts logic - use the MOST RECENT check-in
                const status = calculateHealthStatus(recentCheckins[0], patient.sexo)
                if (status === 'Crítico') criticalAlerts++
            }
        })

    const responseRate = totalPatients > 0
        ? Math.round((patientsWithRecentCheckin / totalPatients) * 100)
        : 0

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel Médico</h1>
                    <p className="text-muted-foreground">Visão geral do desempenho e saúde dos seus pacientes.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPatients}</div>
                        <p className="text-xs text-muted-foreground">Total de atletas monitorados</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-t-4 border-t-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
                        <p className="text-xs text-muted-foreground">Requerem atenção imediata (7d)</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{responseRate}%</div>
                        <p className="text-xs text-muted-foreground">Check-ins realizados nos últimos 7d</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between pt-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Pacientes Recentes
                    </h2>
                    <Link href="/doctor/patients" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                        Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[200px] min-w-[180px]">Paciente</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="hidden sm:table-cell">Modalidade</TableHead>
                                    <TableHead className="hidden md:table-cell">Fase</TableHead>
                                    <TableHead className="hidden lg:table-cell">Última Sincronização</TableHead>
                                    <TableHead className="text-right min-w-[100px]">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(patients as PatientWithCheckins[]).map((patient) => {
                                    // Sort check-ins to get the MOST RECENT first
                                    const sortedCheckins = patient.weekly_checkins?.sort((a, b) => b.data.localeCompare(a.data)) || []
                                    const lastCheckin = sortedCheckins[0]

                                    // Status Logic matching Patients list
                                    let status: 'Crítico' | 'Atenção' | 'Seguro' | 'Sem Dados' = 'Sem Dados'
                                    let badgeVariant: 'destructive' | 'secondary' | 'default' | 'outline' = 'outline'
                                    let badgeColorClass = ""

                                    if (lastCheckin) {
                                        status = calculateHealthStatus(lastCheckin, patient.sexo)
                                        badgeVariant = getBadgeVariant(status)

                                        if (status === 'Crítico') {
                                            badgeColorClass = "bg-red-100 text-red-700 border-red-200"
                                        } else if (status === 'Atenção') {
                                            badgeColorClass = "bg-orange-100 text-orange-700 border-orange-200"
                                        } else {
                                            badgeColorClass = "bg-green-100 text-green-700 border-green-200"
                                        }
                                    }

                                    return (
                                        <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors group">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border shrink-0">
                                                        <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold">
                                                            {patient.nome?.substring(0, 2).toUpperCase() || 'P'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-slate-900 truncate">{patient.nome || 'Sem Nome'}</span>
                                                        <span className="text-xs text-muted-foreground font-normal truncate hidden sm:block">{patient.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={badgeVariant === 'default' ? 'outline' : badgeVariant} className={`rounded-full px-2 sm:px-3 py-0.5 text-[9px] sm:text-[10px] uppercase font-black tracking-wide sm:tracking-widest ${badgeColorClass}`}>
                                                    {status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <span className="text-sm text-slate-600 font-medium">{patient.sport_modalities?.nome || '-'}</span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-md">
                                                    {patient.season_phases?.nome || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {lastCheckin ? format(parseISO(lastCheckin.data), "dd/MM/yyyy") : 'Pendente'}
                                                    </span>
                                                    {lastCheckin && (
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                            {format(parseISO(lastCheckin.data), "EEEE", { locale: ptBR })}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/doctor/patients/${patient.id}`}>
                                                    <Button variant="ghost" size="sm" className="group-hover:bg-blue-50 group-hover:text-blue-600 font-bold text-xs gap-1 sm:gap-2 transition-all px-2 sm:px-3">
                                                        <span className="hidden sm:inline">Ver</span>
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {!patients?.length && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <User className="h-8 w-8 opacity-20" />
                                                <p>Nenhum paciente encontrado.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    )
}
