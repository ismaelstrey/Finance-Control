"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalTransactions: number
  totalIncome: number
  totalExpenses: number
  balance: number
}

interface DashboardStatsProps {
  refreshTrigger: number
}

export function DashboardStats({ refreshTrigger }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics')
      const result = await response.json()
      
      if (response.ok) {
        setStats(result.summary)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    description 
  }: {
    title: string
    value: string | number
    icon: any
    color: string
    description: string
  }) => (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          {loading ? (
            <div className="animate-pulse bg-muted h-8 w-20 rounded" />
          ) : (
            typeof value === 'number' && title !== 'Transações' ? formatCurrency(value) : value
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total de Receitas"
        value={stats.totalIncome}
        icon={TrendingUp}
        color="text-green-600"
        description="Entradas no período"
      />
      
      <StatCard
        title="Total de Despesas"
        value={stats.totalExpenses}
        icon={TrendingDown}
        color="text-red-600"
        description="Saídas no período"
      />
      
      <StatCard
        title="Saldo Atual"
        value={stats.balance}
        icon={DollarSign}
        color={stats.balance >= 0 ? "text-blue-600" : "text-red-600"}
        description="Saldo disponível"
      />
      
      <StatCard
        title="Transações"
        value={stats.totalTransactions}
        icon={Activity}
        color="text-purple-600"
        description="Total de movimentações"
      />
    </div>
  )
}

