const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getUserByEmail() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'devblackie@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (user) {
      console.log('User found:');
      console.log('ID:', user.id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUserByEmail();
