'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Info, Activity, Moon, Brain, Zap, Heart } from 'lucide-react'
import {
    calculateRecoveryScore,
    getRecoveryColor,
    getRecoveryBadgeVariant,
    type CheckinData
} from '@/lib/monitoring'

interface RecoveryScoreCardProps {
    checkinData: CheckinData | null
    className?: string
}

export function RecoveryScoreCard({ checkinData, className }: RecoveryScoreCardProps) {
    const [modalOpen, setModalOpen] = useState(false)

    if (!checkinData) {
        return (
            <Card className={className}>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Sem dados de check-in</p>
                </CardContent>
            </Card>
        )
    }

    const recovery = calculateRecoveryScore(checkinData)
    const color = getRecoveryColor(recovery.status)
    const badgeVariant = getRecoveryBadgeVariant(recovery.status)

    return (
        <Card className={className}>
            <CardContent className="py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Score Circle */}
                        <div
                            className="relative flex items-center justify-center w-16 h-16 rounded-full border-4"
                            style={{ borderColor: color }}
                        >
                            <span
                                className="text-2xl font-bold"
                                style={{ color }}
                            >
                                {recovery.score}
                            </span>
                        </div>

                        {/* Label and Badge */}
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Recovery Score</span>
                            <Badge variant={badgeVariant} className="w-fit">
                                {recovery.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Info Button */}
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                <Info className="h-4 w-4 mr-1" />
                                Como calculamos?
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    Recovery Score - Hooper Index
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 text-sm">
                                <p className="text-muted-foreground leading-relaxed">
                                    Este score é calculado utilizando o <strong>Hooper Index</strong>,
                                    um modelo amplamente reconhecido na literatura esportiva para
                                    monitoramento longitudinal e detecção de overtraining e fadiga acumulada em atletas.
                                </p>

                                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-slate-700">Variáveis Analisadas:</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4 text-indigo-500" />
                                            <span>Qualidade do Sono</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <span>Fadiga (Cansaço)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-purple-500" />
                                            <span>Nível de Estresse</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-red-500" />
                                            <span>Dor Muscular (DOMS)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                    <h4 className="font-semibold text-blue-800">Fórmula:</h4>
                                    <code className="text-xs bg-white px-2 py-1 rounded block">
                                        HI = Fadiga + Estresse + Dor + (10 - Sono)
                                    </code>
                                    <code className="text-xs bg-white px-2 py-1 rounded block">
                                        Score = 100 - (HI × 2.5) + Ajustes
                                    </code>
                                    <p className="text-xs text-blue-700">
                                        Ajustes secundários baseados em humor e libido.
                                        Penalidade adicional se lesão reportada.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-700">Interpretação Clínica:</h4>
                                    <div className="flex gap-2">
                                        <Badge variant="default">80-100: Seguro</Badge>
                                        <Badge variant="secondary">60-79: Atenção</Badge>
                                        <Badge variant="destructive">&lt;60: Crítico</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Atletas com score abaixo de 60 devem considerar redução
                                        de carga de treino e avaliação médica.
                                    </p>
                                </div>

                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Heart className="h-3 w-3" />
                                        Referência: Hooper SL, Mackinnon LT. (1995). Monitoring overtraining in athletes.
                                    </p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}
