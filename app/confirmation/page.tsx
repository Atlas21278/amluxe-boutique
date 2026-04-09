import { Suspense } from 'react'
import { stripe } from '@/lib/stripe'
import Link from 'next/link'

async function ConfirmationContent({ sessionId }: { sessionId: string }) {
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Impossible de récupérer les détails de ta commande.
      </p>
    )
  }

  const montant = session.amount_total ? (session.amount_total / 100).toLocaleString('fr-FR') : '—'

  return (
    <div className="text-center space-y-4">
      <div
        className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#22c55e' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl" style={{ color: 'var(--text)' }}>
        Merci pour ton achat
      </h1>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Paiement de <strong>{montant} €</strong> confirmé.
      </p>
      <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
        Tu vas recevoir un email de confirmation Stripe. Nous te contacterons sous 24h pour organiser la livraison.
      </p>
    </div>
  )
}

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id

  return (
    <div className="max-w-lg mx-auto px-4 py-24">
      {!sessionId ? (
        <p style={{ color: 'var(--text-muted)' }}>Session introuvable.</p>
      ) : (
        <Suspense fallback={<p style={{ color: 'var(--text-muted)' }}>Vérification…</p>}>
          <ConfirmationContent sessionId={sessionId} />
        </Suspense>
      )}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase border-b pb-0.5 transition-opacity hover:opacity-60"
          style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
        >
          Retour à la collection
        </Link>
      </div>
    </div>
  )
}
