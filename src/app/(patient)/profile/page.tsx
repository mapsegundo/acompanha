
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const profileSchema = z.object({
    nome: z.string().min(2, "Nome é obrigatório"),
    sport_modalities_id: z.string().uuid("Selecione uma modalidade"),
    idade: z.string().optional(),
    sexo: z.enum(["M", "F"]),
    season_phases_id: z.string().uuid("Selecione a fase da temporada"),
    peso: z.string().min(1, "Peso é obrigatório"),
})

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nome: "",
            sport_modalities_id: "",
            idade: "",
            sexo: "M",
            season_phases_id: "",
            peso: "",
        },
    })

    const [modalities, setModalities] = useState<{ id: string, nome: string }[]>([])
    const [phases, setPhases] = useState<{ id: string, nome: string }[]>([])

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Load lookup tables
            const [modalitiesRes, phasesRes] = await Promise.all([
                supabase.from('sport_modalities').select('*').order('nome'),
                supabase.from('season_phases').select('*').order('nome')
            ])

            if (modalitiesRes.data) setModalities(modalitiesRes.data)
            if (phasesRes.data) setPhases(phasesRes.data)

            // Load patient profile
            const { data: patient } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (patient) {
                form.reset({
                    nome: patient.nome === 'Paciente Demo' ? '' : patient.nome || "",
                    sport_modalities_id: patient.sport_modalities_id || "",
                    idade: patient.idade ? String(patient.idade) : "",
                    sexo: (patient.sexo as any) || "M",
                    season_phases_id: patient.season_phases_id || "",
                    peso: patient.peso ? String(patient.peso) : ""
                })
            }
            setIsLoading(false)
        }
        loadInitialData()
    }, [form, router, supabase])

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            // Check if patient exists
            const { data: existing } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
                .single()

            const payload = {
                user_id: user.id,
                email: user.email,
                nome: values.nome,
                sport_modalities_id: values.sport_modalities_id,
                idade: values.idade ? parseInt(values.idade) : null,
                sexo: values.sexo,
                season_phases_id: values.season_phases_id,
                peso: values.peso ? parseFloat(values.peso) : null
            }

            if (existing) {
                const { error } = await supabase.from('patients').update(payload).eq('id', existing.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('patients').insert(payload)
                if (error) throw error
            }

            toast.success("Perfil atualizado com sucesso!")

            // Optional: redirect to dashboard if coming from checking redirect? 
            // For now just stay on profile or refresh.
            // router.refresh() 
        } catch (error) {
            toast.error("Erro ao salvar perfil", { description: (error as Error).message })
        }
    }

    const onInvalid = () => {
        toast.error("Preencha todos os campos obrigatórios corretamente.")
    }

    if (isLoading) return <div>Carregando...</div>

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seu nome" {...field} className="h-12" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sport_modalities_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modalidade Esportiva</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder="Selecione sua modalidade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {modalities.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="idade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Idade</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Anos" {...field} className="h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="peso"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Peso (kg)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="Ex: 75.5" {...field} className="h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="sexo"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Sexo Biológico</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="flex gap-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="M" />
                                                </FormControl>
                                                <Label className="font-normal cursor-pointer">Masculino</Label>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="F" />
                                                </FormControl>
                                                <Label className="font-normal cursor-pointer">Feminino</Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="season_phases_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fase da Temporada</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder="Selecione a fase atual" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {phases.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-12 font-bold uppercase tracking-tight"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar Informações"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
