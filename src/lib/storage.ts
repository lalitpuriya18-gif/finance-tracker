import { FinanceData } from '../types/finance';
import { api } from './api';

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
 * Backend Storage Provider that synchronizes with the Express + SQLite database
 * with automatic fallback to localStorage in case of offline/network interruption.
 */
export class BackendStorageProvider implements IStorageProvider {
  private localFallback = new LocalStorageProvider();

  async loadData(): Promise<FinanceData | null> {
    try {
      const data = await api.getBootstrap();
      if (data && data.accounts && data.accounts.length > 0) {
        // Cache to local storage
        await this.localFallback.saveData(data);
        return data;
      }
    } catch (e) {
      console.warn('[Storage] Backend unavailable, falling back to localStorage cache:', e);
    }
    return this.localFallback.loadData();
  }

  async saveData(data: FinanceData): Promise<void> {
    // Always persist to local cache first for responsiveness
    await this.localFallback.saveData(data);
  }

  async clearData(): Promise<void> {
    try {
      await api.clearAllData();
    } catch (e) {
      console.warn('[Storage] Failed to clear backend data:', e);
    }
    await this.localFallback.clearData();
  }
}

// Active storage instance (swappable, defaults to Backend + Local fallback)
export const storage: IStorageProvider = new BackendStorageProvider();
