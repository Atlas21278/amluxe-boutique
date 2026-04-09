import { getArticles } from '@/lib/articles'
import { ArticleCard } from '@/components/ArticleCard'

export const revalidate = 60

export default async function HomePage() {
  const articles = await getArticles()

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <p
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: 'var(--accent)' }}
        >
          Collection authentifiée
        </p>
        <h1
          className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
          style={{ color: 'var(--text)' }}
        >
          Pièces d&apos;exception,
          <br />
          <em style={{ color: 'var(--accent)' }}>authenticité garantie</em>
        </h1>
        <p
          className="text-sm tracking-wide max-w-md mx-auto mb-10"
          style={{ color: 'var(--text-muted)' }}
        >
          Sacs de luxe sélectionnés avec soin · Paiement 100% sécurisé · Livraison assurée
        </p>
        <a
          href="#collection"
          className="inline-block border px-8 py-3 text-xs tracking-widest uppercase transition-all duration-300 hover:opacity-70"
          style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
        >
          Découvrir la collection
        </a>
      </section>

      {/* Séparateur */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
      </div>

      {/* Grille articles */}
      <section id="collection" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <p
          className="text-xs tracking-widest uppercase mb-10 text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          {articles.length} pièce{articles.length !== 1 ? 's' : ''} disponible{articles.length !== 1 ? 's' : ''}
        </p>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p
              className="font-serif text-xl mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              Aucune pièce disponible pour le moment
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Revenez bientôt — de nouvelles pièces arrivent régulièrement.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                delay={i * 80}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
