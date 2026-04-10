import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET' : 'MISSING',
    CUSTOMER_API_SECRET: process.env.CUSTOMER_API_SECRET ? 'SET' : 'MISSING',
    NEXT_PUBLIC_AMLUXE_API_URL: process.env.NEXT_PUBLIC_AMLUXE_API_URL ?? 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
  })
}
