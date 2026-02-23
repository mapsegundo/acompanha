"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO, isAfter, startOfDay } from "date-fns"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Camera, Loader2, X, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"

const numericField = z.string().transform((v) => v === '' ? null : Number(v)).pipe(z.number().nullable());

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
    peso_corporal: numericField,
    cintura: numericField,
    gordura_corporal: numericField,
    massa_magra: numericField,
    pescoco: numericField,
    ombro: numericField,
    peito: numericField,
    biceps_esquerdo: numericField,
    biceps_direito: numericField,
    antebraco_esquerdo: numericField,
    antebraco_direito: numericField,
    abdomen: numericField,
    quadris: numericField,
    coxa_esquerda: numericField,
    coxa_direita: numericField,
    panturrilha_esquerda: numericField,
    panturrilha_direita: numericField,
})

type FormOutput = z.output<typeof formSchema>

// Input type uses strings for numeric fields since the form inputs work with strings
interface FormInput {
    data: string
    peso_corporal: string
    cintura: string
    gordura_corporal: string
    massa_magra: string
    pescoco: string
    ombro: string
    peito: string
    biceps_esquerdo: string
    biceps_direito: string
    antebraco_esquerdo: string
    antebraco_direito: string
    abdomen: string
    quadris: string
    coxa_esquerda: string
    coxa_direita: string
    panturrilha_esquerda: string
    panturrilha_direita: string
}

interface MeasurementField {
    name: keyof FormInput
    label: string
    unit: string
    step?: string
}

const measurementFields: MeasurementField[] = [
    { name: "peso_corporal", label: "Peso Corporal", unit: "kg", step: "0.1" },
    { name: "cintura", label: "Cintura", unit: "cm", step: "0.1" },
    { name: "gordura_corporal", label: "Gordura Corporal", unit: "%", step: "0.1" },
    { name: "massa_magra", label: "Massa Corporal Magra", unit: "kg", step: "0.1" },
    { name: "pescoco", label: "Pescoço", unit: "cm", step: "0.1" },
    { name: "ombro", label: "Ombro", unit: "cm", step: "0.1" },
    { name: "peito", label: "Peito", unit: "cm", step: "0.1" },
    { name: "biceps_esquerdo", label: "Bíceps Esquerdo", unit: "cm", step: "0.1" },
    { name: "biceps_direito", label: "Bíceps Direito", unit: "cm", step: "0.1" },
    { name: "antebraco_esquerdo", label: "Antebraço Esquerdo", unit: "cm", step: "0.1" },
    { name: "antebraco_direito", label: "Antebraço Direito", unit: "cm", step: "0.1" },
    { name: "abdomen", label: "Abdômen", unit: "cm", step: "0.1" },
    { name: "quadris", label: "Quadris", unit: "cm", step: "0.1" },
    { name: "coxa_esquerda", label: "Coxa Esquerda", unit: "cm", step: "0.1" },
    { name: "coxa_direita", label: "Coxa Direita", unit: "cm", step: "0.1" },
    { name: "panturrilha_esquerda", label: "Panturrilha Esquerda", unit: "cm", step: "0.1" },
    { name: "panturrilha_direita", label: "Panturrilha Direita", unit: "cm", step: "0.1" },
]

