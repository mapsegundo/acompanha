"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react"
import { validatePassword } from "@/lib/password-validation"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"
import { Turnstile } from "@/components/turnstile"

export default function SignupPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Form State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [nome, setNome] = useState("")
    const [idade, setIdade] = useState("")
    const [sexo, setSexo] = useState("")
    const [peso, setPeso] = useState("")
    const [modalidadeId, setModalidadeId] = useState("")
    const [faseId, setFaseId] = useState("")
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)

    // Options from DB
    const [modalities, setModalities] = useState<{ id: string; nome: string }[]>([])
    const [phases, setPhases] = useState<{ id: string; nome: string }[]>([])

    useEffect(() => {
        const fetchOptions = async () => {
            const { data: mods } = await supabase.from('sport_modalities').select('*')
            const { data: phs } = await supabase.from('season_phases').select('*')
            if (mods) setModalities(mods)
            if (phs) setPhases(phs)
        }
        fetchOptions()
    }, [supabase])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // 1. Create Auth User with Profile Data in metadata
        // The database trigger will handle the insertion into public.patients
        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                captchaToken: captchaToken || undefined,
                data: {
                    nome,
                    idade: parseInt(idade),
                    sexo,
                    peso: parseFloat(peso),
                    sport_modalities_id: modalidadeId,
                    season_phases_id: faseId
                }
            }
        })

        if (authError) {
            toast.error("Erro no cadastro", { description: authError.message })
        } else {
            toast.success("Conta criada!", {
                description: "Verifique seu e-mail para confirmar o cadastro."
            })
            setStep(3) // Success step
        }

        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-lg shadow-2xl border-none ring-1 ring-slate-200">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <ShieldCheck className="text-white h-7 w-7" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900 italic">CADASTRO</CardTitle>
                    <CardDescription className="font-bold text-slate-500 italic">Crie sua conta em 2 passos rápidos</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Informações de Acesso</Label>
                                    <Input
                                        placeholder="Seu melhor e-mail"
                                        type="email"
                                        className="h-12 border-slate-200 font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Crie uma senha forte"
                                        type="password"
                                        className="h-12 border-slate-200 font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <PasswordStrengthIndicator
                                        validation={validatePassword(password)}
                                        show={password.length > 0}
                                    />
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Seu Perfil</Label>
                                    <Input
                                        placeholder="Seu nome completo"
                                        className="h-12 border-slate-200 font-medium"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Idade"
                                            type="number"
                                            className="h-12 border-slate-200 font-medium"
                                            value={idade}
                                            onChange={(e) => setIdade(e.target.value)}
                                        />
                                        <Select value={sexo} onValueChange={setSexo}>
                                            <SelectTrigger className="w-full h-12 border-slate-200 font-medium flex items-center">
                                                <SelectValue placeholder="Gênero" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Masculino</SelectItem>
                                                <SelectItem value="F">Feminino</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={() => setStep(2)}
                                disabled={!email || !validatePassword(password).isValid || !nome || !idade || !sexo}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black text-xs gap-2 shadow-lg shadow-blue-100 rounded-xl"
                            >
                                PRÓXIMO PASSO <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSignup} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Informações Esportivas</Label>
                                    <Input
                                        placeholder="Peso atual (kg)"
                                        type="number"
                                        step="0.1"
                                        className="h-12 border-slate-200 font-medium"
                                        value={peso}
                                        onChange={(e) => setPeso(e.target.value)}
                                    />
                                    <Select value={modalidadeId} onValueChange={setModalidadeId}>
                                        <SelectTrigger className="w-full h-12 border-slate-200 font-medium flex items-center">
                                            <SelectValue placeholder="Modalidade Esportiva" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modalities.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={faseId} onValueChange={setFaseId}>
                                        <SelectTrigger className="w-full h-12 border-slate-200 font-medium flex items-center">
                                            <SelectValue placeholder="Fase da Temporada" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {phases.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                                    onVerify={(token) => setCaptchaToken(token)}
                                    onExpire={() => setCaptchaToken(null)}
                                    theme="light"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" type="button" onClick={() => setStep(1)} className="h-12 border-slate-200 font-black text-xs gap-2 rounded-xl flex-1">
                                    <ArrowLeft className="h-4 w-4" /> VOLTAR
                                </Button>
                                <Button type="submit" disabled={loading || !peso || !modalidadeId || !faseId || !captchaToken} className="h-12 bg-blue-600 hover:bg-blue-700 font-black text-xs gap-2 shadow-lg shadow-blue-100 rounded-xl flex-[2]">
                                    {loading ? "PROCESSANDO..." : "CONCLUIR CADASTRO"}
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-6 animate-in zoom-in duration-500 py-4">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                                    <ShieldCheck className="h-10 w-10 text-green-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">Quase lá!</h3>
                                <p className="text-slate-500 font-medium">
                                    Enviamos um link de confirmação para o e-mail: <br />
                                    <strong className="text-slate-900">{email}</strong>
                                </p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg text-xs text-slate-500 leading-relaxed font-bold">
                                Por favor, clique no link enviado para ativar sua conta e começar seu monitoramento completo.
                            </div>
                            <Link href="/login" className="block w-full">
                                <Button variant="outline" className="w-full h-12 border-slate-200 font-black text-xs rounded-xl">
                                    IR PARA LOGIN
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <Link href="/login" className="text-sm text-slate-500 font-bold italic hover:text-blue-600 transition-colors">
                            Já tem uma conta? Faça login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
