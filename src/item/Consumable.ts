import { Item } from './Item';
import { ItemType, ICharacter, ItemConfig } from './types';

export class Consumable extends Item {
  private effects: ConsumableEffect[];

  constructor(config: ItemConfig & { effects: ConsumableEffect[] }) {
    super({
      ...config,
      type: ItemType.CONSUMABLE,
      stackable: true
    });
    this.effects = config.effects;
  }

  getEffects(): ConsumableEffect[] {
    return [...this.effects];
  }

  use(character: ICharacter): boolean {
    if (this.getQuantity() <= 0) {
      return false;
    }

    let used = false;

    for (const effect of this.effects) {
      switch (effect.type) {
        case 'heal':
          character.heal(effect.value);
          used = true;
          break;
        case 'damage':
          character.takeDamage(effect.value);
          used = true;
          break;
        case 'buff_attack':
          character.modifyAttack(effect.value);
          used = true;
          break;
        case 'buff_defense':
          character.modifyDefense(effect.value);
          used = true;
          break;
        case 'buff_speed':
          character.modifySpeed(effect.value);
          used = true;
          break;
        case 'buff_health':
          character.modifyMaxHealth(effect.value);
          used = true;
          break;
      }
    }

    if (used) {
      this.addQuantity(-1);
    }

    return used;
  }

  clone(): Consumable {
    const cloned = new Consumable({
      id: this.getId(),
      name: this.getName(),
      description: this.getDescription(),
      type: this.getType(),
      rarity: this.getRarity(),
      value: this.getValue(),
      stackable: true,
      effects: this.effects
    });
    cloned.setQuantity(this.getQuantity());
    return cloned;
  }

  serialize() {
    return {
      ...super.serialize(),
      effects: this.effects
    };
  }

  static deserialize(data: any): Consumable {
    const consumable = new Consumable({
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      rarity: data.rarity,
      value: data.value,
      stackable: true,
      effects: data.effects
    });
    consumable.setQuantity(data.quantity);
    return consumable;
  }
}

export interface ConsumableEffect {
  type: 'heal' | 'damage' | 'buff_attack' | 'buff_defense' | 'buff_speed' | 'buff_health';
  value: number;
  duration?: number;
}