function MedicoesForm() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [patientId, setPatientId] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [existingFotoUrl, setExistingFotoUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const measurementId = searchParams.get('id')
    const supabase = createClient()

    const form = useForm<FormInput>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        mode: "onChange",
        defaultValues: {
            data: format(new Date(), 'yyyy-MM-dd'),
            peso_corporal: '',
            cintura: '',
            gordura_corporal: '',
            massa_magra: '',
            pescoco: '',
            ombro: '',
            peito: '',
            biceps_esquerdo: '',
            biceps_direito: '',
            antebraco_esquerdo: '',
            antebraco_direito: '',
            abdomen: '',
            quadris: '',
            coxa_esquerda: '',
            coxa_direita: '',
            panturrilha_esquerda: '',
            panturrilha_direita: '',
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

            const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (!patient) {
                toast.error("Perfil não encontrado.")
                router.push('/login')
                return
            }

            setPatientId(patient.id)

            // Load existing measurement if editing
            if (measurementId) {
                const { data: measurement } = await supabase
                    .from('body_measurements')
                    .select('*')
                    .eq('id', measurementId)
                    .single()

                if (measurement) {
                    form.reset({
                        data: measurement.data,
                        peso_corporal: measurement.peso_corporal ?? '',
                        cintura: measurement.cintura ?? '',
                        gordura_corporal: measurement.gordura_corporal ?? '',
                        massa_magra: measurement.massa_magra ?? '',
                        pescoco: measurement.pescoco ?? '',
                        ombro: measurement.ombro ?? '',
                        peito: measurement.peito ?? '',
                        biceps_esquerdo: measurement.biceps_esquerdo ?? '',
                        biceps_direito: measurement.biceps_direito ?? '',
                        antebraco_esquerdo: measurement.antebraco_esquerdo ?? '',
                        antebraco_direito: measurement.antebraco_direito ?? '',
                        abdomen: measurement.abdomen ?? '',
                        quadris: measurement.quadris ?? '',
                        coxa_esquerda: measurement.coxa_esquerda ?? '',
                        coxa_direita: measurement.coxa_direita ?? '',
                        panturrilha_esquerda: measurement.panturrilha_esquerda ?? '',
                        panturrilha_direita: measurement.panturrilha_direita ?? '',
                    })

                    if (measurement.foto_url) {
                        setExistingFotoUrl(measurement.foto_url)
                        // Generate signed URL for preview
                        const { data: signedUrl } = await supabase.storage
                            .from('measurements')
                            .createSignedUrl(measurement.foto_url, 3600)
                        if (signedUrl) {
                            setImagePreview(signedUrl.signedUrl)
                        }
                    }
                }
            } else {
                // New measurement: pre-fill with values from the most recent one
                const { data: lastMeasurement } = await supabase
                    .from('body_measurements')
                    .select('*')
                    .eq('patient_id', patient.id)
                    .order('data', { ascending: false })
                    .limit(1)
                    .single()

                if (lastMeasurement) {
                    // Keep today's date, no photo — only copy numeric values
                    form.reset({
                        data: format(new Date(), 'yyyy-MM-dd'),
                        peso_corporal: lastMeasurement.peso_corporal ?? '',
                        cintura: lastMeasurement.cintura ?? '',
                        gordura_corporal: lastMeasurement.gordura_corporal ?? '',
                        massa_magra: lastMeasurement.massa_magra ?? '',
                        pescoco: lastMeasurement.pescoco ?? '',
                        ombro: lastMeasurement.ombro ?? '',
                        peito: lastMeasurement.peito ?? '',
                        biceps_esquerdo: lastMeasurement.biceps_esquerdo ?? '',
                        biceps_direito: lastMeasurement.biceps_direito ?? '',
                        antebraco_esquerdo: lastMeasurement.antebraco_esquerdo ?? '',
                        antebraco_direito: lastMeasurement.antebraco_direito ?? '',
                        abdomen: lastMeasurement.abdomen ?? '',
                        quadris: lastMeasurement.quadris ?? '',
                        coxa_esquerda: lastMeasurement.coxa_esquerda ?? '',
                        coxa_direita: lastMeasurement.coxa_direita ?? '',
                        panturrilha_esquerda: lastMeasurement.panturrilha_esquerda ?? '',
                        panturrilha_direita: lastMeasurement.panturrilha_direita ?? '',
                    })
                }
            }
            setIsLoading(false)
        }
        loadData()
    }, [measurementId, form, router, supabase])

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("A imagem deve ter no máximo 5MB")
                return
            }
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        setExistingFotoUrl(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const uploadImage = async (measurementRecordId: string): Promise<string | null> => {
        if (!selectedImage || !patientId) return existingFotoUrl

        const fileExt = selectedImage.name.split('.').pop()
        const filePath = `${patientId}/${measurementRecordId}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('measurements')
            .upload(filePath, selectedImage, { upsert: true })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error("Erro ao fazer upload da imagem")
        }

        return filePath
    }

    const onSubmit = async (values: FormOutput) => {
        if (!patientId) return
        setIsSaving(true)

        try {
            const payload: Record<string, unknown> = {
                patient_id: patientId,
                data: values.data,
                peso_corporal: values.peso_corporal,
                cintura: values.cintura,
                gordura_corporal: values.gordura_corporal,
                massa_magra: values.massa_magra,
                pescoco: values.pescoco,
                ombro: values.ombro,
                peito: values.peito,
                biceps_esquerdo: values.biceps_esquerdo,
                biceps_direito: values.biceps_direito,
                antebraco_esquerdo: values.antebraco_esquerdo,
                antebraco_direito: values.antebraco_direito,
                abdomen: values.abdomen,
                quadris: values.quadris,
                coxa_esquerda: values.coxa_esquerda,
                coxa_direita: values.coxa_direita,
                panturrilha_esquerda: values.panturrilha_esquerda,
                panturrilha_direita: values.panturrilha_direita,
            }

            if (measurementId) {
                // Update existing
                const fotoUrl = await uploadImage(measurementId)
                if (fotoUrl !== undefined) payload.foto_url = fotoUrl

                const { error } = await supabase
                    .from('body_measurements')
                    .update(payload)
                    .eq('id', measurementId)

                if (error) throw error
                toast.success("Medições atualizadas com sucesso!")
            } else {
                // Insert new — first create the record, then upload image
                const { data: newRecord, error } = await supabase
                    .from('body_measurements')
                    .insert(payload)
                    .select('id')
                    .single()

                if (error) throw error

                if (newRecord && selectedImage) {
                    const fotoUrl = await uploadImage(newRecord.id)
                    if (fotoUrl) {
                        await supabase
                            .from('body_measurements')
                            .update({ foto_url: fotoUrl })
                            .eq('id', newRecord.id)
                    }
                }

                toast.success("Medições salvas com sucesso!")
            }

            router.push("/medicoes/lista")
        } catch (error) {
            toast.error("Erro ao salvar", { description: (error as Error).message })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between py-4 mb-2">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/medicoes/lista")}
                    className="text-blue-500 hover:text-blue-600 p-0 h-auto font-medium"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Cancelar
                </Button>
                <h1 className="text-lg font-bold">
                    {measurementId ? 'Editar Medições' : 'Registrar Medições'}
                </h1>
                <Button
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={form.handleSubmit(onSubmit as any)}
                    disabled={isSaving}
                    variant="ghost"
                    className="text-blue-500 hover:text-blue-600 p-0 h-auto font-bold"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </Button>
            </div>

            <Form {...form}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-0">
                    {/* Data */}
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                        <span className="text-sm font-medium">Data</span>
                        <FormField
                            control={form.control}
                            name="data"
                            render={({ field }) => (
                                <FormItem className="m-0 flex items-center gap-2">
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            className="w-[160px] h-8 text-right text-sm border border-border/60 rounded-md bg-muted/20 cursor-pointer"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Photo section */}
                    <div className="py-4 border-b border-border/50">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">Imagem do progresso</span>
                        </div>

                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-auto object-contain rounded-t-xl"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-border/60 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                            >
                                <Camera className="h-8 w-8 text-blue-500" />
                                <span className="text-sm font-medium text-blue-500">Adicionar imagem</span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Measurements */}
                    <div className="pt-4">
                        <h2 className="text-sm font-medium text-muted-foreground mb-2">Medições</h2>

                        <div className="divide-y divide-border/40">
                            {measurementFields.map((mField) => (
                                <FormField
                                    key={mField.name}
                                    control={form.control}
                                    name={mField.name}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between py-3 space-y-0">
                                            <FormLabel className="text-sm font-normal cursor-pointer">
                                                {mField.label} ({mField.unit})
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step={mField.step || "1"}
                                                    placeholder="-"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    className="w-24 h-8 text-right border-none bg-transparent text-sm font-medium tabular-nums focus-visible:ring-1 focus-visible:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Bottom Save Button (mobile-friendly) */}
                    <div className="pt-6 pb-8">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                measurementId ? 'Atualizar Medições' : 'Salvar Medições'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default function MedicoesPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        }>
            <MedicoesForm />
        </Suspense>
    )
}
