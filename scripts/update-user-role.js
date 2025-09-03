const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Update the user with email codedblood22@gmail.com to INSTRUCTOR role
    const updatedUser = await prisma.user.update({
      where: {
        email: 'codedblood22@gmail.com'
      },
      data: {
        role: 'INSTRUCTOR'
      }
    });

    console.log('User role updated successfully:');
    console.log(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
