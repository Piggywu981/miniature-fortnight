import { SaveSlotManager } from '../SaveSlot';
import { SaveSlot } from '../types';

describe('SaveSlotManager', () => {
  let manager: SaveSlotManager;

  beforeEach(() => {
    manager = new SaveSlotManager(3);
  });

  describe('initialization', () => {
    it('should initialize with empty slots', () => {
      expect(manager.getSlotCount()).toBe(0);
    });

    it('should initialize with max slots', () => {
      expect(manager.getMaxSlots()).toBe(3);
    });
  });

  describe('slot creation', () => {
    it('should create slot', () => {
      const slot = manager.createSlot('Test Save');
      expect(slot).not.toBeNull();
      if (slot) {
        expect(slot.name).toBe('Test Save');
        expect(manager.getSlotCount()).toBe(1);
      }
    });

    it('should generate unique id for each slot', () => {
      const slot1 = manager.createSlot('Save 1');
      const slot2 = manager.createSlot('Save 2');
      expect(slot1).not.toBeNull();
      expect(slot2).not.toBeNull();
      if (slot1 && slot2) {
        expect(slot1.id).not.toBe(slot2.id);
      }
    });

    it('should set initial values', () => {
      const slot = manager.createSlot('Test Save');
      expect(slot).not.toBeNull();
      if (slot) {
        expect(slot.level).toBe(1);
        expect(slot.playTime).toBe(0);
        expect(slot.timestamp).toBeGreaterThan(0);
      }
    });

    it('should not create slot when full', () => {
      manager.createSlot('Save 1');
      manager.createSlot('Save 2');
      manager.createSlot('Save 3');
      const slot = manager.createSlot('Save 4');
      expect(slot).toBeNull();
    });
  });

  describe('slot retrieval', () => {
    it('should get slot by id', () => {
      const created = manager.createSlot('Test Save');
      const retrieved = manager.getSlot(created!.id);
      expect(retrieved).not.toBeNull();
      if (retrieved) {
        expect(retrieved).toEqual(created);
      }
    });

    it('should return null for non-existent slot', () => {
      const slot = manager.getSlot('non_existent');
      expect(slot).toBeNull();
    });
  });

  describe('slot update', () => {
    it('should update slot', () => {
      const slot = manager.createSlot('Test Save');
      expect(slot).not.toBeNull();
      if (slot) {
        const updated = manager.updateSlot(slot.id, { level: 5 });
        expect(updated?.level).toBe(5);
        expect(manager.getSlot(slot.id)?.level).toBe(5);
      }
    });

    it('should not update non-existent slot', () => {
      const updated = manager.updateSlot('non_existent', { level: 5 });
      expect(updated).toBeNull();
    });
  });

  describe('slot deletion', () => {
    it('should delete slot', () => {
      const slot = manager.createSlot('Test Save');
      const deleted = manager.deleteSlot(slot!.id);
      expect(deleted).toBe(true);
      expect(manager.getSlotCount()).toBe(0);
    });

    it('should not delete non-existent slot', () => {
      const deleted = manager.deleteSlot('non_existent');
      expect(deleted).toBe(false);
    });
  });

  describe('slot queries', () => {
    it('should get all slots', () => {
      manager.createSlot('Save 1');
      manager.createSlot('Save 2');
      const slots = manager.getAllSlots();
      expect(slots.length).toBe(2);
    });

    it('should check if can create slot', () => {
      expect(manager.canCreateSlot()).toBe(true);
      manager.createSlot('Save 1');
      manager.createSlot('Save 2');
      manager.createSlot('Save 3');
      expect(manager.canCreateSlot()).toBe(false);
    });
  });

  describe('clearing', () => {
    it('should clear all slots', () => {
      manager.createSlot('Save 1');
      manager.createSlot('Save 2');
      manager.clear();
      expect(manager.getSlotCount()).toBe(0);
    });
  });

  describe('serialization', () => {
    it('should serialize slots', () => {
      manager.createSlot('Save 1');
      manager.createSlot('Save 2');
      const data = manager.serialize();
      expect(data.length).toBe(2);
    });

    it('should deserialize slots', () => {
      const slot1: SaveSlot = {
        id: 'slot1',
        name: 'Save 1',
        timestamp: Date.now(),
        level: 5,
        playTime: 100
      };
      const slot2: SaveSlot = {
        id: 'slot2',
        name: 'Save 2',
        timestamp: Date.now(),
        level: 10,
        playTime: 200
      };
      const deserialized = SaveSlotManager.deserialize([slot1, slot2]);
      expect(deserialized.getSlotCount()).toBe(2);
      const retrieved1 = deserialized.getSlot('slot1');
      const retrieved2 = deserialized.getSlot('slot2');
      expect(retrieved1).toEqual(slot1);
      expect(retrieved2).toEqual(slot2);
    });
  });
});
