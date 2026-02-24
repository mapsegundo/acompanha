import type { ComponentProps } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, AlertTriangle, ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format, parseISO, startOfDay, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  calculateHealthStatus,
  getBadgeVariant,
  getHealthBadgeColorClasses,
  type CheckinData,
  type RecoveryStatus,
} from "@/lib/monitoring"
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row"

export const dynamic = "force-dynamic"

interface WeeklyCheckin extends CheckinData {
  id: string
  data: string
  recovery_score?: number | null
  recovery_status?: RecoveryStatus | null
}

interface PatientWithCheckins {
  id: string
  nome: string
  email: string
  sexo: "M" | "F"
  ativo: boolean
  sport_modalities: { nome: string } | null
  season_phases: { nome: string } | null
  weekly_checkins: WeeklyCheckin[]
}

type TableStatus = ReturnType<typeof calculateHealthStatus>
type BadgeVariant = ComponentProps<typeof Badge>["variant"]

export default async function DoctorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number.parseInt(pageParam || "1", 10)
  const pageSize = 10
  const supabase = await createClient()
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7))

  const { data: allPatients } = await supabase
    .from("patients")
    .select(
      `
        *,
        sexo,
        ativo,
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
          ciclo_menstrual_alterado,
          recovery_score,
          recovery_status
        )
      `
    )
    .order("created_at", { ascending: false })

  const activePatients = ((allPatients as PatientWithCheckins[] | null) ?? []).filter((patient) => patient.ativo !== false)
  const totalPatients = activePatients.length
  const totalPages = Math.max(1, Math.ceil(totalPatients / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const paginatedPatients = activePatients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  let criticalAlerts = 0
  let patientsWithRecentCheckin = 0

  activePatients.forEach((patient) => {
    const sortedCheckins = [...(patient.weekly_checkins ?? [])].sort((a, b) => b.data.localeCompare(a.data))
    const recentCheckins = sortedCheckins.filter((checkin) => {
      const checkinDate = startOfDay(parseISO(checkin.data))
      return checkinDate >= sevenDaysAgo
    })

    if (recentCheckins.length > 0) {
      patientsWithRecentCheckin += 1
      const status = calculateHealthStatus(recentCheckins[0], patient.sexo)
      if (status === "Crítico") {
        criticalAlerts += 1
      }
    }
  })

  const responseRate = totalPatients > 0 ? Math.round((patientsWithRecentCheckin / totalPatients) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Painel Médico</h1>
        <p className="text-muted-foreground">Visão geral do desempenho e saúde dos seus pacientes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1 text-slate-400">Total de atletas monitorados</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-t-red-500 border-t-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1 text-slate-400">Requerem atenção imediata (7d)</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 text-slate-400">Check-ins realizados nos últimos 7d</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Pacientes Recentes
          </h2>
          <Link href="/doctor/patients" className="text-xs font-semibold text-slate-900 flex items-center gap-1 hover:underline">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <Card className="border shadow-sm overflow-hidden bg-transparent md:bg-card border-none md:border-solid">
          {/* Mobile view - Cards */}
          <div className="md:hidden flex flex-col gap-4">
            {paginatedPatients.map((patient) => {
              const latest = [...(patient.weekly_checkins || [])].sort((a, b) => b.data.localeCompare(a.data))[0]
              let status: TableStatus = "Sem Dados"
              let variant: BadgeVariant = "outline"

              if (latest) {
                status = calculateHealthStatus(latest, patient.sexo)
                variant = getBadgeVariant(status)
              }

              return (
                <Link
                  href={`/doctor/patients/${patient.id}`}
                  key={patient.id}
                  className="block p-4 border rounded-xl bg-card shadow-sm hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-sm uppercase">
                          {patient.nome?.substring(0, 2) || "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-[#0f172a] line-clamp-1 break-all">{patient.nome}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 break-all">{patient.email}</div>
                      </div>
                    </div>
                    <Badge
                      variant={variant}
                      className={`font-bold uppercase py-0.5 px-2 text-[10px] whitespace-nowrap ${getHealthBadgeColorClasses(status)}`}
                    >
                      {status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-4 bg-slate-50 border p-3 rounded-lg">
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Score</div>
                      {latest && latest.recovery_score !== null && latest.recovery_score !== undefined ? (
                        <span className="font-bold text-orange-500">{latest.recovery_score}</span>
                      ) : (
                        "-"
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Última Sync</div>
                      <div className="font-medium">{latest ? format(parseISO(latest.data), "dd/MM") : "Pendente"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Modalidade</div>
                      <div className="truncate text-muted-foreground text-xs font-semibold">{patient.sport_modalities?.nome || "-"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Fase</div>
                      <div className="truncate text-muted-foreground text-xs font-semibold">{patient.season_phases?.nome || "-"}</div>
                    </div>
                  </div>
                </Link>
              )
            })}
            {!paginatedPatients.length && (
              <div className="text-center py-12 text-muted-foreground border rounded-xl bg-card">
                Nenhum paciente configurado.
              </div>
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Última Sincronização</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.map((patient) => {
                  const latest = [...(patient.weekly_checkins || [])].sort((a, b) => b.data.localeCompare(a.data))[0]
                  let status: TableStatus = "Sem Dados"
                  let variant: BadgeVariant = "outline"

                  if (latest) {
                    status = calculateHealthStatus(latest, patient.sexo)
                    variant = getBadgeVariant(status)
                  }

                  return (
                    <ClickableTableRow
                      key={patient.id}
                      href={`/doctor/patients/${patient.id}`}
                      label={`Abrir prontuário de ${patient.nome ?? "paciente"}`}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs uppercase">
                              {patient.nome?.substring(0, 2) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-[#0f172a]">{patient.nome}</div>
                            <div className="text-xs text-muted-foreground">{patient.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={variant}
                          className={`font-bold uppercase py-0 px-2 text-[10px] ${getHealthBadgeColorClasses(status)}`}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {latest && latest.recovery_score !== null && latest.recovery_score !== undefined ? (
                          <span className="font-bold text-orange-500 text-lg">{latest.recovery_score}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{patient.sport_modalities?.nome || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/50">
                          {patient.season_phases?.nome || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{latest ? format(parseISO(latest.data), "dd/MM/yyyy") : "Pendente"}</div>
                        {latest && (
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">
                            {format(parseISO(latest.data), "EEEE", { locale: ptBR })}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-medium text-xs">
                          Ver <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </ClickableTableRow>
                  )
                })}

                {!paginatedPatients.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nenhum paciente configurado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Link href={`/doctor/dashboard?page=${Math.max(1, currentPage - 1)}`} className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
            </Link>
            <Link
              href={`/doctor/dashboard?page=${Math.min(totalPages, currentPage + 1)}`}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            >
              <Button variant="outline" size="sm">
                Próxima <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
