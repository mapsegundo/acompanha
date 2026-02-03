import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { LayoutDashboard, Users, LogOut, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex h-screen w-full flex-col md:flex-row bg-muted/20">
            <aside className="w-full md:w-64 bg-slate-950 text-white border-r border-slate-800 flex flex-col justify-between shadow-xl">
                <div className="p-6">
                    <h2 className="text-2xl font-black tracking-tighter mb-8 text-blue-500 flex items-center gap-2">
                        ACOMPANHA <span className="text-[10px] text-white bg-blue-600 px-1.5 py-0.5 rounded-sm font-bold tracking-normal">MD</span>
                    </h2>
                    <nav className="flex flex-col gap-2">
                        <Link href="/doctor/dashboard">
                            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-900 hover:text-blue-400 border-none transition-all">
                                <LayoutDashboard className="h-4 w-4" />
                                Visão Geral
                            </Button>
                        </Link>
                        <Link href="/doctor/patients">
                            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-900 hover:text-blue-400 border-none transition-all">
                                <Users className="h-4 w-4" />
                                Pacientes
                            </Button>
                        </Link>
                        <Link href="/doctor/alerts">
                            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-900 hover:text-blue-400 border-none transition-all">
                                <Bell className="h-4 w-4" />
                                Alertas
                            </Button>
                        </Link>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-900 flex flex-col gap-4">
                    {user && (
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800/50">
                            <User className="h-3.5 w-3.5 text-blue-500" />
                            <span className="truncate flex-1">{user.email}</span>
                        </div>
                    )}
                    <form action="/auth/signout" method="post">
                        <Button variant="outline" className="w-full gap-2 border-slate-800 bg-transparent text-slate-300 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-all font-semibold" type="submit">
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
