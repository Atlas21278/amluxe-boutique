import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getArticle } from '@/lib/articles'

const BOUTIQUE_URL = process.env.NEXT_PUBLIC_BOUTIQUE_URL ?? 'http://localhost:3001'

export async function POST(req: NextRequest) {
  try {
    const { articleId } = await req.json()

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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(article.prixVente * 100),
            product_data: {
              name: `${article.marque} ${article.modele}`,
              description: article.etat,
              ...(images.length > 0 && { images }),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        articleId: String(articleId),
      },
      success_url: `${BOUTIQUE_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BOUTIQUE_URL}/annulation`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    const message = err instanceof Error ? err.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
