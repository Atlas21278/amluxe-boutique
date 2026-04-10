# Espace Client Phase 2 — Historique des commandes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lier les paiements Stripe aux comptes Clerk pour afficher l'historique des commandes sur `/compte/commandes`.

**Architecture:** La boutique envoie le `clerkUserId` dans les métadonnées Stripe au moment du checkout. Le webhook AMLuxe crée un enregistrement `CustomerOrder` après paiement. La page `/compte/commandes` dans la boutique appelle `GET /api/customer/orders` sur AMLuxe via un secret interne partagé. AMLuxe vérifie ce secret (pas de Clerk dans AMLuxe — trop lourd) et retourne les commandes du user.

**Tech Stack:** Prisma + PostgreSQL (AMLuxe), @clerk/nextjs v4 (boutique), shared `CUSTOMER_API_SECRET` entre les deux apps, Stripe metadata.

---

## Fichiers à créer / modifier

| Action | Fichier | Rôle |
|--------|---------|------|
| Modifier | `E:/AMLuxe/prisma/schema.prisma` | Ajouter model CustomerOrder |
| Créer | `E:/AMLuxe/prisma/migrations/...` | Migration auto-générée |
| Modifier | `E:/AMLuxe/middleware.ts` | Exclure `/api/customer/*` du NextAuth |
| Créer | `E:/AMLuxe/app/api/customer/orders/route.ts` | GET commandes d'un user (auth: secret interne) |
| Modifier | `E:/AMLuxe/app/api/webhooks/stripe/route.ts` | Créer CustomerOrder après paiement |
| Modifier | `E:/AMLuxe/.env.local` | Ajouter CUSTOMER_API_SECRET |
| Modifier | `E:/amluxe-boutique/components/BuyButton.tsx` | Envoyer clerkUserId au checkout |
| Modifier | `E:/amluxe-boutique/app/api/checkout/route.ts` | Ajouter clerkUserId + prix dans metadata Stripe |
| Créer | `E:/amluxe-boutique/app/compte/commandes/page.tsx` | Page historique commandes |
| Modifier | `E:/amluxe-boutique/.env.local` | Ajouter CUSTOMER_API_SECRET |
| Modifier | `E:/amluxe-boutique/.env.example` | Ajouter CUSTOMER_API_SECRET |

---

## Task 1 : CustomerOrder Prisma model + migration (AMLuxe)

**Fichiers :**
- Modifier : `E:/AMLuxe/prisma/schema.prisma`
- Créer : migration auto-générée

- [ ] **Lire le fichier `E:/AMLuxe/prisma/schema.prisma`** pour voir la structure existante (8 modèles déjà présents : Commande, Article, etc.)

- [ ] **Ajouter le model CustomerOrder à la fin de `E:/AMLuxe/prisma/schema.prisma`**

```prisma
model CustomerOrder {
  id              Int      @id @default(autoincrement())
  clerkUserId     String
  articleId       Int
  marque          String
  modele          String
  prixArticle     Float
  prixLivraison   Float
  stripeSessionId String   @unique
  createdAt       DateTime @default(now())

  @@index([clerkUserId])
}
```

- [ ] **Lancer la migration**

```bash
cd E:/AMLuxe
npx prisma migrate dev --name customer-order
```

Attendu : `✓ Your database is now in sync with your schema.`

- [ ] **Vérifier que le client Prisma est régénéré**

```bash
cd E:/AMLuxe
npx prisma generate
```

Attendu : `✓ Generated Prisma Client`

- [ ] **Vérifier que le build compile**

```bash
cd E:/AMLuxe
npm run build
```

Attendu : `✓ Compiled successfully`

- [ ] **Commit**

```bash
cd E:/AMLuxe
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: model CustomerOrder + migration"
```

---

## Task 2 : GET /api/customer/orders (AMLuxe)

**Fichiers :**
- Modifier : `E:/AMLuxe/middleware.ts`
- Créer : `E:/AMLuxe/app/api/customer/orders/route.ts`
- Modifier : `E:/AMLuxe/.env.local`

