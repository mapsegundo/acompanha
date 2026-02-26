type CheckinEventType = "created" | "updated"

/**
 * Sends a push notification to the doctor when a patient completes a check-in.
 * Uses the internal Next.js API route to avoid client-side secrets and handle token cleanup.
 */
export async function notifyDoctorOnCheckin(
    doctorUserId: string,
    patientName: string,
    patientId: string,
    eventType: CheckinEventType = "created"
) {
    try {
        const title = eventType === "updated" ? "Check-in Atualizado" : "Novo Check-in Recebido"
        const body = eventType === "updated"
            ? `${patientName} atualizou o acompanhamento da semana.`
            : `${patientName} enviou o acompanhamento da semana.`

        const response = await fetch("/api/notifications/push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                targetUserId: doctorUserId,
                title,
                body,
                data: { patientId },
            }),
        })

        if (!response.ok) {
            const responseText = await response.text()
            console.warn("Push notification request failed:", response.status, responseText)
        }
    } catch (error) {
        // Non-critical - check-in still saves even if notification fails.
        console.warn("Push notification request failed:", error)
    }
}
