import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      nickname: 'Shichiya',
    },
  });
  console.log('Seed completed: admin user created (username: admin, password: admin123)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
