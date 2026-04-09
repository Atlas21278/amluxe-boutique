import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  // Routes publiques (non protégées)
  publicRoutes: [
    '/',
    '/catalogue(.*)',
    '/article(.*)',
    '/api/public(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  // /compte/* est protégé par défaut (tout ce qui n'est pas publicRoutes)
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
