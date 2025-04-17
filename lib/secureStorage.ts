import { AES, enc } from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_ENCRYPTION_KEY || 'fallback-key';

interface SecureStorageError extends Error {
  code: string;
  timestamp: string;
}

class StorageError extends Error implements SecureStorageError {
  code: string;
  timestamp: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

export const createSecureStorage = () => {
  return {
    getItem: (key: string): string | null => {
      try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        
        const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY).toString(enc.Utf8);
        if (!decrypted) {
          throw new StorageError('Decryption failed', 'DECRYPT_ERROR');
        }
        return decrypted;
      } catch (error) {
        console.error('Storage retrieval error:', error);
        throw new StorageError(
          'Failed to retrieve data from secure storage',
          'RETRIEVE_ERROR'
        );
      }
    },
    
    setItem: (key: string, value: string): void => {
      try {
        if (!value) {
          throw new StorageError('Cannot store empty value', 'INVALID_VALUE');
        }
        const encrypted = AES.encrypt(value, ENCRYPTION_KEY).toString();
        localStorage.setItem(key, encrypted);
      } catch (error) {
        console.error('Storage save error:', error);
        throw new StorageError(
          'Failed to save data to secure storage',
          'SAVE_ERROR'
        );
      }
    },
    
    removeItem: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Storage removal error:', error);
        throw new StorageError(
          'Failed to remove data from secure storage',
          'REMOVE_ERROR'
        );
      }
    },
  };
};