"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SplitSquareVertical, ChevronDown, ChevronUp } from "lucide-react"

interface Measurement {
    id: string
    data: string
    foto_url: string | null
    peso_corporal: number | null
    gordura_corporal: number | null
    massa_magra: number | null
    cintura: number | null
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

interface MeasurementWithUrl extends Measurement {
    signedUrl: string | null
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SideSelector({ value, onChange, open, setOpen, label, options, formatDate }: {
    value: string
    onChange: (id: string) => void
    open: boolean
    setOpen: (v: boolean) => void
    label: string
    options: MeasurementWithUrl[]
    formatDate: (m: MeasurementWithUrl) => string
}) {
    const selected = options.find((m) => m.id === value)
    return (
        <div className="relative flex-1">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-white text-sm font-medium gap-2 hover:bg-muted/40 transition-colors"
            >
                <span className="truncate text-left">
                    {selected ? formatDate(selected) : label}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute top-full mt-1 left-0 right-0 z-20 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {options.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => { onChange(m.id); setOpen(false) }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors ${value === m.id ? "font-bold text-primary" : ""}`}
                        >
                            {format(parseISO(m.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            {m.peso_corporal && <span className="text-muted-foreground ml-2">· {m.peso_corporal}kg</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function StatRow({ label, left, right, unit }: { label: string; left: number | null; right: number | null; unit: string }) {
    return (
        <div className="grid grid-cols-3 text-xs py-1.5 border-b border-border/40">
            <span className="text-left font-mono font-bold text-muted-foreground">{left ?? "—"}{left !== null ? unit : ""}</span>
            <span className="text-center font-medium text-muted-foreground">{label}</span>
            <span className="text-right font-mono font-bold text-muted-foreground">{right ?? "—"}{right !== null ? unit : ""}</span>
        </div>
    )
}

// ── Main component ─────────────────────────────────────────────────────────

interface PatientPhotoComparisonProps {
    patientId: string
}

export function PatientPhotoComparison({ patientId }: PatientPhotoComparisonProps) {
    const [measurements, setMeasurements] = useState<MeasurementWithUrl[]>([])
    const [leftId, setLeftId] = useState<string>("")
    const [rightId, setRightId] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [leftOpen, setLeftOpen] = useState(false)
    const [rightOpen, setRightOpen] = useState(false)
    const [expanded, setExpanded] = useState(true)
    const supabase = createClient()

    const loadData = useCallback(async () => {
        const { data: raw } = await supabase
            .from('body_measurements')
            .select('*')
            .eq('patient_id', patientId)
            .order('data', { ascending: false })

        if (!raw) { setIsLoading(false); return }

        const withUrls: MeasurementWithUrl[] = await Promise.all(
            raw.map(async (m) => {
                let signedUrl: string | null = null
                if (m.foto_url) {
                    const { data } = await supabase.storage
                        .from('measurements')
                        .createSignedUrl(m.foto_url, 3600)
                    if (data) signedUrl = data.signedUrl
                }
                return { ...m, signedUrl }
            })
        )

        setMeasurements(withUrls)

        const withPhotos = withUrls.filter((m) => m.signedUrl)
        if (withPhotos.length >= 2) {
            setRightId(withPhotos[0].id)
            setLeftId(withPhotos[1].id)
        } else if (withPhotos.length === 1) {
            setRightId(withPhotos[0].id)
        }

        setIsLoading(false)
    }, [supabase, patientId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData()
    }, [loadData])

    const leftM = measurements.find((m) => m.id === leftId) ?? null
    const rightM = measurements.find((m) => m.id === rightId) ?? null

    const formatDateShort = (m: MeasurementWithUrl) =>
        format(parseISO(m.data), "dd/MM/yy", { locale: ptBR })

    const formatLong = (m: MeasurementWithUrl | null) =>
        m ? format(parseISO(m.data), "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : "—"

    const withPhotos = measurements.filter((m) => m.signedUrl)

    return (
        <Card className="border-none shadow-md ring-1 ring-border overflow-hidden">
            <CardHeader
                className="bg-muted/50 border-b cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <SplitSquareVertical className="h-5 w-5 text-purple-500" />
                        Comparar Fotos
                        <span className="text-xs font-normal text-muted-foreground">({withPhotos.length} fotos)</span>
                    </CardTitle>
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="p-4 space-y-4" onClick={() => { if (leftOpen) setLeftOpen(false); if (rightOpen) setRightOpen(false) }}>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
                    ) : withPhotos.length < 2 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <SplitSquareVertical className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Fotos insuficientes para comparação (mínimo 2)</p>
                        </div>
                    ) : (
                        <>
                            {/* Selectors */}
                            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                <SideSelector
                                    value={leftId}
                                    onChange={setLeftId}
                                    open={leftOpen}
                                    setOpen={setLeftOpen}
                                    label="Antes"
                                    options={withPhotos}
                                    formatDate={formatDateShort}
                                />
                                <span className="text-muted-foreground text-sm font-bold shrink-0">vs</span>
                                <SideSelector
                                    value={rightId}
                                    onChange={setRightId}
                                    open={rightOpen}
                                    setOpen={setRightOpen}
                                    label="Depois"
                                    options={withPhotos}
                                    formatDate={formatDateShort}
                                />
                            </div>

                            {/* Photos side by side */}
                            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border">
                                <div className="relative">
                                    {leftM?.signedUrl ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={leftM.signedUrl} alt="Antes" className="w-full h-auto object-contain bg-black/5" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <p className="text-white text-xs font-bold">{formatLong(leftM)}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-64 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs">Selecione</div>
                                    )}
                                </div>
                                <div className="relative">
                                    {rightM?.signedUrl ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={rightM.signedUrl} alt="Depois" className="w-full h-auto object-contain bg-black/5" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <p className="text-white text-xs font-bold">{formatLong(rightM)}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-64 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs">Selecione</div>
                                    )}
                                </div>
                            </div>

                            {/* Stats table */}
                            {leftM && rightM && (
                                <div className="rounded-xl border overflow-hidden">
                                    <div className="px-4 py-2 border-b bg-muted/20">
                                        <div className="grid grid-cols-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            <span>{formatDateShort(leftM)}</span>
                                            <span className="text-center">Medida</span>
                                            <span className="text-right">{formatDateShort(rightM)}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-1 pb-1">Composição</p>
                                        <StatRow label="Peso" left={leftM.peso_corporal} right={rightM.peso_corporal} unit="kg" />
                                        <StatRow label="Gordura" left={leftM.gordura_corporal} right={rightM.gordura_corporal} unit="%" />
                                        <StatRow label="Massa Magra" left={leftM.massa_magra} right={rightM.massa_magra} unit="kg" />

                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-2 pb-1">Tronco</p>
                                        <StatRow label="Pescoço" left={leftM.pescoco} right={rightM.pescoco} unit="cm" />
                                        <StatRow label="Ombro" left={leftM.ombro} right={rightM.ombro} unit="cm" />
                                        <StatRow label="Peito" left={leftM.peito} right={rightM.peito} unit="cm" />
                                        <StatRow label="Cintura" left={leftM.cintura} right={rightM.cintura} unit="cm" />
                                        <StatRow label="Abdome" left={leftM.abdomen} right={rightM.abdomen} unit="cm" />
                                        <StatRow label="Quadris" left={leftM.quadris} right={rightM.quadris} unit="cm" />

                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-2 pb-1">Braços</p>
                                        <StatRow label="Bíceps E" left={leftM.biceps_esquerdo} right={rightM.biceps_esquerdo} unit="cm" />
                                        <StatRow label="Bíceps D" left={leftM.biceps_direito} right={rightM.biceps_direito} unit="cm" />
                                        <StatRow label="Antebraço E" left={leftM.antebraco_esquerdo} right={rightM.antebraco_esquerdo} unit="cm" />
                                        <StatRow label="Antebraço D" left={leftM.antebraco_direito} right={rightM.antebraco_direito} unit="cm" />

                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-2 pb-1">Pernas</p>
                                        <StatRow label="Coxa E" left={leftM.coxa_esquerda} right={rightM.coxa_esquerda} unit="cm" />
                                        <StatRow label="Coxa D" left={leftM.coxa_direita} right={rightM.coxa_direita} unit="cm" />
                                        <StatRow label="Panturrilha E" left={leftM.panturrilha_esquerda} right={rightM.panturrilha_esquerda} unit="cm" />
                                        <StatRow label="Panturrilha D" left={leftM.panturrilha_direita} right={rightM.panturrilha_direita} unit="cm" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            )}
        </Card>
    )
}
