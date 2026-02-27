"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO, isAfter, startOfDay } from "date-fns"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { notifyDoctorOnCheckin } from "@/lib/push-notifications"

// Normalizes Brazilian comma-separated decimals (e.g. "87,4" → 87.4)
const parseDecimal = (v: unknown) => Number(String(v).replace(',', '.'))

const formSchema = z.object({
    data: z.string().min(1, "Data é obrigatória").refine((val) => !isNaN(Date.parse(val)), {
        message: "Data inválida",
    }).refine((val) => {
        const selectedDate = parseISO(val)
        const today = startOfDay(new Date())
        return !isAfter(selectedDate, today)
    }, {
        message: "A data não pode ser futura",
    }),
    peso: z.preprocess(parseDecimal, z.number({ invalid_type_error: "Digite um número válido" }).min(0, "Peso inválido")),
    cansaco: z.number().min(0).max(10),
    horas_treino_7d: z.preprocess(parseDecimal, z.number({ invalid_type_error: "Digite um número válido" }).min(0)),
    qualidade_sono: z.number().min(0).max(10),
    dor_muscular: z.number().min(0).max(10),
    estresse: z.number().min(0).max(10),
    humor: z.number().min(0).max(10),
    duracao_treino: z.preprocess(parseDecimal, z.number({ invalid_type_error: "Digite um número válido" }).min(0)),
    ciclo_menstrual_alterado: z.boolean(),
    libido: z.number().min(0).max(10),
    erecao_matinal: z.boolean(),
    lesao: z.boolean(),
    local_lesao: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// --- Score Button Grid ---
interface ScoreButtonsProps {
    value: number
    onChange: (v: number) => void
    isPositive: boolean
}

function getButtonColor(score: number, isPositive: boolean) {
    const good = isPositive ? score >= 7 : score <= 3
    const mid = isPositive ? score >= 4 && score < 7 : score > 3 && score < 7
    if (good) return "bg-emerald-500 text-white border-emerald-500 shadow-emerald-200"
    if (mid) return "bg-amber-400 text-white border-amber-400 shadow-amber-200"
    return "bg-red-500 text-white border-red-500 shadow-red-200"
}

function getCardAccent(value: number, isPositive: boolean) {
    if (value === 0) return ""
    const good = isPositive ? value >= 7 : value <= 3
    const mid = isPositive ? value >= 4 && value < 7 : value > 3 && value < 7
    if (good) return "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
    if (mid) return "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
    return "bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-800"
}

function ScoreButtons({ value, onChange, isPositive }: ScoreButtonsProps) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={cn(
                        "h-12 rounded-xl border-2 text-base font-black transition-all duration-150 shadow-sm active:scale-95",
                        value === n
                            ? getButtonColor(n, isPositive) + " scale-105 shadow-md"
                            : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                    )}
                    aria-label={`Nota ${n}`}
                    aria-pressed={value === n}
                >
                    {n}
                </button>
            ))}
        </div>
    )
}

// --- Metric Card Wrapper ---
interface MetricCardProps {
    label: string
    sublabel?: string
    value: number
    isPositive: boolean
    children: React.ReactNode
}

function MetricCard({ label, sublabel, value, isPositive, children }: MetricCardProps) {
    return (
        <div className={cn(
            "rounded-2xl border-2 p-5 space-y-4 transition-colors duration-300",
            value > 0 ? getCardAccent(value, isPositive) : "border-border"
        )}>
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-base font-bold">{label}</p>
                    {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
                </div>
                {value > 0 && (
                    <span className="text-3xl font-black tabular-nums leading-none">{value}<span className="text-sm font-normal text-muted-foreground">/10</span></span>
                )}
            </div>
            {children}
        </div>
    )
}

// --- Stories Progress Bar ---
function StoriesProgress({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex gap-1.5 w-full" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-300",
                        i < current ? "bg-foreground" : "bg-foreground/20"
                    )}
                />
            ))}
        </div>
    )
}

// --- Loading Skeleton ---
function CheckinSkeleton() {
    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6 animate-pulse">
            <div className="flex gap-1.5">
                {[1, 2, 3].map(i => <div key={i} className="h-1 flex-1 rounded-full bg-muted" />)}
            </div>
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="space-y-4">
                <div className="h-32 bg-muted rounded-2xl" />
                <div className="h-32 bg-muted rounded-2xl" />
            </div>
        </div>
    )
}

