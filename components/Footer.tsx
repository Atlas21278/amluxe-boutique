export function Footer() {
  return (
    <footer
      className="mt-24 border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p
          className="font-serif text-sm tracking-widest uppercase"
          style={{ color: 'var(--accent)' }}
        >
          La Boutique
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Sacs de luxe certifiés authentiques · Paiement sécurisé Stripe
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
