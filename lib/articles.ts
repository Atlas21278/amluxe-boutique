import type { ArticlePublic } from '@/types/article'

const API_URL = process.env.NEXT_PUBLIC_AMLUXE_API_URL

export async function getArticles(): Promise<ArticlePublic[]> {
  try {
    const res = await fetch(`${API_URL}/api/public/articles`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getArticle(id: number): Promise<ArticlePublic | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/articles/${id}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