- [ ] **Lire `E:/AMLuxe/middleware.ts`** pour voir le matcher existant

Le matcher actuel exclut déjà `api/public` et `api/webhooks`. Il faut aussi exclure `api/customer`.

- [ ] **Modifier `E:/AMLuxe/middleware.ts`**

```ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/((?!login|mot-de-passe-oublie|api/auth|api/public|api/webhooks|api/customer|_next/static|_next/image|favicon\\.ico).*)'],
}
```

- [ ] **Ajouter CUSTOMER_API_SECRET dans `E:/AMLuxe/.env.local`**

```bash
# Ajouter dans E:/AMLuxe/.env.local
CUSTOMER_API_SECRET=amluxe-customer-internal-2026
```

- [ ] **Créer `E:/AMLuxe/app/api/customer/orders/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (!secret || secret !== process.env.CUSTOMER_API_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const clerkUserId = req.headers.get('x-clerk-user-id')
  if (!clerkUserId) {
    return NextResponse.json({ error: 'clerkUserId requis' }, { status: 400 })
  }

  const orders = await prisma.customerOrder.findMany({
    where: { clerkUserId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
```

- [ ] **Vérifier le build**

```bash
cd E:/AMLuxe
npm run build
```

Attendu : `✓ Compiled successfully`

- [ ] **Commit**

```bash
cd E:/AMLuxe
git add middleware.ts app/api/customer/orders/route.ts .env.local
git commit -m "feat: GET /api/customer/orders avec secret interne"
```

**Note :** Ne pas commiter `.env.local` — enlever du `git add` si git refuse (il devrait être dans `.gitignore`).

---

## Task 3 : Webhook crée CustomerOrder (AMLuxe)

**Fichiers :**
- Modifier : `E:/AMLuxe/app/api/webhooks/stripe/route.ts`

Le webhook actuel reçoit `checkout.session.completed`, lit `articleId` depuis `session.metadata`, met à jour l'article en `Vendu`. Il faut maintenant aussi créer un `CustomerOrder` si `clerkUserId` est présent dans les metadata.

