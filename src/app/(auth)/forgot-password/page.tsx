"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Mail, KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        })

        if (error) {
            toast.error("Erro ao solicitar", { description: error.message })
        } else {
            toast.success("Link enviado!", {
                description: "Verifique seu e-mail para redefinir sua senha."
            })
            setSent(true)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-slate-200">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <KeyRound className="text-white h-7 w-7" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900 italic">RECUPERAR SENHA</CardTitle>
                    <CardDescription className="font-bold text-slate-500 italic">
                        {sent ? "Link enviado com sucesso!" : "Enviaremos um link de redefinição para o seu e-mail"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!sent ? (
                        <form onSubmit={handleReset} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black uppercase text-slate-500 ml-1">E-mail Cadastrado</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="h-12 pl-10 border-slate-200 focus:ring-blue-500 font-medium"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black text-sm shadow-lg shadow-blue-100 transition-all rounded-xl" disabled={loading}>
                                {loading ? "ENVIANDO..." : "ENVIAR LINK DE RECUPERAÇÃO"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 py-4">
                            <p className="text-slate-500 font-medium">
                                Verifique a caixa de entrada de:<br />
                                <strong className="text-slate-900">{email}</strong>
                            </p>
                            <div className="p-4 bg-blue-50 rounded-lg text-xs text-blue-700 leading-relaxed font-bold">
                                Se não encontrar o e-mail em alguns minutos, verifique sua pasta de spam.
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 font-bold italic hover:text-blue-600 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Voltar para o Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
