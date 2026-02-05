"use client"

import { PasswordValidation, getPasswordStrengthLabel } from "@/lib/password-validation"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
    validation: PasswordValidation
    show: boolean
}

export function PasswordStrengthIndicator({ validation, show }: PasswordStrengthIndicatorProps) {
    if (!show) return null

    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500',
    }

    const strengthWidth = {
        weak: 'w-1/3',
        medium: 'w-2/3',
        strong: 'w-full',
    }

    const strengthTextColors = {
        weak: 'text-red-600',
        medium: 'text-yellow-600',
        strong: 'text-green-600',
    }

    const requirements = [
        { key: 'minLength', label: 'Mínimo 8 caracteres', met: validation.requirements.minLength },
        { key: 'hasUppercase', label: 'Letra maiúscula (A-Z)', met: validation.requirements.hasUppercase },
        { key: 'hasLowercase', label: 'Letra minúscula (a-z)', met: validation.requirements.hasLowercase },
        { key: 'hasNumber', label: 'Número (0-9)', met: validation.requirements.hasNumber },
        { key: 'hasSpecialChar', label: 'Caractere especial (!@#$%)', met: validation.requirements.hasSpecialChar },
    ]

    return (
        <div className="mt-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Força da senha</span>
                    <span className={cn("text-[10px] font-black uppercase", strengthTextColors[validation.strength])}>
                        {getPasswordStrengthLabel(validation.strength)}
                    </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            strengthColors[validation.strength],
                            strengthWidth[validation.strength]
                        )}
                    />
                </div>
            </div>

            {/* Requirements List */}
            <div className="grid grid-cols-1 gap-1">
                {requirements.map(req => (
                    <div
                        key={req.key}
                        className={cn(
                            "flex items-center gap-2 text-xs font-medium transition-colors duration-200",
                            req.met ? "text-green-600" : "text-slate-400"
                        )}
                    >
                        {req.met ? (
                            <Check className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                            <X className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
