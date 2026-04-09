# Espace Client Boutique — Design Spec
**Date** : 2026-04-09  
**Statut** : Approuvé  

---

## Contexte

La boutique `amluxe-boutique` est actuellement 100% anonyme. L'objectif est d'ajouter un espace client complet permettant aux acheteurs de se connecter, consulter leurs commandes, sauvegarder leurs adresses, mettre des articles en favoris et recevoir des emails automatiques.

---

## Architecture générale

```
Boutique (amluxe-boutique)         AMLuxe (backend existant)        Services externes
──────────────────────────         ──────────────────────────        ──────────────────
Clerk Provider (auth)              Nouvelles tables Prisma :         Clerk (auth SaaS)
  → Email + mot de passe             CustomerOrder                   Resend (emails)
  → Google OAuth                     CustomerAddress                 Stripe (déjà là)
  → Sessions JWT                     CustomerWishlist
  → Email vérification               CustomerSubscription

Pages protégées (/compte/*)        Nouvelles routes API :
  /compte                            GET/POST   /api/customer/orders
  /compte/commandes                  GET/POST/DELETE /api/customer/addresses
  /compte/adresses                   GET/POST/DELETE /api/customer/wishlist
  /compte/favoris                    POST /api/customer/subscribe
```

**Principe clé :** AMLuxe garde NextAuth pour l'admin. Les routes `/api/customer/*` vérifient le JWT Clerk via `@clerk/nextjs/server`. Les deux systèmes d'auth cohabitent sans conflit.

---

## Phase 1 — Authentification Clerk

### Ce qu'on construit

- Installation Clerk dans `amluxe-boutique`
- Pages `/login` et `/register` avec composants Clerk (email + Google)
- Middleware protégeant `/compte/*`
- Navbar mise à jour : bouton "Se connecter" → avatar + menu dropdown quand connecté
- Page `/compte` : dashboard avec liens vers les 4 sections (commandes, adresses, favoris, alertes)

### Composants

```
app/
  login/page.tsx           → <SignIn /> Clerk
  register/page.tsx        → <SignUp /> Clerk
  compte/
    layout.tsx             → Vérifie auth, redirige vers /login si non connecté
    page.tsx               → Dashboard client
middleware.ts              → clerkMiddleware() protège /compte/*
components/
  UserButton.tsx           → Avatar Clerk + menu (Mon compte / Déconnexion)
```

### Navbar modifiée

```
Non connecté : [...liens] + bouton "Se connecter" → /login
Connecté     : [...liens] + <UserButton /> (avatar + dropdown)
```

### Impact AMLuxe : aucun

---

## Phase 2 — Historique des commandes

### Ce qu'on construit

- Nouvelle table `CustomerOrder` dans AMLuxe
- Lien Stripe → Clerk userId au moment du checkout
- Route `GET /api/customer/orders` dans AMLuxe (auth Clerk JWT)
- Page `/compte/commandes` dans la boutique

### Modèle Prisma (AMLuxe)

```prisma
model CustomerOrder {
  id            Int      @id @default(autoincrement())
  clerkUserId   String
  articleId     Int
  marque        String
  modele        String
  prixArticle   Float
  prixLivraison Float
  stripeSessionId String @unique
  createdAt     DateTime @default(now())
}
```

### Flux

```
Client connecté → clique "Acheter"
→ /api/checkout reçoit clerkUserId (header Authorization)
→ Stripe Checkout créé avec metadata: { articleId, clerkUserId }
→ Webhook stripe → marque article Vendu + crée CustomerOrder
→ /compte/commandes → affiche liste des achats avec date et montant
```

### Impact AMLuxe : migration Prisma + 2 nouvelles routes

---

## Phase 3 — Adresses sauvegardées

### Ce qu'on construit

- Nouvelle table `CustomerAddress` dans AMLuxe
- Route CRUD `/api/customer/addresses`
- Page `/compte/adresses`
- Checkout pré-rempli si adresse sauvegardée (Stripe shipping_address_collection)

### Modèle Prisma (AMLuxe)

```prisma
model CustomerAddress {
  id          Int      @id @default(autoincrement())
  clerkUserId String
  nom         String
  prenom      String
  adresse     String
  ville       String
  codePostal  String
  telephone   String
  defaut      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### Flux

```
Client connecté → /compte/adresses → ajoute une adresse
→ Au checkout → Stripe reçoit l'adresse pré-remplie
→ Plus besoin de la ressaisir à chaque achat
```

### Impact AMLuxe : migration Prisma + 2 routes

---

## Phase 4 — Wishlist / Favoris

### Ce qu'on construit

- Nouvelle table `CustomerWishlist` dans AMLuxe
- Bouton ❤ sur les `ArticleCard` et la fiche produit
- Route CRUD `/api/customer/wishlist`
- Page `/compte/favoris` : grille des articles mis en favoris

### Modèle Prisma (AMLuxe)

```prisma
model CustomerWishlist {
  id          Int      @id @default(autoincrement())
  clerkUserId String
  articleId   Int
  createdAt   DateTime @default(now())

  @@unique([clerkUserId, articleId])
}
```

### Comportement

- Non connecté + clic ❤ → redirect vers /login
- Article "Vendu" dans la wishlist → badge "Vendu" sur la card favoris
- Article supprimé de AMLuxe → disparaît silencieusement de la wishlist

### Impact AMLuxe : migration Prisma + 2 routes

---

## Phase 5 — Notifications email (Resend)

### Ce qu'on construit

- Intégration Resend dans AMLuxe (résout le WIP T-103)
- Email de confirmation après achat
- Email d'alerte quand un nouvel article passe "En vente"
- Table `CustomerSubscription` pour les alertes

### Modèle Prisma (AMLuxe)

```prisma
model CustomerSubscription {
  id          Int      @id @default(autoincrement())
  clerkUserId String
  email       String
  actif       Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@unique([clerkUserId])
}
```

### Emails déclenchés

| Événement | Déclencheur | Contenu |
|-----------|-------------|---------|
| Confirmation achat | Webhook Stripe `checkout.session.completed` | Récap commande, montant, délai livraison |
| Nouvel article | Statut article → "En vente" dans AMLuxe | Photo, marque, modèle, prix, lien boutique |

### Template emails

Style sobre assorti au thème crème de la boutique — HTML responsive via Resend React Email.

### Impact AMLuxe : `npm install resend`, 1 migration, 2 fonctions email

---

## Variables d'environnement requises

### amluxe-boutique (Railway)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/compte
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/compte
```

### AMLuxe (Railway)
```
CLERK_SECRET_KEY=sk_live_...   (pour vérifier les JWT clients)
RESEND_API_KEY=re_...          (Phase 5)
```

---

## Ce qui n'est PAS dans le scope

- Google OAuth pour Apple → nécessite Apple Developer Account + domaine custom
- Chat support client
- Avis / notes sur les articles
- Programme de fidélité
- Notifications push mobile
