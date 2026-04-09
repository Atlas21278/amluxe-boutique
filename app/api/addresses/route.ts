import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const AMLUXE_URL = process.env.NEXT_PUBLIC_AMLUXE_API_URL!
const SECRET = process.env.CUSTOMER_API_SECRET!

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const res = await fetch(`${AMLUXE_URL}/api/customer/addresses`, {
    headers: { 'x-internal-secret': SECRET, 'x-clerk-user-id': userId },
    cache: 'no-store',
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()

  const res = await fetch(`${AMLUXE_URL}/api/customer/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': SECRET,
      'x-clerk-user-id': userId,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
