import { Tile, TileType, MapGrid, Room } from './types';

export class MapGridManager {
  private width: number;
  private height: number;
  private tiles: Tile[][];
  private rooms: Room[];
  private playerStart: { x: number; y: number };
  private stairsDown: { x: number; y: number };

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.rooms = [];
    this.playerStart = { x: 1, y: 1 };
    this.stairsDown = { x: 1, y: 1 };
    this.initializeGrid();
  }

  private initializeGrid(): void {
    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          type: TileType.WALL,
          x,
          y,
          explored: false,
          visible: false
        });
      }
      this.tiles.push(row);
    }
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getTile(x: number, y: number): Tile | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.tiles[y][x];
  }

  setTile(x: number, y: number, type: TileType): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x].type = type;
    }
  }

  getTiles(): Tile[][] {
    return this.tiles.map(row => row.map(tile => ({ ...tile })));
  }

  addRoom(room: Room): void {
    this.rooms.push(room);
  }

  getRooms(): Room[] {
    return this.rooms.map(room => ({ ...room }));
  }

  setPlayerStart(x: number, y: number): void {
    this.playerStart = { x, y };
  }

  getPlayerStart(): { x: number; y: number } {
    return { ...this.playerStart };
  }

  setStairsDown(x: number, y: number): void {
    this.stairsDown = { x, y };
  }

  getStairsDown(): { x: number; y: number } {
    return { ...this.stairsDown };
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    return tile.type === TileType.FLOOR || 
           tile.type === TileType.DOOR || 
           tile.type === TileType.STAIRS_DOWN;
  }

  isWall(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    if (!tile) return true;
    return tile.type === TileType.WALL;
  }

  setExplored(x: number, y: number, explored: boolean): void {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.explored = explored;
    }
  }

  setVisible(x: number, y: number, visible: boolean): void {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.visible = visible;
      if (visible) {
        tile.explored = true;
      }
    }
  }

  clearVisibility(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x].visible = false;
      }
    }
  }

  getExploredTiles(): Tile[] {
    const explored: Tile[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].explored) {
          explored.push({ ...this.tiles[y][x] });
        }
      }
    }
    return explored;
  }

  getVisibleTiles(): Tile[] {
    const visible: Tile[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].visible) {
          visible.push({ ...this.tiles[y][x] });
        }
      }
    }
    return visible;
  }

  serialize(): MapGrid {
    return {
      width: this.width,
      height: this.height,
      tiles: this.getTiles(),
      rooms: this.getRooms(),
      playerStart: this.getPlayerStart(),
      stairsDown: this.getStairsDown()
    };
  }

  static deserialize(data: MapGrid): MapGridManager {
    const map = new MapGridManager(data.width, data.height);
    for (let y = 0; y < data.height; y++) {
      for (let x = 0; x < data.width; x++) {
        map.setTile(x, y, data.tiles[y][x].type);
        map.setExplored(x, y, data.tiles[y][x].explored);
      }
    }
    data.rooms.forEach(room => map.addRoom(room));
    map.setPlayerStart(data.playerStart.x, data.playerStart.y);
    map.setStairsDown(data.stairsDown.x, data.stairsDown.y);
    return map;
  }
}
