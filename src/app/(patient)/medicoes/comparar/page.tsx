"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { SplitSquareVertical } from "lucide-react"
import { PhotoComparison, type PhotoComparisonMeasurement } from "@/components/measurements/photo-comparison"
import { withSignedMeasurementUrls } from "@/lib/measurement-photos"

interface MeasurementRow extends Omit<PhotoComparisonMeasurement, "signedUrl"> {
  foto_url: string | null
}

export default function CompararFotosPage() {
  const [measurements, setMeasurements] = useState<PhotoComparisonMeasurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: patient } = await supabase.from("patients").select("id").eq("user_id", user.id).single()
    if (!patient) {
      router.push("/login")
      return
    }

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
      .eq("patient_id", patient.id)
      .order("data", { ascending: false })

    if (!rawRows) {
      setMeasurements([])
      setIsLoading(false)
      return
    }

    const rowsWithSignedUrls = await withSignedMeasurementUrls(supabase, rawRows as MeasurementRow[])
    setMeasurements(rowsWithSignedUrls)
    setIsLoading(false)
  }, [router, supabase])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadData])

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <SplitSquareVertical className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Comparar Fotos</h1>
          <p className="text-sm text-muted-foreground">Veja sua evolução lado a lado</p>
        </div>
      </div>

      <PhotoComparison
        measurements={measurements}
        isLoading={isLoading}
        leftLabel="Foto da esquerda"
        rightLabel="Foto da direita"
      />
    </div>
  )
}
