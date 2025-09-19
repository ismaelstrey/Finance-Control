'use client'

import { UserProfile } from '@/components/auth/user-profile'
import { LoginButton } from '@/components/auth/login-button'
import { useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Navbar() {
  const { data: session, isPending } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FC</span>
            </div>
            <span className="font-bold text-xl">Finance Control</span>
          </Link>

          {/* Navigation Links - apenas se autenticado */}
          {session?.user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/transactions">
                <Button variant="ghost">Transações</Button>
              </Link>
              <Link href="/categories">
                <Button variant="ghost">Categorias</Button>
              </Link>
              <Link href="/reports">
                <Button variant="ghost">Relatórios</Button>
              </Link>
            </div>
          )}

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isPending ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : session?.user ? (
              <UserProfile />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}