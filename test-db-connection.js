const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando conexão com PostgreSQL...');
    
    // Testar conexão básica
    await prisma.$connect();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
    
    // Verificar se as tabelas existem
    console.log('\n📋 Verificando tabelas existentes...');
    
    // Contar transações
    const transactionCount = await prisma.transaction.count();
    console.log(`📊 Total de transações no banco: ${transactionCount}`);
    
    // Contar categorias
    const categoryCount = await prisma.category.count();
    console.log(`📂 Total de categorias no banco: ${categoryCount}`);
    
    // Listar algumas transações recentes
    if (transactionCount > 0) {
      console.log('\n🔍 Últimas 5 transações:');
      const recentTransactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          fitId: true,
          description: true,
          amount: true,
          date: true,
          type: true
        }
      });
      
      recentTransactions.forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.description} - R$ ${transaction.amount} (${transaction.type}) - ${transaction.date.toLocaleDateString()}`);
      });
    }
    
    console.log('\n✅ Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conexão com o banco:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();