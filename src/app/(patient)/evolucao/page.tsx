"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TrendingUp, Weight, Percent, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Measurement {
    id: string
    data: string
    peso_corporal: number | null
    gordura_corporal: number | null
    massa_magra: number | null
}

type Metric = "peso_corporal" | "gordura_corporal" | "massa_magra"

const METRICS: { key: Metric; label: string; unit: string; icon: React.ElementType; color: string }[] = [
    { key: "peso_corporal", label: "Peso", unit: "kg", icon: Weight, color: "#3b82f6" },
    { key: "gordura_corporal", label: "Gordura", unit: "%", icon: Percent, color: "#f97316" },
    { key: "massa_magra", label: "Massa Magra", unit: "kg", icon: Dumbbell, color: "#22c55e" },
]

function LineChart({
    data,
    color,
    unit,
}: {
    data: { label: string; value: number }[]
    color: string
    unit: string
}) {
    if (data.length < 2) {
        return (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">
                Registre ao menos 2 medições para ver o gráfico
            </div>
        )
    }

    const W = 600
    const H = 200
    const PAD = { top: 20, right: 20, bottom: 40, left: 48 }
    const chartW = W - PAD.left - PAD.right
    const chartH = H - PAD.top - PAD.bottom

    const values = data.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const xStep = chartW / (data.length - 1)
    const toX = (i: number) => PAD.left + i * xStep
    const toY = (v: number) => PAD.top + chartH - ((v - min) / range) * chartH

    const pathD = data
        .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d.value)}`)
        .join(" ")

    const areaD =
        `M ${toX(0)} ${toY(data[0].value)} ` +
        data.map((d, i) => `L ${toX(i)} ${toY(d.value)}`).join(" ") +
        ` L ${toX(data.length - 1)} ${PAD.top + chartH} L ${toX(0)} ${PAD.top + chartH} Z`

    // Y-axis labels
    const yTicks = 4
    const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
        const v = min + (range / yTicks) * i
        return { y: toY(v), label: v.toFixed(1) }
    })

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300 }}>
                <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {yLabels.map(({ y, label }, i) => (
                    <g key={i}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
                        <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
                            {label}
                        </text>
                    </g>
                ))}

                {/* Area fill */}
                <path d={areaD} fill="url(#chartGrad)" />

                {/* Line */}
                <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

                {/* Data points + labels */}
                {data.map((d, i) => (
                    <g key={i}>
                        <circle cx={toX(i)} cy={toY(d.value)} r={4} fill={color} stroke="white" strokeWidth={2} />
                        <text
                            x={toX(i)}
                            y={toY(d.value) - 10}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight="bold"
                            fill={color}
                        >
                            {d.value}{unit}
                        </text>
                        {/* X-axis label */}
                        <text
                            x={toX(i)}
                            y={H - 6}
                            textAnchor="middle"
                            fontSize={9}
                            fill="#94a3b8"
                            transform={i % 2 === 0 ? undefined : `rotate(-30, ${toX(i)}, ${H - 6})`}
                        >
                            {d.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    )
}

export default function EvolucaoPage() {
    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [activeMetric, setActiveMetric] = useState<Metric>("peso_corporal")
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    const loadData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data: patient } = await supabase
            .from('patients')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!patient) { router.push('/login'); return }

        const { data } = await supabase
            .from('body_measurements')
            .select('id, data, peso_corporal, gordura_corporal, massa_magra')
            .eq('patient_id', patient.id)
            .order('data', { ascending: true })

        setMeasurements(data ?? [])
        setIsLoading(false)
    }, [router, supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData()
    }, [loadData])

    const metric = METRICS.find((m) => m.key === activeMetric)!
    const chartData = measurements
        .filter((m) => m[activeMetric] !== null)
        .map((m) => ({
            label: format(parseISO(m.data), "dd/MM", { locale: ptBR }),
            value: m[activeMetric] as number,
        }))

    const current = chartData[chartData.length - 1]?.value
    const first = chartData[0]?.value
    const diff = current !== undefined && first !== undefined ? current - first : null

    if (isLoading) {
        return <div className="flex justify-center py-12 text-muted-foreground text-sm">Carregando...</div>
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Evolução</h1>
                    <p className="text-sm text-muted-foreground">Acompanhe sua evolução ao longo do tempo</p>
                </div>
            </div>

            {/* Metric selector */}
            <div className="flex gap-2 flex-wrap">
                {METRICS.map((m) => {
                    const Icon = m.icon
                    const isActive = m.key === activeMetric
                    return (
                        <Button
                            key={m.key}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className={`gap-2 ${isActive ? "" : "text-muted-foreground"}`}
                            style={isActive ? { backgroundColor: m.color, borderColor: m.color } : {}}
                            onClick={() => setActiveMetric(m.key)}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {m.label}
                        </Button>
                    )
                })}
            </div>

            {/* Summary card */}
            {chartData.length >= 2 && (
                <div className="rounded-2xl border bg-card p-4 flex gap-6">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Atual</div>
                        <div className="text-3xl font-black" style={{ color: metric.color }}>
                            {current}{metric.unit}
                        </div>
                    </div>
                    <div className="border-l pl-6">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Variação Total</div>
                        <div className={`text-2xl font-black ${diff !== null && diff < 0 ? "text-green-500" : diff !== null && diff > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                            {diff !== null ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}${metric.unit}` : "-"}
                        </div>
                    </div>
                    <div className="border-l pl-6">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Registros</div>
                        <div className="text-2xl font-black text-muted-foreground">{chartData.length}</div>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="rounded-2xl border bg-card p-4">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    {metric.label} ({metric.unit})
                </h2>
                <LineChart data={chartData} color={metric.color} unit={metric.unit} />
            </div>

            {/* Table */}
            {measurements.length > 0 && (
                <div className="rounded-2xl border bg-card overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Histórico</h2>
                    </div>
                    <div className="divide-y">
                        {[...measurements].reverse().map((m) => (
                            <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
                                <span className="text-muted-foreground">
                                    {format(parseISO(m.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                                <div className="flex gap-4 font-mono font-bold text-right">
                                    <span className="text-blue-500">{m.peso_corporal ?? "-"} kg</span>
                                    <span className="text-orange-500">{m.gordura_corporal ?? "-"}%</span>
                                    <span className="text-green-500">{m.massa_magra ?? "-"} kg</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {measurements.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Sem dados ainda</h3>
                    <p className="text-muted-foreground text-sm">Registre suas medições para ver a evolução aqui.</p>
                </div>
            )}
        </div>
    )
}
