import { SaveData } from './types';

export class SaveSerializer {
  private static readonly VERSION = '1.0.0';

  serialize(data: Partial<SaveData>): string {
    const saveData: SaveData = {
      version: SaveSerializer.VERSION,
      timestamp: Date.now(),
      ...data
    } as SaveData;

    return JSON.stringify(saveData, null, 2);
  }

  deserialize(json: string): SaveData | null {
    try {
      const data = JSON.parse(json) as SaveData;

      if (!this.validateSaveData(data)) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to deserialize save data:', error);
      return null;
    }
  }

  private validateSaveData(data: any): data is SaveData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!data.version || typeof data.version !== 'string') {
      return false;
    }

    if (!data.timestamp || typeof data.timestamp !== 'number') {
      return false;
    }

    if (!data.player || typeof data.player !== 'object') {
      return false;
    }

    if (!data.map || typeof data.map !== 'object') {
      return false;
    }

    if (!data.inventory || !Array.isArray(data.inventory)) {
      return false;
    }

    return true;
  }

  getVersion(): string {
    return SaveSerializer.VERSION;
  }
}