function CheckinForm() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [sexo, setSexo] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const checkinId = searchParams.get('id')
    const supabase = createClient()

    const TOTAL_STEPS = 3

    const form: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            data: format(new Date(), 'yyyy-MM-dd'),
            peso: '' as unknown as number,
            cansaco: 5,
            horas_treino_7d: '' as unknown as number,
            qualidade_sono: 5,
            dor_muscular: 0,
            estresse: 5,
            humor: 5,
            duracao_treino: '' as unknown as number,
            ciclo_menstrual_alterado: false,
            libido: 5,
            erecao_matinal: false,
            lesao: false,
            local_lesao: '',
        },
    })

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: patient } = await supabase
                .from('patients').select('*').eq('user_id', user.id).single()
            if (!patient) { toast.error("Perfil não encontrado."); router.push('/login'); return }

            setSexo(patient.sexo)

            if (checkinId) {
                const { data: checkin } = await supabase
                    .from('weekly_checkins').select('*').eq('id', checkinId).single()
                if (checkin) {
                    form.reset({
                        data: checkin.data,
                        peso: Number(checkin.peso),
                        cansaco: checkin.cansaco ?? 5,
                        horas_treino_7d: Number(checkin.horas_treino_7d),
                        qualidade_sono: checkin.qualidade_sono ?? 5,
                        dor_muscular: checkin.dor_muscular ?? 0,
                        estresse: checkin.estresse ?? 5,
                        humor: checkin.humor ?? 5,
                        duracao_treino: Number(checkin.duracao_treino),
                        ciclo_menstrual_alterado: !!checkin.ciclo_menstrual_alterado,
                        libido: checkin.libido ?? 5,
                        erecao_matinal: !!checkin.erecao_matinal,
                        lesao: !!checkin.lesao,
                        local_lesao: checkin.local_lesao || "",
                    })
                }
            }
            setIsLoading(false)
        }
        loadData()
    }, [checkinId, form, router, supabase])

    const nextStep = (e: React.MouseEvent) => { e.preventDefault(); setStep((s) => Math.min(s + 1, TOTAL_STEPS)) }
    const prevStep = (e: React.MouseEvent) => { e.preventDefault(); setStep((s) => Math.max(s - 1, 1)) }

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setIsSubmitting(false); return }

        try {
            const { data: patient } = await supabase.from('patients').select('id,nome').eq('user_id', user.id).single()
            if (!patient) { toast.error("Perfil de paciente não encontrado."); setIsSubmitting(false); return }

            const notifyDoctors = async (eventType: "created" | "updated") => {
                try {
                    const { data: doctors } = await supabase.from("doctors").select("user_id")
                    if (!doctors || doctors.length === 0) return

                    const patientName = patient.nome?.trim() || "Paciente"
                    const notifications = doctors
                        .map((doctor) => doctor.user_id)
                        .filter((doctorUserId): doctorUserId is string => Boolean(doctorUserId))
                        .map((doctorUserId) => notifyDoctorOnCheckin(doctorUserId, patientName, patient.id, eventType))

                    await Promise.allSettled(notifications)
                } catch {
                    // Non-critical - check-in should not fail if notification fails
                }
            }

            const payload: Record<string, unknown> = {
                patient_id: patient.id,
                data: values.data,
                peso: Number(values.peso),
                cansaco: Number(values.cansaco),
                horas_treino_7d: Number(values.horas_treino_7d),
                qualidade_sono: Number(values.qualidade_sono),
                dor_muscular: Number(values.dor_muscular),
                estresse: Number(values.estresse),
                humor: Number(values.humor),
                duracao_treino: Number(values.duracao_treino),
                libido: Number(values.libido),
                lesao: Boolean(values.lesao),
                local_lesao: values.local_lesao || null,
            }

            if (sexo === 'F') {
                payload.ciclo_menstrual_alterado = Boolean(values.ciclo_menstrual_alterado)
                payload.erecao_matinal = null
            } else if (sexo === 'M') {
                payload.erecao_matinal = Boolean(values.erecao_matinal)
                payload.ciclo_menstrual_alterado = null
            }

            if (checkinId) {
                const { error } = await supabase.from('weekly_checkins').update(payload).eq('id', checkinId)
                if (error) throw error
                await notifyDoctors("updated")
                toast.success("Check-in atualizado com sucesso!")
            } else {
                const { error } = await supabase.from('weekly_checkins').insert(payload)
                if (error) throw error
                await notifyDoctors("created")
                toast.success("Check-in salvo com sucesso!")
            }

            router.push("/dashboard")
        } catch (error) {
            toast.error("Erro ao salvar", { description: (error as Error).message })
        } finally {
            setIsSubmitting(false)
        }
    }

    const onInvalid = () => toast.error("Por favor, corrija os erros antes de continuar.")

    if (isLoading) return <CheckinSkeleton />

    return (
        <div className="max-w-2xl mx-auto py-4 pb-8">
            {/* Header */}
            <div className="mb-6 space-y-3">
                <StoriesProgress current={step} total={TOTAL_STEPS} />
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black">
                        {checkinId ? 'Editar Acompanhamento' : 'Novo Acompanhamento'}
                    </h1>
                    <span className="text-sm font-semibold text-muted-foreground">{step}/{TOTAL_STEPS}</span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">

                    {/* STEP 1: Dados Gerais */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Dados Gerais & Corpo</h2>

                            <FormField
                                control={form.control}
                                name="data"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data do Check-in</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="h-12 max-w-[200px]" />
                                        </FormControl>
                                        <FormDescription>Ajuste se este check-in for de dias anteriores.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="peso"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Peso Atual (kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="Ex: 80,5 ou 80.5"
                                                {...field}
                                                onBlur={(e) => {
                                                    const normalized = e.target.value.replace(',', '.')
                                                    field.onChange(normalized)
                                                    field.onBlur()
                                                }}
                                                className="h-12 text-lg font-bold"
                                            />
                                        </FormControl>
                                        <FormDescription>Use ponto ou vírgula como separador decimal.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="qualidade_sono"
                                render={({ field }) => (
                                    <MetricCard label="Qualidade do Sono" sublabel="Como você dormiu essa semana?" value={field.value} isPositive={true}>
                                        <ScoreButtons value={field.value} onChange={field.onChange} isPositive={true} />
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                                            <span>Péssimo</span><span>Excelente</span>
                                        </div>
                                    </MetricCard>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cansaco"
                                render={({ field }) => (
                                    <MetricCard label="Nível de Cansaço" sublabel="Qual sua fadiga acumulada?" value={field.value} isPositive={false}>
                                        <ScoreButtons value={field.value} onChange={field.onChange} isPositive={false} />
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                                            <span>Descansado</span><span>Exausto</span>
                                        </div>
                                    </MetricCard>
                                )}
                            />
                        </div>
                    )}

                    {/* STEP 2: Bem-estar Mental */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Bem-estar Mental & Hormonal</h2>

                            <FormField
                                control={form.control}
                                name="estresse"
                                render={({ field }) => (
                                    <MetricCard label="Nível de Estresse" sublabel="Quanto você se sentiu estressado?" value={field.value} isPositive={false}>
                                        <ScoreButtons value={field.value} onChange={field.onChange} isPositive={false} />
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                                            <span>Baixo</span><span>Muito Alto</span>
                                        </div>
                                    </MetricCard>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="humor"
                                render={({ field }) => (
                                    <MetricCard label="Humor" sublabel="Como foi o seu estado emocional?" value={field.value} isPositive={true}>
                                        <ScoreButtons value={field.value} onChange={field.onChange} isPositive={true} />
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                                            <span>Deprimido</span><span>Feliz</span>
                                        </div>
                                    </MetricCard>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="libido"
                                render={({ field }) => (
                                    <MetricCard label="Libido" sublabel="Como está seu desejo sexual?" value={field.value} isPositive={true}>
                                        <ScoreButtons value={field.value} onChange={field.onChange} isPositive={true} />
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                                            <span>Baixa</span><span>Alta</span>
                                        </div>
                                    </MetricCard>
                                )}
                            />

                            {sexo === 'F' && (
                                <FormField
                                    control={form.control}
                                    name="ciclo_menstrual_alterado"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 p-5 min-h-[72px]">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-bold">Alteração no ciclo menstrual?</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {sexo === 'M' && (
                                <FormField
                                    control={form.control}
                                    name="erecao_matinal"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 p-5 min-h-[72px]">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-bold">Ereção Matinal</FormLabel>
                                                <FormDescription>Na maioria dos dias essa semana?</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    )}

                    {/* STEP 3: Treino & Lesões */}
                    {step === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-widest text-[11px]">Treino & Lesões</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="horas_treino_7d"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Horas de Treino (7 dias)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder="Ex: 5,5"
                                                    {...field}
                                                    onBlur={(e) => {
                                                        const normalized = e.target.value.replace(',', '.')
                                                        field.onChange(normalized)
                                                        field.onBlur()
                                                    }}
                                                    className="h-12 text-base font-bold"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duracao_treino"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duração Média (min)</FormLabel>
                                            <FormControl>
                                                <Input type="text" inputMode="numeric" placeholder="Ex: 60" {...field} className="h-12 text-base font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="dor_muscular"
                                render={({ field }) => (
                                    <MetricCard label="Dor Muscular" sublabel="Intensidade da dor / soreness esta semana" value={field.value} isPositive={false}>
                                        <ScoreButtons value={field.value} onChange={field.onChange} isPositive={false} />
                                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                                            <span>Sem Dor</span><span>Muita Dor</span>
                                        </div>
                                    </MetricCard>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lesao"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border-2 p-5 min-h-[72px]">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base font-bold">Alguma lesão, dor ou incômodo?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {form.watch("lesao") && (
                                <FormField
                                    control={form.control}
                                    name="local_lesao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descreva a Lesão</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Local e tipo da dor, quando começou..." {...field} className="min-h-[100px]" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-2">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center justify-center gap-2 h-14 px-6 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 hover:bg-muted"
                                aria-label="Voltar para o passo anterior"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Voltar
                            </button>
                        )}
                        {step < TOTAL_STEPS ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex flex-1 items-center justify-center gap-2 h-14 rounded-2xl bg-foreground text-background font-bold text-base transition-all active:scale-95 hover:opacity-90"
                                aria-label="Avançar para o próximo passo"
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex flex-1 items-center justify-center gap-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                aria-label="Salvar check-in"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Salvando...</>
                                ) : (
                                    checkinId ? 'Atualizar Check-in' : '✓ Finalizar Check-in'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default function CheckinPage() {
    return (
        <Suspense fallback={<CheckinSkeleton />}>
            <CheckinForm />
        </Suspense>
    )
}
