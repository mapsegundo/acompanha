/* eslint-disable */
// @ts-ignore
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Parse body for checkin data or assume it runs on trigger/schedule
        // For now assuming it receives { patient_id, current_checkin }
        const { patient_id } = await req.json()

        // Fetch recent checkins
        const { data: checkins, error } = await supabaseClient
            .from('weekly_checkins')
            .select('*')
            .eq('patient_id', patient_id)
            .order('data', { ascending: false })
            .limit(4) // Get last month approx

        if (error) throw error
        if (!checkins || checkins.length === 0) {
            return new Response(JSON.stringify({ status: 'Verde', reason: 'Sem dados' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const current = checkins[0]
        const previous = checkins[1]

        let status = 'Verde'
        const reasons: string[] = []

        // Rule 1: Sleep + Fatigue + Muscle Pain (General "Bad" condition)
        // Assuming scales 0-10 where 0 is Good/Low and 10 is Bad/High? 
        // Usually: Sleep (0=Bad, 10=Good), Fatigue (0=None, 10=Extreme), Pain (0=None, 10=Extreme)
        // Let's assume standard conventions: Qualidade Sono (Higher is Better), Cansaço (Lower is Better), Dor (Lower is Better)
        // "Sono ruim" (< 4?), "Cansaço alto" (> 7?), "Dor muscular" (exists? > 5?)
        // Adjust logic as needed.
        const isSleepBad = (current.qualidade_sono ?? 10) < 4
        const isFatigueHigh = (current.cansaco ?? 0) > 7
        const isPainPresent = (current.dor_muscular ?? 0) > 5

        if (isSleepBad && isFatigueHigh && isPainPresent) {
            status = 'Vermelho'
            reasons.push('Combinação de sono ruim, cansaço alto e dor muscular')
        }

        // Rule 2: Libido reduced for 2+ weeks
        // Need to check previous checkin
        if (checkins.length >= 2) {
            const currentLibidoLow = (current.libido ?? 10) < 4
            const prevLibidoLow = (previous?.libido ?? 10) < 4

            if (currentLibidoLow && prevLibidoLow) {
                if (status !== 'Vermelho') status = 'Amarelo' // Don't downgrade Red
                reasons.push('Libido reduzida por 2+ semanas')
            }
        }

        // Rule 3: Load Increase > 30%
        // Need comparison. "horas_treino_7d" or "carga" (if existing).
        // Using duracao_treino or adding a load field? 
        // User mentioned "Aumento de carga". Maybe "duracao_treino" * "perceived exertion"?
        // Or just look at "peso"? No, load usually means training load.
        // I'll stick to 'duracao_treino' if it's the proxy, or maybe I missed a field.
        // 'horas_treino_7d' is available.

        if (checkins.length >= 2 && previous?.horas_treino_7d > 0) {
            const increase = (current.horas_treino_7d - previous.horas_treino_7d) / previous.horas_treino_7d
            if (increase > 0.30) {
                status = 'Vermelho'
                reasons.push(`Aumento de carga semanal > 30% (${(increase * 100).toFixed(0)}%)`)
            }
        }

        // Default Update patient status (if we had a status field on patient, currently we don't in SQL, 
        // maybe we should return it or update a separate 'status' table or add to patients)
        // User Requirements: "Visualiza pacientes por status (verde, amarelo, vermelho)"
        // So we probably should store it on Patients table.

        // Update Patient
        // await supabaseClient.from('patients').update({ status: status }).eq('id', patient_id)

        return new Response(JSON.stringify({ status, reasons }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: (error as any).message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
