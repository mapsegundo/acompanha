"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Activity,
    ClipboardPlus,
    Ruler,
    TrendingUp,
    CircleUserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/dashboard", label: "Início", icon: Activity },
    { href: "/checkin", label: "Check-in", icon: ClipboardPlus },
    { href: "/medicoes/lista", label: "Medições", icon: Ruler },
    { href: "/evolucao", label: "Evolução", icon: TrendingUp },
    { href: "/profile", label: "Perfil", icon: CircleUserRound },
]

export function PatientBottomNav() {
    const pathname = usePathname()

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Navegação principal"
        >
            <div className="flex h-16 items-stretch">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive =
                        pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-tight transition-colors duration-150 min-h-[56px] tap-highlight-transparent",
                                isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <span
                                className={cn(
                                    "flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200",
                                    isActive ? "bg-foreground/10" : "bg-transparent"
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
                                    isActive ? "text-foreground font-bold" : "text-muted-foreground"
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
