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

    // Vérifier que l'article est toujours disponible
    const article = await getArticle(articleId)
    if (!article) {
      return NextResponse.json(
        { error: "Ce sac n'est plus disponible." },
        { status: 409 }
      )
    }

    // Stripe n'accepte que des URLs publiques pour les images
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
