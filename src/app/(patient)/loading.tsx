export default function PatientLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-muted rounded-lg" />
                <div className="h-10 w-10 bg-muted rounded-full" />
            </div>

            {/* Cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border bg-card overflow-hidden">
                        <div className="p-4 space-y-4">
                            {/* Status row */}
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-28 bg-muted rounded" />
                                <div className="h-5 w-16 bg-muted rounded-full" />
                            </div>
                            {/* Weight */}
                            <div className="h-8 w-24 bg-muted rounded" />
                            {/* Metric bars */}
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="space-y-1">
                                        <div className="flex justify-between">
                                            <div className="h-3 w-12 bg-muted rounded" />
                                            <div className="h-3 w-8 bg-muted rounded" />
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
