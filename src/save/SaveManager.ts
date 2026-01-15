import { SaveSlot, SaveData, SaveConfig } from './types';
import { SaveSlotManager } from './SaveSlot';
import { SaveSerializer } from './SaveSerializer';

const getLocalStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

const getWindow = () => {
  if (typeof window !== 'undefined') {
    return window;
  }
  return null;
};

interface Timer {
  setInterval: (handler: () => void, timeout: number) => number;
  clearInterval: (id: number) => void;
}

const getTimer = (): Timer | null => {
  const windowObj = getWindow();
  if (windowObj) {
    return {
      setInterval: windowObj.setInterval,
      clearInterval: windowObj.clearInterval
    };
  }
  return null;
};

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

class DefaultStorage implements Storage {
  getItem(key: string): string | null {
    try {
      const localStorage = getLocalStorage();
      if (localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      const localStorage = getLocalStorage();
      if (localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Failed to set item in storage:', error);
    }
  }

  removeItem(key: string): void {
    try {
      const localStorage = getLocalStorage();
      if (localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to remove item from storage:', error);
    }
  }

  clear(): void {
    try {
      const localStorage = getLocalStorage();
      if (localStorage) {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

export class SaveManager {
  private slotManager: SaveSlotManager;
  private serializer: SaveSerializer;
  private config: SaveConfig;
  private autoSaveTimer: number | null;
  private storage: Storage;
  private timer: Timer | null;

  constructor(config?: Partial<SaveConfig>, storage?: Storage, timer?: Timer) {
    this.config = {
      maxSlots: 5,
      autoSaveInterval: 300000,
      enableAutoSave: false,
      ...config
    };
    this.slotManager = new SaveSlotManager(this.config.maxSlots);
    this.serializer = new SaveSerializer();
    this.storage = storage || new DefaultStorage();
    this.timer = timer || getTimer();
    this.autoSaveTimer = null;
  }

  createSave(name: string, saveData: Partial<SaveData>): SaveSlot | null {
    if (!this.slotManager.canCreateSlot()) {
      return null;
    }

    const slot = this.slotManager.createSlot(name);
    if (!slot) {
      return null;
    }

    const success = this.saveToStorage(slot.id, saveData);

    if (!success) {
      this.slotManager.deleteSlot(slot.id);
      return null;
    }

    return slot;
  }

  loadSave(slotId: string): SaveData | null {
    const slot = this.slotManager.getSlot(slotId);
    if (!slot) {
      return null;
    }

    const json = this.loadFromStorage(slotId);
    if (!json) {
      return null;
    }

    return this.serializer.deserialize(json);
  }

  updateSave(slotId: string, saveData: Partial<SaveData>): boolean {
    const slot = this.slotManager.getSlot(slotId);
    if (!slot) {
      return false;
    }

    const success = this.saveToStorage(slotId, saveData);
    if (!success) {
      return false;
    }

    this.slotManager.updateSlot(slotId, {
      timestamp: Date.now(),
      level: saveData.player?.level || slot.level,
      playTime: (slot.playTime || 0) + 1
    });

    return true;
  }

  deleteSave(slotId: string): boolean {
    const success = this.slotManager.deleteSlot(slotId);
    if (!success) {
      return false;
    }

    this.removeFromStorage(slotId);
    return true;
  }

  getAllSaves(): SaveSlot[] {
    return this.slotManager.getAllSlots();
  }

  getSaveCount(): number {
    return this.slotManager.getSlotCount();
  }

  exportSave(slotId: string): string | null {
    const slot = this.slotManager.getSlot(slotId);
    if (!slot) {
      return null;
    }

    const json = this.loadFromStorage(slotId);
    if (!json) {
      return null;
    }

    return json;
  }

  importSave(json: string, name: string): SaveSlot | null {
    const saveData = this.serializer.deserialize(json);
    if (!saveData) {
      return null;
    }

    return this.createSave(name, saveData);
  }

  startAutoSave(callback: (saveData: Partial<SaveData>) => void): void {
    if (!this.config.enableAutoSave) {
      return;
    }

    this.stopAutoSave();
    if (this.timer) {
      this.autoSaveTimer = this.timer.setInterval(() => {
        callback({});
      }, this.config.autoSaveInterval);
    }
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer !== null && this.timer) {
      this.timer.clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private saveToStorage(slotId: string, saveData: Partial<SaveData>): boolean {
    try {
      const json = this.serializer.serialize(saveData);
      this.storage.setItem(`save_${slotId}`, json);
      return true;
    } catch (error) {
      console.error('Failed to save to storage:', error);
      return false;
    }
  }

  private loadFromStorage(slotId: string): string | null {
    try {
      return this.storage.getItem(`save_${slotId}`);
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return null;
    }
  }

  private removeFromStorage(slotId: string): void {
    try {
      this.storage.removeItem(`save_${slotId}`);
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  }

  clearAllSaves(): void {
    const slots = this.slotManager.getAllSlots();
    slots.forEach(slot => {
      this.deleteSave(slot.id);
    });
    this.slotManager.clear();
    this.storage.clear();
  }

  getConfig(): SaveConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<SaveConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getSerializer(): SaveSerializer {
    return this.serializer;
  }
}

export { Storage };
