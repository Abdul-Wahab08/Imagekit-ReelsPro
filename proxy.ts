import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {

    const token = await getToken({ req: request })
    const url = request.nextUrl

    if (!token && (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/upload-reel"))) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (token && (url.pathname.startsWith("/login") || url.pathname.startsWith("/register"))) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()

}

export const config = {
    matcher: [
        '/login',
        '/register',
        '/upload-reel'
    ]
}