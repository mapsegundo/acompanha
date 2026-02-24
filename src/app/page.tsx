
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-white selection:bg-blue-500/30">
      <main className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <div className="mb-4 animate-in fade-in zoom-in duration-700">
          <Image src="/logo.png" alt="Acompanha Logo" width={120} height={120} className="rounded-3xl shadow-2xl shadow-blue-500/20" />
        </div>
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl uppercase">
            Acompanha<span className="text-blue-500">.</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-slate-400 md:text-xl font-medium">
            Monitoramento clínico e esportivo de elite. <br className="hidden sm:block" />
            Simplicidade para o atleta, inteligência para o médico.
          </p>
        </div>
        <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-14 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 transition-all hover:scale-105">
              ACESSAR PLATAFORMA
            </Button>
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-50">
        © 2026 Acompanha • Monitoramento Longitudinal
      </footer>
    </div>
  )
}
