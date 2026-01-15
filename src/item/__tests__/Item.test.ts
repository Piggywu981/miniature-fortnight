import { Item } from '../Item';
import { ItemType, ItemRarity } from '../types';

describe('Item', () => {
  let item: Item;

  beforeEach(() => {
    item = new Item({
      id: 'test_item',
      name: 'Test Item',
      description: 'A test item',
      type: ItemType.TREASURE,
      rarity: ItemRarity.COMMON,
      value: 10,
      stackable: true,
      maxStack: 99
    });
  });

  describe('initialization', () => {
    it('should initialize with correct values', () => {
      expect(item.getId()).toBe('test_item');
      expect(item.getName()).toBe('Test Item');
      expect(item.getDescription()).toBe('A test item');
      expect(item.getType()).toBe(ItemType.TREASURE);
      expect(item.getRarity()).toBe(ItemRarity.COMMON);
      expect(item.getValue()).toBe(10);
    });

    it('should initialize with quantity 1', () => {
      expect(item.getQuantity()).toBe(1);
    });

    it('should set max stack to 99 for stackable items', () => {
      expect(item.getMaxStack()).toBe(99);
    });

    it('should set max stack to 1 for non-stackable items', () => {
      const nonStackable = new Item({
        id: 'non_stackable',
        name: 'Non Stackable',
        description: 'Cannot be stacked',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      expect(nonStackable.getMaxStack()).toBe(1);
    });
  });

  describe('quantity management', () => {
    it('should set quantity', () => {
      item.setQuantity(5);
      expect(item.getQuantity()).toBe(5);
    });

    it('should not set quantity below 0', () => {
      item.setQuantity(-5);
      expect(item.getQuantity()).toBe(0);
    });

    it('should not set quantity above max stack', () => {
      item.setQuantity(200);
      expect(item.getQuantity()).toBe(99);
    });

    it('should add quantity', () => {
      const added = item.addQuantity(5);
      expect(item.getQuantity()).toBe(6);
      expect(added).toBe(5);
    });

    it('should limit added quantity to max stack', () => {
      item.setQuantity(98);
      const added = item.addQuantity(5);
      expect(item.getQuantity()).toBe(99);
      expect(added).toBe(1);
    });
  });

  describe('stacking', () => {
    it('should identify stackable items', () => {
      expect(item.isStackable()).toBe(true);
    });

    it('should identify non-stackable items', () => {
      const nonStackable = new Item({
        id: 'non_stackable',
        name: 'Non Stackable',
        description: 'Cannot be stacked',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      expect(nonStackable.isStackable()).toBe(false);
    });

    it('should determine if items can stack', () => {
      const item2 = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true
      });
      expect(item.canStackWith(item2)).toBe(true);
    });

    it('should not stack different items', () => {
      const item2 = new Item({
        id: 'different_item',
        name: 'Different Item',
        description: 'A different item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true
      });
      expect(item.canStackWith(item2)).toBe(false);
    });

    it('should not stack if at max capacity', () => {
      item.setQuantity(99);
      const item2 = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true
      });
      expect(item.canStackWith(item2)).toBe(false);
    });
  });

  describe('usage', () => {
    it('should return false for use by default', () => {
      const mockCharacter = {
        takeDamage: jest.fn(),
        heal: jest.fn(),
        modifyAttack: jest.fn(),
        modifyDefense: jest.fn(),
        modifyMaxHealth: jest.fn(),
        modifySpeed: jest.fn()
      };
      expect(item.use(mockCharacter)).toBe(false);
    });
  });

  describe('cloning', () => {
    it('should create a clone with same properties', () => {
      item.setQuantity(5);
      const cloned = item.clone();
      expect(cloned.getId()).toBe(item.getId());
      expect(cloned.getName()).toBe(item.getName());
      expect(cloned.getQuantity()).toBe(item.getQuantity());
    });

    it('should create independent clone', () => {
      const cloned = item.clone();
      cloned.setQuantity(10);
      expect(item.getQuantity()).toBe(1);
    });
  });

  describe('serialization', () => {
    it('should serialize item data', () => {
      item.setQuantity(5);
      const data = item.serialize();
      expect(data.id).toBe('test_item');
      expect(data.name).toBe('Test Item');
      expect(data.quantity).toBe(5);
    });

    it('should deserialize item data', () => {
      const data = item.serialize();
      const deserialized = Item.deserialize(data);
      expect(deserialized.getId()).toBe(item.getId());
      expect(deserialized.getName()).toBe(item.getName());
      expect(deserialized.getQuantity()).toBe(item.getQuantity());
    });
  });
});
