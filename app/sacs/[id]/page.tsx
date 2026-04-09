import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticle, getArticles } from '@/lib/articles'
import { PhotoGallery } from '@/components/PhotoGallery'
import { BuyButton } from '@/components/BuyButton'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((a) => ({ id: String(a.id) }))
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(parseInt(params.id))
  if (!article) return { title: 'Article non disponible' }
  return {
    title: `${article.marque} ${article.modele} — La Boutique`,
    description: `${article.etat} · ${article.prixVente?.toLocaleString('fr-FR')} €`,
  }
}

const ETAT_COLORS: Record<string, string> = {
  'Neuf':          '#22c55e',
  'Très bon état': '#84cc16',
  'Bon état':      '#eab308',
  'État correct':  '#f97316',
}

export default async function FicheProduit({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const article = await getArticle(id)
  if (!article) notFound()

  const etatColor = ETAT_COLORS[article.etat] ?? 'var(--text-muted)'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Retour */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-10 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Galerie */}
        <div>
          <PhotoGallery photos={article.photos} alt={`${article.marque} ${article.modele}`} />
        </div>

        {/* Infos */}
        <div className="flex flex-col">
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: 'var(--accent)' }}
          >
            {article.marque}
          </p>
          <h1
            className="font-serif text-3xl sm:text-4xl mb-6"
            style={{ color: 'var(--text)' }}
          >
            {article.modele}
          </h1>

          {/* Prix */}
          <p
            className="font-serif text-2xl mb-6"
            style={{ color: 'var(--text)' }}
          >
            {article.prixVente?.toLocaleString('fr-FR')} €
          </p>

          {/* État */}
          <div
            className="inline-flex items-center gap-2 text-xs tracking-wider uppercase px-3 py-1.5 rounded-sm mb-6 self-start border"
            style={{ borderColor: etatColor, color: etatColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: etatColor }} />
            {article.etat}
          </div>

          {/* Notes / description */}
          {article.notes && (
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: 'var(--text-muted)' }}
            >
              {article.notes}
            </p>
          )}

          {/* Livraison */}
          <div
            className="rounded-sm border p-4 mb-6 space-y-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
              Livraison
            </p>
            {[
              { icon: '📦', label: 'Colissimo suivi + assuré jusqu\'à 1500€', detail: 'France métropolitaine' },
              { icon: '⏱', label: 'Expédition sous 24–48h', detail: 'Après confirmation du paiement' },
              { icon: '🔒', label: 'Emballage sécurisé discret', detail: 'Adapté aux articles de valeur' },
            ].map(({ icon, label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-base">{icon}</span>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{detail}</p>
                </div>
              </div>
            ))}
            <div
              className="mt-3 pt-3 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Frais de port</span>
              <span className="font-serif text-sm" style={{ color: 'var(--text)' }}>18 €</span>
            </div>
          </div>

          <div className="border-t pt-8 mt-auto" style={{ borderColor: 'var(--border)' }}>
            <BuyButton articleId={article.id} prix={article.prixVente ?? 0} />

            <p
              className="text-xs text-center mt-4"
              style={{ color: 'var(--text-muted)' }}
            >
              Paiement sécurisé Stripe · Livraison Colissimo assuré incluse
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
