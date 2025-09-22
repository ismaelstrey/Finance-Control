'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/file-upload';
import { DashboardStats } from '@/components/dashboard-stats';
import { Loader2, Upload, BarChart3, Tags, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Força a atualização dos componentes que dependem dos dados
    setRefreshKey(prev => prev + 1);
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Remove the redirect logic - let middleware handle authentication
  // The middleware will redirect unauthenticated users to login

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bem-vindo de volta, {session?.user?.name || session?.user?.email}!
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Arquivo OFX
          </CardTitle>
          <CardDescription>
            Faça upload do seu arquivo OFX para importar transações bancárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="mb-8">
        <DashboardStats key={refreshKey} />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transações
            </CardTitle>
            <CardDescription>
              Visualize e gerencie suas transações importadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/transactions">
              <Button className="w-full">Ver Transações</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Categorias
            </CardTitle>
            <CardDescription>
              Organize suas transações por categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/categories">
              <Button className="w-full">Gerenciar Categorias</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatórios
            </CardTitle>
            <CardDescription>
              Analise seus gastos com gráficos e relatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports">
              <Button className="w-full">Ver Relatórios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {session?.user?.name || 'Não informado'}</p>
            <p><strong>Email:</strong> {session?.user?.email}</p>
            <p><strong>Último acesso:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}