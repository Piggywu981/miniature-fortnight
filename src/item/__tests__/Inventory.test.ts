import { Inventory } from '../Inventory';
import { Item } from '../Item';
import { Equipment, EquipmentSlot } from '../Equipment';
import { Consumable } from '../Consumable';
import { ItemType, ItemRarity } from '../types';

describe('Inventory', () => {
  let inventory: Inventory;
  let mockCharacter: any;

  beforeEach(() => {
    inventory = new Inventory(10);
    mockCharacter = {
      takeDamage: jest.fn(),
      heal: jest.fn(),
      modifyAttack: jest.fn(),
      modifyDefense: jest.fn(),
      modifyMaxHealth: jest.fn(),
      modifySpeed: jest.fn()
    };
  });

  describe('initialization', () => {
    it('should initialize with correct max size', () => {
      expect(inventory.getMaxSize()).toBe(10);
    });

    it('should initialize empty', () => {
      expect(inventory.getSize()).toBe(0);
      expect(inventory.getItems()).toEqual([]);
    });
  });

  describe('adding items', () => {
    it('should add item', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      const added = inventory.addItem(item);
      expect(added).toBe(true);
      expect(inventory.getSize()).toBe(1);
    });

    it('should not add item when full', () => {
      for (let i = 0; i < 10; i++) {
        inventory.addItem(new Item({
          id: `item_${i}`,
          name: `Item ${i}`,
          description: 'Test',
          type: ItemType.TREASURE,
          rarity: ItemRarity.COMMON,
          value: 10,
          stackable: false
        }));
      }
      const extraItem = new Item({
        id: 'extra',
        name: 'Extra',
        description: 'Extra',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      const added = inventory.addItem(extraItem);
      expect(added).toBe(false);
      expect(inventory.getSize()).toBe(10);
    });

    it('should stack stackable items', () => {
      const item1 = new Item({
        id: 'stackable',
        name: 'Stackable',
        description: 'Can be stacked',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        maxStack: 99
      });
      const item2 = new Item({
        id: 'stackable',
        name: 'Stackable',
        description: 'Can be stacked',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        maxStack: 99
      });
      inventory.addItem(item1);
      inventory.addItem(item2);
      expect(inventory.getSize()).toBe(1);
      expect(inventory.getItem(0)?.getQuantity()).toBe(2);
    });
  });

  describe('removing items', () => {
    it('should remove item', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      inventory.addItem(item);
      const removed = inventory.removeItem(0);
      expect(removed).not.toBeNull();
      expect(inventory.getSize()).toBe(0);
    });

    it('should return null for invalid index', () => {
      const removed = inventory.removeItem(0);
      expect(removed).toBeNull();
    });

    it('should remove partial quantity from stackable item', () => {
      const item = new Item({
        id: 'stackable',
        name: 'Stackable',
        description: 'Can be stacked',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        maxStack: 99
      });
      item.setQuantity(10);
      inventory.addItem(item);
      const removed = inventory.removeItem(0, 3);
      expect(removed?.getQuantity()).toBe(3);
      expect(inventory.getItem(0)?.getQuantity()).toBe(7);
    });
  });

  describe('using items', () => {
    it('should use consumable', () => {
      const consumable = new Consumable({
        id: 'health_potion',
        name: 'Health Potion',
        description: 'Heals',
        type: ItemType.CONSUMABLE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        effects: [{ type: 'heal', value: 20 }]
      });
      inventory.addItem(consumable);
      const used = inventory.useItem(0, mockCharacter);
      expect(used).toBe(true);
      expect(mockCharacter.heal).toHaveBeenCalledWith(20);
    });

    it('should remove consumable after use', () => {
      const consumable = new Consumable({
        id: 'health_potion',
        name: 'Health Potion',
        description: 'Heals',
        type: ItemType.CONSUMABLE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        effects: [{ type: 'heal', value: 20 }]
      });
      inventory.addItem(consumable);
      inventory.useItem(0, mockCharacter);
      expect(inventory.getSize()).toBe(0);
    });

    it('should not use non-consumable items', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      inventory.addItem(item);
      const used = inventory.useItem(0, mockCharacter);
      expect(used).toBe(false);
    });
  });

  describe('equipping items', () => {
    it('should equip equipment', () => {
      const equipment = new Equipment({
        id: 'test_sword',
        name: 'Test Sword',
        description: 'A test sword',
        type: ItemType.WEAPON,
        rarity: ItemRarity.COMMON,
        value: 50,
        stackable: false,
        stats: { attack: 10 },
        slot: EquipmentSlot.WEAPON
      });
      inventory.addItem(equipment);
      const equipped = inventory.equipItem(0, mockCharacter);
      expect(equipped).toBe(true);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(10);
    });

    it('should unequip currently equipped item', () => {
      const sword1 = new Equipment({
        id: 'sword1',
        name: 'Sword 1',
        description: 'First sword',
        type: ItemType.WEAPON,
        rarity: ItemRarity.COMMON,
        value: 50,
        stackable: false,
        stats: { attack: 10 },
        slot: EquipmentSlot.WEAPON
      });
      const sword2 = new Equipment({
        id: 'sword2',
        name: 'Sword 2',
        description: 'Second sword',
        type: ItemType.WEAPON,
        rarity: ItemRarity.COMMON,
        value: 50,
        stackable: false,
        stats: { attack: 15 },
        slot: EquipmentSlot.WEAPON
      });
      inventory.addItem(sword1);
      inventory.addItem(sword2);
      inventory.equipItem(0, mockCharacter);
      inventory.equipItem(1, mockCharacter);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(10);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(-10);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(15);
    });

    it('should not equip non-equipment items', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      inventory.addItem(item);
      const equipped = inventory.equipItem(0, mockCharacter);
      expect(equipped).toBe(false);
    });

    it('should get equipped item', () => {
      const equipment = new Equipment({
        id: 'test_sword',
        name: 'Test Sword',
        description: 'A test sword',
        type: ItemType.WEAPON,
        rarity: ItemRarity.COMMON,
        value: 50,
        stackable: false,
        stats: { attack: 10 },
        slot: EquipmentSlot.WEAPON
      });
      inventory.addItem(equipment);
      inventory.equipItem(0, mockCharacter);
      const equipped = inventory.getEquippedItem(EquipmentSlot.WEAPON);
      expect(equipped?.getId()).toBe('test_sword');
    });

    it('should get all equipped items', () => {
      const weapon = new Equipment({
        id: 'weapon',
        name: 'Weapon',
        description: 'A weapon',
        type: ItemType.WEAPON,
        rarity: ItemRarity.COMMON,
        value: 50,
        stackable: false,
        stats: { attack: 10 },
        slot: EquipmentSlot.WEAPON
      });
      const armor = new Equipment({
        id: 'armor',
        name: 'Armor',
        description: 'Armor',
        type: ItemType.ARMOR,
        rarity: ItemRarity.COMMON,
        value: 50,
        stackable: false,
        stats: { defense: 10 },
        slot: EquipmentSlot.ARMOR
      });
      inventory.addItem(weapon);
      inventory.addItem(armor);
      inventory.equipItem(0, mockCharacter);
      inventory.equipItem(1, mockCharacter);
      const equipped = inventory.getAllEquippedItems();
      expect(equipped.length).toBe(2);
    });
  });

  describe('item queries', () => {
    it('should check if has item', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      inventory.addItem(item);
      expect(inventory.hasItem('test_item')).toBe(true);
      expect(inventory.hasItem('nonexistent')).toBe(false);
    });

    it('should count items', () => {
      const item1 = new Item({
        id: 'stackable',
        name: 'Stackable',
        description: 'Can be stacked',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        maxStack: 99
      });
      const item2 = new Item({
        id: 'stackable',
        name: 'Stackable',
        description: 'Can be stacked',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        maxStack: 99
      });
      item1.setQuantity(5);
      item2.setQuantity(3);
      inventory.addItem(item1);
      inventory.addItem(item2);
      expect(inventory.countItem('stackable')).toBe(8);
    });
  });

  describe('clearing', () => {
    it('should clear inventory', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      inventory.addItem(item);
      inventory.clear();
      expect(inventory.getSize()).toBe(0);
      expect(inventory.getAllEquippedItems().length).toBe(0);
    });
  });

  describe('serialization', () => {
    it('should serialize inventory data', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      inventory.addItem(item);
      const data = inventory.serialize();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
    });

    it('should deserialize inventory data', () => {
      const item = new Item({
        id: 'test_item',
        name: 'Test Item',
        description: 'A test item',
        type: ItemType.TREASURE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: false
      });
      inventory.addItem(item);
      const data = inventory.serialize();
      const deserialized = Inventory.deserialize(data);
      expect(deserialized.getSize()).toBe(inventory.getSize());
    });
  });
});
