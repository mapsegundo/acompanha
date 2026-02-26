/**
 * PWA platform detection utilities.
 * Replaces the Capacitor version — no native shell required.
 */

/**
 * Returns true when the app is installed as a PWA (standalone display mode).
 * Works on both iOS and Android.
 */
export function isInstalledPWA(): boolean {
    if (typeof window === "undefined") return false
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari: navigator.standalone is a non-standard prop
        (navigator as unknown as { standalone?: boolean }).standalone === true
    )
}

/**
 * Returns 'ios', 'android', or 'web' based on user agent.
 */
export function getPlatform(): "ios" | "android" | "web" {
    if (typeof navigator === "undefined") return "web"
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios"
    if (/Android/i.test(ua)) return "android"
    return "web"
}

export const isIOS = () => getPlatform() === "ios"
export const isAndroid = () => getPlatform() === "android"

/**
 * @deprecated Kept for compatibility — use isInstalledPWA() instead.
 */
export const isNativeApp = isInstalledPWA
