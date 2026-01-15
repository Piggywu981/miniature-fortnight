export enum TileType {
  WALL = 'wall',
  FLOOR = 'floor',
  DOOR = 'door',
  STAIRS_UP = 'stairs_up',
  STAIRS_DOWN = 'stairs_down',
  TRAP = 'trap',
  TREASURE = 'treasure'
}

export interface Tile {
  type: TileType;
  x: number;
  y: number;
  explored: boolean;
  visible: boolean;
}

export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  tiles: Tile[];
}

export interface MapConfig {
  width: number;
  height: number;
  maxRooms: number;
  minRoomSize: number;
  maxRoomSize: number;
}

export interface MapGrid {
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: Room[];
  playerStart: { x: number; y: number };
  stairsDown: { x: number; y: number };
}
