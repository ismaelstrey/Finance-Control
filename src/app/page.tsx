'use client'

import { useSession } from '@/lib/auth-client'
import { LoginButton } from '@/components/auth/login-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Se o usuário está logado, redireciona para o dashboard
  if (session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo de volta!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Olá, {session.user.name}. Pronto para gerenciar suas finanças?
          </p>
          <Link href="/dashboard">
            <Button size="lg">Ir para Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Página inicial para usuários não autenticados
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Finance Control</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Seu sistema moderno de controle e relatório de finanças pessoais
        </p>
        <LoginButton />
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Controle Total</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Gerencie todas as suas transações financeiras em um só lugar
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios Detalhados</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Visualize seus gastos e receitas com gráficos e relatórios intuitivos
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorização</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Organize suas finanças por categorias personalizadas
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

