"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Package } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Category {
  id: string
  name: string
  description?: string
  color?: string
  _count?: {
    transactions: number
  }
}

interface CategoryListProps {
  categories: Category[]
  loading: boolean
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

export function CategoryList({ categories, loading, onEdit, onDelete }: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (categoryId: string) => {
    setDeletingId(categoryId)
    try {
      await onDelete(categoryId)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma categoria encontrada</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: category.color || '#3b82f6' }}
                />
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a categoria "{category.name}"?
                        {category._count && category._count.transactions > 0 && (
                          <span className="block mt-2 text-destructive">
                            Esta categoria possui {category._count.transactions} transação(ões) associada(s).
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {category.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {category._count?.transactions || 0} transação(ões)
              </Badge>
              <div className="text-xs text-muted-foreground">
                ID: {category.id.slice(0, 8)}...
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}