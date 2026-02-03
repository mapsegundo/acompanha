
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Mock Data - filtered for alerts
const alerts = [
    { id: 1, patientId: 1, patientName: "Alice Silva", type: "Risco Alto", severity: "Vermelho", message: "Combinação de sono ruim e dores musculares relatadas.", date: "2023-10-27" },
    { id: 2, patientId: 5, patientName: "Eduardo Lima", type: "Sobrecarga", severity: "Vermelho", message: "Aumento de carga semanal > 30%.", date: "2023-10-20" },
    { id: 3, patientId: 2, patientName: "Bob Santos", type: "Atenção", severity: "Amarelo", message: "Cansaço acumulado por 2 semanas.", date: "2023-10-26" },
]

export default function AlertsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Alertas Clínicos</h1>
            <p className="text-muted-foreground">Monitoramento de eventos que requerem atenção médica.</p>

            <div className="grid gap-4">
                {alerts.map((alert) => (
                    <Card key={alert.id} className={`border-l-4 ${alert.severity === 'Vermelho' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    {alert.severity === 'Vermelho' ? <AlertTriangle className="text-red-500 h-5 w-5" /> : <Info className="text-yellow-500 h-5 w-5" />}
                                    <CardTitle className="text-lg">{alert.type}</CardTitle>
                                </div>
                                <Badge variant={alert.severity === 'Vermelho' ? 'destructive' : 'secondary'}>{alert.severity}</Badge>
                            </div>
                            <CardDescription>{alert.date} • Paciente: <span className="font-semibold text-foreground">{alert.patientName}</span></CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">{alert.message}</p>
                            <Link href={`/doctor/patients/${alert.patientId}`}>
                                <Button variant="secondary" size="sm">Investigar Paciente</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="flex justify-center mb-4"><Info className="h-12 w-12 opacity-20" /></div>
                        <p>Nenhum alerta pendente.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
