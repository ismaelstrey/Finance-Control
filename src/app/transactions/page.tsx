'use client'

import { useSession } from '@/lib/auth-client'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionList } from '@/components/transaction-list'
import { Filters } from '@/components/filters'
import { ExportButtons } from '@/components/export-buttons'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Interface para os filtros da página de transações
interface FilterState {
  startDate: string
  endDate: string
  category: string
  type: string
  description: string
}

// Interface para os filtros do componente Filters
interface FiltersState {
  startDate: string
  endDate: string
  categoryId: string
  type: string
  search: string
}

export default function TransactionsPage() {
  const { data: session, isPending } = useSession()
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    category: '',
    type: '',
    description: ''
  })

  // Redireciona para login se não estiver autenticado
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

  // Função para converter os filtros do componente Filters para o formato esperado pelo TransactionList
  const handleFiltersChange = useCallback((filtersData: FiltersState) => {
    setFilters({
      startDate: filtersData.startDate,
      endDate: filtersData.endDate,
      category: filtersData.categoryId,
      type: filtersData.type,
      description: filtersData.search
    })
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as suas transações financeiras
          </p>
        </div>
        <ExportButtons />
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as transações por data, categoria, tipo ou descrição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Filters onFiltersChange={handleFiltersChange} />
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            Todas as suas transações organizadas e filtradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList filters={filters} />
        </CardContent>
      </Card>
    </div>
  )
}