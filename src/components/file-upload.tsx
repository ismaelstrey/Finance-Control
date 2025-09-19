"use client"

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface FileUploadProps {
  onUploadSuccess: () => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.ofx')) {
      setUploadStatus('error')
      setUploadMessage('Por favor, selecione um arquivo OFX válido.')
      return
    }

    setIsUploading(true)
    setUploadStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-ofx', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus('success')
        setUploadMessage(result.message)
        onUploadSuccess()
      } else {
        setUploadStatus('error')
        setUploadMessage(result.error || 'Erro ao processar o arquivo')
      }
    } catch {
      setUploadStatus('error')
      setUploadMessage('Erro de conexão. Tente novamente.')
    } finally {
      setIsUploading(false)
      // Limpar o input para permitir upload do mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Upload de Arquivo OFX</h3>
            <p className="text-sm text-muted-foreground">
              Selecione um arquivo OFX para importar suas transações
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".ofx"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={handleButtonClick}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Selecionar Arquivo OFX
              </>
            )}
          </Button>

          {uploadStatus !== 'idle' && (
            <div className={`flex items-center gap-2 p-3 rounded-md text-sm ${
              uploadStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            }`}>
              {uploadStatus === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

