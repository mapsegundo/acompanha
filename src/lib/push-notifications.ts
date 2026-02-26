import { createClient } from "@/lib/supabase/client"

/**
 * Sends a push notification to the doctor when a patient completes a check-in.
 * Calls the Supabase Edge Function `send-push-notification`.
 * Silently fails if the doctor has no registered device tokens.
 */
export async function notifyDoctorOnCheckin(doctorUserId: string, patientName: string, patientId: string) {
    try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        await supabase.functions.invoke("send-push-notification", {
            body: {
                targetUserId: doctorUserId,
                title: "Novo Check-in Recebido",
                body: `${patientName} enviou o acompanhamento desta semana.`,
                data: { patientId },
            },
        })
    } catch {
        // Non-critical — check-in still saves even if notification fails
    }
}
