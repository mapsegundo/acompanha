/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker"
import { Serwist } from "serwist"

// Serwist injects this during build — declare globally so TypeScript is happy
declare const self: ServiceWorkerGlobalScope & {
    __SW_MANIFEST: (string | { url: string; revision: string | null })[]
}

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: defaultCache,
})

// Handle push events — show notification
self.addEventListener("push", (event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (event as any).data?.json() ?? {}
    const title: string = data.title ?? "Acompanha"
    const options: NotificationOptions = {
        body: data.body ?? "Você tem uma nova notificação.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-72.png",
        data: data.data ?? {},
        tag: "acompanha-notification",
    }
    event.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification click — navigate to relevant page
self.addEventListener("notificationclick", (event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ne = event as any
    ne.notification.close()
    const patientId = ne.notification.data?.patientId
    const url: string = patientId ? `/doctor/patients/${patientId}` : "/"

    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                const existing = clientList.find((c) => c.url.includes(self.location.origin))
                if (existing) {
                    existing.focus()
                    return existing.navigate(url)
                }
                return self.clients.openWindow(url)
            })
    )
})

serwist.addEventListeners()
