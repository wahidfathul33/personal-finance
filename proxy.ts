import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'pf_auth'

async function computeToken(): Promise<string> {
  const pin = process.env.AUTH_PIN ?? ''
  const secret = process.env.AUTH_SECRET ?? 'changeme'
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(pin))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/auth')) return NextResponse.next()

  const token = req.cookies.get(COOKIE_NAME)?.value
  const expected = await computeToken()

  if (token !== expected) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
