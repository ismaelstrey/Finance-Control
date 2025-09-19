import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseOFXFile, categorizeTransaction } from '@/lib/ofx-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo foi enviado' }, { status: 400 });
    }
    
    if (!file.name.toLowerCase().endsWith('.ofx')) {
      return NextResponse.json({ error: 'Apenas arquivos OFX são aceitos' }, { status: 400 });
    }
    
    const fileContent = await file.text();
    const parsedData = parseOFXFile(fileContent);
    
    // Buscar todas as categorias existentes
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const transaction of parsedData.transactions) {
      try {
        // Verificar se a transação já existe
        const existingTransaction = await prisma.transaction.findUnique({
          where: { fitId: transaction.fitId }
        });
        
        if (existingTransaction) {
          skippedCount++;
          continue;
        }
        
        // Categorizar a transação
        const categoryName = categorizeTransaction(transaction.description);
        const categoryId = categoryMap.get(categoryName);
        
        // Inserir a transação
        await prisma.transaction.create({
          data: {
            fitId: transaction.fitId,
            date: transaction.date,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            categoryId: categoryId || null
          }
        });
        
        insertedCount++;
      } catch (error) {
        console.error('Erro ao inserir transação:', error);
        // Continuar com as próximas transações mesmo se uma falhar
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Arquivo processado com sucesso! ${insertedCount} transações inseridas, ${skippedCount} transações já existiam.`,
      data: {
        totalTransactions: parsedData.transactions.length,
        insertedCount,
        skippedCount,
        accountId: parsedData.accountId,
        balance: parsedData.balance,
        balanceDate: parsedData.balanceDate
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar arquivo OFX:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao processar o arquivo' },
      { status: 500 }
    );
  }
}

