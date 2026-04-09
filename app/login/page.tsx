import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <p
          className="text-xs tracking-widest uppercase text-center mb-8"
          style={{ color: 'var(--accent)' }}
        >
          La Boutique
        </p>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none border rounded-sm w-full',
              headerTitle: 'font-serif',
            },
          }}
        />
      </div>
    </div>
  )
}
