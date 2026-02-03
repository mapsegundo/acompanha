
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity } from "lucide-react"
import Link from "next/link"
import { PatientCharts } from "./charts"
import { Badge } from "@/components/ui/badge"

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Patient Info
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

    // 2. Fetch Check-ins
    const { data: checkins } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('patient_id', id)
        .order('data', { ascending: true })

    if (patientError) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Erro ao carregar paciente</h1>
                <p>{patientError.message}</p>
                <Link href="/doctor/dashboard"><Button className="mt-4">Voltar</Button></Link>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/doctor/patients">
                        <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            {patient.nome || "Paciente Sem Nome"}
                            <Badge variant="outline" className="text-sm font-normal text-muted-foreground">{patient.modalidade || "Sem modalidade"}</Badge>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                            <User className="h-4 w-4" /> {patient.email}
                            <span className="mx-2">•</span>
                            Idade: {patient.idade || "N/A"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Gerar Relatório
                    </Button>
                </div>
            </div>

            {/* Charts & Data */}
            {checkins && checkins.length > 0 ? (
                <PatientCharts checkins={checkins} />
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/10">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Sem dados de check-in</h3>
                    <p className="text-muted-foreground">Este paciente ainda não realizou nenhum acompanhamento.</p>
                </div>
            )}
        </div>
    )
}
