"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Activity,
    Users,
    Bell,
    Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/doctor/dashboard", label: "Início", icon: Activity },
    { href: "/doctor/patients", label: "Pacientes", icon: Users },
    { href: "/doctor/alerts", label: "Alertas", icon: Bell },
    { href: "/doctor/admin", label: "Admin", icon: Settings },
]

export function DoctorBottomNav() {
    const pathname = usePathname()

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Navegação médica"
        >
            <div className="flex h-16 items-stretch">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive =
                        pathname === href || (href !== "/doctor/dashboard" && pathname.startsWith(href))

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-tight transition-colors duration-150 min-h-[56px] tap-highlight-transparent",
                                isActive
                                    ? "text-blue-400"
                                    : "text-slate-400 hover:text-blue-300"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <span
                                className={cn(
                                    "flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200",
                                    isActive ? "bg-blue-900/40" : "bg-transparent"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5 transition-transform duration-200",
                                        isActive ? "scale-110" : "scale-100"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                            </span>
                            <span
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-blue-400 font-bold" : "text-slate-400"
                                )}
                            >
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
