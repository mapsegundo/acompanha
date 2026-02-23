"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ruler, Calendar, ImageIcon, ChevronDown, ChevronUp } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { withSignedMeasurementUrls } from "@/lib/measurement-photos"

interface BodyMeasurement {
    id: string
    data: string
    foto_url: string | null
    peso_corporal: number | null
    cintura: number | null
    gordura_corporal: number | null
    massa_magra: number | null
    pescoco: number | null
    ombro: number | null
    peito: number | null
    biceps_esquerdo: number | null
    biceps_direito: number | null
    antebraco_esquerdo: number | null
    antebraco_direito: number | null
    abdomen: number | null
    quadris: number | null
    coxa_esquerda: number | null
    coxa_direita: number | null
    panturrilha_esquerda: number | null
    panturrilha_direita: number | null
}

interface PatientMeasurementsProps {
    patientId: string
}

const measurementLabels: Record<string, { label: string; unit: string }> = {
    peso_corporal: { label: "Peso Corporal", unit: "kg" },
    cintura: { label: "Cintura", unit: "cm" },
    gordura_corporal: { label: "Gordura Corporal", unit: "%" },
    massa_magra: { label: "Massa Magra", unit: "kg" },
    pescoco: { label: "Pescoço", unit: "cm" },
    ombro: { label: "Ombro", unit: "cm" },
    peito: { label: "Peito", unit: "cm" },
    biceps_esquerdo: { label: "Bíceps Esq.", unit: "cm" },
    biceps_direito: { label: "Bíceps Dir.", unit: "cm" },
    antebraco_esquerdo: { label: "Antebraço Esq.", unit: "cm" },
    antebraco_direito: { label: "Antebraço Dir.", unit: "cm" },
    abdomen: { label: "Abdômen", unit: "cm" },
    quadris: { label: "Quadris", unit: "cm" },
    coxa_esquerda: { label: "Coxa Esq.", unit: "cm" },
    coxa_direita: { label: "Coxa Dir.", unit: "cm" },
    panturrilha_esquerda: { label: "Panturrilha Esq.", unit: "cm" },
    panturrilha_direita: { label: "Panturrilha Dir.", unit: "cm" },
}

export function PatientMeasurements({ patientId }: PatientMeasurementsProps) {
    const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMeasurements = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('body_measurements')
                .select('*')
                .eq('patient_id', patientId)
                .order('data', { ascending: false })

            if (!error && data) {
                const typedData = data as BodyMeasurement[]
                setMeasurements(typedData)

                const rowsWithSignedUrls = await withSignedMeasurementUrls(supabase, typedData)
                const urls: Record<string, string> = {}
                rowsWithSignedUrls.forEach((row) => {
                    if (row.signedUrl) {
                        urls[row.id] = row.signedUrl
                    }
                })
                setSignedUrls(urls)
            }
            setLoading(false)
        }
        fetchMeasurements()
    }, [patientId])

    const formatVal = (val: number | null, unit: string) => {
        if (val === null || val === undefined) return '-'
        return `${val}${unit}`
    }

    const getMeasurementEntries = (m: BodyMeasurement) => {
        return Object.entries(measurementLabels)
            .map(([key, info]) => ({
                label: info.label,
                value: m[key as keyof BodyMeasurement] as number | null,
                unit: info.unit,
            }))
            .filter(entry => entry.value !== null && entry.value !== undefined)
    }

    if (loading) return null

    if (measurements.length === 0) {
        return (
            <Card className="border-l-4 border-l-purple-400">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-purple-500" />
                        Medições Corporais
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Nenhuma medição registrada por este paciente.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-l-4 border-l-purple-400">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-purple-500" />
                    Medições Corporais
                    <span className="text-xs text-muted-foreground font-normal ml-auto">
                        {measurements.length} registro{measurements.length !== 1 ? 's' : ''}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {measurements.map((m) => {
                    const isExpanded = expandedId === m.id
                    const entries = getMeasurementEntries(m)

                    return (
                        <div key={m.id} className="border rounded-lg overflow-hidden">
                            {/* Summary row */}
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : m.id)}
                                className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(parseISO(m.data), "dd/MM/yyyy")}
                                    </div>
                                    {signedUrls[m.id] && (
                                        <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                                    )}
                                    {m.peso_corporal && (
                                        <span className="text-sm font-bold">{m.peso_corporal}kg</span>
                                    )}
                                    {m.gordura_corporal && (
                                        <span className="text-xs text-muted-foreground">
                                            {m.gordura_corporal}% gordura
                                        </span>
                                    )}
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                            </button>

                            {/* Expanded details */}
                            {isExpanded && (
                                <div className="border-t bg-muted/10 p-3">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Photo */}
                                        {signedUrls[m.id] && (
                                            <div className="w-full md:w-48 shrink-0">
                                                <Image
                                                    src={signedUrls[m.id]}
                                                    alt={`Progresso ${format(parseISO(m.data), "dd/MM/yyyy")}`}
                                                    width={768}
                                                    height={1024}
                                                    unoptimized
                                                    className="w-full rounded-lg object-cover max-h-[240px]"
                                                />
                                            </div>
                                        )}

                                        {/* Data grid */}
                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                            {entries.map((entry, idx) => (
                                                <div key={idx} className="flex justify-between text-xs border-b border-dashed border-border/50 pb-1">
                                                    <span className="text-muted-foreground">{entry.label}</span>
                                                    <span className="font-bold">{formatVal(entry.value, entry.unit)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
