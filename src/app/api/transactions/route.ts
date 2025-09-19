import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where: {
      categoryId?: string;
      date?: { gte?: Date; lte?: Date };
      type?: string;
      description?: { contains: string; mode: 'insensitive' };
    } = {};
    
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }
    
    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate) };
    }
    
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) };
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Buscar transações com paginação
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ]);
    
    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, categoryId } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID da transação é obrigatório' }, { status: 400 });
    }
    
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: { categoryId },
      include: { category: true }
    });
    
    return NextResponse.json(updatedTransaction);
    
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

