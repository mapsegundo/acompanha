
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Activity, Calendar, Target } from "lucide-react"
import Link from "next/link"
import { PatientCharts } from "./charts"
import { PatientNotes } from "./patient-notes"
import { Badge } from "@/components/ui/badge"
import { ReportButton } from "./report-button"

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

    // Get most recent weight from check-ins
    const latestCheckin = checkins && checkins.length > 0 ? checkins[checkins.length - 1] : null
    const currentWeight = latestCheckin?.peso || patient.peso

    return (
        <div className="space-y-6">
            {/* Header - Premium Redesign */}
            <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Link href="/doctor/patients" className="mt-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100 transition-colors">
                                <ArrowLeft className="h-5 w-5 text-slate-600" />
                            </Button>
                        </Link>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {patient.nome || "Paciente Sem Nome"}
                                </h1>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-slate-200">
                                        <Target className="h-3 w-3 mr-1" />
                                        {modalityName}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {phaseName}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1 bg-slate-100 rounded-md">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    {patient.email}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 italic">
                                    <span>{patient.idade || "N/A"} anos</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{currentWeight ? `${currentWeight}kg` : "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                        <ReportButton
                            patient={{
                                nome: patient.nome || "Paciente",
                                email: patient.email || "",
                                idade: patient.idade,
                                sexo: patient.sexo,
                                peso: currentWeight,
                                modalidade: modalityName,
                                fase: phaseName
                            }}
                            checkins={checkins || []}
                        />
                    </div>
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

            {/* Clinical Notes */}
            <PatientNotes patientId={id} isDoctor={true} />
        </div>
    )
}
