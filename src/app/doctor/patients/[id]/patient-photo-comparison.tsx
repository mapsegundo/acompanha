"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SplitSquareVertical, ChevronDown, ChevronUp } from "lucide-react"
import { PhotoComparison, type PhotoComparisonMeasurement } from "@/components/measurements/photo-comparison"
import { withSignedMeasurementUrls } from "@/lib/measurement-photos"

interface MeasurementRow extends Omit<PhotoComparisonMeasurement, "signedUrl"> {
  foto_url: string | null
}

interface PatientPhotoComparisonProps {
  patientId: string
}

export function PatientPhotoComparison({ patientId }: PatientPhotoComparisonProps) {
  const [measurements, setMeasurements] = useState<PhotoComparisonMeasurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const { data: rawRows } = await supabase
      .from("body_measurements")
      .select(
        `
          id,
          data,
          foto_url,
          peso_corporal,
          gordura_corporal,
          massa_magra,
          cintura,
          pescoco,
          ombro,
          peito,
          biceps_esquerdo,
          biceps_direito,
          antebraco_esquerdo,
          antebraco_direito,
          abdomen,
          quadris,
          coxa_esquerda,
          coxa_direita,
          panturrilha_esquerda,
          panturrilha_direita
        `
      )
      .eq("patient_id", patientId)
      .order("data", { ascending: false })

    if (!rawRows) {
      setMeasurements([])
      setIsLoading(false)
      return
    }

    const rowsWithSignedUrls = await withSignedMeasurementUrls(supabase, rawRows as MeasurementRow[])
    setMeasurements(rowsWithSignedUrls)
    setIsLoading(false)
  }, [patientId, supabase])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadData])

  const totalPhotos = measurements.filter((measurement) => measurement.signedUrl).length

  return (
    <Card className="border-l-4 border-l-purple-400">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <SplitSquareVertical className="h-4 w-4 text-purple-500" />
            Comparar Fotos
            <span className="text-xs text-muted-foreground font-normal ml-1">({totalPhotos} fotos)</span>
          </CardTitle>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-4">
          <PhotoComparison
            measurements={measurements}
            isLoading={isLoading}
            leftLabel="Antes"
            rightLabel="Depois"
            emptyTitle="Fotos insuficientes para comparação"
            emptyDescription="Este paciente precisa de ao menos 2 medições com foto."
          />
        </CardContent>
      )}
    </Card>
  )
}
