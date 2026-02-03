"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, BarChart, Bar, Legend } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Define types for the data we expect
interface Checkin {
    id: string
    data: string
    peso: number
    cansaco: number
    horas_treino_7d: number
    qualidade_sono: number
    dor_muscular: number
    estresse: number
    humor: number
    duracao_treino: number
    libido: number
    erecao_matinal: boolean
    lesao: boolean
    local_lesao: string | null
}

interface PatientChartsProps {
    checkins: Checkin[]
}

const subjectiveConfig = {
    qualidade_sono: { label: "Sono", color: "#60a5fa" }, // Blue
    cansaco: { label: "Cansaço", color: "#f59e0b" }, // Amber
    estresse: { label: "Estresse", color: "#ef4444" }, // Red
    humor: { label: "Humor", color: "#22c55e" }, // Green
    dor_muscular: { label: "Dor", color: "#71717a" }, // Zinc
    libido: { label: "Libido", color: "#ec4899" }, // Pink
} satisfies ChartConfig

const physicalConfig = {
    peso: { label: "Peso (kg)", color: "#2563eb" },
    horas_treino_7d: { label: "Horas Treino", color: "#f97316" },
} satisfies ChartConfig

export function PatientCharts({ checkins }: PatientChartsProps) {
    // Format dates for display
    const data = checkins.map(c => ({
        ...c,
        formattedDate: format(new Date(c.data), "dd/MM", { locale: ptBR })
    }))

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Wellbeing Radar/Line Chart */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Bem-estar e Subjetivos (0-10)</CardTitle>
                        <CardDescription>Monitoramento de qualidade de vida e recuperação.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={subjectiveConfig} className="min-h-[300px] w-full">
                            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis domain={[0, 10]} hide />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line type="monotone" dataKey="qualidade_sono" stroke="var(--color-qualidade_sono)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="cansaco" stroke="var(--color-cansaco)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="estresse" stroke="var(--color-estresse)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="humor" stroke="var(--color-humor)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="dor_muscular" stroke="var(--color-dor_muscular)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="libido" stroke="var(--color-libido)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Physical & Training Chart */}
                <Card className="col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Carga e Peso</CardTitle>
                        <CardDescription>Relação entre volume de treino e peso corporal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={physicalConfig} className="min-h-[300px] w-full">
                            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis yAxisId="left" orientation="left" stroke="var(--color-peso)" domain={['dataMin - 1', 'dataMax + 1']} hide />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-horas_treino_7d)" hide />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="peso" fill="var(--color-peso)" radius={[4, 4, 0, 0]} name="Peso (kg)" />
                                <Line yAxisId="right" type="monotone" dataKey="horas_treino_7d" stroke="var(--color-horas_treino_7d)" strokeWidth={3} name="Horas de Treino" />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Cards */}
            <h3 className="text-lg font-semibold mt-8">Histórico Recente</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {checkins.slice().reverse().slice(0, 4).map((checkin) => (
                    <Card key={checkin.id} className="text-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{format(new Date(checkin.data), "dd 'de' MMMM", { locale: ptBR })}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex justify-between"><span>Peso:</span> <span className="font-bold">{checkin.peso} kg</span></div>
                            <div className="flex justify-between"><span>Sono:</span> <span className={checkin.qualidade_sono < 5 ? "text-red-500" : "text-green-600"}>{checkin.qualidade_sono}/10</span></div>
                            <div className="flex justify-between"><span>Lesão:</span> {checkin.lesao ? <Badge variant="destructive">Sim</Badge> : <Badge variant="outline">Não</Badge>}</div>
                            {checkin.local_lesao && <div className="text-xs text-red-500 mt-1">Local: {checkin.local_lesao}</div>}
                            <div className="flex justify-between pt-2 border-t mt-2"><span>Ereção Matinal:</span> {checkin.erecao_matinal ? "Sim" : "Não"}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
