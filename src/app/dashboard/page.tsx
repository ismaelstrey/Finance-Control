'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/file-upload'
import { DashboardStats } from '@/components/dashboard-stats'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    // Força a atualização dos componentes que dependem dos dados
    setRefreshKey(prev => prev + 1)
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button>Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {session.user.name}!
        </p>
      </div>

      {/* Upload de OFX */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upload de Arquivo OFX</h2>
        <FileUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Estatísticas do Dashboard */}
      <DashboardStats key={refreshKey} />

      {/* Cards de Navegação */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>
              Gerencie suas transações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/transactions">
              <Button className="w-full">Ver Transações</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>
              Organize suas categorias de gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/categories">
              <Button className="w-full">Gerenciar Categorias</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios</CardTitle>
            <CardDescription>
              Visualize seus dados financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports">
              <Button className="w-full">Ver Relatórios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Nome:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>ID:</strong> {session.user.id}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}