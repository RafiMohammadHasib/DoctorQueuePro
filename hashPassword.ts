import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function updatePassword() {
  try {
    // Get the user
    const [user] = await db.select().from(users).where(eq(users.username, 'drjohnson'));
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword('password123');
    
    // Update the user
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
  }
}

updatePassword().then(() => process.exit(0));