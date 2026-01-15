import { SaveManager } from '../SaveManager';
import { SaveData } from '../types';
import { Storage } from '../SaveManager';

const mockStorageData: Record<string, string> = {};

const getItemMock = jest.fn((key: string) => mockStorageData[key] || null);
const setItemMock = jest.fn((key: string, value: string) => { mockStorageData[key] = value; });
const removeItemMock = jest.fn((key: string) => { delete mockStorageData[key]; });
const clearMock = jest.fn(() => { Object.keys(mockStorageData).forEach(key => delete mockStorageData[key]); });

const mockStorage: Storage = {
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
  clear: clearMock
};

const mockTimer = {
  setInterval: (handler: () => void, timeout: number): number => {
    return setInterval(handler, timeout) as unknown as number;
  },
  clearInterval: (id: number) => {
    clearInterval(id as unknown as NodeJS.Timeout);
  }
};

describe('SaveManager', () => {
  let manager: SaveManager;

  beforeEach(() => {
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key]);
    getItemMock.mockClear();
    setItemMock.mockClear();
    removeItemMock.mockClear();
    clearMock.mockClear();
    
    manager = new SaveManager({ maxSlots: 3, enableAutoSave: false }, mockStorage, mockTimer);
  });

  afterEach(() => {
    manager.clearAllSaves();
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key]);
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const defaultManager = new SaveManager();
      const config = defaultManager.getConfig();
      expect(config.maxSlots).toBe(5);
      expect(config.autoSaveInterval).toBe(300000);
      expect(config.enableAutoSave).toBe(false);
    });

    it('should initialize with custom config', () => {
      const customManager = new SaveManager({ maxSlots: 10, autoSaveInterval: 60000 });
      const config = customManager.getConfig();
      expect(config.maxSlots).toBe(10);
      expect(config.autoSaveInterval).toBe(60000);
    });
  });

  describe('save creation', () => {
    it('should create save', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test Player',
          level: 5,
          experience: 100,
          health: 50,
          maxHealth: 100,
          position: { x: 10, y: 20 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      const slot = manager.createSave('Test Save', saveData);
      expect(slot).toBeDefined();
      expect(slot?.name).toBe('Test Save');
      expect(manager.getSaveCount()).toBe(1);
    });

    it('should not create save when slots full', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test',
          level: 1,
          experience: 0,
          health: 100,
          maxHealth: 100,
          position: { x: 0, y: 0 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      manager.createSave('Save 1', saveData);
      manager.createSave('Save 2', saveData);
      manager.createSave('Save 3', saveData);
      const slot = manager.createSave('Save 4', saveData);
      expect(slot).toBeNull();
    });
  });

  describe('save loading', () => {
    it('should load save', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test Player',
          level: 5,
          experience: 100,
          health: 50,
          maxHealth: 100,
          position: { x: 10, y: 20 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      const slot = manager.createSave('Test Save', saveData);
      expect(slot).not.toBeNull();
      const loaded = manager.loadSave(slot!.id);
      expect(loaded).toBeDefined();
      expect(loaded?.player.name).toBe('Test Player');
      expect(loaded?.player.level).toBe(5);
    });

    it('should return null for non-existent save', () => {
      const loaded = manager.loadSave('non_existent');
      expect(loaded).toBeNull();
    });
  });

  describe('save update', () => {
    it('should update save', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test Player',
          level: 5,
          experience: 100,
          health: 50,
          maxHealth: 100,
          position: { x: 10, y: 20 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      const slot = manager.createSave('Test Save', saveData);
      expect(slot).not.toBeNull();
      const updatedData: Partial<SaveData> = {
        player: {
          name: 'Test Player',
          level: 10,
          experience: 200,
          health: 80,
          maxHealth: 100,
          position: { x: 15, y: 25 }
        },
        map: {
          level: 2,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      const updated = manager.updateSave(slot!.id, updatedData);
      expect(updated).toBe(true);
      const loaded = manager.loadSave(slot!.id);
      expect(loaded?.player.level).toBe(10);
    });

    it('should not update non-existent save', () => {
      const updated = manager.updateSave('non_existent', {});
      expect(updated).toBe(false);
    });
  });

  describe('save deletion', () => {
    it('should delete save', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test',
          level: 1,
          experience: 0,
          health: 100,
          maxHealth: 100,
          position: { x: 0, y: 0 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      const slot = manager.createSave('Test Save', saveData);
      expect(slot).not.toBeNull();
      const deleted = manager.deleteSave(slot!.id);
      expect(deleted).toBe(true);
      expect(manager.getSaveCount()).toBe(0);
    });

    it('should not delete non-existent save', () => {
      const deleted = manager.deleteSave('non_existent');
      expect(deleted).toBe(false);
    });
  });

  describe('save queries', () => {
    it('should get all saves', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test',
          level: 1,
          experience: 0,
          health: 100,
          maxHealth: 100,
          position: { x: 0, y: 0 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      manager.createSave('Save 1', saveData);
      manager.createSave('Save 2', saveData);
      const saves = manager.getAllSaves();
      expect(saves.length).toBe(2);
    });

    it('should get save count', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test',
          level: 1,
          experience: 0,
          health: 100,
          maxHealth: 100,
          position: { x: 0, y: 0 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      expect(manager.getSaveCount()).toBe(0);
      manager.createSave('Save 1', saveData);
      expect(manager.getSaveCount()).toBe(1);
    });
  });

  describe('export and import', () => {
    it('should export save', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test Player',
          level: 5,
          experience: 100,
          health: 50,
          maxHealth: 100,
          position: { x: 10, y: 20 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      const slot = manager.createSave('Test Save', saveData);
      expect(slot).not.toBeNull();
      const exported = manager.exportSave(slot!.id);
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported!);
      expect(parsed.player.name).toBe('Test Player');
    });

    it('should return null for non-existent export', () => {
      const exported = manager.exportSave('non_existent');
      expect(exported).toBeNull();
    });

    it('should import save', () => {
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        player: {
          name: 'Imported Player',
          level: 10,
          experience: 500,
          health: 80,
          maxHealth: 100,
          position: { x: 5, y: 10 }
        },
        map: {
          level: 3,
          width: 60,
          height: 60,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      const json = JSON.stringify(saveData);
      const slot = manager.importSave(json, 'Imported Save');
      expect(slot).toBeDefined();
      expect(slot?.name).toBe('Imported Save');
      expect(manager.getSaveCount()).toBe(1);
    });

    it('should return null for invalid import', () => {
      const slot = manager.importSave('invalid json', 'Invalid Save');
      expect(slot).toBeNull();
    });
  });

  describe('auto save', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start auto save', () => {
      const autoSaveManager = new SaveManager({ maxSlots: 3, enableAutoSave: true, autoSaveInterval: 1000 }, mockStorage, mockTimer);
      const callback = jest.fn();
      autoSaveManager.startAutoSave(callback);
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalled();
      autoSaveManager.stopAutoSave();
    });

    it('should not start auto save when disabled', () => {
      const disabledManager = new SaveManager({ enableAutoSave: false }, mockStorage, mockTimer);
      const callback = jest.fn();
      disabledManager.startAutoSave(callback);
      jest.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();
    });

    it('should stop auto save', () => {
      const autoSaveManager = new SaveManager({ maxSlots: 3, enableAutoSave: true, autoSaveInterval: 1000 }, mockStorage, mockTimer);
      const callback = jest.fn();
      autoSaveManager.startAutoSave(callback);
      jest.advanceTimersByTime(1000);
      autoSaveManager.stopAutoSave();
      jest.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearing', () => {
    it('should clear all saves', () => {
      const saveData: Partial<SaveData> = {
        player: {
          name: 'Test',
          level: 1,
          experience: 0,
          health: 100,
          maxHealth: 100,
          position: { x: 0, y: 0 }
        },
        map: {
          level: 1,
          width: 50,
          height: 50,
          tiles: [],
          exploredTiles: []
        },
        inventory: [],
        equippedItems: []
      };

      manager.createSave('Save 1', saveData);
      manager.createSave('Save 2', saveData);
      manager.clearAllSaves();
      expect(manager.getSaveCount()).toBe(0);
    });
  });
});
