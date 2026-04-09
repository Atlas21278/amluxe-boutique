export default function AProposPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
      <p className="text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--accent)' }}>
        À propos
      </p>
      <h1 className="font-serif text-4xl mb-12" style={{ color: 'var(--text)' }}>
        Des pièces d&apos;exception,<br />sourcées au Japon
      </h1>

      <div className="space-y-10 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>

        <section>
          <h2 className="font-serif text-lg mb-3" style={{ color: 'var(--text)' }}>Pourquoi le Japon ?</h2>
          <p>
            Le Japon est reconnu dans le monde entier comme l&apos;une des meilleures sources de maroquinerie de luxe d&apos;occasion. La culture japonaise accorde une importance extrême au soin des objets — les sacs y sont conservés dans leur boîte d&apos;origine, avec factures, dustbag et accessoires, souvent portés très peu de fois.
          </p>
          <p className="mt-3">
            Les grandes villes comme Tokyo, Osaka et Kyoto abritent des revendeurs spécialisés de luxe (recycle shops) qui appliquent des standards de vérification rigoureux. C&apos;est dans ces circuits que nous sourçons nos pièces.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg mb-3" style={{ color: 'var(--text)' }}>Authenticité garantie par la loi japonaise</h2>
          <p>
            Au Japon, la revente de produits contrefaits est sévèrement encadrée par la <strong style={{ color: 'var(--text)' }}>Loi sur les marques (商標法, Shōhyō-hō)</strong> et la <strong style={{ color: 'var(--text)' }}>Loi sur la concurrence déloyale (不正競争防止法)</strong>. Tout commerce de produits contrefaits est passible de poursuites pénales.
          </p>
          <p className="mt-3">
            Les revendeurs professionnels japonais sont par ailleurs soumis à la <strong style={{ color: 'var(--text)' }}>Loi sur les antiquités (古物営業法, Kobutsu Eigyō-hō)</strong>, qui oblige tout acteur du marché de l&apos;occasion à obtenir une licence délivrée par la préfecture de police. Ce cadre légal strict est une garantie supplémentaire que les pièces en circulation sont authentiques.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg mb-3" style={{ color: 'var(--text)' }}>Notre processus de sélection</h2>
          <p>
            Chaque pièce est sourcée personnellement auprès de revendeurs certifiés au Japon, puis inspectée à la réception en France :
          </p>
          <ul className="mt-3 space-y-2">
            {[
              'Vérification des coutures, ferrures et matières',
              'Contrôle des numéros de série et codes date',
              'Authentification des dustbags, boîtes et accessoires',
              'Documentation photographique complète avant mise en vente',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg mb-3" style={{ color: 'var(--text)' }}>Les maisons que nous proposons</h2>
          <p>
            Hermès, Chanel, Louis Vuitton, Dior, Celine, Bottega Veneta, Gucci, Prada — uniquement des maisons de la haute maroquinerie française et italienne, reconnues pour la durabilité et la valeur patrimoniale de leurs créations.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg mb-3" style={{ color: 'var(--text)' }}>Livraison & contact</h2>
          <p>
            Chaque envoi est soigneusement emballé et expédié en colissimo assuré. Nous organisons la livraison personnellement après chaque achat et vous contactons sous 24h pour convenir des modalités.
          </p>
          <p className="mt-3">
            Pour toute question avant achat, n&apos;hésitez pas à nous contacter directement.
          </p>
        </section>

      </div>
    </div>
  )
}
