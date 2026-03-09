'use server'

import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'pf_auth'

function computeToken(pin: string): string {
  const secret = process.env.AUTH_SECRET ?? 'changeme'
  return createHmac('sha256', secret).update(pin).digest('hex')
}

export async function verifyPin(pin: string): Promise<{ error: string } | undefined> {
  const expected = process.env.AUTH_PIN
  if (!expected) return { error: 'AUTH_PIN belum dikonfigurasi' }
  if (pin !== expected) return { error: 'PIN salah' }

  const token = computeToken(pin)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: '/',
  })

  redirect('/')
}
