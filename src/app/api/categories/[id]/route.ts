import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name, description, color } = await request.json();
    const { id } = await params;
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 });
    }
    
    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3b82f6'
      }
    });
    
    return NextResponse.json(category);
    
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    
    // Verificar se é erro de duplicata
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }
    
    // Verificar se há transações associadas
    if (existingCategory._count.transactions > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma categoria que possui transações associadas' },
        { status: 400 }
      );
    }
    
    await prisma.category.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Categoria excluída com sucesso' });
    
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}