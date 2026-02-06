'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardPlus, FileText, User, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SharedNote {
    id: string
    note_text: string
    created_at: string
    doctors?: {
        nome: string
    }
}

interface SharedNotesProps {
    patientId: string
}

export function SharedNotes({ patientId }: SharedNotesProps) {
    const [notes, setNotes] = useState<SharedNote[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

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
                created_at,
                doctors ( nome )
            `)
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            const normalizedNotes = data.map((note: unknown) => {
                const n = note as { id: string; note_text: string; created_at: string; doctors: { nome: string } | { nome: string }[] | null }
                return {
                    ...n,
                    doctors: Array.isArray(n.doctors) ? n.doctors[0] : n.doctors
                }
            }) as SharedNote[]
            setNotes(normalizedNotes)
        }
        setIsLoading(false)
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (notes.length === 0) {
        return null // Don't show section if no shared notes
    }

    return (
        <Card className="border rounded-xl shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <ClipboardPlus className="h-5 w-5 text-blue-600" />
                    Orientações do Médico
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="p-4 border rounded-lg bg-blue-50/50 hover:shadow-sm transition-shadow"
                    >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground font-medium">
                                {format(new Date(note.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                            {note.doctors?.nome && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Dr(a). {note.doctors.nome}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {note.note_text}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
