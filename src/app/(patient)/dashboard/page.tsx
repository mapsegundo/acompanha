
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

// Mock data for initial display
const checkins = [
    { id: 1, date: '2023-10-27', status: 'Verde', weight: 75.5, note: 'Semana boa, treino consistente.' },
    { id: 2, date: '2023-10-20', status: 'Amarelo', weight: 76.0, note: 'Cansaço acumulado.' },
    { id: 3, date: '2023-10-13', status: 'Verde', weight: 76.2, note: 'Tudo ok.' },
]

export default function DashboardPage() {
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
                {checkins.map((checkin) => (
                    <Card key={checkin.id} className="hover:shadow-lg transition-shadow border-l-4"
                        style={{ borderLeftColor: checkin.status === 'Verde' ? '#22c55e' : checkin.status === 'Amarelo' ? '#eab308' : '#ef4444' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {checkin.date}
                            </CardTitle>
                            <Badge variant={checkin.status === 'Verde' ? "default" : checkin.status === 'Amarelo' ? "secondary" : "destructive"}>
                                {checkin.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{checkin.weight} kg</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {checkin.note}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
