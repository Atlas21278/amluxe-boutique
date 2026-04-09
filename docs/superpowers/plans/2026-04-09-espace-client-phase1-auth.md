# Espace Client Phase 1 — Authentification Clerk

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter l'authentification Clerk (email + Google OAuth) à la boutique avec pages login/register, navbar mise à jour et dashboard client protégé.

**Architecture:** Clerk gère 100% l'auth (sessions, JWT, email verification, Google OAuth). La boutique ajoute `ClerkProvider` en root layout, un middleware qui protège `/compte/*`, et des pages login/register utilisant les composants Clerk prébuilt. La Navbar affiche un bouton "Se connecter" ou un avatar utilisateur selon l'état de connexion.

**Tech Stack:** `@clerk/nextjs` v5, Next.js 14 App Router, Tailwind CSS v3. Aucun changement dans AMLuxe pour cette phase.

---

## Fichiers à créer / modifier

| Action | Fichier | Rôle |
|--------|---------|------|
| Modifier | `app/layout.tsx` | Envelopper avec `ClerkProvider` |
| Créer | `middleware.ts` | Protéger `/compte/*` avec `clerkMiddleware` |
| Créer | `app/login/page.tsx` | Page connexion (composant `SignIn` Clerk) |
| Créer | `app/register/page.tsx` | Page inscription (composant `SignUp` Clerk) |
| Créer | `app/compte/layout.tsx` | Layout protégé — redirige vers /login si non connecté |
| Créer | `app/compte/page.tsx` | Dashboard client avec liens vers les 4 sections futures |
| Créer | `components/AuthButton.tsx` | Bouton "Se connecter" OU avatar utilisateur selon état |
| Modifier | `components/Navbar.tsx` | Intégrer `AuthButton` à droite du toggle dark mode |

---

## Task 1 : Installer Clerk + variables d'environnement

**Fichiers :**
- Modifier : `E:/amluxe-boutique/package.json` (via npm install)
- Modifier : `E:/amluxe-boutique/.env.local`
- Modifier : `E:/amluxe-boutique/.env.example`

- [ ] **Installer le SDK Clerk**

```bash
cd E:/amluxe-boutique
npm install @clerk/nextjs
```

- [ ] **Créer une application Clerk**

```
1. Ouvrir https://dashboard.clerk.com
2. "Create application" → nom : "AMLuxe Boutique"
3. Activer : Email + Google
4. Copier les clés depuis "API Keys"
```

- [ ] **Ajouter les variables dans `.env.local`**

```bash
# Ajouter dans E:/amluxe-boutique/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/compte
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/compte
```

- [ ] **Mettre à jour `.env.example`**

```bash
# Ajouter dans E:/amluxe-boutique/.env.example
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/compte
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/compte
```

- [ ] **Vérifier que le projet compile**

```bash
cd E:/amluxe-boutique
npm run build
# Attendu : ✓ Compiled successfully
```

- [ ] **Commit**

```bash
cd E:/amluxe-boutique
git add package.json package-lock.json .env.example
git commit -m "feat: installer @clerk/nextjs"
```

---

## Task 2 : ClerkProvider dans le root layout + middleware

**Fichiers :**
- Modifier : `E:/amluxe-boutique/app/layout.tsx`
- Créer : `E:/amluxe-boutique/middleware.ts`

- [ ] **Modifier `app/layout.tsx`** pour envelopper avec ClerkProvider

```tsx
// E:/amluxe-boutique/app/layout.tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'La Boutique — Sacs de luxe',
  description: 'Découvrez notre sélection de sacs de luxe certifiés authentiques.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Créer `middleware.ts`** à la racine du projet

```ts
// E:/amluxe-boutique/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/compte(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- [ ] **Vérifier le build**

```bash
cd E:/amluxe-boutique
npm run build
# Attendu : ✓ Compiled successfully
```

- [ ] **Commit**

```bash
cd E:/amluxe-boutique
git add app/layout.tsx middleware.ts
git commit -m "feat: ClerkProvider root layout + middleware protection /compte"
```

---

## Task 3 : Pages login et register

**Fichiers :**
- Créer : `E:/amluxe-boutique/app/login/page.tsx`
- Créer : `E:/amluxe-boutique/app/register/page.tsx`

- [ ] **Créer `app/login/page.tsx`**

```tsx
// E:/amluxe-boutique/app/login/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <p
          className="text-xs tracking-widest uppercase text-center mb-8"
          style={{ color: 'var(--accent)' }}
        >
          La Boutique
        </p>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border rounded-sm w-full',
              headerTitle: 'font-serif',
            },
          }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Créer `app/register/page.tsx`**

```tsx
// E:/amluxe-boutique/app/register/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <p
          className="text-xs tracking-widest uppercase text-center mb-8"
          style={{ color: 'var(--accent)' }}
        >
          La Boutique
        </p>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border rounded-sm w-full',
              headerTitle: 'font-serif',
            },
          }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Vérifier le build**

```bash
cd E:/amluxe-boutique
npm run build
# Attendu : ✓ Compiled successfully
```

- [ ] **Commit**

```bash
cd E:/amluxe-boutique
git add app/login/page.tsx app/register/page.tsx
git commit -m "feat: pages login et register avec composants Clerk"
```

---

## Task 4 : Dashboard client /compte

**Fichiers :**
- Créer : `E:/amluxe-boutique/app/compte/layout.tsx`
- Créer : `E:/amluxe-boutique/app/compte/page.tsx`

