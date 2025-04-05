import { db } from './server/db';
import { users } from './shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).execute();
    
    if (existingAdmin.length > 0) {
      console.log("Admin account already exists.");
      return;
    }
    
    // Create admin account
    const hashedPassword = await hashPassword('admin');
    
    const [adminUser] = await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      role: 'admin',
      name: 'System Administrator',
      isVerified: true, // Pre-verified
      verificationToken: null
    }).returning();
    
    console.log('Admin account created successfully:', adminUser);
  } catch (error) {
    console.error('Failed to create admin account:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();