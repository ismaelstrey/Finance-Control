"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileSpreadsheet, Printer, Image } from 'lucide-react'

export function ExportButtons() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToExcel = async () => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/export/excel')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transacoes_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Erro ao exportar dados')
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const printPage = () => {
    window.print()
  }

  const exportChartsAsImage = async () => {
    try {
      // Capturar os gráficos como imagem usando html2canvas
      const html2canvas = await import('html2canvas')
      
      // Encontrar os elementos dos gráficos
      const chartElements = document.querySelectorAll('[data-chart]')
      
      if (chartElements.length === 0) {
        alert('Nenhum gráfico encontrado para exportar')
        return
      }

      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i] as HTMLElement
        const canvas = await html2canvas.default(element, {
          background: '#ffffff'
        } as any)
        
        // Converter para blob e fazer download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `grafico_${i + 1}_${new Date().toISOString().split('T')[0]}.png`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }
        }, 'image/png')
      }
    } catch (error) {
      console.error('Erro ao exportar gráficos:', error)
      alert('Erro ao exportar gráficos. Tente novamente.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={exportToExcel}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </>
            )}
          </Button>

          <Button
            onClick={printPage}
            variant="outline"
            className="w-full"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>

          <Button
            onClick={exportChartsAsImage}
            variant="outline"
            className="w-full"
          >
            <Image className="w-4 h-4 mr-2" />
            Gráficos PNG
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Exporte seus dados financeiros em diferentes formatos para análise offline
        </p>
      </CardContent>
    </Card>
  )
}

