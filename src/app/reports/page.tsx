'use client'

import { useSession } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardStats } from '@/components/dashboard-stats'
import { MonthlyChart } from '@/components/charts/monthly-chart'
import { CategoryChart } from '@/components/charts/category-chart'
import { TransactionList } from '@/components/transaction-list'
import { ExportButtons } from '@/components/export-buttons'
import { Filters } from '@/components/filters'
import Link from 'next/link'
import { useState } from 'react'

import { FilterState as FiltersState } from '@/components/filters'

interface FilterState {
  startDate: string
  endDate: string
  category: string
  type: string
  description: string
}

export default function ReportsPage() {
  const { data: session, isPending } = useSession()
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    category: '',
    type: '',
    description: ''
  })

  // Função para converter os filtros do componente Filters para o formato esperado pelo TransactionList
  const handleFiltersChange = (filtersData: FiltersState) => {
    setFilters({
      startDate: filtersData.startDate,
      endDate: filtersData.endDate,
      category: filtersData.categoryId,
      type: filtersData.type,
      description: filtersData.search
    })
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análise completa das suas finanças
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
          <ExportButtons />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre os dados para análises específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Filters onFiltersChange={handleFiltersChange} />
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <DashboardStats />

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>
              Receitas e despesas por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>
              Distribuição dos gastos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Últimas transações registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList filters={filters} />
        </CardContent>
      </Card>
    </div>
  )
}