'use client'

import Image from 'next/image'
import { useState } from 'react'

export function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (photos.length === 0) {
    return (
      <div
        className="aspect-square rounded-sm flex items-center justify-center"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
    )
  }

  return (
    <>
      {/* Photo principale */}
      <div
        className="aspect-square relative rounded-sm overflow-hidden cursor-zoom-in"
        style={{ backgroundColor: 'var(--border)' }}
        onClick={() => setLightbox(true)}
      >
        <Image
          src={photos[selected]}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
        />
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {selected + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Miniatures */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-all ${
                i === selected ? 'opacity-100' : 'opacity-50 hover:opacity-75'
              }`}
              style={{ borderColor: i === selected ? 'var(--accent)' : 'transparent' }}
            >
              <Image
                src={photo}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-full mx-4">
            <Image
              src={photos[selected]}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setLightbox(false)}
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
