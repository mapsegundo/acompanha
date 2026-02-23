"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ComponentProps } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { calculateHealthStatus, getBadgeVariant, type CheckinData, type RecoveryStatus } from "@/lib/monitoring"
import { Search, ArrowRight, ArrowUpDown, ChevronLeft, ChevronRight, Users } from "lucide-react"
import { ClickableTableRow } from "@/components/dashboard/clickable-table-row"

interface WeeklyCheckin extends CheckinData {
  id: string
  data: string
  recovery_score: number | null
  recovery_status: RecoveryStatus | null
}

type Patient = {
  id: string
  nome: string | null
  email: string | null
  sexo: string | null
  ativo: boolean
  sport_modalities: { nome: string } | null
  season_phases: { nome: string } | null
  weekly_checkins: WeeklyCheckin[]
}

type StatusFilter = "ativos" | "inativos" | "todos"

type SortConfig =
  | {
      key: "nome" | "status" | "lastCheckin"
      direction: "asc" | "desc"
    }
  | null

type TableStatus = ReturnType<typeof calculateHealthStatus>
type BadgeVariant = ComponentProps<typeof Badge>["variant"]

export default function PatientsListPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ativos")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const supabase = createClient()

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("patients")
      .select(
        `
          *,
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
      .order("nome")

    if (data) {
      setPatients(data as Patient[])
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPatients()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchPatients])

  function handleSort(key: "nome" | "status" | "lastCheckin") {
    setSortConfig((previous) => {
      if (previous?.key === key) {
        return previous.direction === "asc" ? { key, direction: "desc" } : null
      }
      return { key, direction: "asc" }
    })
  }

  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients]

    if (statusFilter === "ativos") {
      result = result.filter((patient) => patient.ativo !== false)
    } else if (statusFilter === "inativos") {
      result = result.filter((patient) => patient.ativo === false)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (patient) => patient.nome?.toLowerCase().includes(query) || patient.email?.toLowerCase().includes(query)
      )
    }

    if (sortConfig) {
      result.sort((leftPatient, rightPatient) => {
        if (sortConfig.key === "nome") {
          return sortConfig.direction === "asc"
            ? (leftPatient.nome || "").localeCompare(rightPatient.nome || "")
            : (rightPatient.nome || "").localeCompare(leftPatient.nome || "")
        }

        const leftLatest = [...(leftPatient.weekly_checkins || [])].sort((a, b) => b.data.localeCompare(a.data))[0]
        const rightLatest = [...(rightPatient.weekly_checkins || [])].sort((a, b) => b.data.localeCompare(a.data))[0]

        if (sortConfig.key === "status") {
          const leftStatus: TableStatus = leftLatest ? calculateHealthStatus(leftLatest, leftPatient.sexo ?? undefined) : "Sem Dados"
          const rightStatus: TableStatus = rightLatest
            ? calculateHealthStatus(rightLatest, rightPatient.sexo ?? undefined)
            : "Sem Dados"
          const order = { Crítico: 0, Atenção: 1, Seguro: 2, "Sem Dados": 3 }
          return sortConfig.direction === "asc"
            ? order[leftStatus] - order[rightStatus]
            : order[rightStatus] - order[leftStatus]
        }

        if (sortConfig.key === "lastCheckin") {
          const leftDate = leftLatest?.data || ""
          const rightDate = rightLatest?.data || ""
          return sortConfig.direction === "asc" ? leftDate.localeCompare(rightDate) : rightDate.localeCompare(leftDate)
        }

        return 0
      })
    }

    return result
  }, [patients, searchQuery, sortConfig, statusFilter])

  const totalPages = Math.ceil(filteredAndSortedPatients.length / pageSize)
  const paginatedPatients = filteredAndSortedPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-medium">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold italic tracking-tight text-[#0f172a]">Meus Pacientes</h1>
        <p className="text-muted-foreground">Listagem completa de atletas monitorados e sua saúde atual.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex border rounded-lg p-1 bg-background">
          {(["ativos", "inativos", "todos"] as StatusFilter[]).map((filterValue) => (
            <button
              key={filterValue}
              type="button"
              onClick={() => {
                setStatusFilter(filterValue)
                setCurrentPage(1)
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                statusFilter === filterValue ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground"
              }`}
            >
              {filterValue}
            </button>
          ))}
        </div>
      </div>

      <Card className="border shadow-sm">
        <div className="p-4 flex items-center gap-2 text-muted-foreground text-sm border-b">
          <Users className="h-4 w-4" />
          <span>
            {filteredAndSortedPatients.length} {filteredAndSortedPatients.length === 1 ? "Atleta" : "Atletas"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("nome")} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-1">
                    Paciente <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort("status")} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead
                  onClick={() => handleSort("lastCheckin")}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Última Sync <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => {
                const latest = [...(patient.weekly_checkins || [])].sort((a, b) => b.data.localeCompare(a.data))[0]

                let status: TableStatus = "Sem Dados"
                let variant: BadgeVariant = "outline"
                if (latest) {
                  status = calculateHealthStatus(latest, patient.sexo ?? undefined)
                  variant = getBadgeVariant(status)
                }

                return (
                  <ClickableTableRow
                    key={patient.id}
                    href={`/doctor/patients/${patient.id}`}
                    label={`Abrir prontuário de ${patient.nome ?? "paciente"}`}
                    className={`${!patient.ativo ? "opacity-50 grayscale" : ""}`}
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
                      <Badge variant={variant} className="font-bold uppercase py-0 px-2 text-[10px]">
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
                      <div className="text-sm font-medium">
                        {latest ? format(parseISO(latest.data), "dd/MM/yyyy") : "Pendente"}
                      </div>
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
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  setCurrentPage((pageValue) => Math.max(1, pageValue - 1))
                }}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  setCurrentPage((pageValue) => Math.min(totalPages, pageValue + 1))
                }}
                disabled={currentPage === totalPages}
              >
                Próxima <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
