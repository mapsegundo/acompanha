"use client"

import { useEffect, useRef, useCallback } from "react"

declare global {
    interface Window {
        turnstile: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string
                    callback?: (token: string) => void
                    'error-callback'?: () => void
                    'expired-callback'?: () => void
                    theme?: 'light' | 'dark' | 'auto'
                    size?: 'normal' | 'compact'
                }
            ) => string
            reset: (widgetId: string) => void
            remove: (widgetId: string) => void
        }
    }
}

interface TurnstileProps {
    siteKey: string
    onVerify: (token: string) => void
    onError?: () => void
    onExpire?: () => void
    theme?: 'light' | 'dark' | 'auto'
    size?: 'normal' | 'compact'
    className?: string
}

export function Turnstile({
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'light',
    size = 'normal',
    className = '',
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const initializedRef = useRef(false)

    // Store callbacks in refs
    const onVerifyRef = useRef(onVerify)
    const onErrorRef = useRef(onError)
    const onExpireRef = useRef(onExpire)

    // Update refs in useEffect to avoid accessing during render
    useEffect(() => {
        onVerifyRef.current = onVerify
        onErrorRef.current = onError
        onExpireRef.current = onExpire
    }, [onVerify, onError, onExpire])

    const initWidget = useCallback(() => {
        if (!containerRef.current || !window.turnstile || widgetIdRef.current) return

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => onVerifyRef.current(token),
            'error-callback': () => onErrorRef.current?.(),
            'expired-callback': () => onExpireRef.current?.(),
            theme,
            size,
        })
        initializedRef.current = true
    }, [siteKey, theme, size])

    useEffect(() => {
        // Prevent double initialization
        if (initializedRef.current) return

        // Check if script is already loaded
        if (window.turnstile) {
            initWidget()
            return
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(
            'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
        )

        if (existingScript) {
            existingScript.addEventListener('load', initWidget)
            return
        }

        // Load the script
        const script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        script.async = true
        script.defer = true
        script.onload = initWidget
        document.head.appendChild(script)

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current)
                    widgetIdRef.current = null
                    initializedRef.current = false
                } catch {
                    // Widget might already be removed
                }
            }
        }
    }, [initWidget])

    return <div ref={containerRef} className={className} />
}
