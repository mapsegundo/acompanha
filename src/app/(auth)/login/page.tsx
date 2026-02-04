"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            toast.error("Erro ao entrar", { description: "E-mail ou senha inválidos." })
        } else {
            toast.success("Sucesso!", {
                description: "Redirecionando para o painel..."
            })
            // Redirect will be handled by middleware or automatic refresh
            window.location.href = "/"
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-slate-200">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <h1 className="text-white font-black italic tracking-tighter text-xl">AC</h1>
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900 italic">LOG IN</CardTitle>
                    <CardDescription className="font-bold text-slate-500 italic">Acesse sua conta para continuar</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase text-slate-500 ml-1">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                className="h-12 border-slate-200 focus:ring-blue-500 font-medium"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" title="password" className="text-xs font-black uppercase text-slate-500 ml-1">Senha</Label>
                                <Link href="/forgot-password" title="recuperacao" className="text-[10px] font-bold text-blue-600 hover:underline">
                                    Esqueceu sua senha?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 border-slate-200 focus:ring-blue-500 font-medium"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black text-sm shadow-lg shadow-blue-100 transition-all rounded-xl" disabled={loading}>
                            {loading ? "Entrando..." : "ENTRAR AGORA"}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-bold italic">
                            Ainda não tem uma conta?
                        </p>
                        <Link href="/signup">
                            <Button variant="ghost" className="mt-2 text-blue-600 font-black hover:bg-blue-50 hover:text-blue-700">
                                CRIAR CONTA PREMIUM
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
