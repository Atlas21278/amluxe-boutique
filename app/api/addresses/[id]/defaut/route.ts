import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const AMLUXE_URL = process.env.NEXT_PUBLIC_AMLUXE_API_URL!
const SECRET = process.env.CUSTOMER_API_SECRET!

export async function PUT(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const res = await fetch(`${AMLUXE_URL}/api/customer/addresses/${params.id}`, {
    method: 'PUT',
    headers: { 'x-internal-secret': SECRET, 'x-clerk-user-id': userId },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
