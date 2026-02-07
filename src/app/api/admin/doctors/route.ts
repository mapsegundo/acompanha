import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { email, nome, crm, especialidade } = await request.json()

        // Validação básica
        if (!email || !nome) {
            return NextResponse.json(
                { error: 'Email e nome são obrigatórios' },
                { status: 400 }
            )
        }

        // Verificar se Service Role Key está configurada
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY não configurada')
            return NextResponse.json(
                { error: 'Configuração do servidor incompleta. Contacte o administrador.' },
                { status: 500 }
            )
        }

        // Criar cliente admin com Service Role
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Buscar usuário existente pelo email
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) {
            console.error('Erro ao listar usuários:', listError)
            return NextResponse.json(
                { error: 'Erro ao verificar usuários existentes' },
                { status: 500 }
            )
        }

        // Encontrar o usuário com o email informado
        const existingUser = users.find(user => user.email === email)

        if (!existingUser) {
            return NextResponse.json(
                { error: 'Não existe um usuário cadastrado com este email. O médico precisa criar uma conta primeiro em acompanha.online.' },
                { status: 404 }
            )
        }

        // 2. Verificar se já existe um doctor com esse user_id
        const { data: existingDoctor } = await supabaseAdmin
            .from('doctors')
            .select('id')
            .eq('user_id', existingUser.id)
            .single()

        if (existingDoctor) {
            return NextResponse.json(
                { error: 'Este usuário já está cadastrado como médico.' },
                { status: 409 }
            )
        }

        // 3. Criar registro na tabela doctors vinculando ao user_id existente
        const { error: doctorError } = await supabaseAdmin
            .from('doctors')
            .insert({
                user_id: existingUser.id,
                email,
                nome,
                crm: crm || null,
                especialidade: especialidade || null
            })

        if (doctorError) {
            console.error('Erro ao inserir doctor:', doctorError)
            return NextResponse.json(
                { error: doctorError.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Médico vinculado com sucesso!',
            userId: existingUser.id
        })

    } catch (error) {
        console.error('Erro inesperado:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
