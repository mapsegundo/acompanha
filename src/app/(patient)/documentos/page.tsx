"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Document {
    id: string
    titulo: string
    descricao: string | null
    file_url: string
    file_name: string | null
    file_type: string | null
    created_at: string
}

export default function DocumentosPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    const loadDocuments = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data: patient } = await supabase
            .from('patients')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!patient) { router.push('/login'); return }

        const { data } = await supabase
            .from('patient_documents')
            .select('*')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false })

        if (data) setDocuments(data)
        setIsLoading(false)
    }, [router, supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDocuments()
    }, [loadDocuments])

    async function handleDownload(doc: Document) {
        console.log("Gerando link para:", doc.file_url)
        const { data, error } = await supabase.storage
            .from('patient-documents')
            .createSignedUrl(doc.file_url, 3600)

        if (error) {
            console.error("Erro Supabase Storage:", error)
            toast.error("Erro ao gerar link de download")
            return
        }

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        } else {
            toast.error("Erro ao gerar link de download")
        }
    }

    if (isLoading) {
        return <div className="flex justify-center py-12 text-muted-foreground text-sm">Carregando...</div>
    }

    return (
        <div className="space-y-5 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Documentos</h1>
                    <p className="text-sm text-muted-foreground">Prescrições, dietas e treinos enviados pelo seu médico</p>
                </div>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                    <h3 className="text-lg font-semibold mb-1">Nenhum documento</h3>
                    <p className="text-sm text-muted-foreground">Quando o seu médico enviar documentos, eles aparecerão aqui.</p>
                </div>
            ) : (
                <div className="rounded-2xl border bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b bg-muted/20">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
                        </div>
                    </div>
                    <div className="divide-y">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{doc.titulo}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{format(parseISO(doc.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                            {doc.file_name && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate">{doc.file_name}</span>
                                                </>
                                            )}
                                        </div>
                                        {doc.descricao && (
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.descricao}</p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload(doc)}
                                    className="gap-1.5 text-xs font-bold shrink-0 ml-2"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Download</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
