
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

export default async function PatientsListPage() {
    const supabase = await createClient()
    const { data: patients } = await supabase.from('patients').select('*').order('nome')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todos os Pacientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Modalidade</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients?.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">
                                        <div>{patient.nome || 'Sem Nome'}</div>
                                    </TableCell>
                                    <TableCell>
                                        {patient.email}
                                    </TableCell>
                                    <TableCell>{patient.modalidade || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/doctor/patients/${patient.id}`}>
                                            <Button variant="outline" size="sm">Ver Prontuário</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!patients?.length && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        Nenhum paciente encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
