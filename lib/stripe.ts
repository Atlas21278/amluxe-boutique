import Stripe from 'stripe'

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY manquante')
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_, prop: string) {
    return getStripe()[prop as keyof Stripe]
  },
})
