import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'test@example.com';
  const password = 'test123456';
  const name = 'Test User';

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER' as UserRole,
        settings: {
          voiceEnabled: true,
          textEnabled: true,
          imageEnabled: true,
        },
      },
    });

    console.log('Test user created successfully:', {
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
