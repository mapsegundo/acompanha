"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UserX, UserCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PatientToggleStatusProps {
    patientId: string
    initialAtivo: boolean
}

export function PatientToggleStatus({ patientId, initialAtivo }: PatientToggleStatusProps) {
    const [ativo, setAtivo] = useState(initialAtivo)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    async function toggleStatus() {
        setIsLoading(true)
        const newStatus = !ativo
        const { error } = await supabase
            .from('patients')
            .update({ ativo: newStatus })
            .eq('id', patientId)

        if (!error) {
            setAtivo(newStatus)
            toast.success(newStatus ? "Paciente reativado com sucesso!" : "Paciente desativado com sucesso!")
            router.refresh()
        } else {
            console.error("Erro ao alternar status:", error)
            toast.error("Erro ao alterar status do paciente")
        }
        setIsLoading(false)
    }

    return (
        <Button
            variant={ativo ? "outline" : "default"}
            size="sm"
            onClick={toggleStatus}
            disabled={isLoading}
            className={`gap-2 text-xs font-bold transition-all ${ativo
                ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                : "bg-green-600 hover:bg-green-700 text-white"
                }`}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Aguarde...
                </>
            ) : ativo ? (
                <>
                    <UserX className="h-3.5 w-3.5" />
                    Desativar
                </>
            ) : (
                <>
                    <UserCheck className="h-3.5 w-3.5" />
                    Reativar
                </>
            )}
        </Button>
    )
}
