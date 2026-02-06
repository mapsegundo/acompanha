import { Button } from "@/components/ui/button"
import { ArrowLeft, Info, Moon, Brain, Zap, Heart, AlertTriangle, Activity } from 'lucide-react'
import Link from "next/link"

export default function RecoveryScoreInfoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/doctor/patients">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-slate-800">Recovery Score - Hooper Index</h1>
                    </div>
                    <p className="text-slate-600">
                        Este score é calculado utilizando o <strong>Hooper Index</strong>, um modelo amplamente reconhecido na literatura esportiva para monitoramento longitudinal e detecção de overtraining e fadiga acumulada em atletas.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Variables */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Variáveis Analisadas:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                <Moon className="h-5 w-5 text-purple-600" />
                                <span className="text-slate-700">Qualidade do Sono</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                <Zap className="h-5 w-5 text-orange-600" />
                                <span className="text-slate-700">Fadiga (Cansaço)</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                <Brain className="h-5 w-5 text-blue-600" />
                                <span className="text-slate-700">Nível de Estresse</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                <Activity className="h-5 w-5 text-red-600" />
                                <span className="text-slate-700">Dor Muscular (DOMS)</span>
                            </div>
                        </div>
                    </div>

                    {/* Formula */}
                    <div className="bg-blue-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
                        <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Fórmula de Cálculo:
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-sm font-semibold text-blue-700 mb-2">1. Calcular Hooper Index (HI):</p>
                                <code className="block text-sm bg-slate-100 px-4 py-3 rounded border border-slate-300">
                                    HI = Fadiga + Estresse + Dor + (10 - Sono)
                                </code>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-sm font-semibold text-blue-700 mb-2">2. Calcular Score Base:</p>
                                <code className="block text-sm bg-slate-100 px-4 py-3 rounded border border-slate-300">
                                    Score Base = 100 - (HI × 2.5)
                                </code>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-sm font-semibold text-blue-700 mb-2">3. Aplicar Ajustes (Humor e Libido):</p>
                                <code className="block text-sm bg-slate-100 px-4 py-3 rounded border border-slate-300">
                                    Ajuste = ((Humor - 5) × 2) + ((Libido - 5) × 1)
                                </code>
                                <div className="mt-3 space-y-1 text-sm text-blue-700">
                                    <p>• Valores <strong>acima de 5</strong> = ajuste POSITIVO</p>
                                    <p>• Valores <strong>abaixo de 5</strong> = ajuste NEGATIVO</p>
                                    <p>• Humor tem peso <strong>maior (×2)</strong> que libido (×1)</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                                <p className="text-sm font-semibold text-blue-700 mb-2">4. Score Final:</p>
                                <code className="block text-sm bg-slate-100 px-4 py-3 rounded border border-slate-300">
                                    Score = Score Base + Ajuste
                                </code>
                            </div>
                        </div>
                    </div>

                    {/* Injury Penalty */}
                    <div className="bg-red-50 rounded-lg shadow-md p-6 border-2 border-red-200">
                        <h2 className="text-xl font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Penalidade de Lesão
                        </h2>
                        <div className="space-y-2 text-red-700">
                            <p className="font-medium">Se lesão reportada:</p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li><strong>-12 pontos</strong> aplicados ao score</li>
                                <li>Score <strong>máximo limitado a 70</strong></li>
                                <li>Justificativa: Lesão ativa sempre indica necessidade de redução de carga</li>
                            </ul>
                        </div>
                    </div>

                    {/* Clinical Interpretation */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Interpretação Clínica:</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="font-bold text-green-700 text-lg">80-100</div>
                                <div className="flex-1">
                                    <span className="font-semibold text-green-700">Seguro</span>
                                    <p className="text-sm text-green-600">Atleta recuperado, pode progredir na carga de treino</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="font-bold text-orange-700 text-lg">60-79</div>
                                <div className="flex-1">
                                    <span className="font-semibold text-orange-700">Atenção</span>
                                    <p className="text-sm text-orange-600">Monitorar de perto, considerar ajuste de volume/intensidade</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="font-bold text-red-700 text-lg">&lt;60</div>
                                <div className="flex-1">
                                    <span className="font-semibold text-red-700">Crítico</span>
                                    <p className="text-sm text-red-600">Redução de carga necessária, avaliação médica recomendada</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <p className="text-xs text-slate-500">
                                Atletas com score abaixo de 60 devem ter redução de carga de treino e avaliação médica se necessário.
                            </p>
                        </div>
                    </div>

                    {/* Reference */}
                    <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                        <p className="text-xs text-slate-600 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-slate-500" />
                            <strong>Referência:</strong> Hooper SL, Mackinnon LT. (1995). Monitoring overtraining in athletes. Sports Medicine.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
