"use client"

import dynamic from "next/dynamic"

const MobileSidebar = dynamic(
  () => import("@/components/mobile-sidebar").then((mod) => mod.MobileSidebar),
  { ssr: false }
)

interface MobileSidebarNoSSRProps {
  children: React.ReactNode
}

export function MobileSidebarNoSSR({ children }: MobileSidebarNoSSRProps) {
  return <MobileSidebar>{children}</MobileSidebar>
}
