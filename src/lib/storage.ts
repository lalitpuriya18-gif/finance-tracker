import { FinanceData } from '../types/finance';

export interface IStorageProvider {
  loadData(): Promise<FinanceData | null>;
  saveData(data: FinanceData): Promise<void>;
  clearData(): Promise<void>;
}

const STORAGE_KEY = 'fintrack_v1_data';

export class LocalStorageProvider implements IStorageProvider {
  async loadData(): Promise<FinanceData | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as FinanceData;
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
      return null;
    }
  }

  async saveData(data: FinanceData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data to localStorage', e);
    }
  }

  async clearData(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear data from localStorage', e);
    }
  }
}

/**
 * Example Supabase Storage Provider stub.
 * To activate Supabase backend:
 * 1. npm install @supabase/supabase-js
 * 2. Initialize supabase client
 * 3. Replace default storage with SupabaseStorageProvider
 */
/*
export class SupabaseStorageProvider implements IStorageProvider {
  private client: any;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    // import { createClient } from '@supabase/supabase-js';
    // this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  async loadData(): Promise<FinanceData | null> {
    // const { data, error } = await this.client.from('user_finance').select('payload').single();
    // return data?.payload || null;
    return null;
  }

  async saveData(data: FinanceData): Promise<void> {
    // await this.client.from('user_finance').upsert({ payload: data });
  }

  async clearData(): Promise<void> {
    // await this.client.from('user_finance').delete();
  }
}
*/

// Active storage instance (swappable)
export const storage: IStorageProvider = new LocalStorageProvider();
