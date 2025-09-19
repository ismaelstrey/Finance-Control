'use client'

import { LoginButton } from '@/components/auth/login-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo</CardTitle>
          <CardDescription>
            Faça login para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginButton />
          <p className="text-sm text-gray-600 text-center">
            Ao fazer login, você concorda com nossos termos de serviço
          </p>
        </CardContent>
      </Card>
    </div>
  )
}