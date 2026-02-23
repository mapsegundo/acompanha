"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Activity, ClipboardPlus, FileText, Ruler,
    TrendingUp, SplitSquareVertical, CircleUserRound,
    User, LogOut, Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"

const navItems = [
    { href: "/dashboard", label: "Acompanhamentos", icon: Activity, color: "text-blue-500" },
    { href: "/checkin", label: "Novo Check-in", icon: ClipboardPlus, color: "text-emerald-500" },
    { href: "/medicoes/lista", label: "Medições", icon: Ruler, color: "text-purple-500" },
    { href: "/evolucao", label: "Evolução", icon: TrendingUp, color: "text-blue-400" },
    { href: "/medicoes/comparar", label: "Comparar Fotos", icon: SplitSquareVertical, color: "text-pink-500" },
    { href: "/documentos", label: "Documentos", icon: FileText, color: "text-indigo-500" },
    { href: "/profile", label: "Meu Perfil", icon: CircleUserRound, color: "text-orange-500" },
]

interface PatientMobileSidebarProps {
    userEmail?: string | null
}

export function PatientMobileSidebar({ userEmail }: PatientMobileSidebarProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleNav = (href: string) => {
        setOpen(false)
        router.push(href)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden fixed top-4 left-4 z-50 bg-background border shadow-md hover:bg-muted"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background border-r p-0 flex flex-col justify-between">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg shadow-md" />
                        <h2 className="text-xl font-black tracking-tight text-primary uppercase italic">ACOMPANHA</h2>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {navItems.map(({ href, label, icon: Icon, color }) => (
                            <button
                                key={href}
                                onClick={() => handleNav(href)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-left"
                            >
                                <Icon className={`h-4 w-4 ${color}`} />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6 border-t flex flex-col gap-4">
                    {userEmail && (
                        <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="truncate">{userEmail}</span>
                        </div>
                    )}
                    <form action="/auth/signout" method="post">
                        <Button variant="outline" className="w-full gap-2" type="submit">
                            <LogOut className="h-4 w-4" /> Sair
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}
