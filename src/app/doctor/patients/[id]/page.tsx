
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity, Calendar, Target, FileDown } from "lucide-react"
import Link from "next/link"
import { PatientCharts } from "./charts"
import { Badge } from "@/components/ui/badge"
import { ReportButton } from "./report-button"

// Define types for joined data
interface PatientData {
    id: string
    nome: string | null
    email: string | null
    idade: number | null
    sexo: string | null
    peso: number | null
    sport_modalities: { nome: string } | null
    season_phases: { nome: string } | null
}

interface CheckinData {
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

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Patient Info with FK joins
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
            id,
            nome,
            email,
            idade,
            sexo,
            peso,
            sport_modalities ( nome ),
            season_phases ( nome )
        `)
        .eq('id', id)
        .single()

    // 2. Fetch Check-ins
    const { data: checkins } = await supabase
        .from('weekly_checkins')
        .select('*')
        .eq('patient_id', id)
        .order('data', { ascending: true })


    if (patientError || !patient) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">Erro ao carregar paciente</h1>
                <p>{patientError?.message || 'Paciente não encontrado'}</p>
                <Link href="/doctor/dashboard"><Button className="mt-4">Voltar</Button></Link>
            </div>
        )
    }

    // Type-safe extraction of FK joined data
    // @ts-expect-error Supabase FK join types are complex, but we know the structure
    const modalityName = patient.sport_modalities?.nome || "Sem modalidade"
    // @ts-expect-error Supabase FK join types are complex, but we know the structure
    const phaseName = patient.season_phases?.nome || "Sem fase"

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/doctor/patients">
                        <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 flex-wrap">
                            {patient.nome || "Paciente Sem Nome"}
                            <Badge variant="outline" className="text-sm font-normal text-muted-foreground">
                                <Target className="h-3 w-3 mr-1" />
                                {modalityName}
                            </Badge>
                            <Badge variant="secondary" className="text-sm font-normal">
                                <Calendar className="h-3 w-3 mr-1" />
                                {phaseName}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                            <User className="h-4 w-4" /> {patient.email}
                            <span className="mx-2">•</span>
                            Idade: {patient.idade || "N/A"}
                            <span className="mx-2">•</span>
                            Peso: {patient.peso ? `${patient.peso} kg` : "N/A"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ReportButton
                        patient={{
                            nome: patient.nome || "Paciente",
                            email: patient.email || "",
                            idade: patient.idade,
                            sexo: patient.sexo,
                            peso: patient.peso,
                            modalidade: modalityName,
                            fase: phaseName
                        }}
                        checkins={checkins || []}
                    />
                </div>
            </div>

            {/* Charts & Data */}
            {checkins && checkins.length > 0 ? (
                <PatientCharts checkins={checkins} sexo={patient.sexo || 'M'} />
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
