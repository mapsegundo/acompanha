"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

const CREDENTIAL_KEY = "acompanha_bio_email"
const SESSION_KEY = "acompanha_bio_session"

interface StoredBiometricData {
    email: string
    refreshToken: string | null
}

function readStoredBiometricData(): StoredBiometricData | null {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
        try {
            const parsed = JSON.parse(stored) as Partial<StoredBiometricData>
            if (parsed.email && typeof parsed.email === "string") {
                return {
                    email: parsed.email,
                    refreshToken: typeof parsed.refreshToken === "string" ? parsed.refreshToken : null,
                }
            }
        } catch {
            // Ignore invalid storage and fallback to legacy key.
        }
    }

    const legacyEmail = localStorage.getItem(CREDENTIAL_KEY)
    if (!legacyEmail) return null

    return {
        email: legacyEmail,
        refreshToken: null,
    }
}

function persistBiometricData(email: string, refreshToken: string | null) {
    localStorage.setItem(CREDENTIAL_KEY, email)
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
            email,
            refreshToken,
        } satisfies StoredBiometricData)
    )
}

/**
 * Biometrics via WebAuthn (Web Authentication API).
 * Works on modern iOS Safari (Face ID) and Android (fingerprint/face).
 * Requires the site to be served over HTTPS.
 */
export function useBiometrics() {
    const isAvailable = useCallback(async (): Promise<boolean> => {
        return (
            typeof window !== "undefined" &&
            "PublicKeyCredential" in window &&
            (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
        )
    }, [])

    /**
     * Register a WebAuthn credential for the current user after login.
     * This links the device biometrics to the user for future logins.
     */
    const registerCredential = useCallback(async (email: string, userId: string, refreshToken: string | null) => {
        if (!(await isAvailable())) return

        try {
            const challenge = crypto.getRandomValues(new Uint8Array(32))
            await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: "Acompanha", id: window.location.hostname },
                    user: {
                        id: new TextEncoder().encode(userId),
                        name: email,
                        displayName: email,
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: "public-key" },
                        { alg: -257, type: "public-key" },
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        residentKey: "required",
                        userVerification: "required",
                    },
                    timeout: 60000,
                    attestation: "none",
                },
            })

            persistBiometricData(email, refreshToken)
        } catch {
            // User cancelled or device not supported - non-critical.
        }
    }, [isAvailable])

    /**
     * Authenticate via biometrics. Shows Face ID / fingerprint dialog.
     * Returns stored auth metadata on success, or null on failure.
     */
    const verifyBiometric = useCallback(async (): Promise<StoredBiometricData | null> => {
        if (!(await isAvailable())) return null

        const stored = readStoredBiometricData()
        if (!stored) return null

        try {
            const challenge = crypto.getRandomValues(new Uint8Array(32))
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    rpId: window.location.hostname,
                    userVerification: "required",
                    timeout: 60000,
                },
            })

            return credential ? stored : null
        } catch {
            return null
        }
    }, [isAvailable])

    /**
     * Auto-login flow: verify biometric then restore Supabase session.
     */
    const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
        const biometricData = await verifyBiometric()
        if (!biometricData) return false

        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
            persistBiometricData(biometricData.email, session.refresh_token ?? biometricData.refreshToken)
            window.location.href = "/"
            return true
        }

        if (biometricData.refreshToken) {
            const { data, error } = await supabase.auth.refreshSession({
                refresh_token: biometricData.refreshToken,
            })

            if (!error && data.session) {
                persistBiometricData(biometricData.email, data.session.refresh_token)
                window.location.href = "/"
                return true
            }
        }

        return false
    }, [verifyBiometric])

    const clearCredentials = useCallback(() => {
        localStorage.removeItem(CREDENTIAL_KEY)
        localStorage.removeItem(SESSION_KEY)
    }, [])

    return { isAvailable, registerCredential, loginWithBiometrics, clearCredentials }
}
