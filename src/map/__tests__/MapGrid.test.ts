import { MapGridManager } from '../MapGrid';
import { TileType } from '../types';

describe('MapGridManager', () => {
  let map: MapGridManager;

  beforeEach(() => {
    map = new MapGridManager(10, 10);
  });

  describe('initialization', () => {
    it('should initialize with correct dimensions', () => {
      expect(map.getWidth()).toBe(10);
      expect(map.getHeight()).toBe(10);
    });

    it('should initialize all tiles as walls', () => {
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          const tile = map.getTile(x, y);
          expect(tile?.type).toBe(TileType.WALL);
        }
      }
    });

    it('should initialize all tiles as unexplored and invisible', () => {
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          const tile = map.getTile(x, y);
          expect(tile?.explored).toBe(false);
          expect(tile?.visible).toBe(false);
        }
      }
    });
  });

  describe('tile management', () => {
    it('should get tile at valid position', () => {
      const tile = map.getTile(5, 5);
      expect(tile).not.toBeNull();
      expect(tile?.x).toBe(5);
      expect(tile?.y).toBe(5);
    });

    it('should return null for invalid position', () => {
      expect(map.getTile(-1, 5)).toBeNull();
      expect(map.getTile(10, 5)).toBeNull();
      expect(map.getTile(5, -1)).toBeNull();
      expect(map.getTile(5, 10)).toBeNull();
    });

    it('should set tile type', () => {
      map.setTile(5, 5, TileType.FLOOR);
      const tile = map.getTile(5, 5);
      expect(tile?.type).toBe(TileType.FLOOR);
    });

    it('should not set tile at invalid position', () => {
      map.setTile(-1, 5, TileType.FLOOR);
      map.setTile(10, 5, TileType.FLOOR);
      expect(map.getTile(-1, 5)).toBeNull();
      expect(map.getTile(10, 5)).toBeNull();
    });
  });

  describe('walkability', () => {
    it('should identify floor as walkable', () => {
      map.setTile(5, 5, TileType.FLOOR);
      expect(map.isWalkable(5, 5)).toBe(true);
    });

    it('should identify door as walkable', () => {
      map.setTile(5, 5, TileType.DOOR);
      expect(map.isWalkable(5, 5)).toBe(true);
    });

    it('should identify stairs down as walkable', () => {
      map.setTile(5, 5, TileType.STAIRS_DOWN);
      expect(map.isWalkable(5, 5)).toBe(true);
    });

    it('should identify wall as not walkable', () => {
      expect(map.isWalkable(5, 5)).toBe(false);
    });

    it('should return false for invalid position', () => {
      expect(map.isWalkable(-1, 5)).toBe(false);
    });
  });

  describe('wall detection', () => {
    it('should identify wall correctly', () => {
      expect(map.isWall(5, 5)).toBe(true);
    });

    it('should identify non-wall correctly', () => {
      map.setTile(5, 5, TileType.FLOOR);
      expect(map.isWall(5, 5)).toBe(false);
    });

    it('should return true for invalid position', () => {
      expect(map.isWall(-1, 5)).toBe(true);
    });
  });

  describe('visibility and exploration', () => {
    it('should set explored flag', () => {
      map.setExplored(5, 5, true);
      const tile = map.getTile(5, 5);
      expect(tile?.explored).toBe(true);
    });

    it('should set visible flag', () => {
      map.setVisible(5, 5, true);
      const tile = map.getTile(5, 5);
      expect(tile?.visible).toBe(true);
      expect(tile?.explored).toBe(true);
    });

    it('should clear all visibility', () => {
      map.setVisible(5, 5, true);
      map.setVisible(6, 6, true);
      map.clearVisibility();
      expect(map.getTile(5, 5)?.visible).toBe(false);
      expect(map.getTile(6, 6)?.visible).toBe(false);
    });

    it('should keep explored flags after clearing visibility', () => {
      map.setVisible(5, 5, true);
      map.clearVisibility();
      expect(map.getTile(5, 5)?.explored).toBe(true);
    });

    it('should get explored tiles', () => {
      map.setVisible(5, 5, true);
      map.setVisible(6, 6, true);
      const explored = map.getExploredTiles();
      expect(explored.length).toBe(2);
    });

    it('should get visible tiles', () => {
      map.setVisible(5, 5, true);
      map.setVisible(6, 6, true);
      const visible = map.getVisibleTiles();
      expect(visible.length).toBe(2);
    });
  });

  describe('room management', () => {
    it('should add room', () => {
      const room = {
        x: 2,
        y: 2,
        width: 3,
        height: 3,
        tiles: []
      };
      map.addRoom(room);
      expect(map.getRooms().length).toBe(1);
    });

    it('should get rooms', () => {
      const room1 = { x: 2, y: 2, width: 3, height: 3, tiles: [] };
      const room2 = { x: 6, y: 6, width: 3, height: 3, tiles: [] };
      map.addRoom(room1);
      map.addRoom(room2);
      const rooms = map.getRooms();
      expect(rooms.length).toBe(2);
    });
  });

  describe('player start position', () => {
    it('should set player start', () => {
      map.setPlayerStart(5, 5);
      const start = map.getPlayerStart();
      expect(start.x).toBe(5);
      expect(start.y).toBe(5);
    });

    it('should get default player start', () => {
      const start = map.getPlayerStart();
      expect(start.x).toBe(1);
      expect(start.y).toBe(1);
    });
  });

  describe('stairs down position', () => {
    it('should set stairs down', () => {
      map.setStairsDown(8, 8);
      const stairs = map.getStairsDown();
      expect(stairs.x).toBe(8);
      expect(stairs.y).toBe(8);
    });

    it('should get default stairs down', () => {
      const stairs = map.getStairsDown();
      expect(stairs.x).toBe(1);
      expect(stairs.y).toBe(1);
    });
  });

  describe('serialization', () => {
    it('should serialize map data', () => {
      map.setTile(5, 5, TileType.FLOOR);
      map.setPlayerStart(3, 3);
      const data = map.serialize();
      expect(data.width).toBe(10);
      expect(data.height).toBe(10);
      expect(data.playerStart.x).toBe(3);
      expect(data.playerStart.y).toBe(3);
    });

    it('should deserialize map data', () => {
      map.setTile(5, 5, TileType.FLOOR);
      map.setPlayerStart(3, 3);
      const data = map.serialize();
      const deserialized = MapGridManager.deserialize(data);
      expect(deserialized.getWidth()).toBe(10);
      expect(deserialized.getTile(5, 5)?.type).toBe(TileType.FLOOR);
      expect(deserialized.getPlayerStart().x).toBe(3);
    });
  });
});
