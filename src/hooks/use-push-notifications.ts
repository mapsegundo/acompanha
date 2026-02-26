"use client"

import { useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

/** Converts a VAPID base64 key to ArrayBuffer as required by pushManager.subscribe */
function vapidKeyToArrayBuffer(base64: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4)
    const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
    const raw = window.atob(b64)
    const arr = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
    return arr.buffer as ArrayBuffer
}

/**
 * Hook to register the browser for Web Push notifications (Web Push API / VAPID).
 * Works on Android Chrome and iOS 16.4+ Safari when installed as PWA.
 * Saves the PushSubscription JSON to the Supabase `device_tokens` table.
 */
export function usePushNotifications(userId: string | null) {
    const registerPush = useCallback(async (uid: string) => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
        if (!PUBLIC_VAPID_KEY) return

        try {
            const registration = await navigator.serviceWorker.ready
            const permission = await Notification.requestPermission()
            if (permission !== "granted") return

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKeyToArrayBuffer(PUBLIC_VAPID_KEY),
            })

            const supabase = createClient()
            await supabase.from("device_tokens").upsert(
                {
                    user_id: uid,
                    token: JSON.stringify(subscription),
                    platform: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? "ios" : "android",
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "token" }
            )
        } catch {
            // Non-critical — app works without push
        }
    }, [])

    useEffect(() => {
        if (userId) registerPush(userId)
    }, [userId, registerPush])
}
