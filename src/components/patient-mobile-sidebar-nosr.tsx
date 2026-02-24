"use client"

import dynamic from "next/dynamic"

const PatientMobileSidebar = dynamic(
  () => import("@/components/patient-mobile-sidebar").then((mod) => mod.PatientMobileSidebar),
  { ssr: false }
)

interface PatientMobileSidebarNoSSRProps {
  userEmail?: string | null
}

export function PatientMobileSidebarNoSSR({ userEmail }: PatientMobileSidebarNoSSRProps) {
  return <PatientMobileSidebar userEmail={userEmail} />
}
