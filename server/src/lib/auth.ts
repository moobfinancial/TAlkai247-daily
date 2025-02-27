import * as bcrypt from 'bcrypt';
import { promisify } from 'util';

const SALT_ROUNDS = 4; // Lower work factor for development

// Convert bcrypt.compare to a promise without using the built-in promise interface
const compareAsync = promisify<string, string, boolean>(bcrypt.compare);

export const hashPassword = async (password: string): Promise<string> => {
  try {
    console.log('Generating salt...');
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    console.log('Hashing password...');
    const hash = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const start = Date.now();
  console.log(`[bcrypt] Starting password comparison at ${new Date().toISOString()}`);
  console.log('[bcrypt] Password length:', password.length);
  console.log('[bcrypt] Hash length:', hashedPassword.length);
  
  try {
    // First, validate inputs
    if (!password || !hashedPassword) {
      console.error('[bcrypt] Invalid input: password or hash is empty');
      return false;
    }

    if (!hashedPassword.startsWith('$2')) {
      console.error('[bcrypt] Invalid hash format: does not start with $2');
      return false;
    }

    // Quick check of hash format and version
    const [, version] = hashedPassword.split('$');
    if (!version || !['2a', '2b', '2y'].includes(version)) {
      console.error('[bcrypt] Invalid hash version:', version);
      return false;
    }

    console.log('[bcrypt] Hash validation passed, starting comparison...');
    
    let completed = false;
    const timeoutId = setTimeout(() => {
      if (!completed) {
        console.error(`[bcrypt] Still waiting for comparison at ${Date.now() - start}ms`);
      }
    }, 1000);

    try {
      // Use the promisified version with a shorter timeout
      const result = await Promise.race<boolean>([
        compareAsync(password, hashedPassword),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => {
            console.error(`[bcrypt] Comparison timeout after 3000ms`);
            reject(new Error('Comparison timeout'));
          }, 3000)
        )
      ]);

      completed = true;
      clearTimeout(timeoutId);

      const duration = Date.now() - start;
      console.log(`[bcrypt] Comparison completed in ${duration}ms with result:`, result);
      return result;
    } catch (error) {
      completed = true;
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[bcrypt] Error comparing passwords after ${duration}ms:`, error);
    if (error instanceof Error) {
      console.error('[bcrypt] Error message:', error.message);
      console.error('[bcrypt] Error stack:', error.stack);
    }
    return false;
  }
};
