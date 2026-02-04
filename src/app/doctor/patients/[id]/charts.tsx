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
    ciclo_menstrual_alterado: boolean
    libido: number
    erecao_matinal: boolean
    lesao: boolean
    local_lesao: string | null
}

interface PatientChartsProps {
    checkins: Checkin[]
    sexo: string
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

export function PatientCharts({ checkins, sexo }: PatientChartsProps) {
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
                        <CardTitle>Bem-estar e Subjetivos</CardTitle>
                        <CardDescription>Escala 0-10: valores altos = melhor para Sono/Humor/Libido, valores baixos = melhor para Cansaço/Estresse/Dor.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={subjectiveConfig} className="min-h-[300px] w-full">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={11}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line type="monotone" dataKey="qualidade_sono" stroke="var(--color-qualidade_sono)" strokeWidth={2} dot={false} name="Sono" />
                                <Line type="monotone" dataKey="cansaco" stroke="var(--color-cansaco)" strokeWidth={2} dot={false} name="Cansaço" />
                                <Line type="monotone" dataKey="estresse" stroke="var(--color-estresse)" strokeWidth={2} dot={false} name="Estresse" />
                                <Line type="monotone" dataKey="humor" stroke="var(--color-humor)" strokeWidth={2} dot={false} name="Humor" />
                                <Line type="monotone" dataKey="dor_muscular" stroke="var(--color-dor_muscular)" strokeWidth={2} dot={false} name="Dor" />
                                <Line type="monotone" dataKey="libido" stroke="var(--color-libido)" strokeWidth={2} dot={false} name="Libido" />
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
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    stroke="var(--color-peso)"
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                    tickFormatter={(value) => `${value}kg`}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="var(--color-horas_treino_7d)"
                                    domain={[0, 'dataMax + 5']}
                                    tickFormatter={(value) => `${value}h`}
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
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
                    <Card key={checkin.id} className="text-sm border-none shadow-md ring-1 ring-border overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <CardTitle className="text-sm font-black italic text-slate-900">
                                {format(new Date(checkin.data), "dd 'de' MMMM", { locale: ptBR })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* CATEGORY: PHYSICAL & PERFORMANCE */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Peso:</span>
                                    <span className="font-black text-slate-900">{checkin.peso} kg</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Treino (7d):</span>
                                    <span className="font-black text-slate-900">{checkin.horas_treino_7d}h</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Média Sessão:</span>
                                    <span className="font-black text-slate-900">{checkin.duracao_treino} min</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 space-y-2">
                                {/* CATEGORY: WELL-BEING (0-10) */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase">Sono:</span>
                                        <span className={`text-xs font-black ${checkin.qualidade_sono >= 8 ? "text-green-600" : checkin.qualidade_sono >= 5 ? "text-orange-500" : "text-red-500"}`}>{checkin.qualidade_sono}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase">Cansaço:</span>
                                        <span className={`text-xs font-black ${checkin.cansaco <= 3 ? "text-green-600" : checkin.cansaco <= 7 ? "text-orange-500" : "text-red-500"}`}>{checkin.cansaco}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase">Estresse:</span>
                                        <span className={`text-xs font-black ${checkin.estresse <= 3 ? "text-green-600" : checkin.estresse <= 7 ? "text-orange-500" : "text-red-500"}`}>{checkin.estresse}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase">Humor:</span>
                                        <span className={`text-xs font-black ${checkin.humor >= 8 ? "text-green-600" : checkin.humor >= 5 ? "text-orange-500" : "text-red-500"}`}>{checkin.humor}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase">Libido:</span>
                                        <span className={`text-xs font-black ${checkin.libido >= 8 ? "text-green-600" : checkin.libido >= 5 ? "text-orange-500" : "text-red-500"}`}>{checkin.libido}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400 font-black uppercase">Dor:</span>
                                        <span className={`text-xs font-black ${checkin.dor_muscular <= 3 ? "text-green-600" : checkin.dor_muscular <= 7 ? "text-orange-500" : "text-red-500"}`}>{checkin.dor_muscular}/10</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 space-y-2">
                                {/* CATEGORY: INDICATORS */}
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Lesão:</span>
                                    {checkin.lesao ? (
                                        <div className="flex flex-col items-end">
                                            <Badge variant="destructive" className="h-5 text-[9px] font-black uppercase px-2">SIM</Badge>
                                            {checkin.local_lesao && <span className="text-[9px] text-red-600 font-bold mt-0.5">{checkin.local_lesao.toUpperCase()}</span>}
                                        </div>
                                    ) : <Badge variant="outline" className="h-5 text-[9px] font-bold uppercase text-slate-600 px-2">NÃO</Badge>}
                                </div>
                                {sexo === 'M' && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Ereção Matinal:</span>
                                        <span className={`font-black text-xs ${checkin.erecao_matinal ? "text-green-600" : "text-slate-600"}`}>
                                            {checkin.erecao_matinal ? "SIM" : "NÃO"}
                                        </span>
                                    </div>
                                )}
                                {sexo === 'F' && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-tight">Alteração Ciclo:</span>
                                        <span className={`font-black text-xs ${checkin.ciclo_menstrual_alterado ? "text-red-600" : "text-slate-600"}`}>
                                            {checkin.ciclo_menstrual_alterado ? "SIM" : "NÃO"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
