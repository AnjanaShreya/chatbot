const prisma = require('./config/db');

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users registered:', users.length);
    console.log('User records:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
