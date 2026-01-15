import { MapGridManager } from '../MapGrid';
import { RoomGenerator } from '../RoomGenerator';
import { TileType } from '../types';

describe('RoomGenerator', () => {
  let map: MapGridManager;
  let generator: RoomGenerator;

  beforeEach(() => {
    map = new MapGridManager(50, 50);
    generator = new RoomGenerator(map, 10, 4, 8);
  });

  describe('room generation', () => {
    it('should generate rooms', () => {
      const rooms = generator.generate();
      expect(rooms.length).toBeGreaterThan(0);
    });

    it('should not exceed max rooms', () => {
      const rooms = generator.generate();
      expect(rooms.length).toBeLessThanOrEqual(10);
    });

    it('should generate rooms within bounds', () => {
      const rooms = generator.generate();
      rooms.forEach(room => {
        expect(room.x).toBeGreaterThanOrEqual(1);
        expect(room.y).toBeGreaterThanOrEqual(1);
        expect(room.x + room.width).toBeLessThan(map.getWidth() - 1);
        expect(room.y + room.height).toBeLessThan(map.getHeight() - 1);
      });
    });

    it('should generate rooms within size limits', () => {
      const rooms = generator.generate();
      rooms.forEach(room => {
        expect(room.width).toBeGreaterThanOrEqual(4);
        expect(room.width).toBeLessThanOrEqual(8);
        expect(room.height).toBeGreaterThanOrEqual(4);
        expect(room.height).toBeLessThanOrEqual(8);
      });
    });

    it('should carve floor tiles for rooms', () => {
      const rooms = generator.generate();
      rooms.forEach(room => {
        for (let y = room.y; y < room.y + room.height; y++) {
          for (let x = room.x; x < room.x + room.width; x++) {
            expect(map.getTile(x, y)?.type).toBe(TileType.FLOOR);
          }
        }
      });
    });

    it('should connect rooms with corridors', () => {
      const rooms = generator.generate();
      if (rooms.length > 1) {
        const center1 = {
          x: Math.floor(rooms[0].x + rooms[0].width / 2),
          y: Math.floor(rooms[0].y + rooms[0].height / 2)
        };
        const center2 = {
          x: Math.floor(rooms[1].x + rooms[1].width / 2),
          y: Math.floor(rooms[1].y + rooms[1].height / 2)
        };

        let pathExists = false;
        const visited = new Set<string>();
        const queue = [[center1.x, center1.y]];

        while (queue.length > 0) {
          const [x, y] = queue.shift()!;
          const key = `${x},${y}`;

          if (visited.has(key)) continue;
          visited.add(key);

          if (x === center2.x && y === center2.y) {
            pathExists = true;
            break;
          }

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

        expect(pathExists).toBe(true);
      }
    });
  });

  describe('room validation', () => {
    it('should not generate overlapping rooms', () => {
      const rooms = generator.generate();
      for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
          const room1 = rooms[i];
          const room2 = rooms[j];
          const overlap = !(
            room1.x + room1.width + 1 < room2.x ||
            room2.x + room2.width + 1 < room1.x ||
            room1.y + room1.height + 1 < room2.y ||
            room2.y + room2.height + 1 < room1.y
          );
          expect(overlap).toBe(false);
        }
      }
    });
  });

  describe('edge cases', () => {
    it('should handle small map', () => {
      const smallMap = new MapGridManager(20, 20);
      const smallGenerator = new RoomGenerator(smallMap, 3, 3, 5);
      const rooms = smallGenerator.generate();
      expect(rooms.length).toBeGreaterThan(0);
    });

    it('should handle large map', () => {
      const largeMap = new MapGridManager(100, 100);
      const largeGenerator = new RoomGenerator(largeMap, 20, 5, 10);
      const rooms = largeGenerator.generate();
      expect(rooms.length).toBeGreaterThan(0);
    });

    it('should handle zero max rooms', () => {
      const zeroGenerator = new RoomGenerator(map, 0, 4, 8);
      const rooms = zeroGenerator.generate();
      expect(rooms.length).toBe(0);
    });
  });
});
