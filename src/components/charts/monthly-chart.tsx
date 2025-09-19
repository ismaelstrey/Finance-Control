"use client"

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface MonthlyData {
  month: string
  income: number
  expenses: number
  transaction_count: number
}

export function MonthlyChart() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMonthlyData()
  }, [])

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch('/api/analytics')
      const result = await response.json()
      
      if (response.ok) {
        // Processar dados mensais
        const monthlyData = result.monthlyStats.map((item: any) => ({
          month: new Date(item.month).toLocaleDateString('pt-BR', { 
            month: 'short', 
            year: '2-digit' 
          }),
          income: parseFloat(item.income) || 0,
          expenses: parseFloat(item.expenses) || 0,
          transaction_count: parseInt(item.transaction_count) || 0
        })).reverse() // Reverter para mostrar do mais antigo para o mais recente
        
        setData(monthlyData)
      }
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error)
    } finally {
      setLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <p className="text-sm text-muted-foreground mt-1">
            Transações: {payload[0]?.payload?.transaction_count || 0}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-chart="monthly">
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="income" 
                name="Receitas" 
                fill="#10b981" 
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                name="Despesas" 
                fill="#ef4444" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

