"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Suspense } from "react"

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    return (
        <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-slate-200">
            <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">Erro de Autenticação</CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                    Não foi possível verificar suas credenciais.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <p className="text-sm text-slate-600">
                    Ocorreu um erro ao processar o link de acesso. Isso pode acontecer se o link expirou ou já foi utilizado.
                </p>
                {error && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-xs text-red-600 break-words font-mono">
                        Erro: {error}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Link href="/login" className="w-full">
                    <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 font-bold">
                        Voltar para Login
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Suspense fallback={<div>Carregando...</div>}>
                <AuthErrorContent />
            </Suspense>
        </div>
    )
}
