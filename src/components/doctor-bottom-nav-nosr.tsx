"use client"

import dynamic from "next/dynamic"

// Importa a Bottom Nav dinamicamente desativando o SSR
// Isso é necessário porque o pathname depende do roteamento do cliente,
// o que pode causar warning de hydration mismatch no primeiro render
const DoctorBottomNav = dynamic(
    () => import("./doctor-bottom-nav").then((mod) => mod.DoctorBottomNav),
    {
        ssr: false,
    }
)

export function DoctorBottomNavNoSSR() {
    return <DoctorBottomNav />
}
