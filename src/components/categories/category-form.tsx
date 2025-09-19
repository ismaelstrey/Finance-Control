"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Category {
  id: string
  name: string
  description?: string
  color?: string
}

interface CategoryFormProps {
  category?: Category | null
  onSave: (data: { name: string; description: string; color: string }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CategoryForm({ category, onSave, onCancel, loading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#3b82f6'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    await onSave(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {category ? 'Editar Categoria' : 'Nova Categoria'}
        </CardTitle>
        <CardDescription>
          {category 
            ? 'Modifique os dados da categoria' 
            : 'Crie uma nova categoria para organizar suas transações'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Categoria *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Alimentação, Transporte..."
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="h-10 w-20"
                  disabled={loading}
                />
                <div 
                  className="w-10 h-10 rounded border border-input"
                  style={{ backgroundColor: formData.color }}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição da categoria..."
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                  {category ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                <>
                  {category ? 'Atualizar' : 'Criar'} Categoria
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}