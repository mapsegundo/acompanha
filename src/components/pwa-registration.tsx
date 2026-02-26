"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { usePushNotifications } from "@/hooks/use-push-notifications"

/**
 * Invisible client component placed in RootLayout.
 * Fetches the current user and registers for Web Push notifications.
 * Registers the service worker on mount (serwist handles SW code, this handles push permission).
 */
export function PWARegistration() {
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const supabase = createClient()
        let active = true

        supabase.auth.getUser().then(({ data }) => {
            if (active) setUserId(data.user?.id ?? null)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null)
        })

        return () => {
            active = false
            subscription.unsubscribe()
        }
    }, [])

    usePushNotifications(userId)
    return null
}
