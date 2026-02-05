"use client"

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
import { CartesianGrid, Line, LineChart, XAxis, YAxis, BarChart, Bar, ReferenceLine } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Moon, Zap, Brain, Smile, Activity, Heart, Weight, Clock, AlertTriangle } from "lucide-react"

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

interface ChartData extends Checkin {
    formattedDate: string
}

interface PatientChartsProps {
    checkins: Checkin[]
    sexo: string
}

// Individual metric chart component - optimized for mobile
function MetricChart({
    data,
    dataKey,
    title,
    icon: Icon,
    color,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    invertColors: _invertColors = false,
    unit = "/10",
    domain = [0, 10]
}: {
    data: ChartData[]
    dataKey: string
    title: string
    icon: React.ElementType
    color: string
    invertColors?: boolean  // true for metrics where low is good (cansaco, estresse, dor)
    unit?: string
    domain?: [number | string, number | string]
}) {
    const config = {
        [dataKey]: { label: title, color }
    } satisfies ChartConfig

    // Calculate average for reference line
    const values = data.map(d => d[dataKey as keyof ChartData] as number).filter(v => v != null)
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color }} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                <ChartContainer config={config} className="h-[140px] w-full">
                    <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={4}
                            fontSize={10}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={domain}
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            width={30}
                            tickFormatter={(v) => `${v}`}
                        />
                        <ReferenceLine
                            y={avg}
                            stroke={color}
                            strokeDasharray="3 3"
                            strokeOpacity={0.5}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: color }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                </ChartContainer>
                <div className="flex justify-between items-center px-2 mt-2 text-xs text-muted-foreground">
                    <span>Média: <strong style={{ color }}>{avg.toFixed(1)}{unit}</strong></span>
                    <span>Último: <strong>{values[values.length - 1]?.toFixed(1) || '-'}{unit}</strong></span>
                </div>
            </CardContent>
        </Card>
    )
}

// Weight chart with bar visualization
function WeightChart({ data }: { data: ChartData[] }) {
    const config = {
        peso: { label: "Peso (kg)", color: "#2563eb" }
    } satisfies ChartConfig

    const values = data.map(d => d.peso).filter(v => v != null)
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Weight className="h-4 w-4 text-blue-600" />
                    Peso Corporal
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                <ChartContainer config={config} className="h-[140px] w-full">
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={['dataMin - 2', 'dataMax + 2']}
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            width={35}
                            tickFormatter={(v) => `${v}kg`}
                        />
                        <ReferenceLine
                            y={avg}
                            stroke="#2563eb"
                            strokeDasharray="3 3"
                            strokeOpacity={0.5}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="peso" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
                <div className="flex justify-between items-center px-2 mt-2 text-xs text-muted-foreground">
                    <span>Média: <strong className="text-blue-600">{avg.toFixed(1)}kg</strong></span>
                    <span>Último: <strong>{values[values.length - 1]?.toFixed(1) || '-'}kg</strong></span>
                </div>
            </CardContent>
        </Card>
    )
}

// Training hours chart
function TrainingChart({ data }: { data: ChartData[] }) {
    const config = {
        horas_treino_7d: { label: "Horas (7d)", color: "#f97316" }
    } satisfies ChartConfig

    const values = data.map(d => d.horas_treino_7d).filter(v => v != null)
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Volume de Treino (7d)
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                <ChartContainer config={config} className="h-[140px] w-full">
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={[0, 'dataMax + 5']}
                            tickLine={false}
                            axisLine={false}
                            fontSize={10}
                            width={30}
                            tickFormatter={(v) => `${v}h`}
                        />
                        <ReferenceLine
                            y={avg}
                            stroke="#f97316"
                            strokeDasharray="3 3"
                            strokeOpacity={0.5}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="horas_treino_7d" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
                <div className="flex justify-between items-center px-2 mt-2 text-xs text-muted-foreground">
                    <span>Média: <strong className="text-orange-500">{avg.toFixed(1)}h</strong></span>
                    <span>Último: <strong>{values[values.length - 1]?.toFixed(1) || '-'}h</strong></span>
                </div>
            </CardContent>
        </Card>
    )
}

