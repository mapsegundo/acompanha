'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardPlus, Eye, EyeOff, Loader2, FileText, User, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PatientNote {
    id: string
    note_text: string
    visibility: 'doctor_only' | 'shared_with_patient'
    created_at: string
    doctors?: {
        nome: string
    }
}

interface PatientNotesProps {
    patientId: string
    isDoctor: boolean
}

export function PatientNotes({ patientId, isDoctor }: PatientNotesProps) {
    const [notes, setNotes] = useState<PatientNote[]>([])
    const [newNote, setNewNote] = useState('')
    const [visibility, setVisibility] = useState<'doctor_only' | 'shared_with_patient'>('doctor_only')
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    // Fetch notes on mount
    useEffect(() => {
        fetchNotes()
    }, [patientId])

    async function fetchNotes() {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('patient_notes')
            .select(`
                id,
                note_text,
                visibility,
                created_at,
                doctors ( nome )
            `)
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            // Supabase FK joins may return array or object, normalize to expected structure
            const normalizedNotes = data.map((note: unknown) => {
                const n = note as { id: string; note_text: string; visibility: string; created_at: string; doctors: { nome: string } | { nome: string }[] | null }
                return {
                    ...n,
                    doctors: Array.isArray(n.doctors) ? n.doctors[0] : n.doctors
                }
            }) as PatientNote[]
            setNotes(normalizedNotes)
        }
        setIsLoading(false)
    }

    async function handleSubmit() {
        if (!newNote.trim()) return

        startTransition(async () => {
            // Get current doctor id
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: doctor } = await supabase
                .from('doctors')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (!doctor) return

            const { error } = await supabase
                .from('patient_notes')
                .insert({
                    patient_id: patientId,
                    doctor_id: doctor.id,
                    note_text: newNote.trim(),
                    visibility: visibility
                })

            if (!error) {
                setNewNote('')
                setVisibility('doctor_only')
                fetchNotes()
            }
        })
    }

    async function handleDelete(noteId: string) {
        if (!confirm('Tem certeza que deseja excluir esta nota?')) return

        startTransition(async () => {
            const { error } = await supabase
                .from('patient_notes')
                .delete()
                .eq('id', noteId)

            if (!error) {
                fetchNotes()
            }
        })
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border rounded-xl shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <ClipboardPlus className="h-5 w-5 text-blue-600" />
                    Notas Clínicas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Doctor: Note Entry Form */}
                {isDoctor && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <Textarea
                            placeholder="Registre observações, condutas ou recomendações..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                            className="resize-none bg-white"
                        />
                        <div className="flex flex-col sm:flex-row gap-3 justify-between">
                            <Select
                                value={visibility}
                                onValueChange={(v) => setVisibility(v as 'doctor_only' | 'shared_with_patient')}
                            >
                                <SelectTrigger className="w-full sm:w-[220px] bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="doctor_only">
                                        <div className="flex items-center gap-2">
                                            <EyeOff className="h-4 w-4" />
                                            Apenas médicos
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="shared_with_patient">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Compartilhar com paciente
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleSubmit}
                                disabled={isPending || !newNote.trim()}
                                className="w-full sm:w-auto"
                            >
                                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Salvar nota
                            </Button>
                        </div>
                    </div>
                )}

                {/* Notes List */}
                <div className="space-y-2">
                    {notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <FileText className="h-10 w-10 mb-3 opacity-50" />
                            <p className="text-sm">
                                {isDoctor
                                    ? 'Nenhuma nota registrada para este paciente.'
                                    : 'Nenhuma nota compartilhada ainda.'}
                            </p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div
                                key={note.id}
                                className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {format(new Date(note.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                            </span>
                                            {isDoctor && (
                                                <Badge
                                                    variant={note.visibility === 'shared_with_patient' ? 'default' : 'secondary'}
                                                    className="text-[10px] uppercase tracking-wider"
                                                >
                                                    {note.visibility === 'shared_with_patient' ? (
                                                        <><Eye className="h-3 w-3 mr-1" /> Compartilhada</>
                                                    ) : (
                                                        <><EyeOff className="h-3 w-3 mr-1" /> Apenas médicos</>
                                                    )}
                                                </Badge>
                                            )}
                                            {note.doctors?.nome && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {note.doctors.nome}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {note.note_text}
                                        </p>
                                    </div>
                                    {isDoctor && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(note.id)}
                                            disabled={isPending}
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title="Excluir nota"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
