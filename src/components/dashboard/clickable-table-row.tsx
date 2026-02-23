"use client"

import { useRouter } from "next/navigation"
import { TableRow } from "@/components/ui/table"
import { type KeyboardEvent, type ReactNode } from "react"

interface ClickableTableRowProps {
    href: string
    children: ReactNode
    className?: string
    label?: string
}

export function ClickableTableRow({ href, children, className, label }: ClickableTableRowProps) {
    const router = useRouter()

    function navigateToRow() {
        router.push(href)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            navigateToRow()
        }
    }

    return (
        <TableRow
            className={`cursor-pointer transition-colors ${className}`}
            onClick={navigateToRow}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="link"
            aria-label={label ?? `Abrir ${href}`}
        >
            {children}
        </TableRow>
    )
}
