import { MapGridManager } from './MapGrid';
import { TileType } from './types';

export class MazeGenerator {
  private map: MapGridManager;

  constructor(map: MapGridManager) {
    this.map = map;
  }

  generateRecursiveBacktracker(startX: number, startY: number): void {
    const width = this.map.getWidth();
    const height = this.map.getHeight();
    const visited = new Set<string>();

    const visit = (x: number, y: number) => {
      visited.add(`${x},${y}`);

      const directions = [
        { dx: 0, dy: -2 },
        { dx: 0, dy: 2 },
        { dx: -2, dy: 0 },
        { dx: 2, dy: 0 }
      ];

      this.shuffleArray(directions);

      for (const dir of directions) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;

        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && !visited.has(`${nx},${ny}`)) {
          const wallX = x + dir.dx / 2;
          const wallY = y + dir.dy / 2;
          this.map.setTile(wallX, wallY, TileType.FLOOR);
          this.map.setTile(nx, ny, TileType.FLOOR);
          visit(nx, ny);
        }
      }
    };

    this.map.setTile(startX, startY, TileType.FLOOR);
    visit(startX, startY);
  }

  generateCellularAutomata(iterations: number = 5, wallThreshold: number = 4): void {
    const width = this.map.getWidth();
    const height = this.map.getHeight();

    this.randomizeMap(0.45);

    for (let i = 0; i < iterations; i++) {
      const newTiles: TileType[][] = [];

      for (let y = 0; y < height; y++) {
        newTiles[y] = [];
        for (let x = 0; x < width; x++) {
          if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            newTiles[y][x] = TileType.WALL;
          } else {
            const neighbors = this.countWallNeighbors(x, y);
            newTiles[y][x] = neighbors >= wallThreshold ? TileType.WALL : TileType.FLOOR;
          }
        }
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          this.map.setTile(x, y, newTiles[y][x]);
        }
      }
    }
  }

  private randomizeMap(wallProbability: number): void {
    const width = this.map.getWidth();
    const height = this.map.getHeight();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          this.map.setTile(x, y, TileType.WALL);
        } else {
          const isWall = Math.random() < wallProbability;
          this.map.setTile(x, y, isWall ? TileType.WALL : TileType.FLOOR);
        }
      }
    }
  }

  private countWallNeighbors(x: number, y: number): number {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;

        if (this.map.isWall(nx, ny)) {
          count++;
        }
      }
    }
    return count;
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  generateBspRooms(minRoomSize: number): void {
    const width = this.map.getWidth();
    const height = this.map.getHeight();
    const rooms: { x: number; y: number; width: number; height: number }[] = [];

    const split = (x: number, y: number, w: number, h: number, depth: number) => {
      if (depth > 4 || w < minRoomSize * 2 || h < minRoomSize * 2) {
        const roomW = Math.max(minRoomSize, w - 2);
        const roomH = Math.max(minRoomSize, h - 2);
        const roomX = x + Math.floor((w - roomW) / 2);
        const roomY = y + Math.floor((h - roomH) / 2);
        rooms.push({ x: roomX, y: roomY, width: roomW, height: roomH });
        return;
      }

      const splitHorizontal = Math.random() < 0.5;

      if (splitHorizontal && h >= minRoomSize * 2) {
        const splitY = y + Math.floor(Math.random() * (h - minRoomSize * 2)) + minRoomSize;
        split(x, y, w, splitY - y, depth + 1);
        split(x, splitY, w, y + h - splitY, depth + 1);
      } else if (w >= minRoomSize * 2) {
        const splitX = x + Math.floor(Math.random() * (w - minRoomSize * 2)) + minRoomSize;
        split(x, y, splitX - x, h, depth + 1);
        split(splitX, y, x + w - splitX, h, depth + 1);
      } else {
        const roomW = Math.max(minRoomSize, w - 2);
        const roomH = Math.max(minRoomSize, h - 2);
        const roomX = x + Math.floor((w - roomW) / 2);
        const roomY = y + Math.floor((h - roomH) / 2);
        rooms.push({ x: roomX, y: roomY, width: roomW, height: roomH });
      }
    };

    split(1, 1, width - 2, height - 2, 0);

    rooms.forEach(room => {
      for (let ry = room.y; ry < room.y + room.height; ry++) {
        for (let rx = room.x; rx < room.x + room.width; rx++) {
          this.map.setTile(rx, ry, TileType.FLOOR);
        }
      }
    });

    for (let i = 1; i < rooms.length; i++) {
      const room1 = rooms[i - 1];
      const room2 = rooms[i];
      const center1 = { x: room1.x + Math.floor(room1.width / 2), y: room1.y + Math.floor(room1.height / 2) };
      const center2 = { x: room2.x + Math.floor(room2.width / 2), y: room2.y + Math.floor(room2.height / 2) };

      if (Math.random() < 0.5) {
        this.createHorizontalTunnel(center1.x, center2.x, center1.y);
        this.createVerticalTunnel(center1.y, center2.y, center2.x);
      } else {
        this.createVerticalTunnel(center1.y, center2.y, center1.x);
        this.createHorizontalTunnel(center1.x, center2.x, center2.y);
      }
    }
  }

  private createHorizontalTunnel(x1: number, x2: number, y: number): void {
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);

    for (let x = startX; x <= endX; x++) {
      this.map.setTile(x, y, TileType.FLOOR);
    }
  }

  private createVerticalTunnel(y1: number, y2: number, x: number): void {
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);

    for (let y = startY; y <= endY; y++) {
      this.map.setTile(x, y, TileType.FLOOR);
    }
  }
}
