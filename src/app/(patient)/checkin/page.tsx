
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
// import { toast } from "sonner" // Ensure Toaster is in RootLayout
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const formSchema = z.object({
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

export default function CheckinPage() {
    const [step, setStep] = useState(1)
    const router = useRouter()
    const supabase = createClient()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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

    // Basic step navigation
    const nextStep = () => setStep((s) => Math.min(s + 1, 3))
    const prevStep = () => setStep((s) => Math.max(s - 1, 1))

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error("Usuário não autenticado")
            // In real app, redirect to login
            // router.push('/login')
            return
        }

        // Try to get patient_id
        let { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).single()

        // Auto-create patient profile if missing (for demo purposes)
        if (!patient) {
            const { data: newPatient, error: createError } = await supabase.from('patients').insert({
                user_id: user.id,
                email: user.email,
                nome: "Paciente Demo" // Should be a separate onboarding flow
            }).select().single()

            if (createError) {
                toast.error("Erro ao criar perfil de paciente: " + createError.message)
                return
            }
            patient = newPatient
        }

        const { error } = await supabase.from('weekly_checkins').insert({
            patient_id: patient.id,
            data: new Date().toISOString(),
            ...values,
        })

        if (error) {
            toast.error("Erro ao salvar check-in", { description: error.message })
        } else {
            toast.success("Check-in realizado com sucesso!")
            router.push("/dashboard")
        }
    }

    const progress = (step / 3) * 100

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Novo Acompanhamento</h1>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">Passo {step} de 3</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-semibold">Dados Físicos & Sono</h2>

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

                            <Separator />

                            <FormField
                                control={form.control}
                                name="qualidade_sono"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Qualidade do Sono (0-10)</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <Slider
                                                    min={0} max={10} step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="flex-1"
                                                />
                                                <span className="w-8 text-center font-bold">{field.value}</span>
                                            </div>
                                        </FormControl>
                                        <FormDescription>0 = Péssimo, 10 = Excelente</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cansaco"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nível de Cansaço (0-10)</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <Slider
                                                    min={0} max={10} step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                    className="flex-1"
                                                />
                                                <span className="w-8 text-center font-bold">{field.value}</span>
                                            </div>
                                        </FormControl>
                                        <FormDescription>0 = Sem cansaço, 10 = Exausto</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-semibold">Bem-estar Mental</h2>

                            <FormField
                                control={form.control}
                                name="estresse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nível de Estresse (0-10)</FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                                        </FormControl>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Baixo</span><span>Muuuito Alto</span>
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
                                        <FormLabel>Humor (0-10)</FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
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
                                        <FormLabel>Libido (0-10)</FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                                        </FormControl>
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
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
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
                                        <FormLabel>Dor Muscular (0-10)</FormLabel>
                                        <FormControl>
                                            <Slider min={0} max={10} step={1} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                                        </FormControl>
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
                            // Use a proper type="button" and manual Next to validate if needed, or simple traversal
                            <Button type="button" className="ml-auto" onClick={nextStep}>
                                Próximo
                            </Button>
                        ) : (
                            <Button type="submit" className="ml-auto bg-green-600 hover:bg-green-700">
                                Finalizar Check-in
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}
