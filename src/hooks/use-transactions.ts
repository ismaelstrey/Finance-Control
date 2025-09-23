import { useState, useEffect, useCallback } from 'react'

// Interface para representar uma transação
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

// Interface para os filtros de transação
interface FilterState {
    startDate: string
    endDate: string
    category: string
    type: string
    description: string
}

// Interface para os parâmetros do hook
interface UseTransactionsParams {
    refreshTrigger?: number
    filters?: FilterState
    limit?: number
}

// Interface para o retorno do hook
interface UseTransactionsReturn {
    transactions: Transaction[]
    loading: boolean
    currentPage: number
    totalPages: number
    fetchTransactions: (page?: number) => Promise<void>
    handlePageChange: (page: number) => void
}

/**
 * Hook personalizado para gerenciar transações
 * Fornece funcionalidades de busca, paginação e filtragem de transações
 */
export function useTransactions({
    refreshTrigger,
    filters,
    limit = 20
}: UseTransactionsParams = {}): UseTransactionsReturn {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    /**
     * Função para buscar transações da API
     * @param page - Número da página a ser buscada
     */
    const fetchTransactions = useCallback(async (page = 1) => {
        try {
            setLoading(true)

            // Construir query params com filtros
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            })

            if (filters) {
                if (filters.startDate) params.append('startDate', filters.startDate)
                if (filters.endDate) params.append('endDate', filters.endDate)
                if (filters.category && filters.category !== 'all') params.append('categoryId', filters.category)
                if (filters.type && filters.type !== 'all') params.append('type', filters.type)
                if (filters.description) params.append('search', filters.description)
            }

            const response = await fetch(`/api/transactions?${params.toString()}`)


            const data = await response.json()
            console.log(data)

            if (data) {
                setTransactions(data.transactions)
                setCurrentPage(data.currentPage)
                setTotalPages(data.totalPages)
            }
        } catch (error) {
            console.error('Erro ao buscar transações:', error)
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }, [filters, limit])

    /**
     * Função para navegar entre páginas
     * @param page - Número da página desejada
     */
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchTransactions(page)
        }
    }

    // Efeito para buscar transações quando os filtros ou refreshTrigger mudarem
    useEffect(() => {
        fetchTransactions(1)
    }, [refreshTrigger, fetchTransactions])

    console.log(transactions)

    return {
        transactions,
        loading,
        currentPage,
        totalPages,
        fetchTransactions,
        handlePageChange
    }
}