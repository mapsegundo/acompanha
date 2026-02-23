"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Upload, Trash2, Download, Loader2, Plus, X, ChevronDown, ChevronUp } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
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

interface PatientDocumentsProps {
    patientId: string
}

export function PatientDocuments({ patientId }: PatientDocumentsProps) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [expanded, setExpanded] = useState(true)
    const [titulo, setTitulo] = useState("")
    const [descricao, setDescricao] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const fetchDocuments = useCallback(async () => {
        const { data } = await supabase
            .from('patient_documents')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (data) setDocuments(data)
        setIsLoading(false)
    }, [supabase, patientId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchDocuments()
    }, [fetchDocuments])

    async function handleUpload() {
        if (!titulo.trim() || !selectedFile) {
            toast.error("Título e arquivo são obrigatórios")
            return
        }

        setIsUploading(true)

        // Get doctor id
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setIsUploading(false); return }

        const { data: doctor } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!doctor) { setIsUploading(false); toast.error("Erro: médico não encontrado"); return }

        // Upload file to storage
        const fileExt = selectedFile.name.split('.').pop()
        const filePath = `${patientId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('patient-documents')
            .upload(filePath, selectedFile)

        if (uploadError) {
            toast.error("Erro ao enviar arquivo")
            setIsUploading(false)
            return
        }

        // Insert document record
        const { error: insertError } = await supabase
            .from('patient_documents')
            .insert({
                patient_id: patientId,
                doctor_id: doctor.id,
                titulo: titulo.trim(),
                descricao: descricao.trim() || null,
                file_url: filePath,
                file_name: selectedFile.name,
                file_type: selectedFile.type,
            })

        if (insertError) {
            toast.error("Erro ao salvar documento")
        } else {
            toast.success("Documento enviado com sucesso!")
            setTitulo("")
            setDescricao("")
            setSelectedFile(null)
            setShowForm(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
            fetchDocuments()
        }

        setIsUploading(false)
    }

    async function handleDownload(doc: Document) {
        const { data } = await supabase.storage
            .from('patient-documents')
            .createSignedUrl(doc.file_url, 3600)

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        } else {
            toast.error("Erro ao gerar link de download")
        }
    }

    async function handleDelete(doc: Document) {
        if (!confirm(`Deseja realmente excluir "${doc.titulo}"?`)) return

        // Delete from storage
        await supabase.storage
            .from('patient-documents')
            .remove([doc.file_url])

        // Delete from database
        const { error } = await supabase
            .from('patient_documents')
            .delete()
            .eq('id', doc.id)

        if (!error) {
            toast.success("Documento excluído")
            fetchDocuments()
        } else {
            toast.error("Erro ao excluir documento")
        }
    }

    return (
        <Card className="border-l-4 border-l-indigo-400">
            <CardHeader
                className="pb-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        Documentos
                        <span className="text-xs text-muted-foreground font-normal ml-1">({documents.length})</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {expanded && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs font-bold"
                                onClick={(e) => { e.stopPropagation(); setShowForm(!showForm) }}
                            >
                                {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                                {showForm ? "Cancelar" : "Novo"}
                            </Button>
                        )}
                        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="p-0">
                    {/* Upload Form */}
                    {showForm && (
                        <div className="p-4 border-b bg-blue-50/30 space-y-3">
                            <Input
                                placeholder="Título *"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className="bg-white"
                            />
                            <Input
                                placeholder="Descrição (opcional)"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="bg-white"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="flex-1 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:text-xs file:font-bold file:bg-white file:text-slate-700 file:cursor-pointer hover:file:bg-slate-50"
                                />
                            </div>
                            {selectedFile && (
                                <p className="text-xs text-muted-foreground">
                                    📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                                </p>
                            )}
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading || !titulo.trim() || !selectedFile}
                                className="w-full gap-2 font-bold"
                                size="sm"
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {isUploading ? "Enviando..." : "Enviar Documento"}
                            </Button>
                        </div>
                    )}

                    {/* Documents List */}
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
                    ) : documents.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhum documento enviado</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors group">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                            <FileText className="h-4 w-4 text-indigo-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{doc.titulo}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{format(parseISO(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                                                {doc.descricao && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">{doc.descricao}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDownload(doc)}
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(doc)}
                                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    )
}
