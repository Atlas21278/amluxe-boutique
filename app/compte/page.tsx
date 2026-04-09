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
