import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Entretenimento',
    'Compras',
    'Serviços',
    'Salário',
    'Freelance',
    'Investimentos',
    'Outros'
  ]

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    })
  }

  console.log('Categorias criadas com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
