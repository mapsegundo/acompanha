"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface RealtimeRefreshListenerProps {
    tables: string[]
    debounceMs?: number
}

export function RealtimeRefreshListener({ tables, debounceMs = 1200 }: RealtimeRefreshListenerProps) {
    const router = useRouter()
    const debounceRef = useRef<number | null>(null)
    const tableKey = useMemo(() => tables.join("|"), [tables])
    const tableList = useMemo(() => tableKey.split("|").filter(Boolean), [tableKey])

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase.channel(`realtime-refresh:${tableKey}`)

        const triggerRefresh = () => {
            if (debounceRef.current) return
            debounceRef.current = window.setTimeout(() => {
                debounceRef.current = null
                router.refresh()
            }, debounceMs)
        }

        for (const table of tableList) {
            channel.on(
                "postgres_changes",
                { event: "*", schema: "public", table },
                () => triggerRefresh()
            )
        }

        channel.subscribe()

        const handleVisibility = () => {
            if (document.visibilityState === "visible") triggerRefresh()
        }

        window.addEventListener("focus", triggerRefresh)
        document.addEventListener("visibilitychange", handleVisibility)

        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current)
                debounceRef.current = null
            }
            window.removeEventListener("focus", triggerRefresh)
            document.removeEventListener("visibilitychange", handleVisibility)
            void supabase.removeChannel(channel)
        }
    }, [debounceMs, router, tableKey, tableList])

    return null
}
