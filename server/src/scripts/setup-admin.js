import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function setupAdmin() {
  const email = 'admin@talkai247.com';
  const password = 'Admin123!';
  const name = 'Admin User';

  try {
    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { email }
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        settings: {
          voiceEnabled: true,
          textEnabled: true,
          imageEnabled: true,
        },
      },
    });

    console.log('Admin user created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Create a regular test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@talkai247.com',
        password: await bcrypt.hash('Test123!', salt),
        name: 'Test User',
        role: 'USER',
        settings: {
          voiceEnabled: true,
          textEnabled: true,
          imageEnabled: true,
        },
      },
    });

    console.log('Test user created successfully:', {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      role: testUser.role
    });

  } catch (error) {
    console.error('Error setting up users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
