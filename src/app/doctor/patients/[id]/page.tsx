
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, Calendar } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ReportButton } from "./report-button"
import { calculateRecoveryScore, getRecoveryColor } from "@/lib/monitoring"
import { PatientToggleStatus } from "./patient-toggle-status"
import { PatientTabView } from "./patient-tab-view"

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
            id,
            nome,
            email,
            idade,
            sexo,
            peso,
            ativo,
            sport_modalities ( nome ),
            season_phases ( nome )
        `)
        .eq('id', id)
        .single()

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

    // @ts-expect-error Supabase FK join types
    const modalityName = patient.sport_modalities?.nome || "Sem modalidade"
    // @ts-expect-error Supabase FK join types
    const phaseName = patient.season_phases?.nome || "Sem fase"

    const latestCheckin = checkins && checkins.length > 0 ? checkins[checkins.length - 1] : null
    const currentWeight = latestCheckin?.peso || patient.peso

    // Recovery score
    let recoveryScore: number | null = null
    let recoveryColor = "#64748b"
    if (latestCheckin?.recovery_score !== null && latestCheckin?.recovery_score !== undefined) {
        const recovery = calculateRecoveryScore(latestCheckin)
        recoveryScore = recovery.score
        recoveryColor = getRecoveryColor(recovery.status)
    }

    return (
        <div className="space-y-4">
            {/* ── Header ── */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

                {/* Top bar: back + actions */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b">
                    <Link href="/doctor/patients">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100">
                            <ArrowLeft className="h-4 w-4 text-slate-600" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <PatientToggleStatus patientId={id} initialAtivo={patient.ativo !== false} />
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

                {/* Patient identity */}
                <div className="px-4 py-4">
                    {/* Row 1: Name + Score */}
                    <div className="flex items-start gap-3 min-w-0">
                        {/* Score circle */}
                        {recoveryScore !== null && (
                            <div
                                className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
                                style={{ border: `3px solid ${recoveryColor}` }}
                            >
                                <span className="text-base font-black" style={{ color: recoveryColor }}>
                                    {recoveryScore}
                                </span>
                            </div>
                        )}
                        <div className="min-w-0 flex-1 pt-0.5">
                            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight break-words">
                                {patient.nome || "Paciente Sem Nome"}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{patient.email}</p>
                        </div>
                    </div>

                    {/* Row 2: Badges + biometrics */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-slate-200">
                            <Target className="h-3 w-3 mr-1" />
                            {modalityName}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                            <Calendar className="h-3 w-3 mr-1" />
                            {phaseName}
                        </Badge>
                        <span className="text-xs text-muted-foreground italic">
                            {patient.idade ? `${patient.idade} anos` : "—"} · {currentWeight ? `${currentWeight}kg` : "—"}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Tab sections ── */}
            <PatientTabView
                patientId={id}
                checkins={checkins || []}
                sexo={patient.sexo || 'M'}
            />
        </div>
    )
}
