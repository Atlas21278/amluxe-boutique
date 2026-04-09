export default function AProposPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
      <p className="text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--accent)' }}>
        À propos
      </p>
      <h1 className="font-serif text-4xl mb-10" style={{ color: 'var(--text)' }}>
        Notre histoire
      </h1>
      <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <p>
          Passionné(e) par les sacs de luxe, je sélectionne des pièces d&apos;exception auprès de fournisseurs de confiance pour vous les proposer à des prix justes.
        </p>
        <p>
          Chaque pièce est minutieusement inspectée et son authenticité vérifiée avant d&apos;être mise en vente. Hermès, Chanel, Louis Vuitton, Dior — uniquement des maisons reconnues.
        </p>
        <p>
          La livraison est organisée personnellement et assurée. Pour toute question, contactez-nous directement.
        </p>
      </div>
    </div>
  )
}
