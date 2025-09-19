"use client"

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  description?: string
  color?: string
  _count?: {
    transactions: number
  }
}

interface CreateCategoryData {
  name: string
  description: string
  color: string
}

interface UpdateCategoryData extends CreateCategoryData {
  id: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar todas as categorias
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar categorias')
      }
      
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao buscar categorias:', err)
    } finally {
      setLoading(false)
    }
  }

  // Função para criar uma nova categoria
  const createCategory = async (data: CreateCategoryData): Promise<Category> => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao criar categoria')
    }

    // Atualizar a lista local
    setCategories(prev => [...prev, result])
    
    return result
  }

  // Função para atualizar uma categoria
  const updateCategory = async (data: UpdateCategoryData): Promise<Category> => {
    const { id, ...updateData } = data
    
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao atualizar categoria')
    }

    // Atualizar a lista local
    setCategories(prev => 
      prev.map(cat => cat.id === id ? result : cat)
    )
    
    return result
  }

  // Função para deletar uma categoria
  const deleteCategory = async (id: string): Promise<void> => {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.error || 'Erro ao deletar categoria')
    }

    // Remover da lista local
    setCategories(prev => prev.filter(cat => cat.id !== id))
  }

  // Carregar categorias ao montar o hook
  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}