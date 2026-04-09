'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export function BuyButton({ articleId, prix }: { articleId: number; prix: number }) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Une erreur est survenue')
        return
      }

      window.location.href = data.url
    } catch {
      toast.error('Impossible de lancer le paiement. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="w-full py-4 text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-50"
      style={{
        backgroundColor: 'var(--accent)',
        color: '#ffffff',
      }}
    >
      {loading ? 'Chargement…' : `Acheter ce sac — ${prix.toLocaleString('fr-FR')} €`}
    </button>
  )
}
