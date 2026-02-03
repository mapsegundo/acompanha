
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <main className="container flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Acompanha<span className="text-blue-500">.</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-slate-400 md:text-xl">
            Monitoramento clínico e esportivo longitudinal de alta performance.
            Simplicidade para o paciente, inteligência para o médico.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              Acessar Plataforma
            </Button>
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-4 text-xs text-slate-500">
        © 2024 Acompanha Health Systems
      </footer>
    </div>
  )
}
