import { Item } from './Item';
import { Equipment, EquipmentSlot } from './Equipment';
import { ICharacter } from './types';

export class Inventory {
  private items: Item[];
  private maxSize: number;
  private equippedItems: Map<EquipmentSlot, Equipment>;

  constructor(maxSize: number = 20) {
    this.items = [];
    this.maxSize = maxSize;
    this.equippedItems = new Map();
  }

  getMaxSize(): number {
    return this.maxSize;
  }

  getSize(): number {
    return this.items.length;
  }

  getItems(): Item[] {
    return this.items.map(item => item.clone());
  }

  getItem(index: number): Item | null {
    if (index < 0 || index >= this.items.length) {
      return null;
    }
    return this.items[index].clone();
  }

  addItem(item: Item): boolean {
    if (this.items.length >= this.maxSize) {
      return false;
    }

    for (const existingItem of this.items) {
      if (existingItem.canStackWith(item)) {
        const added = existingItem.addQuantity(item.getQuantity());
        return added > 0;
      }
    }

    this.items.push(item.clone());
    return true;
  }

  removeItem(index: number, quantity: number = 1): Item | null {
    if (index < 0 || index >= this.items.length) {
      return null;
    }

    const item = this.items[index];

    if (item.isStackable() && item.getQuantity() > quantity) {
      item.addQuantity(-quantity);
      const removed = item.clone();
      removed.setQuantity(quantity);
      return removed;
    } else {
      return this.items.splice(index, 1)[0];
    }
  }

  useItem(index: number, character: ICharacter): boolean {
    if (index < 0 || index >= this.items.length) {
      return false;
    }

    const item = this.items[index];
    const used = item.use(character);

    if (used && item.getQuantity() <= 0) {
      this.items.splice(index, 1);
    }

    return used;
  }

  equipItem(index: number, character: ICharacter): boolean {
    if (index < 0 || index >= this.items.length) {
      return false;
    }

    const item = this.items[index];

    if (!(item instanceof Equipment)) {
      return false;
    }

    const slot = item.getSlot();
    const currentlyEquipped = this.equippedItems.get(slot);

    if (currentlyEquipped) {
      this.unequipItem(slot, character);
    }

    item.equip(character);
    this.equippedItems.set(slot, item);
    return true;
  }

  unequipItem(slot: EquipmentSlot, character: ICharacter): boolean {
    const equipped = this.equippedItems.get(slot);

    if (!equipped) {
      return false;
    }

    equipped.unequip(character);
    this.equippedItems.delete(slot);
    return true;
  }

  getEquippedItem(slot: EquipmentSlot): Equipment | null {
    const equipped = this.equippedItems.get(slot);
    return equipped ? equipped.clone() : null;
  }

  getAllEquippedItems(): Equipment[] {
    return Array.from(this.equippedItems.values()).map(item => item.clone());
  }

  hasItem(itemId: string): boolean {
    return this.items.some(item => item.getId() === itemId);
  }

  countItem(itemId: string): number {
    return this.items
      .filter(item => item.getId() === itemId)
      .reduce((total, item) => total + item.getQuantity(), 0);
  }

  clear(): void {
    this.items = [];
    this.equippedItems.clear();
  }

  serialize(): any[] {
    return this.items.map(item => item.serialize());
  }

  static deserialize(data: any): Inventory {
    const inventory = new Inventory(20);
    
    if (Array.isArray(data)) {
      data.forEach((itemData: any) => {
        if (itemData.stats) {
          inventory.addItem(Equipment.deserialize(itemData));
        } else if (itemData.effects) {
          inventory.addItem(Consumable.deserialize(itemData));
        } else {
          inventory.addItem(Item.deserialize(itemData));
        }
      });
    } else if (data.items) {
      data.items.forEach((itemData: any) => {
        if (itemData.stats) {
          inventory.addItem(Equipment.deserialize(itemData));
        } else if (itemData.effects) {
          inventory.addItem(Consumable.deserialize(itemData));
        } else {
          inventory.addItem(Item.deserialize(itemData));
        }
      });

      if (data.equippedItems) {
        data.equippedItems.forEach((equippedData: any) => {
          const equipment = Equipment.deserialize(equippedData.item);
          equipment.setEquipped(true);
          inventory.equippedItems.set(equippedData.slot, equipment);
        });
      }
    }

    return inventory;
  }
}

import { Consumable } from './Consumable';
