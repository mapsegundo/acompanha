"use client"

import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type RefObject, useRef } from "react"

interface NativeCameraButtonProps {
    /** Called with a File object from the native file picker or camera */
    onCapture: (file: File) => void
    label?: string
    className?: string
    /** Optional external ref to control the hidden input externally */
    inputRef?: RefObject<HTMLInputElement | null>
}

/**
 * A button that opens the native camera or gallery picker.
 * Uses the standard HTML `<input type="file" accept="image/*" capture="environment">` approach
 * which triggers the native camera/gallery sheet on iOS and Android.
 * Works in PWA and regular browser contexts.
 */
export function NativeCameraButton({
    onCapture,
    label = "Adicionar Foto",
    className,
    inputRef: externalRef,
}: NativeCameraButtonProps) {
    const internalRef = useRef<HTMLInputElement>(null)
    const ref = externalRef ?? internalRef

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onCapture(file)
        // Reset so the same file can be re-selected
        e.target.value = ""
    }

    return (
        <>
            <input
                ref={ref}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleChange}
                aria-label="Selecionar foto"
            />
            <Button
                type="button"
                variant="outline"
                onClick={() => ref.current?.click()}
                className={className}
            >
                <ImageIcon className="h-4 w-4 mr-2 shrink-0" />
                {label}
            </Button>
        </>
    )
}
