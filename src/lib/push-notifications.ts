import { createClient } from "@/lib/supabase/client"

type CheckinEventType = "created" | "updated"

/**
 * Sends a push notification to the doctor when a patient completes a check-in.
 * Calls the Supabase Edge Function `send-push-notification`.
 * Silently fails if the doctor has no registered device tokens.
 */
export async function notifyDoctorOnCheckin(
    doctorUserId: string,
    patientName: string,
    patientId: string,
    eventType: CheckinEventType = "created"
) {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const title = eventType === "updated" ? "Check-in Atualizado" : "Novo Check-in Recebido"
        const body = eventType === "updated"
            ? `${patientName} atualizou o acompanhamento da semana.`
            : `${patientName} enviou o acompanhamento da semana.`

        await supabase.functions.invoke("send-push-notification", {
            body: {
                targetUserId: doctorUserId,
                title,
                body,
                data: { patientId },
            },
        })
    } catch {
        // Non-critical - check-in still saves even if notification fails.
    }
}
