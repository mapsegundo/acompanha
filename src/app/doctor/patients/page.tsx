"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { calculateHealthStatus, getBadgeVariant, type RecoveryStatus } from "@/lib/monitoring"
import { Search, ArrowRight, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { CheckinData } from "@/lib/monitoring"

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
    sport_modalities: { nome: string } | null
    season_phases: { nome: string } | null
    weekly_checkins: WeeklyCheckin[]
}

type SortConfig = {
    key: 'nome' | 'status' | 'lastCheckin'
    direction: 'asc' | 'desc'
} | null

function SortIcon({ columnKey, sortConfig }: { columnKey: 'nome' | 'status' | 'lastCheckin', sortConfig: SortConfig }) {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />
    return sortConfig.direction === 'asc'
        ? <ArrowUp className="h-4 w-4 ml-1" />
        : <ArrowDown className="h-4 w-4 ml-1" />
}

export default function PatientsListPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortConfig, setSortConfig] = useState<SortConfig>(null)
    const supabase = createClient()

    const fetchPatients = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('patients')
            .select(`
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
            `)
            .order('nome')

        if (data) setPatients(data as Patient[])
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPatients()
    }, [fetchPatients])

    function handleSort(key: 'nome' | 'status' | 'lastCheckin') {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return prev.direction === 'asc' ? { key, direction: 'desc' } : null
            }
            return { key, direction: 'asc' }
        })
    }

    const filteredAndSortedPatients = useMemo(() => {
        let result = [...patients]

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter(patient =>
                patient.nome?.toLowerCase().includes(query) ||
                patient.email?.toLowerCase().includes(query)
            )
        }

        // Sort
        if (sortConfig) {
            result.sort((a, b) => {
                if (sortConfig.key === 'nome') {
                    const aName = a.nome || ''
                    const bName = b.nome || ''
                    return sortConfig.direction === 'asc'
                        ? aName.localeCompare(bName)
                        : bName.localeCompare(aName)
                }

                if (sortConfig.key === 'status') {
                    const aCheckin = a.weekly_checkins?.[a.weekly_checkins.length - 1]
                    const bCheckin = b.weekly_checkins?.[b.weekly_checkins.length - 1]
                    const aStatus = aCheckin ? calculateHealthStatus(aCheckin, a.sexo ?? undefined) : 'Sem Dados'
                    const bStatus = bCheckin ? calculateHealthStatus(bCheckin, b.sexo ?? undefined) : 'Sem Dados'
                    const statusOrder: Record<string, number> = { 'Crítico': 0, 'Atenção': 1, 'Seguro': 2, 'Sem Dados': 3 }
                    const aOrder = statusOrder[aStatus] ?? 3
                    const bOrder = statusOrder[bStatus] ?? 3
                    return sortConfig.direction === 'asc' ? aOrder - bOrder : bOrder - aOrder
                }

                if (sortConfig.key === 'lastCheckin') {
                    const aCheckin = a.weekly_checkins?.[a.weekly_checkins.length - 1]
                    const bCheckin = b.weekly_checkins?.[b.weekly_checkins.length - 1]
                    const aDate = aCheckin?.data || ''
                    const bDate = bCheckin?.data || ''
                    return sortConfig.direction === 'asc'
                        ? aDate.localeCompare(bDate)
                        : bDate.localeCompare(aDate)
                }

                return 0
            })
        }

        return result
    }, [patients, searchQuery, sortConfig])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 italic">Meus Pacientes</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Listagem completa de atletas monitorados e sua saúde atual.</p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-md ring-1 ring-border">
                <div className="bg-muted/50 p-3 sm:p-4 border-b flex items-center justify-between">
                    <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {filteredAndSortedPatients.length} {filteredAndSortedPatients.length === 1 ? 'Atleta' : 'Atletas'}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[200px] min-w-[160px]">
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 hover:bg-transparent font-semibold"
                                        onClick={() => handleSort('nome')}
                                    >
                                        Paciente
                                        <SortIcon columnKey="nome" sortConfig={sortConfig} />
                                    </Button>
                                </TableHead>
                                <TableHead className="min-w-[90px]">
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 hover:bg-transparent font-semibold"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status
                                        <SortIcon columnKey="status" sortConfig={sortConfig} />
                                    </Button>
                                </TableHead>
                                <TableHead className="hidden md:table-cell">Score</TableHead>
                                <TableHead className="hidden sm:table-cell">Modalidade</TableHead>
                                <TableHead className="hidden md:table-cell">Fase</TableHead>
                                <TableHead className="hidden lg:table-cell">
                                    <Button
                                        variant="ghost"
                                        className="h-auto p-0 hover:bg-transparent font-semibold"
                                        onClick={() => handleSort('lastCheckin')}
                                    >
                                        Última Sync
                                        <SortIcon columnKey="lastCheckin" sortConfig={sortConfig} />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right min-w-[70px]">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedPatients.map((patient) => {
                                // Sort to get most recent check-in first
                                const sortedCheckins = [...(patient.weekly_checkins || [])].sort((a, b) => b.data.localeCompare(a.data))
                                const lastCheckin = sortedCheckins[0]

                                // Status Logic
                                let status: 'Crítico' | 'Atenção' | 'Seguro' | 'Sem Dados' = 'Sem Dados'
                                let badgeVariant: 'destructive' | 'secondary' | 'default' | 'outline' = 'outline'
                                let badgeColorClass = ""

                                if (lastCheckin) {
                                    status = calculateHealthStatus(lastCheckin, patient.sexo ?? undefined)
                                    badgeVariant = getBadgeVariant(status)

                                    if (status === 'Crítico') {
                                        badgeColorClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                                    } else if (status === 'Atenção') {
                                        badgeColorClass = "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
                                    } else {
                                        badgeColorClass = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
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
                                        <TableCell className="hidden md:table-cell">
                                            {lastCheckin?.recovery_score !== null && lastCheckin?.recovery_score !== undefined ? (
                                                <span
                                                    className="text-lg font-bold"
                                                    style={{ color: lastCheckin.recovery_status === 'Seguro' ? '#22c55e' : lastCheckin.recovery_status === 'Atenção' ? '#f97316' : '#ef4444' }}
                                                >
                                                    {lastCheckin.recovery_score}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
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
                            {filteredAndSortedPatients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 sm:py-20 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <Search className="h-8 w-8 sm:h-10 sm:w-10" />
                                            <p className="font-medium text-sm sm:text-base">
                                                {searchQuery ? "Nenhum paciente encontrado para esta busca." : "Nenhum atleta cadastrado na base."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
