import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import webpush from "web-push"

export const runtime = "nodejs"

interface PushRequestBody {
    targetUserId: string
    title: string
    body: string
    data?: Record<string, unknown>
}

interface DeviceTokenRow {
    token: string
}

function getAdminClient() {
    return createSupabaseAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}

function configureWebPush() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!publicKey || !privateKey) return false

    webpush.setVapidDetails("mailto:support@acompanha.online", publicKey, privateKey)
    return true
}

function isSubscriptionGone(error: unknown): boolean {
    const statusCode = (error as { statusCode?: number })?.statusCode
    return statusCode === 404 || statusCode === 410
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = (await request.json()) as Partial<PushRequestBody>
        const targetUserId = body.targetUserId?.trim()
        const title = body.title?.trim()
        const message = body.body?.trim()

        if (!targetUserId || !title || !message) {
            return NextResponse.json(
                { error: "targetUserId, title e body são obrigatórios." },
                { status: 400 }
            )
        }

        if (!configureWebPush()) {
            return NextResponse.json(
                { error: "Chaves VAPID não configuradas no servidor." },
                { status: 500 }
            )
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json(
                { error: "SUPABASE_SERVICE_ROLE_KEY não configurada." },
                { status: 500 }
            )
        }

        const supabaseAdmin = getAdminClient()
        const { data: tokens, error: tokenError } = await supabaseAdmin
            .from("device_tokens")
            .select("token")
            .eq("user_id", targetUserId)

        if (tokenError) {
            return NextResponse.json({ error: tokenError.message }, { status: 500 })
        }

        const deviceTokens = (tokens ?? []) as DeviceTokenRow[]
        if (deviceTokens.length === 0) {
            return NextResponse.json({ sent: 0, failed: 0, removed: 0, reason: "no_tokens" })
        }

        let sent = 0
        let failed = 0
        let removed = 0

        for (const row of deviceTokens) {
            try {
                const subscription = JSON.parse(row.token)
                await webpush.sendNotification(
                    subscription,
                    JSON.stringify({
                        title,
                        body: message,
                        data: body.data ?? {},
                    })
                )
                sent += 1
            } catch (error) {
                failed += 1

                if (isSubscriptionGone(error)) {
                    const { error: deleteError } = await supabaseAdmin
                        .from("device_tokens")
                        .delete()
                        .eq("token", row.token)

                    if (!deleteError) removed += 1
                }
            }
        }

        return NextResponse.json({ sent, failed, removed })
    } catch {
        return NextResponse.json({ error: "Erro interno ao enviar push." }, { status: 500 })
    }
}
