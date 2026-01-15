import { ItemConfig, ItemType, ItemRarity } from './types';

export class Item {
  private id: string;
  private name: string;
  private description: string;
  private type: ItemType;
  private rarity: ItemRarity;
  private value: number;
  private stackable: boolean;
  private maxStack: number;
  private quantity: number;

  constructor(config: ItemConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.type = config.type;
    this.rarity = config.rarity;
    this.value = config.value;
    this.stackable = config.stackable;
    this.maxStack = config.maxStack || (this.stackable ? 99 : 1);
    this.quantity = 1;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getType(): ItemType {
    return this.type;
  }

  getRarity(): ItemRarity {
    return this.rarity;
  }

  getValue(): number {
    return this.value;
  }

  isStackable(): boolean {
    return this.stackable;
  }

  getMaxStack(): number {
    return this.maxStack;
  }

  getQuantity(): number {
    return this.quantity;
  }

  setQuantity(quantity: number): void {
    this.quantity = Math.max(0, Math.min(quantity, this.maxStack));
  }

  addQuantity(amount: number): number {
    const newQuantity = this.quantity + amount;
    const actualAdded = Math.min(amount, this.maxStack - this.quantity);
    this.quantity = Math.min(newQuantity, this.maxStack);
    return actualAdded;
  }

  canStackWith(other: Item): boolean {
    return (
      this.stackable &&
      other.stackable &&
      this.id === other.id &&
      this.quantity < this.maxStack
    );
  }

  use(_character: any): boolean {
    return false;
  }

  clone(): Item {
    const cloned = new Item({
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      value: this.value,
      stackable: this.stackable,
      maxStack: this.maxStack
    });
    cloned.setQuantity(this.quantity);
    return cloned;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      rarity: this.rarity,
      value: this.value,
      stackable: this.stackable,
      maxStack: this.maxStack,
      quantity: this.quantity
    };
  }

  static deserialize(data: any): Item {
    const item = new Item({
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      rarity: data.rarity,
      value: data.value,
      stackable: data.stackable,
      maxStack: data.maxStack
    });
    item.setQuantity(data.quantity);
    return item;
  }
}
