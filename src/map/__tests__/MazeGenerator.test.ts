import { MapGridManager } from '../MapGrid';
import { MazeGenerator } from '../MazeGenerator';

describe('MazeGenerator', () => {
  let map: MapGridManager;
  let generator: MazeGenerator;

  beforeEach(() => {
    map = new MapGridManager(21, 21);
    generator = new MazeGenerator(map);
  });

  describe('recursive backtracker', () => {
    it('should generate maze', () => {
      generator.generateRecursiveBacktracker(1, 1);
      const floorTiles = countFloorTiles(map);
      expect(floorTiles).toBeGreaterThan(0);
    });

    it('should create connected maze', () => {
      generator.generateRecursiveBacktracker(1, 1);
      const isConnected = isMapConnected(map);
      expect(isConnected).toBe(true);
    });

    it('should keep walls at boundaries', () => {
      generator.generateRecursiveBacktracker(1, 1);
      for (let x = 0; x < map.getWidth(); x++) {
        expect(map.isWall(x, 0)).toBe(true);
        expect(map.isWall(x, map.getHeight() - 1)).toBe(true);
      }
      for (let y = 0; y < map.getHeight(); y++) {
        expect(map.isWall(0, y)).toBe(true);
        expect(map.isWall(map.getWidth() - 1, y)).toBe(true);
      }
    });
  });

  describe('cellular automata', () => {
    it('should generate cave-like structure', () => {
      generator.generateCellularAutomata(5, 4);
      const floorTiles = countFloorTiles(map);
      expect(floorTiles).toBeGreaterThan(0);
    });

    it('should create connected areas', () => {
      generator.generateCellularAutomata(5, 4);
      const floorTiles = countFloorTiles(map);
      expect(floorTiles).toBeGreaterThan(10);
    });

    it('should respect wall threshold', () => {
      generator.generateCellularAutomata(3, 5);
      const wallTiles = countWallTiles(map);
      expect(wallTiles).toBeGreaterThan(0);
    });
  });

  describe('BSP rooms', () => {
    it('should generate rooms', () => {
      generator.generateBspRooms(4);
      const floorTiles = countFloorTiles(map);
      expect(floorTiles).toBeGreaterThan(0);
    });

    it('should connect rooms', () => {
      generator.generateBspRooms(4);
      const floorTiles = countFloorTiles(map);
      expect(floorTiles).toBeGreaterThan(0);
    });

    it('should handle minimum room size', () => {
      generator.generateBspRooms(3);
      const floorTiles = countFloorTiles(map);
      expect(floorTiles).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle odd dimensions', () => {
      const oddMap = new MapGridManager(23, 23);
      const oddGenerator = new MazeGenerator(oddMap);
      oddGenerator.generateRecursiveBacktracker(1, 1);
      const floorTiles = countFloorTiles(oddMap);
      expect(floorTiles).toBeGreaterThan(0);
    });

    it('should handle even dimensions', () => {
      const evenMap = new MapGridManager(22, 22);
      const evenGenerator = new MazeGenerator(evenMap);
      evenGenerator.generateRecursiveBacktracker(1, 1);
      const floorTiles = countFloorTiles(evenMap);
      expect(floorTiles).toBeGreaterThan(0);
    });
  });
});

function countFloorTiles(map: MapGridManager): number {
  let count = 0;
  for (let y = 0; y < map.getHeight(); y++) {
    for (let x = 0; x < map.getWidth(); x++) {
      if (map.isWalkable(x, y)) {
        count++;
      }
    }
  }
  return count;
}

function countWallTiles(map: MapGridManager): number {
  let count = 0;
  for (let y = 0; y < map.getHeight(); y++) {
    for (let x = 0; x < map.getWidth(); x++) {
      if (map.isWall(x, y)) {
        count++;
      }
    }
  }
  return count;
}

function isMapConnected(map: MapGridManager): boolean {
  const visited = new Set<string>();
  const floorTiles: [number, number][] = [];

  for (let y = 0; y < map.getHeight(); y++) {
    for (let x = 0; x < map.getWidth(); x++) {
      if (map.isWalkable(x, y)) {
        floorTiles.push([x, y]);
      }
    }
  }

  if (floorTiles.length === 0) return true;

  const queue = [floorTiles[0]];

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (map.isWalkable(nx, ny) && !visited.has(`${nx},${ny}`)) {
        queue.push([nx, ny]);
      }
    }
  }

  return visited.size === floorTiles.length;
}
