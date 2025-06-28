import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const tagLength = 16;
const saltLength = 32;
const iterations = 100000;
const keyLength = 32;

export class EncryptionService {
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  }

  static encrypt(text: string, password: string = process.env.ENCRYPTION_KEY!): string {
    const salt = crypto.randomBytes(saltLength);
    const key = this.deriveKey(password, salt);
    const iv = crypto.randomBytes(ivLength);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    return combined.toString('base64');
  }

  static decrypt(encryptedData: string, password: string = process.env.ENCRYPTION_KEY!): string {
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.slice(0, saltLength);
    const iv = combined.slice(saltLength, saltLength + ivLength);
    const tag = combined.slice(saltLength + ivLength, saltLength + ivLength + tagLength);
    const encrypted = combined.slice(saltLength + ivLength + tagLength);
    
    const key = this.deriveKey(password, salt);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  }

  // Generate a user-specific encryption key
  static generateUserKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash sensitive data for indexing (one-way)
  static hash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + process.env.ENCRYPTION_KEY!)
      .digest('hex');
  }
}