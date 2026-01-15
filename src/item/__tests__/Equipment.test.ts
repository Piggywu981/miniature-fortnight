import { Equipment, EquipmentSlot } from '../Equipment';
import { ItemType, ItemRarity } from '../types';

describe('Equipment', () => {
  let equipment: Equipment;
  let mockCharacter: any;

  beforeEach(() => {
    mockCharacter = {
      takeDamage: jest.fn(),
      heal: jest.fn(),
      modifyAttack: jest.fn(),
      modifyDefense: jest.fn(),
      modifyMaxHealth: jest.fn(),
      modifySpeed: jest.fn()
    };

    equipment = new Equipment({
      id: 'test_sword',
      name: 'Test Sword',
      description: 'A test sword',
      type: ItemType.WEAPON,
      rarity: ItemRarity.COMMON,
      value: 50,
      stackable: false,
      stats: {
        attack: 10,
        defense: 2
      },
      slot: EquipmentSlot.WEAPON
    });
  });

  describe('initialization', () => {
    it('should initialize with correct values', () => {
      expect(equipment.getId()).toBe('test_sword');
      expect(equipment.getName()).toBe('Test Sword');
      expect(equipment.getType()).toBe(ItemType.WEAPON);
      expect(equipment.getSlot()).toBe(EquipmentSlot.WEAPON);
    });

    it('should initialize as not equipped', () => {
      expect(equipment.isEquipped()).toBe(false);
    });

    it('should initialize with stats', () => {
      const stats = equipment.getStats();
      expect(stats.attack).toBe(10);
      expect(stats.defense).toBe(2);
    });

    it('should determine slot from type', () => {
      const armor = new Equipment({
        id: 'test_armor',
        name: 'Test Armor',
        description: 'A test armor',
        type: ItemType.ARMOR,
        rarity: ItemRarity.COMMON,
        value: 50,
        stackable: false
      });
      expect(armor.getSlot()).toBe(EquipmentSlot.ARMOR);
    });
  });

  describe('equipping', () => {
    it('should equip to character', () => {
      equipment.equip(mockCharacter);
      expect(equipment.isEquipped()).toBe(true);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(10);
      expect(mockCharacter.modifyDefense).toHaveBeenCalledWith(2);
    });

    it('should not equip if already equipped', () => {
      equipment.equip(mockCharacter);
      mockCharacter.modifyAttack.mockClear();
      equipment.equip(mockCharacter);
      expect(mockCharacter.modifyAttack).not.toHaveBeenCalled();
    });

    it('should apply all stats', () => {
      const fullEquipment = new Equipment({
        id: 'full_equipment',
        name: 'Full Equipment',
        description: 'Has all stats',
        type: ItemType.ARMOR,
        rarity: ItemRarity.EPIC,
        value: 1000,
        stackable: false,
        stats: {
          attack: 5,
          defense: 10,
          health: 20,
          speed: 3
        }
      });
      fullEquipment.equip(mockCharacter);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(5);
      expect(mockCharacter.modifyDefense).toHaveBeenCalledWith(10);
      expect(mockCharacter.modifyMaxHealth).toHaveBeenCalledWith(20);
      expect(mockCharacter.modifySpeed).toHaveBeenCalledWith(3);
    });
  });

  describe('unequipping', () => {
    it('should unequip from character', () => {
      equipment.equip(mockCharacter);
      equipment.unequip(mockCharacter);
      expect(equipment.isEquipped()).toBe(false);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(-10);
      expect(mockCharacter.modifyDefense).toHaveBeenCalledWith(-2);
    });

    it('should not unequip if not equipped', () => {
      equipment.unequip(mockCharacter);
      expect(mockCharacter.modifyAttack).not.toHaveBeenCalled();
    });
  });

  describe('usage', () => {
    it('should equip when used', () => {
      const used = equipment.use(mockCharacter);
      expect(used).toBe(true);
      expect(equipment.isEquipped()).toBe(true);
    });
  });

  describe('cloning', () => {
    it('should create clone with same properties', () => {
      equipment.equip(mockCharacter);
      const cloned = equipment.clone();
      expect(cloned.getId()).toBe(equipment.getId());
      expect(cloned.isEquipped()).toBe(true);
    });

    it('should create independent clone', () => {
      const cloned = equipment.clone();
      cloned.equip(mockCharacter);
      expect(equipment.isEquipped()).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize equipment data', () => {
      equipment.equip(mockCharacter);
      const data = equipment.serialize();
      expect(data.id).toBe('test_sword');
      expect(data.equipped).toBe(true);
      expect(data.slot).toBe(EquipmentSlot.WEAPON);
      expect(data.stats.attack).toBe(10);
    });

    it('should deserialize equipment data', () => {
      const data = equipment.serialize();
      const deserialized = Equipment.deserialize(data);
      expect(deserialized.getId()).toBe(equipment.getId());
      expect(deserialized.isEquipped()).toBe(equipment.isEquipped());
      expect(deserialized.getStats()).toEqual(equipment.getStats());
    });
  });
});
