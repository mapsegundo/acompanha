import Link from "next/link"
import { LayoutDashboard, PlusCircle, LogOut, User } from "lucide-react"
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
                                <LayoutDashboard className="h-4 w-4" />
                                Acompanhamentos
                            </Button>
                        </Link>
                        <Link href="/checkin">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Novo Check-in
                            </Button>
                        </Link>
                        <Link href="/profile">
                            <Button variant="ghost" className="w-full justify-start gap-2">
                                <PlusCircle className="h-4 w-4" />
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
