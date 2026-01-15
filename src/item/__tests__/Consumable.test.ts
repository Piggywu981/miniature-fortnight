import { Consumable, ConsumableEffect } from '../Consumable';
import { ItemType, ItemRarity } from '../types';

describe('Consumable', () => {
  let consumable: Consumable;
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

    const effects: ConsumableEffect[] = [
      { type: 'heal', value: 20 },
      { type: 'buff_attack', value: 5 }
    ];

    consumable = new Consumable({
      id: 'health_potion',
      name: 'Health Potion',
      description: 'Restores health',
      type: ItemType.CONSUMABLE,
      rarity: ItemRarity.COMMON,
      value: 10,
      stackable: true,
      effects
    });
  });

  describe('initialization', () => {
    it('should initialize with correct values', () => {
      expect(consumable.getId()).toBe('health_potion');
      expect(consumable.getName()).toBe('Health Potion');
      expect(consumable.getType()).toBe(ItemType.CONSUMABLE);
      expect(consumable.isStackable()).toBe(true);
    });

    it('should initialize with effects', () => {
      const effects = consumable.getEffects();
      expect(effects.length).toBe(2);
      expect(effects[0].type).toBe('heal');
      expect(effects[0].value).toBe(20);
    });
  });

  describe('usage', () => {
    it('should use consumable and apply effects', () => {
      consumable.use(mockCharacter);
      expect(mockCharacter.heal).toHaveBeenCalledWith(20);
      expect(mockCharacter.modifyAttack).toHaveBeenCalledWith(5);
    });

    it('should decrease quantity when used', () => {
      consumable.setQuantity(5);
      consumable.use(mockCharacter);
      expect(consumable.getQuantity()).toBe(4);
    });

    it('should not use if quantity is 0', () => {
      consumable.setQuantity(0);
      const used = consumable.use(mockCharacter);
      expect(used).toBe(false);
      expect(mockCharacter.heal).not.toHaveBeenCalled();
    });

    it('should apply damage effect', () => {
      const damagePotion = new Consumable({
        id: 'damage_potion',
        name: 'Damage Potion',
        description: 'Deals damage',
        type: ItemType.CONSUMABLE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        effects: [{ type: 'damage', value: 10 }]
      });
      damagePotion.use(mockCharacter);
      expect(mockCharacter.takeDamage).toHaveBeenCalledWith(10);
    });

    it('should apply buff_defense effect', () => {
      const defensePotion = new Consumable({
        id: 'defense_potion',
        name: 'Defense Potion',
        description: 'Increases defense',
        type: ItemType.CONSUMABLE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        effects: [{ type: 'buff_defense', value: 5 }]
      });
      defensePotion.use(mockCharacter);
      expect(mockCharacter.modifyDefense).toHaveBeenCalledWith(5);
    });

    it('should apply buff_speed effect', () => {
      const speedPotion = new Consumable({
        id: 'speed_potion',
        name: 'Speed Potion',
        description: 'Increases speed',
        type: ItemType.CONSUMABLE,
        rarity: ItemRarity.COMMON,
        value: 10,
        stackable: true,
        effects: [{ type: 'buff_speed', value: 3 }]
      });
      speedPotion.use(mockCharacter);
      expect(mockCharacter.modifySpeed).toHaveBeenCalledWith(3);
    });

    it('should apply buff_health effect', () => {
      const healthBuff = new Consumable({
        id: 'health_buff',
        name: 'Health Buff',
        description: 'Increases max health',
        type: ItemType.CONSUMABLE,
        rarity: ItemRarity.RARE,
        value: 50,
        stackable: true,
        effects: [{ type: 'buff_health', value: 10 }]
      });
      healthBuff.use(mockCharacter);
      expect(mockCharacter.modifyMaxHealth).toHaveBeenCalledWith(10);
    });
  });

  describe('cloning', () => {
    it('should create clone with same properties', () => {
      consumable.setQuantity(5);
      const cloned = consumable.clone();
      expect(cloned.getId()).toBe(consumable.getId());
      expect(cloned.getQuantity()).toBe(5);
      expect(cloned.getEffects()).toEqual(consumable.getEffects());
    });

    it('should create independent clone', () => {
      const cloned = consumable.clone();
      cloned.setQuantity(10);
      expect(consumable.getQuantity()).toBe(1);
    });
  });

  describe('serialization', () => {
    it('should serialize consumable data', () => {
      consumable.setQuantity(5);
      const data = consumable.serialize();
      expect(data.id).toBe('health_potion');
      expect(data.quantity).toBe(5);
      expect(data.effects.length).toBe(2);
    });

    it('should deserialize consumable data', () => {
      const data = consumable.serialize();
      const deserialized = Consumable.deserialize(data);
      expect(deserialized.getId()).toBe(consumable.getId());
      expect(deserialized.getQuantity()).toBe(consumable.getQuantity());
      expect(deserialized.getEffects()).toEqual(consumable.getEffects());
    });
  });
});
