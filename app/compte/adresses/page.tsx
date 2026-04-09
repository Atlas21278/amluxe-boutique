'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CustomerAddress {
  id: number
  nom: string
  prenom: string
  adresse: string
  ville: string
  codePostal: string
  telephone: string
  defaut: boolean
}

const EMPTY_FORM = {
  nom: '',
  prenom: '',
  adresse: '',
  ville: '',
  codePostal: '',
  telephone: '',
  defaut: false,
}

export default function AdressesPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchAddresses() {
    setLoading(true)
    try {
      const res = await fetch('/api/addresses')
      if (res.ok) setAddresses(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAddresses() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "Erreur lors de l'ajout")
        return
      }
      setForm(EMPTY_FORM)
      setShowForm(false)
      await fetchAddresses()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleSetDefault(id: number) {
    await fetch(`/api/addresses/${id}/defaut`, { method: 'PUT' })
    await fetchAddresses()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <Link
        href="/compte"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-10 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Mon compte
      </Link>

      <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
        Livraison
      </p>
      <div className="flex items-end justify-between mb-10">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--text)' }}>
          Mes adresses
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            + Ajouter
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border rounded-sm p-6 mb-8 space-y-4"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
            Nouvelle adresse
          </p>

          {error && (
            <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'prenom', label: 'Prénom' },
              { key: 'nom', label: 'Nom' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </label>
                <input
                  type="text"
                  required
                  value={form[key as keyof typeof EMPTY_FORM] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-transparent border-b py-2 text-sm outline-none transition-colors focus:border-current"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Adresse
            </label>
            <input
              type="text"
              required
              value={form.adresse}
              onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
              className="w-full bg-transparent border-b py-2 text-sm outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'codePostal', label: 'Code postal' },
              { key: 'ville', label: 'Ville' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </label>
                <input
                  type="text"
                  required
                  value={form[key as keyof typeof EMPTY_FORM] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-transparent border-b py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Téléphone
            </label>
            <input
              type="tel"
              required
              value={form.telephone}
              onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
              className="w-full bg-transparent border-b py-2 text-sm outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="defaut"
              type="checkbox"
              checked={form.defaut}
              onChange={(e) => setForm((f) => ({ ...f, defaut: e.target.checked }))}
              className="w-3 h-3"
            />
            <label htmlFor="defaut" className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Définir comme adresse par défaut
            </label>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ color: 'var(--accent)' }}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); setForm(EMPTY_FORM) }}
              className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
              style={{ color: 'var(--text-muted)' }}
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border rounded-sm p-6 animate-pulse"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <div className="h-4 rounded w-1/3 mb-2" style={{ backgroundColor: 'var(--border)' }} />
              <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--border)' }} />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div
          className="border rounded-sm p-12 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Aucune adresse sauvegardée.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)' }}
          >
            Ajouter une adresse
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border rounded-sm p-6"
              style={{
                borderColor: address.defaut ? 'var(--accent)' : 'var(--border)',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {address.defaut && (
                    <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
                      Adresse par défaut
                    </p>
                  )}
                  <p className="font-serif text-base mb-1" style={{ color: 'var(--text)' }}>
                    {address.prenom} {address.nom}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {address.adresse}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {address.codePostal} {address.ville}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {address.telephone}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {!address.defaut && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
                      style={{ color: 'var(--accent)' }}
                    >
                      Par défaut
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
