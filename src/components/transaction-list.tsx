"use client"

import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: string
  category?: {
    id: string
    name: string
  }
}

interface TransactionListProps {
  refreshTrigger: number
}

export function TransactionList({ refreshTrigger }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/transactions?page=${page}&limit=20`)
      const data = await response.json()
      
      if (response.ok) {
        setTransactions(data.transactions)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(1)
  }, [refreshTrigger])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchTransactions(page)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Transações Recentes
          <Badge variant="secondary">{transactions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma transação encontrada. Faça o upload de um arquivo OFX para começar.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.amount > 0 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {transaction.amount > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.category && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category.name}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

