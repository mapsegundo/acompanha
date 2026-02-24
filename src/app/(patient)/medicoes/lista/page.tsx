import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Plus, Calendar, Ruler, GitCompare } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"
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
    created_at: string
}

export default async function MedicoesListaPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single()

    let measurements: BodyMeasurement[] = []

    if (patient) {
        const { data, error } = await supabase
            .from('body_measurements')
            .select('*')
            .eq('patient_id', patient.id)
            .order('data', { ascending: false })

        if (!error && data) {
            measurements = data as BodyMeasurement[]
        }
    }

    const measurementsWithUrls = await withSignedMeasurementUrls(supabase, measurements)

    const fmtVal = (val: number | null, unit: string) =>
        val !== null && val !== undefined ? `${val}${unit}` : '-'

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black tracking-tight">Medições</h1>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                        {measurements.length > 0
                            ? `${measurements.length} registro${measurements.length > 1 ? 's' : ''}`
                            : 'Nenhum registro ainda'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {measurements.length >= 2 && (
                        <Link href="/medicoes/comparar">
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9 border-slate-200">
                                <GitCompare className="h-3.5 w-3.5" />
                                Comparar
                            </Button>
                        </Link>
                    )}
                    <Link href="/medicoes">
                        <Button size="sm" className="gap-1.5 text-xs h-9 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-3.5 w-3.5" />
                            Nova
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Empty state */}
            {measurements.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                        <Ruler className="h-7 w-7 text-blue-500" />
                    </div>
                    <h3 className="text-base font-black text-slate-800 mb-1">Nenhuma medição ainda</h3>
                    <p className="text-sm text-muted-foreground text-center mb-5">
                        Registre suas medidas corporais para acompanhar sua evolução.
                    </p>
                    <Link href="/medicoes">
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Plus className="h-4 w-4" /> Registrar Agora
                        </Button>
                    </Link>
                </div>
            )}

            {/* Cards grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {measurementsWithUrls.map((m, index) => (
                    <Link key={m.id} href={`/medicoes?id=${m.id}`} className="block">
                        <Card className="overflow-hidden border hover:border-blue-400/50 hover:shadow-md transition-all duration-200 group">
                            {/* Photo */}
                            {m.signedUrl ? (
                                <div className="relative w-full h-44 bg-slate-100">
                                    <Image
                                        src={m.signedUrl}
                                        alt={`Medição ${format(parseISO(m.data), "dd/MM/yyyy")}`}
                                        fill
                                        unoptimized
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover"
                                    />
                                    {index === 0 && (
                                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full">
                                            Mais recente
                                        </span>
                                    )}
                                </div>
                            ) : (
                                index === 0 && (
                                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-400" />
                                )
                            )}

                            <CardContent className="p-4">
                                {/* Date */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-sm font-bold text-slate-700">
                                            {format(parseISO(m.data), "dd 'de' MMMM", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
                                        {format(parseISO(m.data), "eeee", { locale: ptBR })}
                                    </span>
                                </div>

                                {/* Main weight */}
                                {m.peso_corporal && (
                                    <div className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                                        {m.peso_corporal}
                                        <span className="text-base font-bold text-muted-foreground ml-0.5">kg</span>
                                    </div>
                                )}

                                {/* Key stats */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">Cintura</div>
                                        <div className="text-sm font-black text-slate-800 mt-0.5">{fmtVal(m.cintura, 'cm')}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">Gordura</div>
                                        <div className="text-sm font-black text-slate-800 mt-0.5">{fmtVal(m.gordura_corporal, '%')}</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">M. Magra</div>
                                        <div className="text-sm font-black text-slate-800 mt-0.5">{fmtVal(m.massa_magra, 'kg')}</div>
                                    </div>
                                </div>

                                {/* Edit hint */}
                                <div className="mt-3 pt-3 border-t flex justify-end">
                                    <span className="text-xs text-blue-600 font-black uppercase tracking-tight group-hover:underline">
                                        Editar →
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
