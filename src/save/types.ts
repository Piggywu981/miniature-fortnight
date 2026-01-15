export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  level: number;
  playTime: number;
}

export interface SaveData {
  version: string;
  timestamp: number;
  player: {
    name: string;
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    position: { x: number; y: number };
  };
  map: {
    level: number;
    width: number;
    height: number;
    tiles: any;
    exploredTiles: { x: number; y: number }[];
  };
  inventory: any[];
  equippedItems: any[];
}

export interface SaveConfig {
  maxSlots: number;
  autoSaveInterval: number;
  enableAutoSave: boolean;
}
