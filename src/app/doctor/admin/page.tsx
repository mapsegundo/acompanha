"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Settings, Plus, Pencil, Trash2, Users, Activity, CalendarRange, LogOut } from "lucide-react"
import { toast } from "sonner"

type Modality = {
    id: string
    nome: string
    created_at: string
}

type Phase = {
    id: string
    nome: string
    created_at: string
}

type Doctor = {
    id: string
    email: string
    nome: string
    crm: string
    especialidade: string
    created_at: string
}

export default function AdminPage() {
    const [modalities, setModalities] = useState<Modality[]>([])
    const [phases, setPhases] = useState<Phase[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Dialog states
    const [modalityDialog, setModalityDialog] = useState(false)
    const [phaseDialog, setPhaseDialog] = useState(false)
    const [doctorDialog, setDoctorDialog] = useState(false)

    // Delete states
    const [deleteAlert, setDeleteAlert] = useState<{ type: 'modality' | 'phase' | 'doctor', id: string } | null>(null)

    // Edit states
    const [editingModality, setEditingModality] = useState<Modality | null>(null)
    const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

    // Form states
    const [modalityName, setModalityName] = useState("")
    const [phaseName, setPhaseName] = useState("")
    const [doctorForm, setDoctorForm] = useState({ email: "", nome: "", crm: "", especialidade: "" })

    const supabase = createClient()

    const fetchData = useCallback(async () => {
        setLoading(true)

        const [modalitiesRes, phasesRes, doctorsRes] = await Promise.all([
            supabase.from('sport_modalities').select('*').order('nome'),
            supabase.from('season_phases').select('*').order('nome'),
            supabase.from('doctors').select('*').order('nome')
        ])

        if (modalitiesRes.data) setModalities(modalitiesRes.data)
        if (phasesRes.data) setPhases(phasesRes.data)
        if (doctorsRes.data) setDoctors(doctorsRes.data)

        setLoading(false)
    }, [supabase])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData()
    }, [fetchData])

    // Modality functions
    async function saveModality() {
        if (!modalityName.trim()) {
            toast.error("Digite um nome para a modalidade")
            return
        }

        setIsSaving(true)
        if (editingModality) {
            const { error } = await supabase
                .from('sport_modalities')
                .update({ nome: modalityName })
                .eq('id', editingModality.id)

            if (error) {
                toast.error("Erro ao atualizar modalidade", { description: error.message })
            } else {
                toast.success("Modalidade atualizada!")
                setModalityDialog(false)
                setModalityName("")
                setEditingModality(null)
                fetchData()
            }
        } else {
            const { error } = await supabase
                .from('sport_modalities')
                .insert({ nome: modalityName })

            if (error) {
                toast.error("Erro ao criar modalidade", { description: error.message })
            } else {
                toast.success("Modalidade criada!")
                setModalityDialog(false)
                setModalityName("")
                fetchData()
            }
        }
        setIsSaving(false)
    }

    // Phase functions
    async function savePhase() {
        if (!phaseName.trim()) {
            toast.error("Digite um nome para a fase")
            return
        }

        setIsSaving(true)
        if (editingPhase) {
            const { error } = await supabase
                .from('season_phases')
                .update({ nome: phaseName })
                .eq('id', editingPhase.id)

            if (error) {
                toast.error("Erro ao atualizar fase", { description: error.message })
            } else {
                toast.success("Fase atualizada!")
                setPhaseDialog(false)
                setPhaseName("")
                setEditingPhase(null)
                fetchData()
            }
        } else {
            const { error } = await supabase
                .from('season_phases')
                .insert({ nome: phaseName })

            if (error) {
                toast.error("Erro ao criar fase", { description: error.message })
            } else {
                toast.success("Fase criada!")
                setPhaseDialog(false)
                setPhaseName("")
                fetchData()
            }
        }
        setIsSaving(false)
    }

    // Doctor functions
    async function saveDoctor() {
        if (!doctorForm.email.trim() || !doctorForm.nome.trim()) {
            toast.error("Preencha pelo menos email e nome")
            return
        }

        setIsSaving(true)
        if (editingDoctor) {
            const { error } = await supabase
                .from('doctors')
                .update(doctorForm)
                .eq('id', editingDoctor.id)

            if (error) {
                toast.error("Erro ao atualizar médico", { description: error.message })
            } else {
                toast.success("Médico atualizado!")
                setDoctorDialog(false)
                setDoctorForm({ email: "", nome: "", crm: "", especialidade: "" })
                setEditingDoctor(null)
                fetchData()
            }
        } else {
            // Criar médico via API route (busca usuário existente e vincula)
            try {
                const response = await fetch('/api/admin/doctors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doctorForm)
                })

                const result = await response.json()

                if (!response.ok || result.error) {
                    toast.error("Erro ao vincular médico", { description: result.error })
                } else {
                    toast.success("Médico vinculado!", {
                        description: "Usuário existente foi vinculado como médico com sucesso."
                    })
                    setDoctorDialog(false)
                    setDoctorForm({ email: "", nome: "", crm: "", especialidade: "" })
                    fetchData()
                }
            } catch (error) {
                console.error('Erro ao chamar API:', error)
                toast.error("Erro ao vincular médico", {
                    description: "Falha na comunicação com o servidor"
                })
            }
        }
        setIsSaving(false)
    }

    async function handleDelete() {
        if (!deleteAlert) return

        const { type, id } = deleteAlert
        let error

        if (type === 'modality') {
            const res = await supabase.from('sport_modalities').delete().eq('id', id)
            error = res.error
        } else if (type === 'phase') {
            const res = await supabase.from('season_phases').delete().eq('id', id)
            error = res.error
        } else {
            const res = await supabase.from('doctors').delete().eq('id', id)
            error = res.error
        }

        if (error) {
            toast.error("Erro ao deletar", { description: error.message })
        } else {
            toast.success("Deletado com sucesso!")
            fetchData()
        }

        setDeleteAlert(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Settings className="h-8 w-8 text-primary" />
                    Administração
                </h1>
                <p className="text-muted-foreground">Gerencie modalidades, fases e médicos do sistema.</p>
            </div>

            <Tabs defaultValue="modalities" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="modalities" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Modalidades
                    </TabsTrigger>
                    <TabsTrigger value="phases" className="gap-2">
                        <CalendarRange className="h-4 w-4" />
                        Fases
                    </TabsTrigger>
                    <TabsTrigger value="doctors" className="gap-2">
                        <Users className="h-4 w-4" />
                        Médicos
                    </TabsTrigger>
                </TabsList>

                {/* Modalities Tab */}
                <TabsContent value="modalities">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Modalidades Esportivas</CardTitle>
                                    <CardDescription>Gerencie as modalidades disponíveis no sistema</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingModality(null); setModalityName(""); setModalityDialog(true) }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Modalidade
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {modalities.map((modality) => (
                                        <TableRow key={modality.id}>
                                            <TableCell className="font-medium">{modality.nome}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingModality(modality)
                                                        setModalityName(modality.nome)
                                                        setModalityDialog(true)
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteAlert({ type: 'modality', id: modality.id })}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Phases Tab */}
                <TabsContent value="phases">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Fases da Temporada</CardTitle>
                                    <CardDescription>Gerencie as fases disponíveis no sistema</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingPhase(null); setPhaseName(""); setPhaseDialog(true) }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Fase
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {phases.map((phase) => (
                                        <TableRow key={phase.id}>
                                            <TableCell className="font-medium">{phase.nome}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingPhase(phase)
                                                        setPhaseName(phase.nome)
                                                        setPhaseDialog(true)
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteAlert({ type: 'phase', id: phase.id })}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Doctors Tab */}
                <TabsContent value="doctors">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Médicos</CardTitle>
                                    <CardDescription>Gerencie os médicos do sistema</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingDoctor(null); setDoctorForm({ email: "", nome: "", crm: "", especialidade: "" }); setDoctorDialog(true) }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Novo Médico
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>CRM</TableHead>
                                        <TableHead>Especialidade</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {doctors.map((doctor) => (
                                        <TableRow key={doctor.id}>
                                            <TableCell className="font-medium">{doctor.nome}</TableCell>
                                            <TableCell>{doctor.email}</TableCell>
                                            <TableCell>{doctor.crm || '-'}</TableCell>
                                            <TableCell>{doctor.especialidade || '-'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingDoctor(doctor)
                                                        setDoctorForm({ email: doctor.email || "", nome: doctor.nome || "", crm: doctor.crm || "", especialidade: doctor.especialidade || "" })
                                                        setDoctorDialog(true)
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteAlert({ type: 'doctor', id: doctor.id })}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modality Dialog */}
            <Dialog open={modalityDialog} onOpenChange={setModalityDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingModality ? "Editar" : "Nova"} Modalidade</DialogTitle>
                        <DialogDescription>
                            {editingModality ? "Atualize" : "Crie"} uma modalidade esportiva
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="modality-name">Nome</Label>
                            <Input
                                id="modality-name"
                                value={modalityName}
                                onChange={(e) => setModalityName(e.target.value)}
                                placeholder="Ex: Musculação"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalityDialog(false)} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={saveModality} disabled={isSaving}>
                            {isSaving ? "Processando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Phase Dialog */}
            <Dialog open={phaseDialog} onOpenChange={setPhaseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPhase ? "Editar" : "Nova"} Fase</DialogTitle>
                        <DialogDescription>
                            {editingPhase ? "Atualize" : "Crie"} uma fase da temporada
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="phase-name">Nome</Label>
                            <Input
                                id="phase-name"
                                value={phaseName}
                                onChange={(e) => setPhaseName(e.target.value)}
                                placeholder="Ex: Off season"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPhaseDialog(false)} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={savePhase} disabled={isSaving}>
                            {isSaving ? "Processando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Doctor Dialog */}
            <Dialog open={doctorDialog} onOpenChange={setDoctorDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDoctor ? "Editar" : "Novo"} Médico</DialogTitle>
                        <DialogDescription>
                            {editingDoctor ? "Atualize os dados" : "Cadastre um novo médico"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="doctor-email">Email *</Label>
                            <Input
                                id="doctor-email"
                                type="email"
                                value={doctorForm.email}
                                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                                placeholder="medico@exemplo.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doctor-name">Nome *</Label>
                            <Input
                                id="doctor-name"
                                value={doctorForm.nome}
                                onChange={(e) => setDoctorForm({ ...doctorForm, nome: e.target.value })}
                                placeholder="Dr. João Silva"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doctor-crm">CRM</Label>
                            <Input
                                id="doctor-crm"
                                value={doctorForm.crm}
                                onChange={(e) => setDoctorForm({ ...doctorForm, crm: e.target.value })}
                                placeholder="12345/SP"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doctor-specialty">Especialidade</Label>
                            <Input
                                id="doctor-specialty"
                                value={doctorForm.especialidade}
                                onChange={(e) => setDoctorForm({ ...doctorForm, especialidade: e.target.value })}
                                placeholder="Medicina Esportiva"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDoctorDialog(false)} disabled={isSaving}>Cancelar</Button>
                        <Button onClick={saveDoctor} disabled={isSaving}>
                            {isSaving ? "Processando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteAlert} onOpenChange={() => setDeleteAlert(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. {deleteAlert?.type === 'modality' && "Pacientes vinculados a esta modalidade ficarão sem modalidade."}
                            {deleteAlert?.type === 'phase' && "Pacientes vinculados a esta fase ficarão sem fase."}
                            {deleteAlert?.type === 'doctor' && "Este médico será removido do sistema."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border md:hidden">
                <form action="/auth/signout" method="post">
                    <Button variant="outline" className="w-full h-12 gap-2 text-red-600 border-red-200 bg-red-50/50 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all font-bold uppercase tracking-tight" type="submit">
                        <LogOut className="h-4 w-4" /> Sair da Conta
                    </Button>
                </form>
            </div>
        </div>
    )
}
