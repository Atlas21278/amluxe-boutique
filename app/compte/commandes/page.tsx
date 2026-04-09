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
      // API indisponible — liste vide
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