- [ ] **Créer `app/compte/layout.tsx`**

```tsx
// E:/amluxe-boutique/app/compte/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function CompteLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/login')
  return <>{children}</>
}
```

- [ ] **Créer `app/compte/page.tsx`**

```tsx
// E:/amluxe-boutique/app/compte/page.tsx
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

const SECTIONS = [
  {
    href: '/compte/commandes',
    icon: '📦',
    titre: 'Mes commandes',
    description: 'Historique de vos achats et suivi',
  },
  {
    href: '/compte/adresses',
    icon: '📍',
    titre: 'Mes adresses',
    description: 'Adresses de livraison sauvegardées',
  },
  {
    href: '/compte/favoris',
    icon: '❤️',
    titre: 'Mes favoris',
    description: 'Articles mis de côté',
  },
  {
    href: '/compte/alertes',
    icon: '🔔',
    titre: 'Mes alertes',
    description: 'Notifications nouveaux articles',
  },
]

export default async function ComptePage() {
  const user = await currentUser()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
        Mon espace
      </p>
      <h1 className="font-serif text-3xl mb-2" style={{ color: 'var(--text)' }}>
        Bonjour, {user?.firstName ?? 'vous'} 👋
      </h1>
      <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
        {user?.emailAddresses[0]?.emailAddress}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex items-start gap-4 border rounded-sm p-6 transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 2px 8px var(--shadow)',
            }}
          >
            <span className="text-2xl">{section.icon}</span>
            <div>
              <p className="font-serif text-base mb-1" style={{ color: 'var(--text)' }}>
                {section.titre}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Vérifier le build**

```bash
cd E:/amluxe-boutique
npm run build
# Attendu : ✓ Compiled successfully
```

- [ ] **Commit**

```bash
cd E:/amluxe-boutique
git add app/compte/layout.tsx app/compte/page.tsx
git commit -m "feat: dashboard client /compte avec 4 sections"
```

---

## Task 5 : AuthButton + Navbar mise à jour

**Fichiers :**
- Créer : `E:/amluxe-boutique/components/AuthButton.tsx`
- Modifier : `E:/amluxe-boutique/components/Navbar.tsx`

- [ ] **Créer `components/AuthButton.tsx`**

```tsx
// E:/amluxe-boutique/components/AuthButton.tsx
'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export function AuthButton() {
  const { isLoaded, isSignedIn, user } = useUser()
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
            <SignOutButton redirectUrl="/">
              <button className="w-full text-left px-4 py-2 text-xs tracking-wide hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                Se déconnecter
              </button>
            </SignOutButton>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Modifier `components/Navbar.tsx`** pour intégrer AuthButton

```tsx
// E:/amluxe-boutique/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { AuthButton } from '@/components/AuthButton'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{ backgroundColor: 'var(--bg-nav)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-lg tracking-widest uppercase"
          style={{ color: 'var(--text)' }}
        >
          La Boutique
        </Link>

        {/* Liens */}
        <div className="hidden sm:flex items-center gap-8">
          {[
            { href: '/', label: 'Collection' },
            { href: '/a-propos', label: 'À propos' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs tracking-widest uppercase transition-colors hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Droite : dark mode + auth */}
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Changer le thème"
              className="p-2 rounded-full transition-colors hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}
          {mounted && <AuthButton />}
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Vérifier le build**

```bash
cd E:/amluxe-boutique
npm run build
# Attendu : ✓ Compiled successfully
```

- [ ] **Commit**

```bash
cd E:/amluxe-boutique
git add components/AuthButton.tsx components/Navbar.tsx
git commit -m "feat: AuthButton (login/avatar dropdown) + Navbar mise à jour"
```

---

## Task 6 : Configuration Google OAuth dans Clerk + Railway

- [ ] **Activer Google OAuth dans Clerk Dashboard**

```
1. dashboard.clerk.com → ton app → "User & Authentication" → "Social connections"
2. Activer Google → cliquer "Enable"
3. Mode "Use Clerk credentials" (pas besoin de Google Cloud Console en mode test)
   → En production : créer un projet Google Cloud + OAuth credentials
```

- [ ] **Ajouter les variables Clerk dans Railway (service boutique)**

```
Railway → service boutique → Variables :
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY                  = sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL     = /login
NEXT_PUBLIC_CLERK_SIGN_UP_URL     = /register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL  = /compte
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL  = /compte
```

- [ ] **Ajouter le domaine de production dans Clerk**

```
dashboard.clerk.com → ton app → "Domains"
→ Ajouter le domaine Railway de la boutique (ex: amluxe-boutique-staging.up.railway.app)
```

- [ ] **Push et vérifier le déploiement Railway**

```bash
cd E:/amluxe-boutique
git push origin master
# Attendre le déploiement Railway
# Tester : aller sur la boutique → "Se connecter" → bouton Google visible
```

---

## Checklist finale Phase 1

- [ ] `/login` accessible sans auth, affiche formulaire email + bouton Google
- [ ] `/register` accessible sans auth, affiche formulaire inscription + bouton Google
- [ ] `/compte` redirige vers `/login` si non connecté
- [ ] `/compte` affiche "Bonjour, [prénom]" si connecté
- [ ] Navbar : "Se connecter" si déconnecté, avatar + dropdown si connecté
- [ ] Déconnexion fonctionne et redirige vers `/`
- [ ] Build Railway sans erreur
