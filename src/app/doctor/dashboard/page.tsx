
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
import { Activity, Users, AlertTriangle } from "lucide-react"

// Mock Data
const patients = [
    { id: 1, name: "Alice Silva", status: "Vermelho", lastCheckin: "2023-10-27", trend: "down" },
    { id: 2, name: "Bob Santos", status: "Amarelo", lastCheckin: "2023-10-26", trend: "stable" },
    { id: 3, name: "Carlos Oliveira", status: "Verde", lastCheckin: "2023-10-25", trend: "up" },
    { id: 4, name: "Daniela Costa", status: "Verde", lastCheckin: "2023-10-27", trend: "up" },
]

export default function DoctorDashboard() {
    const redCount = patients.filter(p => p.status === 'Vermelho').length
    const activeCount = patients.length

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Painel Médico</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                        <p className="text-xs text-muted-foreground">+2 essa semana</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{redCount}</div>
                        <p className="text-xs text-muted-foreground">Pacientes em vermelho</p>
                    </CardContent>
                </Card>
                <Card>
                    {/* Placeholder for compliance or average health */}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Acompanhamentos (Semana)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-muted-foreground">Taxa de resposta</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Status Recente</h2>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Paciente</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Último Check-in</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">{patient.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={patient.status === 'Verde' ? "default" : patient.status === 'Amarelo' ? "secondary" : "destructive"}
                                            className={patient.status === 'Verde' ? "bg-green-600 hover:bg-green-700" : patient.status === 'Amarelo' ? "bg-yellow-500 hover:bg-yellow-600" : ""}>
                                            {patient.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{patient.lastCheckin}</TableCell>
                                    <TableCell>
                                        <a href={`/doctor/patients/${patient.id}`} className="text-blue-600 hover:underline text-sm">Ver Detalhes</a>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}
