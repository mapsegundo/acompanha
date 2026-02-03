import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, MapPin, User, ArrowRight, Users } from "lucide-react"

export default async function PatientsListPage() {
    const supabase = await createClient()

    // Fetch all patients with their latest check-in
    const { data: patients } = await supabase
        .from('patients')
        .select(`
            *,
            weekly_checkins (
                id,
                data,
                qualidade_sono,
                dor_muscular,
                cansaco,
                humor
            )
        `)
        .order('nome')

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic">Meus Pacientes</h1>
                <p className="text-muted-foreground">Listagem completa de atletas monitorados e sua saúde atual.</p>
            </div>

            <Card className="overflow-hidden border-none shadow-md ring-1 ring-border">
                <div className="bg-muted/50 p-4 border-b flex items-center justify-between">
                    <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {patients?.length || 0} Atletas
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[300px]">Paciente</TableHead>
                            <TableHead>Status Saúde</TableHead>
                            <TableHead>Modalidade</TableHead>
                            <TableHead>Última Sincronização</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients?.map((patient) => {
                            const lastCheckin = patient.weekly_checkins?.[patient.weekly_checkins.length - 1]

                            // Status Logic
                            let status: 'Crítico' | 'Atenção' | 'Seguro' | 'Sem Dados' = 'Sem Dados'
                            let badgeVariant: 'destructive' | 'secondary' | 'default' | 'outline' = 'outline'
                            let badgeColorClass = ""

                            if (lastCheckin) {
                                const isCritical = lastCheckin.qualidade_sono <= 3 || lastCheckin.dor_muscular >= 8 || lastCheckin.cansaco >= 9 || lastCheckin.humor <= 3
                                const isWarning = lastCheckin.qualidade_sono <= 5 || lastCheckin.dor_muscular >= 6 || lastCheckin.humor <= 5

                                if (isCritical) {
                                    status = 'Crítico'
                                    badgeVariant = 'destructive'
                                    badgeColorClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
                                } else if (isWarning) {
                                    status = 'Atenção'
                                    badgeVariant = 'secondary'
                                    badgeColorClass = "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
                                } else {
                                    status = 'Seguro'
                                    badgeVariant = 'default'
                                    badgeColorClass = "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                                }
                            }

                            return (
                                <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border">
                                                <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-bold">
                                                    {patient.nome?.substring(0, 2).toUpperCase() || 'P'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{patient.nome || 'Sem Nome'}</span>
                                                <span className="text-xs text-muted-foreground font-normal">{patient.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={badgeVariant === 'default' ? 'outline' : badgeVariant} className={`rounded-full px-3 py-0.5 text-[10px] uppercase font-black tracking-widest ${badgeColorClass}`}>
                                            {status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600 font-medium">{patient.modalidade || '-'}</span>
                                    </TableCell>
                                    <TableCell>
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
                                            <Button variant="ghost" size="sm" className="group-hover:bg-blue-50 group-hover:text-blue-600 font-bold text-xs gap-2 transition-all">
                                                Visualizar Prontuário
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {!patients?.length && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                        <User className="h-10 w-10" />
                                        <p className="font-medium">Nenhum atleta cadastrado na base.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
