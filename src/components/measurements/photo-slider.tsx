"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { GripVertical } from "lucide-react"

interface PhotoSliderProps {
    beforeUrl: string
    afterUrl: string
    beforeDate: string
    afterDate: string
}

export function PhotoSlider({ beforeUrl, afterUrl, beforeDate, afterDate }: PhotoSliderProps) {
    const [position, setPosition] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const formatDate = (d: string) =>
        format(parseISO(d), "dd 'de' MMM 'de' yyyy", { locale: ptBR })

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        setPosition((x / rect.width) * 100)
    }, [])

    // Mouse events
    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true
        updatePosition(e.clientX)
        const onMove = (ev: MouseEvent) => { if (isDragging.current) updatePosition(ev.clientX) }
        const onUp = () => { isDragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
        window.addEventListener("mousemove", onMove)
        window.addEventListener("mouseup", onUp)
    }

    // Touch events
    const onTouchStart = (e: React.TouchEvent) => {
        isDragging.current = true
        updatePosition(e.touches[0].clientX)
    }
    const onTouchMove = (e: React.TouchEvent) => {
        e.preventDefault()
        if (isDragging.current) updatePosition(e.touches[0].clientX)
    }
    const onTouchEnd = () => { isDragging.current = false }

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-square select-none overflow-hidden rounded-2xl border bg-black/5 cursor-col-resize touch-none"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            aria-label="Comparador de fotos: arraste para comparar"
            role="slider"
            aria-valuenow={Math.round(position)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            {/* After (right layer - full width) */}
            <Image
                src={afterUrl}
                alt={`Depois — ${formatDate(afterDate)}`}
                fill
                unoptimized
                className="object-contain pointer-events-none"
                sizes="(max-width: 768px) 100vw, 600px"
            />

            {/* Before (left layer - clipped) */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
                <Image
                    src={beforeUrl}
                    alt={`Antes — ${formatDate(beforeDate)}`}
                    fill
                    unoptimized
                    className="object-contain pointer-events-none"
                    sizes="(max-width: 768px) 100vw, 600px"
                />
            </div>

            {/* Divider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]"
                style={{ left: `${position}%` }}
            />

            {/* Drag handle */}
            <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-white shadow-lg border-2 border-white/80 flex items-center justify-center"
                style={{ left: `${position}%` }}
            >
                <GripVertical className="h-5 w-5 text-black/60" />
            </div>

            {/* Date labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 pb-3 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg max-w-[45%] truncate">
                    {formatDate(beforeDate)}
                </div>
                <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg max-w-[45%] truncate text-right">
                    {formatDate(afterDate)}
                </div>
            </div>
        </div>
    )
}
