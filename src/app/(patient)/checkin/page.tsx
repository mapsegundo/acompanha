
"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"

const formSchema = z.object({
    data: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Data inválida",
    }),

    // Check-in Fields
    peso: z.string().transform((v) => parseFloat(v) || 0),
    cansaco: z.number().min(0).max(10),
    horas_treino_7d: z.string().transform((v) => parseFloat(v) || 0),
    qualidade_sono: z.number().min(0).max(10),
    dor_muscular: z.number().min(0).max(10),
    estresse: z.number().min(0).max(10),
    humor: z.number().min(0).max(10),
    duracao_treino: z.string().transform((v) => parseFloat(v) || 0),
    libido: z.number().min(0).max(10),
    erecao_matinal: z.boolean(),
    lesao: z.boolean(),
    local_lesao: z.string().optional(),
})

function CheckinForm() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [isProfileComplete, setIsProfileComplete] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const checkinId = searchParams.get('id')
    const supabase = createClient()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            data: new Date().toISOString().split('T')[0],
            peso: "70",
            cansaco: 5,
            horas_treino_7d: "5",
            qualidade_sono: 5,
            dor_muscular: 0,
            estresse: 5,
            humor: 5,
            duracao_treino: "60",
            libido: 5,
            erecao_matinal: true,
            lesao: false,
            local_lesao: "",
        },
    })

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 1. Check Patient Profile
            const { data: patient } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user.id)
                .single()

            // If profile incomplete, flag it (component will redirect or show warning)
            if (!patient || !patient.nome || patient.nome === 'Paciente Demo' || !patient.modalidade) {
                setIsProfileComplete(false)
                toast.warning("Complete seu perfil para realizar o check-in.")
                router.push('/profile') // Redirect to profile
                return
            }

            // 2. Load Check-in if Editing
            if (checkinId) {
                const { data: checkin } = await supabase
                    .from('weekly_checkins')
                    .select('*')
                    .eq('id', checkinId)
                    .single()

                if (checkin) {
                    form.reset({
                        data: checkin.data,
                        peso: String(checkin.peso),
                        cansaco: checkin.cansaco,
                        horas_treino_7d: String(checkin.horas_treino_7d),
                        qualidade_sono: checkin.qualidade_sono,
                        dor_muscular: checkin.dor_muscular,
                        estresse: checkin.estresse,
                        humor: checkin.humor,
                        duracao_treino: String(checkin.duracao_treino),
                        libido: checkin.libido,
                        erecao_matinal: checkin.erecao_matinal,
                        lesao: checkin.lesao,
                        local_lesao: checkin.local_lesao || "",
                    })
                }
            }
            setIsLoading(false)
        }
        loadData()
    }, [checkinId, form, router, supabase])


    // Basic step navigation
    // Explicitly prevent default to avoid any chance of button click bubbling as submit
    const nextStep = (e: React.MouseEvent) => {
        e.preventDefault()
        setStep((s) => Math.min(s + 1, 3))
    }
    const prevStep = (e: React.MouseEvent) => {
        e.preventDefault()
        setStep((s) => Math.max(s - 1, 1))
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            // Get Patient ID (we assume it exists because of the check in useEffect)
            const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()

            if (!patient) {
                toast.error("Perfil de paciente não encontrado.")
                return
            }

            const payload = {
                patient_id: patient.id,
                ...values
            }

            if (checkinId) {
                const { error } = await supabase.from('weekly_checkins').update(payload).eq('id', checkinId)
                if (error) throw error
                toast.success("Check-in atualizado com sucesso!")
            } else {
                const { error } = await supabase.from('weekly_checkins').insert(payload)
                if (error) throw error
                toast.success("Check-in salvo com sucesso!")
            }

            router.push("/dashboard")

        } catch (error: any) {
            toast.error("Erro ao salvar", { description: error.message })
        }
    }

    const progress = (step / 3) * 100

    if (isLoading) {
        return <div className="flex justify-center py-10">Verificando perfil...</div>
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {checkinId ? 'Editar Acompanhamento' : 'Novo Acompanhamento'}
                </h1>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">Passo {step} de 3</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-semibold">Dados Gerais</h2>

                            <FormField
                                control={form.control}
                                name="data"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data do Check-in</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="max-w-[200px]" />
                                        </FormControl>
                                        <FormDescription>Se este check-in é de dias anteriores, ajuste a data.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            <div className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="peso"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Peso Atual (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="qualidade_sono"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex justify-between">
                                                Qualidade do Sono
                                                <span className="font-bold text-primary">{field.value}/10</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0} max={10} step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                                                <span>Péssimo</span><span>Excelente</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cansaco"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex justify-between">
                                                Nível de Cansaço
                                                <span className="font-bold text-primary">{field.value}/10</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={0} max={10} step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                                                <span>Zero</span><span>Exausto</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-semibold">Bem-estar Mental</h2>

                            <FormField
                                control={form.control}
                                name="estresse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex justify-between">Nível de Estresse <span className="font-bold text-primary">{field.value}/10</span></FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} className="py-4" />
                                        </FormControl>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Baixo</span><span>Muito Alto</span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="humor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex justify-between">Humor <span className="font-bold text-primary">{field.value}/10</span></FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} className="py-4" />
                                        </FormControl>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Deprimido</span><span>Feliz</span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="libido"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex justify-between">Libido <span className="font-bold text-primary">{field.value}/10</span></FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} className="py-4" />
                                        </FormControl>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Baixa</span><span>Alta</span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="erecao_matinal"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Ereção Matinal</FormLabel>
                                            <FormDescription>
                                                Você apresentou ereção matinal na maioria dos dias?
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-semibold">Treino & Lesões</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="horas_treino_7d"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Horas de Treino (7d)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.5" {...field} />
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
                                                <Input type="number" {...field} />
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
                                    <FormItem>
                                        <FormLabel className="flex justify-between">Dor Muscular <span className="font-bold text-primary">{field.value}/10</span></FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} className="py-4" />
                                        </FormControl>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Sem Dor</span><span>Muita Dor</span>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lesao"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Possui Lesão?</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
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
                                            <FormLabel>Local da Lesão</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Descreva o local e tipo da dor..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={prevStep}>
                                Voltar
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button type="button" className="ml-auto" onClick={nextStep}>
                                Próximo
                            </Button>
                        ) : (
                            <Button type="submit" className="ml-auto bg-green-600 hover:bg-green-700">
                                {checkinId ? 'Atualizar Check-in' : 'Finalizar Check-in'}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default function CheckinPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <CheckinForm />
        </Suspense>
    )
}
