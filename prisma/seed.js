// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Populando banco de dados...')

  const hashedPassword = await bcrypt.hash('demo123', 12)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@furagames.com' },
    update: {},
    create: { name: 'Demo User', email: 'demo@furagames.com', password: hashedPassword },
  })

  console.log('✅ Usuário criado:', demoUser.email)

  await prisma.gameReview.upsert({
    where: { id: 'seed-1' },
    update: {},
    create: {
      id: 'seed-1',
      userId: demoUser.id,
      title: 'The Legend of Zelda: Tears of the Kingdom',
      platform: 'Nintendo Switch',
      genre: 'Action-Adventure',
      rating: 10,
      hoursPlayed: 120,
      status: 'completed',
      review: 'Uma obra-prima absoluta. A liberdade de criação é incomparável.',
      pros: ['Gameplay inovador', 'Mundo imenso', 'Liberdade criativa'],
      cons: ['Performance em algumas áreas'],
      coverImage: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&h=600&fit=crop',
    },
  })

  await prisma.gameReview.upsert({
    where: { id: 'seed-2' },
    update: {},
    create: {
      id: 'seed-2',
      userId: demoUser.id,
      title: 'Elden Ring',
      platform: 'PC',
      genre: 'Action RPG',
      rating: 9,
      hoursPlayed: 85,
      status: 'completed',
      review: 'O melhor jogo da FromSoftware. O mundo aberto funciona perfeitamente.',
      pros: ['Mundo aberto incrível', 'Combate satisfatório'],
      cons: ['Alguns bosses repetidos'],
      coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    },
  })

  const group = await prisma.group.upsert({
    where: { id: 'seed-group-1' },
    update: {},
    create: {
      id: 'seed-group-1',
      name: 'RPG Enthusiasts',
      description: 'Grupo para amantes de RPGs de todos os tipos',
      ownerId: demoUser.id,
      inviteCode: 'RPG2024',
    },
  })

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: demoUser.id, groupId: group.id } },
    update: {},
    create: { userId: demoUser.id, groupId: group.id, role: 'owner' },
  })

  console.log('✅ Reviews e grupo criados')
  console.log('\n🎮 Seed concluído!')
  console.log('   Login: demo@furagames.com / demo123')
  console.log('   Invite code: RPG2024')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
