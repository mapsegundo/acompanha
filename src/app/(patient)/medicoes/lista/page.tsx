import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Calendar, Ruler, ImageIcon, SplitSquareVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"

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

    // Generate signed URLs for photos
    const measurementsWithUrls = await Promise.all(
        measurements.map(async (m) => {
            let signedUrl: string | null = null
            if (m.foto_url) {
                const { data } = await supabase.storage
                    .from('measurements')
                    .createSignedUrl(m.foto_url, 3600)
                if (data) signedUrl = data.signedUrl
            }
            return { ...m, signedImageUrl: signedUrl }
        })
    )

    const formatValue = (val: number | null, unit: string) => {
        if (val === null || val === undefined) return '-'
        return `${val}${unit}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Minhas Medições</h1>
                <div className="flex gap-2">
                    <Link href="/medicoes/comparar">
                        <Button variant="outline" className="gap-2">
                            <SplitSquareVertical className="h-4 w-4" /> Comparar
                        </Button>
                    </Link>
                    <Link href="/medicoes">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Nova
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {measurementsWithUrls.map((measurement) => (
                    <Card key={measurement.id} className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 overflow-hidden">
                        {/* Photo thumbnail */}
                        {measurement.signedImageUrl && (
                            <div className="relative w-full h-40 bg-muted">
                                <img
                                    src={measurement.signedImageUrl}
                                    alt={`Progresso ${format(parseISO(measurement.data), "dd/MM/yyyy")}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <CardContent className={`space-y-3 ${measurement.signedImageUrl ? 'pt-4' : 'pt-6'}`}>
                            {/* Date Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {format(parseISO(measurement.data), "dd 'de' MMMM", { locale: ptBR })}
                                </div>
                                {!measurement.signedImageUrl && (
                                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                                    </div>
                                )}
                            </div>

                            {/* Main stats */}
                            {measurement.peso_corporal && (
                                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 italic">
                                    {measurement.peso_corporal} kg
                                </div>
                            )}

                            {/* Quick stats grid */}
                            <div className="text-[11px] font-bold space-y-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                                        <span className="text-slate-400 font-black uppercase tracking-tighter">Cintura</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-black">{formatValue(measurement.cintura, 'cm')}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                                        <span className="text-slate-400 font-black uppercase tracking-tighter">Gordura</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-black">{formatValue(measurement.gordura_corporal, '%')}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                                        <span className="text-slate-400 font-black uppercase tracking-tighter">Peito</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-black">{formatValue(measurement.peito, 'cm')}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                                        <span className="text-slate-400 font-black uppercase tracking-tighter">Ombro</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-black">{formatValue(measurement.ombro, 'cm')}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                                        <span className="text-slate-400 font-black uppercase tracking-tighter">Bíceps E</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-black">{formatValue(measurement.biceps_esquerdo, 'cm')}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                                        <span className="text-slate-400 font-black uppercase tracking-tighter">Bíceps D</span>
                                        <span className="text-slate-900 dark:text-slate-100 font-black">{formatValue(measurement.biceps_direito, 'cm')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit link */}
                            <div className="pt-3 border-t flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-bold">
                                    {format(parseISO(measurement.data), "eeee", { locale: ptBR })}
                                </span>
                                <Link
                                    href={`/medicoes?id=${measurement.id}`}
                                    className="text-xs text-blue-600 font-black uppercase hover:underline"
                                >
                                    Editar
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {measurements.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/10">
                        <Ruler className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Nenhuma medição encontrada</h3>
                        <p className="text-muted-foreground mb-4">Registre suas primeiras medições corporais.</p>
                        <Link href="/medicoes">
                            <Button>Registrar Medições</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
