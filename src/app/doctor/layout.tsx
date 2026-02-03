
import Link from "next/link"
import { LayoutDashboard, Users, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full flex-col md:flex-row bg-muted/20">
            <aside className="w-full md:w-64 bg-slate-900 text-white border-r flex flex-col justify-between">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tight mb-8 text-blue-400">ACOMPANHA <span className="text-xs text-white bg-blue-600 px-1 rounded">MD</span></h2>
                    <nav className="flex flex-col gap-2">
                        <Link href="/doctor/dashboard">
                            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-slate-800 hover:text-white">
                                <LayoutDashboard className="h-4 w-4" />
                                Visão Geral
                            </Button>
                        </Link>
                        <Link href="/doctor/patients">
                            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-slate-800 hover:text-white">
                                <Users className="h-4 w-4" />
                                Pacientes
                            </Button>
                        </Link>
                        <Link href="/doctor/alerts">
                            <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-slate-800 hover:text-white">
                                <Bell className="h-4 w-4" />
                                Alertas
                            </Button>
                        </Link>
                    </nav>
                </div>
                <div className="p-6 border-t border-slate-700">
                    <form action="/auth/signout" method="post">
                        <Button variant="outline" className="w-full gap-2 border-slate-700 hover:bg-slate-700 text-black hover:text-white" type="submit">
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
