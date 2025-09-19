"use client"

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  categoryName: string
  totalAmount: number
  transactionCount: number
  [key: string]: string | number // Adiciona index signature para compatibilidade com recharts
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
]

export function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryData()
  }, [])

  const fetchCategoryData = async () => {
    try {
      const response = await fetch('/api/analytics')
      const result = await response.json()
      
      if (response.ok) {
        // Filtrar apenas despesas (valores negativos) e converter para positivo
        const expenseData = result.categoryStats
          .filter((item: CategoryData) => item.totalAmount < 0)
          .map((item: CategoryData) => ({
            ...item,
            totalAmount: Math.abs(item.totalAmount)
          }))
          .sort((a: CategoryData, b: CategoryData) => b.totalAmount - a.totalAmount)
        
        setData(expenseData)
      }
    } catch (error) {
      console.error('Erro ao buscar dados de categoria:', error)
    } finally {
      setLoading(false)
    }
  }

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CategoryData
  }>
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.categoryName}</p>
          <p className="text-sm text-muted-foreground">
            Valor: {formatCurrency(data.totalAmount)}
          </p>
          <p className="text-sm text-muted-foreground">
            Transações: {data.transactionCount}
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
          <CardTitle>Gastos por Categoria</CardTitle>
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
          <CardTitle>Gastos por Categoria</CardTitle>
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
    <Card data-chart="category">
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalAmount"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.slice(0, 6).map((item, index) => (
            <div key={item.categoryName} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm truncate">{item.categoryName}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

