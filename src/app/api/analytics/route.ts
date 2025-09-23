import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Construir filtros de data
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const where = Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {};

    // Buscar dados analíticos
    const [
      totalTransactions,
      totalIncome,
      totalExpenses,
      categoryStats,
      monthlyStats,
      recentTransactions
    ] = await Promise.all([
      // Total de transações
      prisma.transaction.count({ where }),

      // Total de receitas
      prisma.transaction.aggregate({
        where: { ...where, amount: { gt: 0 } },
        _sum: { amount: true }
      }),

      // Total de despesas
      prisma.transaction.aggregate({
        where: { ...where, amount: { lt: 0 } },
        _sum: { amount: true }
      }),

      // Estatísticas por categoria
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where,
        _sum: { amount: true },
        _count: true
      }),

      // Estatísticas mensais - usando query condicional
      Object.keys(dateFilter).length > 0 
        ? prisma.$queryRaw`
            SELECT 
              to_char(date_trunc('month', date), 'YYYY-MM-DD') as month,
              SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
              COUNT(*) as transaction_count
            FROM "transactions" 
            WHERE date >= ${dateFilter.gte || new Date('1900-01-01')} 
             AND date <= ${dateFilter.lte || new Date('2100-12-31')}
            GROUP BY date_trunc('month', date)
            ORDER BY month DESC
            LIMIT 12
          `
        : prisma.$queryRaw`
            SELECT 
              to_char(date_trunc('month', date), 'YYYY-MM-DD') as month,
              SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
              SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
              COUNT(*) as transaction_count
            FROM "transactions" 
            GROUP BY date_trunc('month', date)
            ORDER BY month DESC
            LIMIT 12
          `,

      // Transações recentes
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 10
      })
    ]);

    // Buscar informações das categorias
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(categories.map((cat: { id: string; name: string }) => [cat.id, cat.name]));

    // Processar estatísticas por categoria
    const categoryStatsWithNames = await Promise.all(
      categoryStats.map(async (stat: { categoryId: string | null; _sum: { amount: number | null }; _count: number }) => {
        const categoryName = stat.categoryId ? categoryMap.get(stat.categoryId) : 'Sem categoria';
        return {
          categoryId: stat.categoryId,
          categoryName,
          totalAmount: stat._sum.amount || 0,
          transactionCount: stat._count
        };
      })
    );

    // Calcular saldo atual
    const balance = (totalIncome._sum.amount || 0) + (totalExpenses._sum.amount || 0);

    // Converter BigInt para Number para evitar erro de serialização
    const processMonthlyStats = (stats: Array<{
      month: string;
      income: bigint | null;
      expenses: bigint | null;
      transaction_count: bigint;
    }>) => {
      return stats.map(stat => ({
        month: stat.month,
        income: Number(stat.income || 0),
        expenses: Number(stat.expenses || 0),
        transactionCount: Number(stat.transaction_count || 0)
      }));
    };

    return NextResponse.json({
      summary: {
        totalTransactions: Number(totalTransactions),
        totalIncome: Number(totalIncome._sum.amount || 0),
        totalExpenses: Math.abs(Number(totalExpenses._sum.amount || 0)),
        balance: Number(balance)
      },
      categoryStats: categoryStatsWithNames.map(stat => ({
        ...stat,
        totalAmount: Number(stat.totalAmount),
        transactionCount: Number(stat.transactionCount)
      })),
      monthlyStats: processMonthlyStats(monthlyStats as Array<{
        month: string;
        income: bigint | null;
        expenses: bigint | null;
        transaction_count: bigint;
      }>),
      recentTransactions: recentTransactions.map((transaction: { amount: number; [key: string]: any }) => ({
        ...transaction,
        amount: Number(transaction.amount)
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar dados analíticos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

