export interface ShippingOption {
  prix: number        // en euros
  label: string
  couverture: string
}

export function getShipping(prixArticle: number): ShippingOption {
  if (prixArticle < 50) {
    return { prix: 8,  label: 'Colissimo suivi',                    couverture: 'jusqu\'à 33€' }
  }
  if (prixArticle < 300) {
    return { prix: 12, label: 'Colissimo suivi + assuré',           couverture: 'jusqu\'à 300€' }
  }
  if (prixArticle < 1000) {
    return { prix: 15, label: 'Colissimo suivi + assuré',           couverture: 'jusqu\'à 1000€' }
  }
  return   { prix: 18, label: 'Colissimo suivi + assuré',           couverture: 'jusqu\'à 1500€' }
}
