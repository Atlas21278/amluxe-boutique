export interface ArticlePublic {
  id: number
  marque: string
  modele: string
  etat: string
  prixVente: number
  plateforme: string | null
  lienAnnonce: string | null
  photos: string[]
  notes: string | null
  createdAt: string
}
