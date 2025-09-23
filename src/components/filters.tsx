"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, X } from 'lucide-react'
import { useCategories } from '@/hooks/use-categories'

interface Category {
  id: string
  name: string
  color: string
  description?: string
  updatedAt: string
  _count: {
    transactions: number
  }
}

interface FiltersProps {
  onFiltersChange: (filters: FilterState) => void
}

export interface FilterState {
  startDate: string
  endDate: string
  categoryId: string
  type: string
  search: string
}

export function Filters({ onFiltersChange }: FiltersProps) {

  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    categoryId: 'all',
    type: 'all',
    search: ''
  })
  const { categories, fetchCategories, loading } = useCategories()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])



  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: 'all',
      type: 'all',
      search: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== '' && value !== 'all'
  )
  if (loading) {
    return <div className='text-center animate-pulse'>Carregando categorias...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Data Início */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
            />
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={filters.categoryId}
              onValueChange={(value) => updateFilter('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories && categories.length > 0 && categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="CREDIT">Receitas</SelectItem>
                <SelectItem value="DEBIT">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Descrição..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