export function PatientCharts({ checkins, sexo }: PatientChartsProps) {
    // Format dates for display and sort by date
    const data = checkins.map(c => ({
        ...c,
        formattedDate: format(new Date(c.data), "dd/MM", { locale: ptBR })
    }))

    // Reverse for table display (most recent first)
    const tableData = [...checkins].reverse()

    return (
        <div className="space-y-6">
            {/* Section: Subjective Metrics */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Indicadores</h3>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Percepção pessoal e bem-estar subjetivo</p>
                    </div>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricChart
                        data={data}
                        dataKey="qualidade_sono"
                        title="Qualidade do Sono"
                        icon={Moon}
                        color="#60a5fa"
                    />
                    <MetricChart
                        data={data}
                        dataKey="cansaco"
                        title="Cansaço"
                        icon={Zap}
                        color="#f59e0b"
                        invertColors
                    />
                    <MetricChart
                        data={data}
                        dataKey="estresse"
                        title="Estresse"
                        icon={AlertTriangle}
                        color="#ef4444"
                        invertColors
                    />
                    <MetricChart
                        data={data}
                        dataKey="humor"
                        title="Humor"
                        icon={Smile}
                        color="#22c55e"
                    />
                    <MetricChart
                        data={data}
                        dataKey="dor_muscular"
                        title="Dor Muscular"
                        icon={Activity}
                        color="#71717a"
                        invertColors
                    />
                    <MetricChart
                        data={data}
                        dataKey="libido"
                        title="Libido"
                        icon={Heart}
                        color="#ec4899"
                    />
                </div>
            </div>

            {/* Section: Physical Metrics */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <Weight className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Dados Físicos</h3>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Antropometria e carga de treinamento</p>
                    </div>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <WeightChart data={data} />
                    <TrainingChart data={data} />
                </div>
            </div>

            {/* Section: Complete Data Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="p-2 bg-slate-50 rounded-lg">
                        <Activity className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Histórico Completo</h3>
                        <p className="text-xs text-slate-500 font-medium tracking-tight">Todos os registros detalhados por data</p>
                    </div>
                </div>
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="sticky left-0 bg-muted/50 font-bold min-w-[90px]">Data</TableHead>
                                    <TableHead className="text-center">Peso</TableHead>
                                    <TableHead className="text-center">Treino</TableHead>
                                    <TableHead className="text-center">Sono</TableHead>
                                    <TableHead className="text-center">Cansaço</TableHead>
                                    <TableHead className="text-center">Estresse</TableHead>
                                    <TableHead className="text-center">Humor</TableHead>
                                    <TableHead className="text-center">Dor</TableHead>
                                    <TableHead className="text-center">Libido</TableHead>
                                    <TableHead className="text-center">Lesão</TableHead>
                                    {sexo === 'M' && <TableHead className="text-center">Ereção</TableHead>}
                                    {sexo === 'F' && <TableHead className="text-center">Alt. Ciclo</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData.map((checkin) => (
                                    <TableRow key={checkin.id} className="text-center">
                                        <TableCell className="sticky left-0 bg-background font-bold text-left whitespace-nowrap">
                                            {format(new Date(checkin.data), "dd/MM/yy")}
                                        </TableCell>
                                        <TableCell className="font-semibold">{checkin.peso}kg</TableCell>
                                        <TableCell>{checkin.horas_treino_7d}h</TableCell>
                                        <TableCell className={getValueColor(checkin.qualidade_sono, false)}>
                                            {checkin.qualidade_sono}
                                        </TableCell>
                                        <TableCell className={getValueColor(checkin.cansaco, true)}>
                                            {checkin.cansaco}
                                        </TableCell>
                                        <TableCell className={getValueColor(checkin.estresse, true)}>
                                            {checkin.estresse}
                                        </TableCell>
                                        <TableCell className={getValueColor(checkin.humor, false)}>
                                            {checkin.humor}
                                        </TableCell>
                                        <TableCell className={getValueColor(checkin.dor_muscular, true)}>
                                            {checkin.dor_muscular}
                                        </TableCell>
                                        <TableCell className={getValueColor(checkin.libido, false)}>
                                            {checkin.libido}
                                        </TableCell>
                                        <TableCell>
                                            {checkin.lesao ? (
                                                <Badge variant="destructive" className="text-[9px] px-1.5">SIM</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        {sexo === 'M' && (
                                            <TableCell>
                                                {checkin.erecao_matinal ? (
                                                    <span className="text-green-600 font-bold text-xs">SIM</span>
                                                ) : (
                                                    <span className="text-orange-500 font-bold text-xs">NÃO</span>
                                                )}
                                            </TableCell>
                                        )}
                                        {sexo === 'F' && (
                                            <TableCell>
                                                {checkin.ciclo_menstrual_alterado ? (
                                                    <span className="text-orange-500 font-bold text-xs">SIM</span>
                                                ) : (
                                                    <span className="text-green-600 font-bold text-xs">NÃO</span>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </div>
    )
}

// Helper function to get color based on value and whether lower is better
function getValueColor(value: number, lowerIsBetter: boolean): string {
    if (lowerIsBetter) {
        // For cansaco, estresse, dor - low is good
        if (value <= 3) return "text-green-600 font-bold"
        if (value <= 6) return "text-orange-500 font-medium"
        return "text-red-600 font-bold"
    } else {
        // For sono, humor, libido - high is good
        if (value >= 7) return "text-green-600 font-bold"
        if (value >= 4) return "text-orange-500 font-medium"
        return "text-red-600 font-bold"
    }
}
