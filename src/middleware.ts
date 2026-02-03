
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Security check: Protect routes
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Protection Check
    if (!user) {
        if (request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/checkin') ||
            request.nextUrl.pathname.startsWith('/doctor')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return response
    }

    // 2. Logged User Routing
    // Differentiate roles based on table existence
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') {

        // Check if Doctor
        const { data: doctor } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (doctor) {
            return NextResponse.redirect(new URL('/doctor/dashboard', request.url))
        }

        // Default to Patient
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 3. Role Access Control
    // Prevent patients from accessing /doctor routes
    if (request.nextUrl.pathname.startsWith('/doctor')) {
        const { data: doctor } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!doctor) {
            // Patient trying to access doctor area -> Send back to patient dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
