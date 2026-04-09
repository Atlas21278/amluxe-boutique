'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AuthButton() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (!isLoaded) return null

  if (!isSignedIn) {
    return (
      <Link
        href="/login"
        className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70 border px-3 py-1.5"
        style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
      >
        Se connecter
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 transition-opacity hover:opacity-70"
        aria-label="Mon compte"
      >
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.firstName ?? 'Avatar'}
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {user.firstName?.[0] ?? user.emailAddresses[0]?.emailAddress[0] ?? '?'}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-10 z-50 w-48 border rounded-sm shadow-lg py-1"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <Link
              href="/compte"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs tracking-wide hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text)' }}
            >
              Mon compte
            </Link>
            <Link
              href="/compte/commandes"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs tracking-wide hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text)' }}
            >
              Mes commandes
            </Link>
            <Link
              href="/compte/favoris"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs tracking-wide hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text)' }}
            >
              Mes favoris
            </Link>
            <div className="border-t my-1" style={{ borderColor: 'var(--border)' }} />
            <button
              onClick={() => signOut(() => router.push('/'))}
              className="w-full text-left px-4 py-2 text-xs tracking-wide hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  )
}
