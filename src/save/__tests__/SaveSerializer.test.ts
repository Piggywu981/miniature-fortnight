import { SaveSerializer } from '../SaveSerializer';
import { SaveData } from '../types';

describe('SaveSerializer', () => {
  let serializer: SaveSerializer;

  beforeEach(() => {
    serializer = new SaveSerializer();
  });

  describe('serialization', () => {
    it('should serialize save data', () => {
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

      const json = serializer.serialize(saveData);
      expect(typeof json).toBe('string');

      const parsed = JSON.parse(json);
      expect(parsed.version).toBe(serializer.getVersion());
      expect(parsed.player.name).toBe('Test Player');
    });

    it('should include version in serialized data', () => {
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

      const json = serializer.serialize(saveData);
      const parsed = JSON.parse(json);
      expect(parsed.version).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('deserialization', () => {
    it('should deserialize valid json', () => {
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
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

      const json = JSON.stringify(saveData);
      const deserialized = serializer.deserialize(json);
      expect(deserialized).toEqual(saveData);
    });

    it('should return null for invalid json', () => {
      const deserialized = serializer.deserialize('not a valid json string');
      expect(deserialized).toBeNull();
    });

    it('should return null for missing version', () => {
      const data = {
        timestamp: Date.now(),
        player: { name: 'Test', level: 1, experience: 0, health: 100, maxHealth: 100, position: { x: 0, y: 0 } },
        map: { level: 1, width: 50, height: 50, tiles: [], exploredTiles: [] },
        inventory: [],
        equippedItems: []
      };
      const json = JSON.stringify(data);
      const deserialized = serializer.deserialize(json);
      expect(deserialized).toBeNull();
    });

    it('should return null for missing player', () => {
      const data = {
        version: '1.0.0',
        timestamp: Date.now(),
        map: { level: 1, width: 50, height: 50, tiles: [], exploredTiles: [] },
        inventory: [],
        equippedItems: []
      };
      const json = JSON.stringify(data);
      const deserialized = serializer.deserialize(json);
      expect(deserialized).toBeNull();
    });
  });

  describe('version', () => {
    it('should return version', () => {
      const version = serializer.getVersion();
      expect(version).toBe('1.0.0');
    });
  });
});
