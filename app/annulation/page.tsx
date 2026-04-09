import Link from 'next/link'

export default function AnnulationPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div
        className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl mb-4" style={{ color: 'var(--text)' }}>
        Paiement annulé
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
        Tu as annulé le paiement. Le sac est toujours disponible si tu changes d&apos;avis.
      </p>
      <Link
        href="/"
        className="inline-block border px-8 py-3 text-xs tracking-widest uppercase transition-all hover:opacity-70"
        style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
      >
        Retour à la collection
      </Link>
    </div>
  )
}
