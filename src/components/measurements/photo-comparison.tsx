"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronDown } from "lucide-react"

export interface PhotoComparisonMeasurement {
  id: string
  data: string
  signedUrl: string | null
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

interface PhotoComparisonProps {
  measurements: PhotoComparisonMeasurement[]
  isLoading?: boolean
  leftLabel?: string
  rightLabel?: string
  emptyTitle?: string
  emptyDescription?: string
}

interface SelectorProps {
  value: string
  onChange: (id: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  label: string
  options: PhotoComparisonMeasurement[]
  formatDate: (measurement: PhotoComparisonMeasurement) => string
}

function SideSelector({
  value,
  onChange,
  open,
  setOpen,
  label,
  options,
  formatDate,
}: SelectorProps) {
  const selected = options.find((measurement) => measurement.id === value)

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-card text-sm font-medium gap-2 hover:bg-muted/40 transition-colors min-h-[44px]"
      >
        <span className="truncate text-left">{selected ? formatDate(selected) : label}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute top-full mt-1 left-0 right-0 z-20 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-60 overflow-y-auto"
        >
          {options.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">Nenhuma foto disponível</div>}
          {options.map((measurement) => (
            <button
              type="button"
              key={measurement.id}
              onClick={() => {
                onChange(measurement.id)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors min-h-[44px] ${value === measurement.id ? "font-bold text-primary" : ""}`}
            >
              {format(parseISO(measurement.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              {measurement.peso_corporal && <span className="text-muted-foreground ml-2">· {measurement.peso_corporal}kg</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatRow({
  label,
  left,
  right,
  unit,
  positiveIncrease = false,
}: {
  label: string
  left: number | null
  right: number | null
  unit: string
  positiveIncrease?: boolean
}) {
  const diff = left !== null && right !== null ? right - left : null
  let colorClass = ""
  if (diff !== null && diff !== 0) {
    if (positiveIncrease) {
      colorClass = diff > 0 ? "text-emerald-500" : "text-red-500"
    } else {
      colorClass = diff < 0 ? "text-emerald-500" : "text-red-500"
    }
  }

  return (
    <div className="grid grid-cols-3 text-xs py-1.5 border-b border-border/40">
      <span className="text-left font-mono font-bold text-muted-foreground">
        {left ?? "—"}
        {left !== null ? unit : ""}
      </span>
      <span className="text-center font-medium text-muted-foreground">{label}</span>
      <span className="text-right font-mono font-bold">
        {right ?? "—"}
        {right !== null ? unit : ""}
        {diff !== null && diff !== 0 && (
          <span className={`ml-1 text-[9px] font-black ${colorClass}`}>
            {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
          </span>
        )}
      </span>
    </div>
  )
}

export function PhotoComparison({
  measurements,
  isLoading = false,
  leftLabel = "Antes",
  rightLabel = "Depois",
  emptyTitle = "Fotos insuficientes",
  emptyDescription = "Você precisa de ao menos 2 medições com fotos para comparar.",
}: PhotoComparisonProps) {
  const [leftId, setLeftId] = useState("")
  const [rightId, setRightId] = useState("")
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  const withPhotos = useMemo(
    () => measurements.filter((measurement) => measurement.signedUrl),
    [measurements]
  )

  const fallbackRightId = withPhotos[0]?.id ?? ""
  const fallbackLeftId = withPhotos[1]?.id ?? withPhotos[0]?.id ?? ""
  const selectedLeftId = withPhotos.some((m) => m.id === leftId) ? leftId : fallbackLeftId
  const selectedRightId = withPhotos.some((m) => m.id === rightId) ? rightId : fallbackRightId

  const leftMeasurement = withPhotos.find((m) => m.id === selectedLeftId) ?? null
  const rightMeasurement = withPhotos.find((m) => m.id === selectedRightId) ?? null

  const formatDateShort = (measurement: PhotoComparisonMeasurement) =>
    format(parseISO(measurement.data), "dd/MM/yy", { locale: ptBR })

  const formatDateLong = (measurement: PhotoComparisonMeasurement | null) =>
    measurement ? format(parseISO(measurement.data), "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : "—"

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-2">
          <div className="h-11 flex-1 bg-muted rounded-xl" />
          <div className="h-11 flex-1 bg-muted rounded-xl" />
        </div>
        <div className="aspect-square bg-muted rounded-2xl" />
      </div>
    )
  }

  return (
    <div
      className="space-y-4"
      onClick={() => {
        if (leftOpen) setLeftOpen(false)
        if (rightOpen) setRightOpen(false)
      }}
    >
      <div className="flex gap-2 items-center" onClick={(event) => event.stopPropagation()}>
        <SideSelector
          value={selectedLeftId}
          onChange={setLeftId}
          open={leftOpen}
          setOpen={setLeftOpen}
          label={leftLabel}
          options={withPhotos}
          formatDate={formatDateShort}
        />
        <span className="text-muted-foreground text-sm font-bold shrink-0">vs</span>
        <SideSelector
          value={selectedRightId}
          onChange={setRightId}
          open={rightOpen}
          setOpen={setRightOpen}
          label={rightLabel}
          options={withPhotos}
          formatDate={formatDateShort}
        />
      </div>

      {withPhotos.length < 2 && (
        <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-2xl text-center">
          <h3 className="font-semibold mb-1">{emptyTitle}</h3>
          <p className="text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      )}

      {withPhotos.length >= 2 && (
        <>
          {/* Side-by-side photo comparison */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border">
            <div className="relative">
              {leftMeasurement?.signedUrl ? (
                <>
                  <Image
                    src={leftMeasurement.signedUrl}
                    alt={`${leftLabel} - ${formatDateLong(leftMeasurement)}`}
                    width={900} height={900} unoptimized
                    className="w-full h-auto object-contain bg-black/5"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs font-bold">{formatDateLong(leftMeasurement)}</p>
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs">Selecione</div>
              )}
            </div>
            <div className="relative">
              {rightMeasurement?.signedUrl ? (
                <>
                  <Image
                    src={rightMeasurement.signedUrl}
                    alt={`${rightLabel} - ${formatDateLong(rightMeasurement)}`}
                    width={900} height={900} unoptimized
                    className="w-full h-auto object-contain bg-black/5"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs font-bold">{formatDateLong(rightMeasurement)}</p>
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs">Selecione</div>
              )}
            </div>
          </div>

          {/* Stats comparison table */}
          {leftMeasurement && rightMeasurement && (
            <div className="rounded-xl border overflow-hidden">
              <div className="px-4 py-2 border-b bg-muted/20">
                <div className="grid grid-cols-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>{formatDateShort(leftMeasurement)}</span>
                  <span className="text-center">Medida</span>
                  <span className="text-right">{formatDateShort(rightMeasurement)}</span>
                </div>
              </div>
              <div className="px-4 py-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-1 pb-1">Composição</p>
                <StatRow label="Peso" left={leftMeasurement.peso_corporal} right={rightMeasurement.peso_corporal} unit="kg" />
                <StatRow label="Gordura" left={leftMeasurement.gordura_corporal} right={rightMeasurement.gordura_corporal} unit="%" />
                <StatRow label="Massa Magra" left={leftMeasurement.massa_magra} right={rightMeasurement.massa_magra} unit="kg" positiveIncrease />

                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-2 pb-1">Tronco</p>
                <StatRow label="Pescoço" left={leftMeasurement.pescoco} right={rightMeasurement.pescoco} unit="cm" />
                <StatRow label="Ombro" left={leftMeasurement.ombro} right={rightMeasurement.ombro} unit="cm" />
                <StatRow label="Peito" left={leftMeasurement.peito} right={rightMeasurement.peito} unit="cm" />
                <StatRow label="Cintura" left={leftMeasurement.cintura} right={rightMeasurement.cintura} unit="cm" />
                <StatRow label="Abdome" left={leftMeasurement.abdomen} right={rightMeasurement.abdomen} unit="cm" />
                <StatRow label="Quadris" left={leftMeasurement.quadris} right={rightMeasurement.quadris} unit="cm" />

                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-2 pb-1">Braços</p>
                <StatRow label="Bíceps E" left={leftMeasurement.biceps_esquerdo} right={rightMeasurement.biceps_esquerdo} unit="cm" />
                <StatRow label="Bíceps D" left={leftMeasurement.biceps_direito} right={rightMeasurement.biceps_direito} unit="cm" />
                <StatRow label="Antebraço E" left={leftMeasurement.antebraco_esquerdo} right={rightMeasurement.antebraco_esquerdo} unit="cm" />
                <StatRow label="Antebraço D" left={leftMeasurement.antebraco_direito} right={rightMeasurement.antebraco_direito} unit="cm" />

                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 pt-2 pb-1">Pernas</p>
                <StatRow label="Coxa E" left={leftMeasurement.coxa_esquerda} right={rightMeasurement.coxa_esquerda} unit="cm" />
                <StatRow label="Coxa D" left={leftMeasurement.coxa_direita} right={rightMeasurement.coxa_direita} unit="cm" />
                <StatRow label="Panturrilha E" left={leftMeasurement.panturrilha_esquerda} right={rightMeasurement.panturrilha_esquerda} unit="cm" />
                <StatRow label="Panturrilha D" left={leftMeasurement.panturrilha_direita} right={rightMeasurement.panturrilha_direita} unit="cm" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
