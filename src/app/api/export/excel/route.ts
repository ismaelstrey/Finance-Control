import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    
    // Construir filtros
    const where: {
      categoryId?: string;
      date?: { gte?: Date; lte?: Date };
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
    
    // Buscar transações
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Preparar dados para o Excel
    const excelData = transactions.map(transaction => ({
      'Data': transaction.date.toLocaleDateString('pt-BR'),
      'Descrição': transaction.description,
      'Categoria': transaction.category?.name || 'Sem categoria',
      'Tipo': transaction.type === 'CREDIT' ? 'Receita' : 'Despesa',
      'Valor': transaction.amount,
      'Valor Formatado': new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(transaction.amount)
    }));
    
    // Criar workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Configurar largura das colunas
    const columnWidths = [
      { wch: 12 }, // Data
      { wch: 40 }, // Descrição
      { wch: 15 }, // Categoria
      { wch: 10 }, // Tipo
      { wch: 12 }, // Valor
      { wch: 15 }  // Valor Formatado
    ];
    worksheet['!cols'] = columnWidths;
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');
    
    // Gerar buffer do Excel
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });
    
    // Criar nome do arquivo com data atual
    const fileName = `transacoes_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Retornar arquivo
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
    
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

