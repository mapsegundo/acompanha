
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

const profileSchema = z.object({
    nome: z.string().min(2, "Nome é obrigatório"),
    modalidade: z.string().min(2, "Modalidade é obrigatória"),
    idade: z.string().optional(), // Inputs often return strings, need transform or flexible schema
    sexo: z.string().optional(),
    fase_temporada: z.string().optional(),
})

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nome: "",
            modalidade: "",
            idade: "",
            sexo: "",
            fase_temporada: "",
        },
    })

    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data: patient } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (patient) {
                form.reset({
                    nome: patient.nome === 'Paciente Demo' ? '' : patient.nome || "",
                    modalidade: patient.modalidade || "",
                    idade: patient.idade ? String(patient.idade) : "",
                    sexo: patient.sexo || "",
                    fase_temporada: patient.fase_temporada || ""
                })
            }
            setIsLoading(false)
        }
        loadProfile()
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
                email: user.email, // Ensure email is kept/set
                nome: values.nome,
                modalidade: values.modalidade,
                idade: values.idade ? parseInt(values.idade) : null,
                sexo: values.sexo,
                fase_temporada: values.fase_temporada
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

    if (isLoading) return <div>Carregando...</div>

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seu nome" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="modalidade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modalidade Esportiva</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Corrida, Triathlon" {...field} />
                                    </FormControl>
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
                                            <Input type="number" placeholder="Anos" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sexo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sexo Biológico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="M / F" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="fase_temporada"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fase da Temporada</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Base, Polimento, Competitiva" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            Salvar Informações
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
