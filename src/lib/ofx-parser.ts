// @ts-ignore: Missing type definitions for ofx-js
import { parse } from 'ofx-js';

export interface OFXTransaction {
  fitId: string;
  date: Date;
  description: string;
  amount: number;
  type: string;
}

export interface ParsedOFXData {
  transactions: OFXTransaction[];
  accountId: string;
  balance: number;
  balanceDate: Date;
}

export function parseOFXFile(ofxContent: string): ParsedOFXData {
  try {
    console.log('Iniciando parse do arquivo OFX...');

    // Primeiro tenta usar a biblioteca ofx-js
    let data;
    try {
      data = parse(ofxContent);
      console.log('Parse com ofx-js concluído, estrutura:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.log('Erro no parse com ofx-js, tentando parser customizado:', error);
      data = parseOFXCustom(ofxContent);
      console.log('Parse customizado concluído, estrutura:', JSON.stringify(data, null, 2));
    }

    // Se o parse retornou vazio, tenta o parser customizado
    if (!data || Object.keys(data).length === 0) {
      console.log('Parse inicial retornou vazio, usando parser customizado...');
      data = parseOFXCustom(ofxContent);
      console.log('Parse customizado concluído, estrutura:', JSON.stringify(data, null, 2));
    }

    // Extrair informações da conta
    const accountId = data.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.CCACCTFROM?.ACCTID ||
      data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKACCTFROM?.ACCTID ||
      'unknown';
    console.log('Account ID encontrado:', accountId);

    // Extrair saldo
    const ledgerBal = data.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.LEDGERBAL ||
      data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.LEDGERBAL;

    const balance = parseFloat(ledgerBal?.BALAMT || '0');
    const balanceDate = parseOFXDate(ledgerBal?.DTASOF || '');
    console.log('Saldo encontrado:', balance, 'Data:', balanceDate);

    // Extrair transações
    const bankTranList = data.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST ||
      data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST;

    console.log('BANKTRANLIST encontrado:', bankTranList);

    const stmtTrns = bankTranList?.STMTTRN || [];
    console.log('STMTTRN raw:', stmtTrns);
    console.log('É array?', Array.isArray(stmtTrns));
    console.log('Quantidade de transações raw:', Array.isArray(stmtTrns) ? stmtTrns.length : 1);

    const transactionArray = Array.isArray(stmtTrns) ? stmtTrns : (stmtTrns ? [stmtTrns] : []);
    console.log('Array de transações processado:', transactionArray.length, 'itens');

    const transactions: OFXTransaction[] = transactionArray
      .filter(trn => {
        const isValid = trn && trn.FITID;
        if (!isValid) {
          console.log('Transação inválida filtrada:', trn);
        }
        return isValid;
      })
      .map(trn => {
        const transaction = {
          fitId: trn.FITID,
          date: parseOFXDate(trn.DTPOSTED),
          description: cleanDescription(trn.MEMO || trn.NAME || 'Transação sem descrição'),
          amount: parseFloat(trn.TRNAMT || '0'),
          type: trn.TRNTYPE || 'OTHER'
        };
        console.log('Transação processada:', transaction);
        return transaction;
      });

    console.log('Total de transações processadas:', transactions.length);

    return {
      transactions,
      accountId,
      balance,
      balanceDate
    };
  } catch (error) {
    console.error('Erro ao fazer parse do arquivo OFX:', error);
    throw new Error('Formato de arquivo OFX inválido');
  }
}

function parseOFXDate(dateString: string): Date {
  if (!dateString) return new Date();

  // Formato OFX: YYYYMMDDHHMMSS[+/-TZ]
  // Extrair apenas a parte da data (YYYYMMDD)
  const dateOnly = dateString.substring(0, 8);

  if (dateOnly.length !== 8) return new Date();

  const year = parseInt(dateOnly.substring(0, 4));
  const month = parseInt(dateOnly.substring(4, 6)) - 1; // Mês é 0-indexado
  const day = parseInt(dateOnly.substring(6, 8));

  return new Date(year, month, day);
}

// Parser customizado para arquivos OFX do Nubank
function parseOFXCustom(ofxContent: string): any {
  console.log('Iniciando parser customizado...');

  // Remove headers OFX
  const xmlContent = ofxContent.substring(ofxContent.indexOf('<OFX>'));
  console.log('Conteúdo XML extraído, tamanho:', xmlContent.length);

  // Extrai informações básicas usando regex
  const accountIdMatch = xmlContent.match(/<ACCTID>([^<]+)<\/ACCTID>/);
  const accountId = accountIdMatch ? accountIdMatch[1] : 'unknown';

  const balanceMatch = xmlContent.match(/<BALAMT>([^<]+)<\/BALAMT>/);
  const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;

  const balanceDateMatch = xmlContent.match(/<DTASOF>([^<]+)<\/DTASOF>/);
  const balanceDate = balanceDateMatch ? balanceDateMatch[1] : '';

  // Extrai todas as transações
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  const transactions = [];
  let match;

  while ((match = transactionRegex.exec(xmlContent)) !== null) {
    const transactionXml = match[1];

    const trnTypeMatch = transactionXml.match(/<TRNTYPE>([^<]+)<\/TRNTYPE>/);
    const dtPostedMatch = transactionXml.match(/<DTPOSTED>([^<]+)<\/DTPOSTED>/);
    const trnAmtMatch = transactionXml.match(/<TRNAMT>([^<]+)<\/TRNAMT>/);
    const fitIdMatch = transactionXml.match(/<FITID>([^<]+)<\/FITID>/);
    const memoMatch = transactionXml.match(/<MEMO>([^<]+)<\/MEMO>/);

    if (fitIdMatch && trnAmtMatch && dtPostedMatch) {
      transactions.push({
        TRNTYPE: trnTypeMatch ? trnTypeMatch[1] : 'OTHER',
        DTPOSTED: dtPostedMatch[1],
        TRNAMT: trnAmtMatch[1],
        FITID: fitIdMatch[1],
        MEMO: memoMatch ? memoMatch[1] : 'Sem descrição'
      });
    }
  }

  console.log('Parser customizado encontrou', transactions.length, 'transações');

  // Retorna estrutura compatível
  return {
    OFX: {
      CREDITCARDMSGSRSV1: {
        CCSTMTTRNRS: {
          CCSTMTRS: {
            CCACCTFROM: {
              ACCTID: accountId
            },
            BANKTRANLIST: {
              STMTTRN: transactions
            },
            LEDGERBAL: {
              BALAMT: balance.toString(),
              DTASOF: balanceDate
            }
          }
        }
      }
    }
  };
}

function cleanDescription(description: string): string {
  // Limpar e normalizar a descrição
  return description
    .trim()
    .replace(/\s+/g, ' ') // Substituir múltiplos espaços por um único espaço
    .substring(0, 255); // Limitar o tamanho
}

export function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();

  // Regras simples de categorização baseadas na descrição
  if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('padaria') || desc.includes('panificadora')) {
    return 'Alimentação';
  }

  if (desc.includes('posto') || desc.includes('combustivel') || desc.includes('abastecedora') || desc.includes('uber') || desc.includes('taxi')) {
    return 'Transporte';
  }

  if (desc.includes('farmacia') || desc.includes('hospital') || desc.includes('clinica') || desc.includes('medico')) {
    return 'Saúde';
  }

  if (desc.includes('escola') || desc.includes('universidade') || desc.includes('curso') || desc.includes('livro')) {
    return 'Educação';
  }

  if (desc.includes('cinema') || desc.includes('teatro') || desc.includes('netflix') || desc.includes('spotify') || desc.includes('jogo')) {
    return 'Entretenimento';
  }

  if (desc.includes('mercadolivre') || desc.includes('amazon') || desc.includes('loja') || desc.includes('shopping')) {
    return 'Compras';
  }

  if (desc.includes('recarga') || desc.includes('telefone') || desc.includes('internet') || desc.includes('luz') || desc.includes('agua')) {
    return 'Serviços';
  }

  if (desc.includes('salario') || desc.includes('pagamento recebido') || desc.includes('transferencia recebida')) {
    return 'Salário';
  }

  if (desc.includes('freelance') || desc.includes('consultoria') || desc.includes('servico prestado')) {
    return 'Freelance';
  }

  if (desc.includes('investimento') || desc.includes('aplicacao') || desc.includes('rendimento')) {
    return 'Investimentos';
  }

  return 'Outros';
}

