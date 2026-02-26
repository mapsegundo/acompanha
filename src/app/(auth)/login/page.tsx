"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { Turnstile } from "@/components/turnstile"
import { useBiometrics } from "@/hooks/use-biometrics"
import { isNativeApp } from "@/lib/capacitor"
import { Fingerprint } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const [captchaKey, setCaptchaKey] = useState(0)
    const [biometricAvailable, setBiometricAvailable] = useState(false)
    const [biometricLoading, setBiometricLoading] = useState(false)
    const supabase = createClient()
    const { isAvailable, registerCredential, loginWithBiometrics } = useBiometrics()

    // Check biometric availability on mount (native only)
    useEffect(() => {
        if (isNativeApp()) {
            isAvailable().then(setBiometricAvailable)
        }
    }, [isAvailable])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                captchaToken: captchaToken || undefined,
            }
        })

        if (error) {
            toast.error("Erro ao entrar", { description: "E-mail ou senha inválidos." })
        } else {
            // Register biometric credential after successful login
            if (data.user) {
                await registerCredential(email, data.user.id, data.session?.refresh_token ?? null)
            }
            toast.success("Sucesso!", { description: "Redirecionando para o painel..." })
            window.location.href = "/"
        }
        setLoading(false)
    }

    const handleBiometricLogin = async () => {
        setBiometricLoading(true)
        const success = await loginWithBiometrics()
        if (!success) {
            toast.error("Falha na biometria", { description: "Use e-mail e senha uma vez para reativar o Face ID / Digital neste aparelho." })
        }
        setBiometricLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4" style={{ paddingTop: 'max(1rem, var(--sat))' }}>
            <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-slate-200">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="p-1 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded-xl" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900">LOG IN</CardTitle>
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
                        <div className="flex justify-center">
                            <Turnstile
                                key={captchaKey}
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                                onVerify={(token) => setCaptchaToken(token)}
                                onExpire={() => { setCaptchaToken(null); setCaptchaKey(k => k + 1) }}
                                onError={() => { setCaptchaToken(null); setCaptchaKey(k => k + 1) }}
                                theme="light"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black text-sm shadow-lg shadow-blue-100 transition-all rounded-xl"
                            disabled={loading || !captchaToken}
                        >
                            {loading ? "Entrando..." : "ENTRAR AGORA"}
                        </Button>
                    </form>

                    {/* Biometric login — only shows on native app with biometrics enrolled */}
                    {biometricAvailable && (
                        <div className="mt-4">
                            <div className="relative flex items-center gap-3">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ou</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 mt-4 border-slate-200 font-black text-slate-700 hover:bg-slate-50 rounded-xl gap-2"
                                onClick={handleBiometricLogin}
                                disabled={biometricLoading}
                            >
                                <Fingerprint className="h-5 w-5 text-blue-600" />
                                {biometricLoading ? "Verificando..." : "Entrar com Face ID / Digital"}
                            </Button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500 font-bold italic">
                            Ainda não tem uma conta?
                        </p>
                        <Link href="/signup">
                            <Button variant="ghost" className="mt-2 text-blue-600 font-black hover:bg-blue-50 hover:text-blue-700">
                                CRIAR NOVA CONTA
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
