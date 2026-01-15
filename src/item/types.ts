export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  KEY = 'key',
  TREASURE = 'treasure'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  speed?: number;
  criticalChance?: number;
  criticalDamage?: number;
}

export interface ItemConfig {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  stackable: boolean;
  maxStack?: number;
  stats?: ItemStats;
}

export interface ItemEffect {
  type: string;
  value: number;
  duration?: number;
}

export interface ICharacter {
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  modifyAttack: (amount: number) => void;
  modifyDefense: (amount: number) => void;
  modifyMaxHealth: (amount: number) => void;
  modifySpeed: (amount: number) => void;
}
