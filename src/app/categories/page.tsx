'use client'

import { useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { CategoryList } from '@/components/categories/category-list'
import { CategoryForm } from '@/components/categories/category-form'
import { useCategories } from '@/hooks/use-categories'

interface Category {
  id: string
  name: string
  description?: string
  color?: string
  _count?: {
    transactions: number
  }
}

export default function CategoriesPage() {
  const { data: session, isPending } = useSession()
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Função para salvar categoria (criar ou editar)
  const handleSaveCategory = async (data: { name: string; description: string; color: string }) => {
    try {
      setFormLoading(true)
      
      if (editingCategory) {
        await updateCategory({ ...data, id: editingCategory.id })
      } else {
        await createCategory(data)
      }
      
      setShowForm(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert(error instanceof Error ? error.message : 'Erro ao salvar categoria')
    } finally {
      setFormLoading(false)
    }
  }

  // Função para deletar categoria
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId)
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      alert(error instanceof Error ? error.message : 'Erro ao deletar categoria')
    }
  }

  // Função para iniciar edição
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  // Função para cancelar formulário
  const handleCancelForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  // Filtrar categorias por termo de busca
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
          <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
          <p className="text-muted-foreground">
            Organize suas transações com categorias personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao Dashboard</Button>
          </Link>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Formulário de Categoria */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={handleCancelForm}
          loading={formLoading}
        />
      )}

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Categorias</CardTitle>
          <CardDescription>
            {filteredCategories.length} categoria(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={filteredCategories}
            loading={loading}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
          />
        </CardContent>
      </Card>
    </div>
  )
}