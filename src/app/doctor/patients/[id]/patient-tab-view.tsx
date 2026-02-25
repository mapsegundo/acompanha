"use client"

import { PatientSummary } from "./patient-summary"
import { PatientCharts } from "./charts"
import { PatientMeasurements } from "./patient-measurements"
import { PatientPhotoComparison } from "./patient-photo-comparison"
import { PatientDocuments } from "./patient-documents"
import { PatientNotes } from "./patient-notes"
import { Activity } from "lucide-react"

interface PatientTabViewProps {
    patientId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkins: any[]
    sexo: string
}

export function PatientTabView({ patientId, checkins, sexo }: PatientTabViewProps) {
    const hasCheckins = checkins && checkins.length > 0

    return (
        <div className="space-y-6">
            {hasCheckins ? (
                <>
                    <PatientSummary checkins={checkins} />
                    <PatientCharts checkins={checkins} sexo={sexo} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-muted/10 text-center">
                    <Activity className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-base font-bold">Sem dados de check-in</h3>
                    <p className="text-sm text-muted-foreground mt-1">Este paciente ainda não realizou nenhum acompanhamento.</p>
                </div>
            )}
            <PatientMeasurements patientId={patientId} />
            <PatientPhotoComparison patientId={patientId} />
            <PatientDocuments patientId={patientId} />
            <PatientNotes patientId={patientId} isDoctor={true} />
        </div>
    )
}
