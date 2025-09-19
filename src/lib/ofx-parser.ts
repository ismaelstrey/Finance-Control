// @ts-expect-error - ofx-js não tem tipos TypeScript disponíveis
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
    // Primeiro tenta usar a biblioteca ofx-js
    let data;
    try {
      data = parse(ofxContent);
    } catch {
      data = parseOFXCustom(ofxContent);
    }

    // Se o parse retornou vazio, tenta o parser customizado
    if (!data || Object.keys(data).length === 0) {
      data = parseOFXCustom(ofxContent);
    }

    // Extrair informações da conta
    const accountId = data.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.CCACCTFROM?.ACCTID ||
      data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKACCTFROM?.ACCTID ||
      'unknown';

    // Extrair saldo
    const ledgerBal = data.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.LEDGERBAL ||
      data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.LEDGERBAL;

    const balance = parseFloat(ledgerBal?.BALAMT || '0');
    const balanceDate = parseOFXDate(ledgerBal?.DTASOF || '');

    // Extrair transações
    const bankTranList = data.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST ||
      data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST;

    const stmtTrns = bankTranList?.STMTTRN || [];
    const transactionArray = Array.isArray(stmtTrns) ? stmtTrns : (stmtTrns ? [stmtTrns] : []);

    const transactions: OFXTransaction[] = transactionArray
      .filter(trn => trn && trn.FITID)
      .map(trn => ({
        fitId: trn.FITID,
        date: parseOFXDate(trn.DTPOSTED),
        description: cleanDescription(trn.MEMO || trn.NAME || 'Transação sem descrição'),
        amount: parseFloat(trn.TRNAMT || '0'),
        type: trn.TRNTYPE || 'OTHER'
      }));

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
function parseOFXCustom(ofxContent: string): ParsedOFXData {
  // Remove headers OFX
  const xmlContent = ofxContent.substring(ofxContent.indexOf('<OFX>'));

  // Extrai informações básicas usando regex
  const accountIdMatch = xmlContent.match(/<ACCTID>([^<]+)<\/ACCTID>/);
  const accountId = accountIdMatch ? accountIdMatch[1] : 'unknown';

  const balanceMatch = xmlContent.match(/<BALAMT>([^<]+)<\/BALAMT>/);
  const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;

  const balanceDateMatch = xmlContent.match(/<DTASOF>([^<]+)<\/DTASOF>/);
  const balanceDate = balanceDateMatch ? balanceDateMatch[1] : '';

  // Extrai todas as transações
  const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  const transactions: OFXTransaction[] = [];
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
        fitId: fitIdMatch[1],
        date: new Date(dtPostedMatch[1].substring(0, 4) + '-' + dtPostedMatch[1].substring(4, 6) + '-' + dtPostedMatch[1].substring(6, 8)),
        description: memoMatch ? memoMatch[1] : 'Sem descrição',
        amount: parseFloat(trnAmtMatch[1]),
        type: trnTypeMatch ? trnTypeMatch[1] : 'OTHER'
      });
    }
  }

  // Retorna estrutura compatível
  return {
    transactions,
    accountId,
    balance,
    balanceDate: new Date(balanceDate)
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

