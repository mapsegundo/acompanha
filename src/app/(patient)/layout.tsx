import Link from "next/link"
import { Activity, ClipboardPlus, LogOut, CircleUserRound, User, Ruler, TrendingUp, SplitSquareVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"

export default async function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex h-screen w-full flex-col md:flex-row bg-muted/20">
            <aside className="w-full md:w-64 bg-background border-r flex flex-col justify-between">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg shadow-md" />
                        <h2 className="text-xl font-black tracking-tight text-primary uppercase italic">ACOMPANHA</h2>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Activity className="h-4 w-4 text-blue-500" />
                                Acompanhamentos
                            </Button>
                        </Link>
                        <Link href="/checkin">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <ClipboardPlus className="h-4 w-4 text-emerald-500" />
                                Novo Check-in
                            </Button>
                        </Link>
                        <Link href="/medicoes/lista">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <Ruler className="h-4 w-4 text-purple-500" />
                                Medições
                            </Button>
                        </Link>
                        <Link href="/evolucao">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-400" />
                                Evolução
                            </Button>
                        </Link>
                        <Link href="/medicoes/comparar">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <SplitSquareVertical className="h-4 w-4 text-pink-500" />
                                Comparar Fotos
                            </Button>
                        </Link>
                        <Link href="/profile">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <CircleUserRound className="h-4 w-4 text-orange-500" />
                                Meu Perfil
                            </Button>
                        </Link>
                    </nav>
                </div>
                <div className="p-6 border-t flex flex-col gap-4">
                    {user && (
                        <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="truncate">{user.email}</span>
                        </div>
                    )}
                    <form action="/auth/signout" method="post">
                        <Button variant="outline" className="w-full gap-2" type="submit">
                            <LogOut className="h-4 w-4" /> Sair
                        </Button>
                    </form>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
