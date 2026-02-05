"use client"

import { useState, useId } from "react"
import Link from "next/link"
import { Activity, Users, Bell, Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"

interface MobileSidebarProps {
    children: React.ReactNode
}

export function MobileSidebar({ children }: MobileSidebarProps) {
    const [open, setOpen] = useState(false)
    const sheetId = useId()

    return (
        <Sheet open={open} onOpenChange={setOpen} key={sheetId}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden fixed top-4 left-4 z-50 bg-slate-950 text-white hover:bg-slate-800 shadow-lg"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-slate-950 text-white border-r border-slate-800 p-0">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl ring-1 ring-slate-800" />
                        <h2 className="text-xl font-black tracking-tighter text-blue-500 flex items-center gap-2">
                            ACOMPANHA <span className="text-[9px] text-white bg-blue-600 px-1.5 py-0.5 rounded-sm font-bold tracking-normal">MD</span>
                        </h2>
                    </div>
                    <nav className="flex flex-col gap-2" onClick={() => setOpen(false)}>
                        <Link href="/doctor/dashboard">
                            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-900 hover:text-blue-400 border-none transition-all">
                                <Activity className="h-4 w-4 text-blue-500" />
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
                                <Bell className="h-4 w-4 text-yellow-500" />
                                Alertas
                            </Button>
                        </Link>
                        <Link href="/doctor/admin">
                            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-900 hover:text-blue-400 border-none transition-all">
                                <Settings className="h-4 w-4 text-slate-400" />
                                Administração
                            </Button>
                        </Link>
                    </nav>
                </div>
                {children}
            </SheetContent>
        </Sheet>
    )
}
