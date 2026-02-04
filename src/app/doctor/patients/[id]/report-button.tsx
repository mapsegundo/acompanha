"use client"

import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PatientInfo {
    nome: string
    email: string
    idade: number | null
    sexo: string | null
    peso: number | null
    modalidade: string
    fase: string
}

interface Checkin {
    id: string
    data: string
    peso: number
    cansaco: number
    horas_treino_7d: number
    qualidade_sono: number
    dor_muscular: number
    estresse: number
    humor: number
    duracao_treino: number
    ciclo_menstrual_alterado: boolean
    libido: number
    erecao_matinal: boolean
    lesao: boolean
    local_lesao: string | null
}

interface ReportButtonProps {
    patient: PatientInfo
    checkins: Checkin[]
}

export function ReportButton({ patient, checkins }: ReportButtonProps) {
    const [loading, setLoading] = useState(false)

    const generateReport = async () => {
        if (checkins.length === 0) {
            toast.error("Sem Dados", { description: "Não há check-ins para gerar o relatório." })
            return
        }

        setLoading(true)
        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()

            // Title
            doc.setFontSize(20)
            doc.setFont("helvetica", "bold")
            doc.text("Relatório de Acompanhamento", pageWidth / 2, 20, { align: "center" })

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, 28, { align: "center" })

            // Patient Info Section
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text("Dados do Paciente", 14, 42)

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            const patientInfoY = 50
            doc.text(`Nome: ${patient.nome}`, 14, patientInfoY)
            doc.text(`Email: ${patient.email}`, 14, patientInfoY + 6)
            doc.text(`Idade: ${patient.idade || "N/A"} anos`, 14, patientInfoY + 12)
            doc.text(`Sexo: ${patient.sexo === 'M' ? 'Masculino' : patient.sexo === 'F' ? 'Feminino' : 'N/A'}`, 14, patientInfoY + 18)
            doc.text(`Peso Atual: ${patient.peso ? `${patient.peso} kg` : "N/A"}`, 14, patientInfoY + 24)
            doc.text(`Modalidade: ${patient.modalidade}`, 105, patientInfoY)
            doc.text(`Fase: ${patient.fase}`, 105, patientInfoY + 6)
            doc.text(`Total de Check-ins: ${checkins.length}`, 105, patientInfoY + 12)

            // Summary Statistics
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text("Resumo Estatístico (Últimos Check-ins)", 14, 88)

            // Calculate averages from last 4 check-ins
            const recentCheckins = checkins.slice(-4)
            const avgSono = (recentCheckins.reduce((a, c) => a + (c.qualidade_sono || 0), 0) / recentCheckins.length).toFixed(1)
            const avgCansaco = (recentCheckins.reduce((a, c) => a + (c.cansaco || 0), 0) / recentCheckins.length).toFixed(1)
            const avgEstresse = (recentCheckins.reduce((a, c) => a + (c.estresse || 0), 0) / recentCheckins.length).toFixed(1)
            const avgHumor = (recentCheckins.reduce((a, c) => a + (c.humor || 0), 0) / recentCheckins.length).toFixed(1)
            const avgDor = (recentCheckins.reduce((a, c) => a + (c.dor_muscular || 0), 0) / recentCheckins.length).toFixed(1)
            const avgLibido = (recentCheckins.reduce((a, c) => a + (c.libido || 0), 0) / recentCheckins.length).toFixed(1)
            const avgTreino = (recentCheckins.reduce((a, c) => a + (c.horas_treino_7d || 0), 0) / recentCheckins.length).toFixed(1)
            const lesoes = recentCheckins.filter(c => c.lesao).length

            autoTable(doc, {
                startY: 94,
                head: [['Indicador', 'Média (0-10)', 'Status']],
                body: [
                    ['Qualidade do Sono', avgSono, Number(avgSono) >= 7 ? '✓ Bom' : Number(avgSono) >= 5 ? '⚠ Atenção' : '✗ Crítico'],
                    ['Cansaço', avgCansaco, Number(avgCansaco) <= 4 ? '✓ Bom' : Number(avgCansaco) <= 7 ? '⚠ Atenção' : '✗ Crítico'],
                    ['Estresse', avgEstresse, Number(avgEstresse) <= 4 ? '✓ Bom' : Number(avgEstresse) <= 7 ? '⚠ Atenção' : '✗ Crítico'],
                    ['Humor', avgHumor, Number(avgHumor) >= 7 ? '✓ Bom' : Number(avgHumor) >= 5 ? '⚠ Atenção' : '✗ Crítico'],
                    ['Dor Muscular', avgDor, Number(avgDor) <= 4 ? '✓ Bom' : Number(avgDor) <= 7 ? '⚠ Atenção' : '✗ Crítico'],
                    ['Libido', avgLibido, Number(avgLibido) >= 6 ? '✓ Bom' : Number(avgLibido) >= 4 ? '⚠ Atenção' : '✗ Crítico'],
                    ['Horas Treino (semana)', avgTreino, '-'],
                    ['Lesões Recentes', `${lesoes}/${recentCheckins.length}`, lesoes === 0 ? '✓ Nenhuma' : '⚠ Atenção'],
                ],
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
            })

            // Check-in History Table
            // @ts-expect-error jspdf-autotable adds finalY to doc
            const tableEndY = doc.lastAutoTable?.finalY || 140

            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text("Histórico de Check-ins", 14, tableEndY + 14)

            // Get last 10 check-ins for the history table
            const historyCheckins = checkins.slice(-10).reverse()

            autoTable(doc, {
                startY: tableEndY + 20,
                head: [['Data', 'Peso', 'Sono', 'Cansaço', 'Estresse', 'Humor', 'Dor', 'Treino', 'Lesão']],
                body: historyCheckins.map(c => [
                    format(new Date(c.data), "dd/MM/yy", { locale: ptBR }),
                    `${c.peso} kg`,
                    `${c.qualidade_sono}/10`,
                    `${c.cansaco}/10`,
                    `${c.estresse}/10`,
                    `${c.humor}/10`,
                    `${c.dor_muscular}/10`,
                    `${c.horas_treino_7d}h`,
                    c.lesao ? 'Sim' : 'Não'
                ]),
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
                bodyStyles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 22 },
                    1: { cellWidth: 18 },
                }
            })

            // Footer
            const pageCount = doc.internal.pages.length - 1
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setFont("helvetica", "italic")
                doc.text(
                    `Acompanha - Monitoramento Clínico | Página ${i} de ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: "center" }
                )
            }

            // Save the PDF
            const fileName = `relatorio_${patient.nome?.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), "yyyyMMdd")}.pdf`
            doc.save(fileName)

            toast.success("Relatório Gerado!", { description: `Arquivo ${fileName} salvo com sucesso.` })
        } catch (error) {
            console.error("Erro ao gerar PDF:", error)
            toast.error("Erro ao gerar relatório", { description: "Tente novamente." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button variant="outline" className="gap-2" onClick={generateReport} disabled={loading}>
            {loading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                </>
            ) : (
                <>
                    <FileDown className="h-4 w-4" />
                    Gerar Relatório
                </>
            )}
        </Button>
    )
}
