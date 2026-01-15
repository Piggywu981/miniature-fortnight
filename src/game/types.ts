export enum GameState {
  INITIALIZING = 'initializing',
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  COMBAT = 'combat',
  GAME_OVER = 'game_over',
  VICTORY = 'victory'
}

export interface GameConfig {
  mapWidth: number;
  mapHeight: number;
  maxRooms: number;
  enableAutoSave: boolean;
  autoSaveInterval: number;
}

export interface GameStats {
  playTime: number;
  roomsExplored: number;
  enemiesDefeated: number;
  itemsCollected: number;
  damageDealt: number;
  damageTaken: number;
}
