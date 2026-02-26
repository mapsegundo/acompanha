"use client"

import { useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

const CREDENTIAL_KEY = "acompanha_bio_email"

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
     * This links the device biometrics to their email for future logins.
     */
    const registerCredential = useCallback(async (email: string, userId: string) => {
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
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required",
                    },
                    timeout: 60000,
                    attestation: "none",
                },
            })
            localStorage.setItem(CREDENTIAL_KEY, email)
        } catch {
            // User cancelled or device not supported — non-critical
        }
    }, [isAvailable])

    /**
     * Authenticate via biometrics. Shows Face ID / fingerprint dialog.
     * On success, the user must still enter their password (or we use a stored token).
     * Returns the email stored during registration, or null on failure.
     */
    const verifyBiometric = useCallback(async (): Promise<string | null> => {
        if (!(await isAvailable())) return null
        const email = localStorage.getItem(CREDENTIAL_KEY)
        if (!email) return null

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
            return credential ? email : null
        } catch {
            return null
        }
    }, [isAvailable])

    /**
     * Auto-login flow: verify biometric → re-authenticate session via Supabase magic link.
     * Since WebAuthn doesn't give us the password, we use a stored refresh token approach.
     */
    const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
        const email = await verifyBiometric()
        if (!email) return false

        // Attempt to refresh the existing session (if still valid)
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
            window.location.href = "/"
            return true
        }

        // Session expired — send magic link to their email as fallback
        await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
        return false
    }, [verifyBiometric])

    const clearCredentials = useCallback(() => {
        localStorage.removeItem(CREDENTIAL_KEY)
    }, [])

    return { isAvailable, registerCredential, loginWithBiometrics, clearCredentials }
}
