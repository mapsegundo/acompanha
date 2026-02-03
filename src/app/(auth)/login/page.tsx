"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            toast.error("Erro ao enviar magic link", { description: error.message })
        } else {
            toast.success("Magic Link enviado!", { description: "Verifique seu email para acessar." })
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-3xl font-bold tracking-tight">ACOMPANHA</CardTitle>
                    <CardDescription>Acesse sua conta para continuar</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Enviando..." : "Entrar com Magic Link"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