Les metadata Stripe contiendront (après Task 5 côté boutique) :
- `articleId` — déjà présent
- `clerkUserId` — nouveau
- `prixArticle` — nouveau (prix de l'article seul, sans livraison)
- `prixLivraison` — nouveau

- [ ] **Lire `E:/AMLuxe/app/api/webhooks/stripe/route.ts`** pour voir le code existant

- [ ] **Modifier le handler `checkout.session.completed`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook Stripe invalide:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const articleId = session.metadata?.articleId
    if (!articleId) {
      console.error('Webhook Stripe : articleId manquant dans metadata')
      return NextResponse.json({ error: 'articleId manquant' }, { status: 400 })
    }

    const id = parseInt(articleId)
    const prixVenteReel = session.amount_total ? session.amount_total / 100 : null

    // Récupérer l'article pour CustomerOrder avant la mise à jour
    const article = await prisma.article.findUnique({ where: { id } })

    await prisma.article.update({
      where: { id },
      data: {
        statut: 'Vendu',
        prixVenteReel,
        dateVente: new Date(),
      },
    })

    await logAudit('UPDATE', 'article', id, 'stripe@webhook', { statut: 'Vendu', prixVenteReel, source: 'stripe-webhook' })

    // Créer CustomerOrder si clerkUserId présent
    const clerkUserId = session.metadata?.clerkUserId
    if (clerkUserId && article) {
      const prixArticle = session.metadata?.prixArticle
        ? parseFloat(session.metadata.prixArticle)
        : (article.prixVente ?? 0)
      const prixLivraison = session.metadata?.prixLivraison
        ? parseFloat(session.metadata.prixLivraison)
        : 0

      await prisma.customerOrder.create({
        data: {
          clerkUserId,
          articleId: id,
          marque: article.marque,
          modele: article.modele,
          prixArticle,
          prixLivraison,
          stripeSessionId: session.id,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Vérifier le build**

```bash
cd E:/AMLuxe
npm run build
```

Attendu : `✓ Compiled successfully`

- [ ] **Commit**

```bash
cd E:/AMLuxe
git add app/api/webhooks/stripe/route.ts
git commit -m "feat: webhook crée CustomerOrder après paiement Stripe"
```

- [ ] **Push AMLuxe vers develop**

```bash
cd E:/AMLuxe
git push origin develop
```

---

## Task 4 : BuyButton envoie clerkUserId + Checkout forward metadata (Boutique)

**Fichiers :**
- Modifier : `E:/amluxe-boutique/components/BuyButton.tsx`
- Modifier : `E:/amluxe-boutique/app/api/checkout/route.ts`

### BuyButton.tsx

Le `BuyButton` actuel envoie seulement `{ articleId }`. Il faut aussi envoyer `clerkUserId` (peut être null si non connecté — dans ce cas pas de CustomerOrder).

- [ ] **Lire `E:/amluxe-boutique/components/BuyButton.tsx`** pour voir le code existant

- [ ] **Remplacer `E:/amluxe-boutique/components/BuyButton.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

export function BuyButton({ articleId, prix }: { articleId: number; prix: number }) {
  const [loading, setLoading] = useState(false)
  const { userId } = useAuth()

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, clerkUserId: userId ?? null }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Une erreur est survenue')
        return
      }

      window.location.href = data.url
    } catch {
      toast.error('Impossible de lancer le paiement. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="w-full py-4 text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50"
      style={{
        backgroundColor: 'var(--accent)',
        color: '#ffffff',
      }}
    >
      {loading ? 'Chargement…' : `Acheter ce sac — ${prix.toLocaleString('fr-FR')} €`}
    </button>
  )
}
```

### checkout/route.ts

- [ ] **Lire `E:/amluxe-boutique/app/api/checkout/route.ts`** pour voir le code existant

Le checkout actuel lit `{ articleId }` depuis le body et crée une session Stripe avec `metadata: { articleId }`. Il faut lire `clerkUserId` depuis le body et l'ajouter aux metadata si présent.

- [ ] **Modifier `E:/amluxe-boutique/app/api/checkout/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getArticle } from '@/lib/articles'
import { getShipping } from '@/lib/shipping'

function getBoutiqueUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BOUTIQUE_URL ?? 'http://localhost:3001'
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `https://${raw}`
}

export async function POST(req: NextRequest) {
  try {
    const { articleId, clerkUserId } = await req.json()

    if (!articleId || typeof articleId !== 'number') {
      return NextResponse.json({ error: 'articleId requis' }, { status: 400 })
    }

    const article = await getArticle(articleId)
    if (!article) {
      return NextResponse.json(
        { error: "Ce sac n'est plus disponible." },
        { status: 409 }
      )
    }

    const images = article.photos
      .slice(0, 1)
      .filter((url) => url.startsWith('https://'))

    const shipping = getShipping(article.prixVente ?? 0)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round((article.prixVente ?? 0) * 100),
            product_data: {
              name: `${article.marque} ${article.modele}`,
              description: article.etat,
              ...(images.length > 0 && { images }),
            },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'eur',
            unit_amount: shipping.prix * 100,
            product_data: {
              name: 'Livraison Colissimo',
              description: `France métropolitaine · ${shipping.label} ${shipping.couverture}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        articleId: String(articleId),
        ...(clerkUserId && typeof clerkUserId === 'string' && {
          clerkUserId,
          prixArticle: String(article.prixVente ?? 0),
          prixLivraison: String(shipping.prix),
        }),
      },
      success_url: `${getBoutiqueUrl()}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getBoutiqueUrl()}/annulation`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    const message = err instanceof Error ? err.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

- [ ] **Vérifier le build**

```bash
cd E:/amluxe-boutique
npm run build
```

Attendu : `✓ Compiled successfully`

- [ ] **Commit**

```bash
cd E:/amluxe-boutique
git add components/BuyButton.tsx app/api/checkout/route.ts
git commit -m "feat: checkout transmet clerkUserId dans metadata Stripe"
```

---

## Task 5 : Page /compte/commandes (Boutique)

**Fichiers :**
- Créer : `E:/amluxe-boutique/app/compte/commandes/page.tsx`
- Modifier : `E:/amluxe-boutique/.env.local`
- Modifier : `E:/amluxe-boutique/.env.example`

- [ ] **Ajouter CUSTOMER_API_SECRET dans `E:/amluxe-boutique/.env.local`**

```bash
# Ajouter dans E:/amluxe-boutique/.env.local
CUSTOMER_API_SECRET=amluxe-customer-internal-2026
```

La valeur doit être identique à celle dans `E:/AMLuxe/.env.local`.

- [ ] **Ajouter CUSTOMER_API_SECRET dans `E:/amluxe-boutique/.env.example`**

```bash
# Ajouter dans E:/amluxe-boutique/.env.example
CUSTOMER_API_SECRET=amluxe-customer-internal-...
```

- [ ] **Créer `E:/amluxe-boutique/app/compte/commandes/page.tsx`**

```tsx
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

interface CustomerOrder {
  id: number
  articleId: number
  marque: string
  modele: string
  prixArticle: number
  prixLivraison: number
  stripeSessionId: string
  createdAt: string
}

export default async function CommandesPage() {
  const { userId } = await auth()

  let orders: CustomerOrder[] = []

  if (userId) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AMLUXE_API_URL}/api/customer/orders`,
        {
          headers: {
            'x-internal-secret': process.env.CUSTOMER_API_SECRET!,
            'x-clerk-user-id': userId,
          },
          cache: 'no-store',
        }
      )
      if (res.ok) orders = await res.json()
    } catch {
      // API indisponible — on affiche une liste vide
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <Link
        href="/compte"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-10 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Mon compte
      </Link>

      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
        Historique
      </p>
      <h1 className="font-serif text-3xl mb-10" style={{ color: 'var(--text)' }}>
        Mes commandes
      </h1>

      {orders.length === 0 ? (
        <div
          className="border rounded-sm p-12 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Aucune commande pour le moment.
          </p>
          <Link
            href="/"
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            Voir la collection
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-sm p-6"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="font-serif text-lg mb-1"
                    style={{ color: 'var(--text)' }}
                  >
                    {order.marque} {order.modele}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="font-serif text-base"
                    style={{ color: 'var(--text)' }}
                  >
                    {(order.prixArticle + order.prixLivraison).toLocaleString('fr-FR')} €
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    dont {order.prixLivraison} € de livraison
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Vérifier le build**

```bash
cd E:/amluxe-boutique
npm run build
```

Attendu : `✓ Compiled successfully`

- [ ] **Commit**

```bash
cd E:/amluxe-boutique
git add app/compte/commandes/page.tsx .env.example
git commit -m "feat: page /compte/commandes — historique achats"
```

- [ ] **Push boutique**

```bash
cd E:/amluxe-boutique
git push origin master
```

---

## Checklist finale Phase 2

- [ ] Model `CustomerOrder` dans Prisma schema + migration AMLuxe ✓
- [ ] `GET /api/customer/orders` route dans AMLuxe (secret interne) ✓
- [ ] Webhook crée `CustomerOrder` si `clerkUserId` dans metadata ✓
- [ ] `BuyButton` envoie `clerkUserId` (null si non connecté) ✓
- [ ] Checkout route ajoute `clerkUserId + prixArticle + prixLivraison` aux metadata Stripe ✓
- [ ] Page `/compte/commandes` affiche la liste des achats ✓
- [ ] Build AMLuxe et boutique OK ✓
- [ ] Builds pushés ✓

## Note Railway (à faire manuellement après les builds)

Dans Railway, ajouter la variable `CUSTOMER_API_SECRET` dans **les deux services** (AMLuxe staging + boutique staging) avec la même valeur. En production, utiliser une valeur aléatoire forte (ex: `openssl rand -hex 32`).
