"use client"

import { useState, useCallback } from 'react'
import { FileUpload } from '@/components/file-upload'
import { TransactionList } from '@/components/transaction-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardStats } from '@/components/dashboard-stats'
import { CategoryChart } from '@/components/charts/category-chart'
import { MonthlyChart } from '@/components/charts/monthly-chart'
import { ExportButtons } from '@/components/export-buttons'
import { Filters, FilterState } from '@/components/filters'
import { DollarSign } from 'lucide-react'

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    categoryId: 'all',
    type: 'all',
    search: ''
  })

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Finance Control</h1>
                <p className="text-sm text-muted-foreground">
                  Controle financeiro inteligente
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Upload Section */}
          <section className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">
                Importe suas transações
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Faça o upload do seu arquivo OFX para começar a analisar suas finanças. 
                O sistema irá categorizar automaticamente suas transações e gerar relatórios detalhados.
              </p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </section>

          {/* Stats Cards */}
          <section className="animate-slide-up">
            <DashboardStats refreshTrigger={refreshTrigger} />
          </section>

          {/* Filters */}
          <section className="animate-scale-in">
            <Filters onFiltersChange={handleFiltersChange} />
          </section>

          {/* Export Buttons */}
          <section className="animate-scale-in">
            <ExportButtons />
          </section>

          {/* Charts Section */}
          <section className="animate-scale-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CategoryChart />
              <MonthlyChart />
            </div>
          </section>

          {/* Transactions List */}
          <section className="animate-scale-in">
            <TransactionList refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Finance Control. Sistema de controle financeiro moderno e intuitivo.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

