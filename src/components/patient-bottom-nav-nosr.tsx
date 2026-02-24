"use client"

import dynamic from "next/dynamic"

const PatientBottomNav = dynamic(
    () => import("@/components/patient-bottom-nav").then((mod) => mod.PatientBottomNav),
    { ssr: false }
)

export function PatientBottomNavNoSSR() {
    return <PatientBottomNav />
}
