'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { ArticlePublic } from '@/types/article'

const ETAT_LABELS: Record<string, { label: string; color: string }> = {
  'Neuf':              { label: 'Neuf',              color: '#22c55e' },
  'Très bon état':     { label: 'Très bon état',     color: '#84cc16' },
  'Bon état':          { label: 'Bon état',           color: '#eab308' },
  'État correct':      { label: 'État correct',       color: '#f97316' },
}

export function ArticleCard({ article, delay = 0 }: { article: ArticlePublic; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const photo = article.photos[0] ?? null
  const etatInfo = ETAT_LABELS[article.etat] ?? { label: article.etat, color: 'var(--text-muted)' }

  return (
    <div
      ref={ref}
      className="fade-up"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Link
        href={`/sacs/${article.id}`}
        className="group block border rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          boxShadow: '0 2px 12px var(--shadow)',
        }}
      >
        {/* Photo */}
        <div
          className="aspect-square overflow-hidden relative"
          style={{ backgroundColor: 'var(--border)' }}
        >
          {photo ? (
            <Image
              src={photo}
              alt={`${article.marque} ${article.modele}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="p-4">
          <p
            className="text-xs tracking-widest uppercase mb-1"
            style={{ color: 'var(--accent)' }}
          >
            {article.marque}
          </p>
          <p
            className="font-serif text-base mb-3"
            style={{ color: 'var(--text)' }}
          >
            {article.modele}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: etatInfo.color }}>
              {etatInfo.label}
            </span>
            <span
              className="font-serif text-base font-medium"
              style={{ color: 'var(--text)' }}
            >
              {article.prixVente?.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
