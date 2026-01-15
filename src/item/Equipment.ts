import { Item } from './Item';
import { ItemType, ICharacter, ItemConfig, ItemStats } from './types';

export class Equipment extends Item {
  private stats: ItemStats;
  private equipped: boolean;
  private slot: EquipmentSlot;

  constructor(config: ItemConfig & { stats?: ItemStats; slot?: EquipmentSlot }) {
    super({
      ...config,
      stackable: false
    });
    this.stats = config.stats || {};
    this.equipped = false;
    this.slot = config.slot || this.determineSlot(config.type);
  }

  private determineSlot(type: ItemType): EquipmentSlot {
    switch (type) {
      case ItemType.WEAPON:
        return EquipmentSlot.WEAPON;
      case ItemType.ARMOR:
        return EquipmentSlot.ARMOR;
      case ItemType.ACCESSORY:
        return EquipmentSlot.ACCESSORY;
      default:
        return EquipmentSlot.ACCESSORY;
    }
  }

  getStats(): ItemStats {
    return { ...this.stats };
  }

  isEquipped(): boolean {
    return this.equipped;
  }

  setEquipped(equipped: boolean): void {
    this.equipped = equipped;
  }

  getSlot(): EquipmentSlot {
    return this.slot;
  }

  equip(character: ICharacter): void {
    if (this.equipped) return;

    if (this.stats.attack) {
      character.modifyAttack(this.stats.attack);
    }
    if (this.stats.defense) {
      character.modifyDefense(this.stats.defense);
    }
    if (this.stats.health) {
      character.modifyMaxHealth(this.stats.health);
    }
    if (this.stats.speed) {
      character.modifySpeed(this.stats.speed);
    }

    this.equipped = true;
  }

  unequip(character: ICharacter): void {
    if (!this.equipped) return;

    if (this.stats.attack) {
      character.modifyAttack(-this.stats.attack);
    }
    if (this.stats.defense) {
      character.modifyDefense(-this.stats.defense);
    }
    if (this.stats.health) {
      character.modifyMaxHealth(-this.stats.health);
    }
    if (this.stats.speed) {
      character.modifySpeed(-this.stats.speed);
    }

    this.equipped = false;
  }

  use(character: ICharacter): boolean {
    this.equip(character);
    return true;
  }

  clone(): Equipment {
    const cloned = new Equipment({
      id: this.getId(),
      name: this.getName(),
      description: this.getDescription(),
      type: this.getType(),
      rarity: this.getRarity(),
      value: this.getValue(),
      stackable: false,
      stats: this.stats,
      slot: this.slot
    });
    cloned.setEquipped(this.equipped);
    return cloned;
  }

  serialize() {
    return {
      ...super.serialize(),
      stats: this.stats,
      equipped: this.equipped,
      slot: this.slot
    };
  }

  static deserialize(data: any): Equipment {
    const equipment = new Equipment({
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      rarity: data.rarity,
      value: data.value,
      stackable: false,
      stats: data.stats,
      slot: data.slot
    });
    equipment.setEquipped(data.equipped);
    return equipment;
  }
}

export enum EquipmentSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory'
}
