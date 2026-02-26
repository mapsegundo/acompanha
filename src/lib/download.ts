/**
 * Mobile-safe document download utility.
 *
 * Safari (iOS and macOS) ignores the `download` attribute on anchor tags
 * when the URL is cross-origin (e.g. Supabase signed URLs from *.supabase.co).
 *
 * Solution: fetch the file content, convert to a blob URL (same-origin),
 * then trigger the anchor click — this works in all browsers including
 * Safari PWA and Chrome mobile.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)

        const link = window.document.createElement("a")
        link.href = blobUrl
        link.download = filename
        link.style.display = "none"
        window.document.body.appendChild(link)
        link.click()

        // Cleanup after a short delay to ensure the click registers
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl)
            window.document.body.removeChild(link)
        }, 150)
    } catch {
        // Fallback: open the URL directly in the browser
        // (works for most file types in regular Safari, just won't auto-download)
        const link = window.document.createElement("a")
        link.href = url
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
    }
}
