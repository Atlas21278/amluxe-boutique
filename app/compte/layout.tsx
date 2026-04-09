import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function CompteLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  return <>{children}</>
}
