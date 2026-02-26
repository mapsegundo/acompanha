"use client"

import { useCallback, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { isIOS, isInstalledPWA } from "@/lib/capacitor"

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

/** Converts a VAPID base64 key to ArrayBuffer as required by pushManager.subscribe. */
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

        // iOS Web Push only works for installed PWAs.
        if (isIOS() && !isInstalledPWA()) return

        try {
            const registration = await navigator.serviceWorker.ready
            const permission = Notification.permission === "granted"
                ? "granted"
                : await Notification.requestPermission()

            if (permission !== "granted") return

            let subscription = await registration.pushManager.getSubscription()
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKeyToArrayBuffer(PUBLIC_VAPID_KEY),
                })
            }

            const supabase = createClient()
            const { error } = await supabase.from("device_tokens").upsert(
                {
                    user_id: uid,
                    token: JSON.stringify(subscription),
                    platform: isIOS() ? "ios" : "android",
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "token" }
            )

            if (error) {
                console.warn("Push token upsert failed:", error.message)
            }
        } catch (error) {
            console.warn("Push registration failed:", error)
        }
    }, [])

    useEffect(() => {
        if (userId) registerPush(userId)
    }, [userId, registerPush])

    useEffect(() => {
        if (!userId) return

        const refreshPushRegistration = () => {
            void registerPush(userId)
        }

        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                refreshPushRegistration()
            }
        }

        window.addEventListener("focus", refreshPushRegistration)
        document.addEventListener("visibilitychange", handleVisibility)

        return () => {
            window.removeEventListener("focus", refreshPushRegistration)
            document.removeEventListener("visibilitychange", handleVisibility)
        }
    }, [userId, registerPush])
}
