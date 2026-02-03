
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Activity, Users, AlertTriangle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function DoctorDashboard() {
    const supabase = await createClient()

    // Fetch patients (limit 5 for dashboard)
    const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })

    // Get total counts
    const { count: activeCount } = await supabase.from('patients').select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Painel Médico</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Monitorados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">--</div>
                        <p className="text-xs text-muted-foreground">Em desenvolvimento</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Acompanhamentos</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--%</div>
                        <p className="text-xs text-muted-foreground">Taxa de resposta</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Pacientes Recentes</h2>
                    <Link href="/doctor/patients" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                        Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Paciente</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Modalidade</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients?.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">{patient.nome || 'Sem Nome'}</TableCell>
                                    <TableCell>{patient.email}</TableCell>
                                    <TableCell>{patient.modalidade || '-'}</TableCell>
                                    <TableCell>
                                        <Link href={`/doctor/patients/${patient.id}`} className="text-blue-600 hover:underline text-sm">
                                            Ver Detalhes
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!patients?.length && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        Nenhum paciente encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}
