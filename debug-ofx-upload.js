const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugOFXUpload() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Iniciando debug do upload OFX...');
    
    // 1. Verificar se o arquivo existe
    const filePath = 'D:\\bgYdWhurJWcGUDUd\\Nubank_2025-09-25.ofx';
    if (!fs.existsSync(filePath)) {
      console.error('❌ Arquivo OFX não encontrado:', filePath);
      return;
    }
    console.log('✅ Arquivo OFX encontrado');
    
    // 2. Ler o conteúdo do arquivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 Tamanho do arquivo: ${fileContent.length} caracteres`);
    
    // 3. Verificar conexão com banco antes do upload
    await prisma.$connect();
    const transactionCountBefore = await prisma.transaction.count();
    console.log(`📊 Transações no banco ANTES do upload: ${transactionCountBefore}`);
    
    // 4. Fazer upload via API
    console.log('🚀 Fazendo upload via API...');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), {
      filename: 'Nubank_2025-09-25.ofx',
      contentType: 'application/x-ofx'
    });
    
    const response = await fetch('http://localhost:3000/api/upload-ofx', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const responseText = await response.text();
    console.log(`📡 Status da resposta: ${response.status}`);
    console.log(`📝 Resposta da API: ${responseText}`);
    
    // 5. Verificar se houve mudanças no banco
    const transactionCountAfter = await prisma.transaction.count();
    console.log(`📊 Transações no banco APÓS o upload: ${transactionCountAfter}`);
    console.log(`📈 Diferença: ${transactionCountAfter - transactionCountBefore} transações`);
    
    // 6. Se não houve inserções, vamos processar manualmente para debug
    if (transactionCountAfter === transactionCountBefore) {
      console.log('\\n🔧 Processando arquivo manualmente para debug...');
      
      // Importar o parser OFX
      const { parseOFXFile } = require('./src/lib/ofx-parser.ts');
      
      try {
        const parsedData = parseOFXFile(fileContent);
        const transactions = parsedData.transactions;
        console.log(`🔍 Parser encontrou ${transactions.length} transações`);
        
        if (transactions.length > 0) {
          console.log('\\n📋 Primeiras 3 transações encontradas:');
          transactions.slice(0, 3).forEach((transaction, index) => {
            console.log(`${index + 1}. FitId: ${transaction.fitId}`);
            console.log(`   Descrição: ${transaction.description}`);
            console.log(`   Valor: R$ ${transaction.amount}`);
            console.log(`   Data: ${transaction.date}`);
            console.log(`   Tipo: ${transaction.type}`);
            console.log('');
          });
          
          // Verificar se alguma transação já existe
          console.log('🔍 Verificando duplicatas...');
          let existingCount = 0;
          for (const transaction of transactions.slice(0, 5)) {
            const existing = await prisma.transaction.findUnique({
              where: { fitId: transaction.fitId }
            });
            if (existing) {
              existingCount++;
              console.log(`⚠ Transação já existe: ${transaction.description} (${transaction.fitId})`);
            }
          }
          console.log(`📊 ${existingCount} de ${Math.min(5, transactions.length)} transações verificadas já existem`);
        }
      } catch (parseError) {
        console.error('❌ Erro no parser OFX:', parseError.message);
      }
    }
    
    console.log('\\n✅ Debug concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugOFXUpload();