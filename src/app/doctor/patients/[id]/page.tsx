
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { use } from "react" // Next.js 15 unwrapping

const chartData = [
    { date: "2023-10-01", weight: 75, sleep: 7 },
    { date: "2023-10-08", weight: 75.2, sleep: 6 },
    { date: "2023-10-15", weight: 74.8, sleep: 8 },
    { date: "2023-10-22", weight: 76.0, sleep: 5 },
]

const chartConfig = {
    weight: {
        label: "Peso (kg)",
        color: "#2563eb",
    },
    sleep: {
        label: "Qualidade Sono",
        color: "#60a5fa",
    },
} satisfies ChartConfig

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params (Next.js 15 requirement)
    const { id } = use(params)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/doctor/dashboard">
                    <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Detalhes do Paciente {id}</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Evolução de Peso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="weight" fill="var(--color-weight)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Qualidade do Sono</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="sleep" fill="var(--color-sleep)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
