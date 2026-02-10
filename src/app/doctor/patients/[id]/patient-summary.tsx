"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface Checkin {
    id: string
    data: string
    peso: number
    cansaco: number
    qualidade_sono: number
    dor_muscular: number
    estresse: number
    humor: number
    libido: number
    lesao: boolean
    recovery_score?: number
}

interface PatientSummaryProps {
    checkins: Checkin[]
}

export function PatientSummary({ checkins }: PatientSummaryProps) {
    if (!checkins || checkins.length === 0) {
        return (
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-6 text-center text-slate-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum dado de check-in disponível para gerar resumo.</p>
                </CardContent>
            </Card>
        )
    }

    // Sort checkins by date (newest first) just in case
    const sortedCheckins = [...checkins].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    const current = sortedCheckins[0]
    const previous = sortedCheckins[1]

    if (!previous) {
        return (
            <Card className="bg-blue-50/50 border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Início do Acompanhamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-blue-700">
                        Este é o primeiro check-in do paciente. O resumo comparativo será gerado a partir do próximo registro.
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Define metrics configuration
    const metrics = [
        { key: 'qualidade_sono', label: 'Sono', higherIsBetter: true },
        { key: 'humor', label: 'Humor', higherIsBetter: true },
        { key: 'libido', label: 'Libido', higherIsBetter: true },
        { key: 'cansaco', label: 'Cansaço', higherIsBetter: false },
        { key: 'estresse', label: 'Estresse', higherIsBetter: false },
        { key: 'dor_muscular', label: 'Dor Muscular', higherIsBetter: false },
        { key: 'peso', label: 'Peso', higherIsBetter: null }, // Weight is neutral contextually, but we can just show change
    ] as const

    // Calculate changes
    const changes = metrics.map(metric => {
        const currVal = current[metric.key as keyof Checkin] as number
        const prevVal = previous[metric.key as keyof Checkin] as number
        const diff = currVal - prevVal

        let status: 'improved' | 'worsened' | 'stable' | 'neutral' = 'stable'

        if (metric.higherIsBetter !== null) {
            if (diff === 0) status = 'stable'
            else if (metric.higherIsBetter) {
                status = diff > 0 ? 'improved' : 'worsened'
            } else { // Lower is better
                status = diff < 0 ? 'improved' : 'worsened'
            }
        } else {
            status = 'neutral'
        }

        return { ...metric, diff, currVal, prevVal, status }
    })

    const improvements = changes.filter(c => c.status === 'improved')
    const worsenings = changes.filter(c => c.status === 'worsened')

    // Generate summary text
    const generateSummaryText = () => {
        const parts = []

        if (current.lesao && !previous.lesao) {
            parts.push("⚠️ Paciente relatou uma NOVA LESÃO esta semana.")
        } else if (current.lesao && previous.lesao) {
            parts.push("Paciente continua relatando lesão.")
        }

        if (improvements.length > 0) {
            const topImprovement = improvements.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0]
            parts.push(`Houve melhoria notável em **${topImprovement.label}**.`)
        }

        if (worsenings.length > 0) {
            const topWorsening = worsenings.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0]
            parts.push(`Atenção para piora em **${topWorsening.label}**.`)
        }

        if (improvements.length === 0 && worsenings.length === 0) {
            parts.push("Quadro estável em relação à semana anterior.")
        }

        return parts.join(" ")
    }

    return (
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span>Resumo da Semana</span>
                    </div>
                    {current.recovery_score && (
                        <Badge variant={current.recovery_score >= 70 ? "default" : "destructive"} className="text-xs">
                            Recovery: {current.recovery_score}%
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Text Summary */}
                <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700 leading-relaxed">
                    {generateSummaryText().split("**").map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                </div>

                {/* Grid of Changes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Improvements */}
                    {improvements.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> Pontos Positivos
                            </h4>
                            <div className="grid gap-2">
                                {improvements.map(item => (
                                    <div key={item.key} className="flex items-center justify-between bg-green-50/50 p-2 rounded border border-green-100">
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                            <ArrowUp className={cn("h-3 w-3", !item.higherIsBetter && "rotate-180")} />
                                            <span>{Math.abs(item.diff)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Worsenings */}
                    {worsenings.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" /> Pontos de Atenção
                            </h4>
                            <div className="grid gap-2">
                                {worsenings.map(item => (
                                    <div key={item.key} className="flex items-center justify-between bg-red-50/50 p-2 rounded border border-red-100">
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
                                            <ArrowDown className={cn("h-3 w-3", !item.higherIsBetter && "rotate-180")} />
                                            <span>{Math.abs(item.diff)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
