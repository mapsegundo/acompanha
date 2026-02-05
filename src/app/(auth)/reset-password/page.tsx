"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ShieldAlert, CheckCircle2 } from "lucide-react"
import { validatePassword } from "@/lib/password-validation"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem")
            return
        }

        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
            toast.error("Senha não atende aos requisitos", {
                description: passwordValidation.errors[0]
            })
            return
        }

        setLoading(true)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            toast.error("Erro ao atualizar senha", { description: error.message })
        } else {
            toast.success("Senha atualizada com sucesso!")
            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-slate-200">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                            <ShieldAlert className="text-white h-7 w-7" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-slate-900 italic">NOVA SENHA</CardTitle>
                    <CardDescription className="font-bold text-slate-500 italic">
                        Crie uma nova senha segura para sua conta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!success ? (
                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="password" title="password" className="text-xs font-black uppercase text-slate-500 ml-1">Nova Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 border-slate-200 focus:ring-blue-500 font-medium"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <PasswordStrengthIndicator
                                    validation={validatePassword(password)}
                                    show={password.length > 0}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" title="confirm" className="text-xs font-black uppercase text-slate-500 ml-1">Confirmar Nova Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 border-slate-200 focus:ring-blue-500 font-medium"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black text-sm shadow-lg shadow-blue-100 transition-all rounded-xl" disabled={loading}>
                                {loading ? "ATUALIZANDO..." : "REDEFINIR SENHA AGORA"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 animate-in zoom-in duration-500 py-4">
                            <div className="flex justify-center">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">Sucesso!</h3>
                                <p className="text-slate-500 font-medium">
                                    Sua senha foi atualizada. Você será redirecionado para o login em instantes...
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
