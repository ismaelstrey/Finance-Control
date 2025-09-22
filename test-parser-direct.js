const fs = require('fs');

// Função parseOFXCustom copiada diretamente do arquivo TypeScript
function parseOFXCustom(ofxContent) {
  console.log('🔍 Iniciando parseOFXCustom...');
  console.log(`📄 Tamanho do conteúdo: ${ofxContent.length} caracteres`);
  
  // Remove headers OFX
  const xmlContent = ofxContent.substring(ofxContent.indexOf('<OFX>'));
  console.log(`📄 Tamanho após remover headers: ${xmlContent.length} caracteres`);

  // Extrai informações básicas usando regex
  const accountIdMatch = xmlContent.match(/<ACCTID>([^<]+)<\/ACCTID>/);
  const accountId = accountIdMatch ? accountIdMatch[1] : 'unknown';
  console.log(`🏦 Account ID: ${accountId}`);

  const balanceMatch = xmlContent.match(/<BALAMT>([^<]+)<\/BALAMT>/);
  const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;
  console.log(`💰 Balance: ${balance}`);

  const balanceDateMatch = xmlContent.match(/<DTASOF>([^<]+)<\/DTASOF>/);
  const balanceDate = balanceDateMatch ? balanceDateMatch[1] : '';
  console.log(`📅 Balance Date: ${balanceDate}`);

  // Extrai todas as transações
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  const transactions = [];
  let match;
  let transactionCount = 0;

  console.log('🔍 Procurando transações...');
  
  while ((match = transactionRegex.exec(xmlContent)) !== null) {
    transactionCount++;
    const transactionXml = match[1];
    console.log(`\n📋 Transação ${transactionCount}:`);
    console.log(`XML: ${transactionXml.substring(0, 200)}...`);

    const trnTypeMatch = transactionXml.match(/<TRNTYPE>([^<]+)<\/TRNTYPE>/);
    const dtPostedMatch = transactionXml.match(/<DTPOSTED>([^<]+)<\/DTPOSTED>/);
    const trnAmtMatch = transactionXml.match(/<TRNAMT>([^<]+)<\/TRNAMT>/);
    const fitIdMatch = transactionXml.match(/<FITID>([^<]+)<\/FITID>/);
    const memoMatch = transactionXml.match(/<MEMO>([^<]+)<\/MEMO>/);

    console.log(`- TRNTYPE: ${trnTypeMatch ? trnTypeMatch[1] : 'não encontrado'}`);
    console.log(`- DTPOSTED: ${dtPostedMatch ? dtPostedMatch[1] : 'não encontrado'}`);
    console.log(`- TRNAMT: ${trnAmtMatch ? trnAmtMatch[1] : 'não encontrado'}`);
    console.log(`- FITID: ${fitIdMatch ? fitIdMatch[1] : 'não encontrado'}`);
    console.log(`- MEMO: ${memoMatch ? memoMatch[1] : 'não encontrado'}`);

    if (fitIdMatch && trnAmtMatch && dtPostedMatch) {
      const transaction = {
        fitId: fitIdMatch[1],
        date: new Date(dtPostedMatch[1].substring(0, 4) + '-' + dtPostedMatch[1].substring(4, 6) + '-' + dtPostedMatch[1].substring(6, 8)),
        description: memoMatch ? memoMatch[1] : 'Sem descrição',
        amount: parseFloat(trnAmtMatch[1]),
        type: trnTypeMatch ? trnTypeMatch[1] : 'OTHER'
      };
      
      transactions.push(transaction);
      console.log(`✅ Transação adicionada: ${transaction.description} - R$ ${transaction.amount}`);
    } else {
      console.log(`❌ Transação ignorada - campos obrigatórios ausentes`);
    }
  }

  console.log(`\n📊 Total de transações encontradas: ${transactions.length}`);

  return {
    transactions,
    accountId,
    balance,
    balanceDate: balanceDate ? new Date() : new Date()
  };
}

async function testParser() {
  try {
    console.log('🚀 Testando parser OFX diretamente...');
    
    const filePath = 'D:\\bgYdWhurJWcGUDUd\\Nubank_2025-09-25.ofx';
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('📄 Arquivo lido com sucesso');
    console.log(`📄 Primeiros 500 caracteres:\n${fileContent.substring(0, 500)}`);
    
    const result = parseOFXCustom(fileContent);
    
    console.log('\n=== RESULTADO FINAL ===');
    console.log(`Account ID: ${result.accountId}`);
    console.log(`Balance: ${result.balance}`);
    console.log(`Transações: ${result.transactions.length}`);
    
    if (result.transactions.length > 0) {
      console.log('\n📋 Primeiras 3 transações:');
      result.transactions.slice(0, 3).forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.description} - R$ ${transaction.amount} (${transaction.type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

testParser();