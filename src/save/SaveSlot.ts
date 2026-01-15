import { SaveSlot } from './types';

export class SaveSlotManager {
  private slots: SaveSlot[];
  private maxSlots: number;

  constructor(maxSlots: number = 5) {
    this.slots = [];
    this.maxSlots = maxSlots;
  }

  createSlot(name: string): SaveSlot | null {
    if (!this.canCreateSlot()) {
      return null;
    }

    const slot: SaveSlot = {
      id: this.generateId(),
      name,
      timestamp: Date.now(),
      level: 1,
      playTime: 0
    };
    this.slots.push(slot);
    return slot;
  }

  getSlot(id: string): SaveSlot | null {
    return this.slots.find(slot => slot.id === id) || null;
  }

  updateSlot(id: string, updates: Partial<SaveSlot>): SaveSlot | null {
    const index = this.slots.findIndex(slot => slot.id === id);
    if (index === -1) return null;

    this.slots[index] = { ...this.slots[index], ...updates };
    return this.slots[index];
  }

  deleteSlot(id: string): boolean {
    const index = this.slots.findIndex(slot => slot.id === id);
    if (index === -1) return false;

    this.slots.splice(index, 1);
    return true;
  }

  getAllSlots(): SaveSlot[] {
    return [...this.slots];
  }

  getSlotCount(): number {
    return this.slots.length;
  }

  canCreateSlot(): boolean {
    return this.slots.length < this.maxSlots;
  }

  getMaxSlots(): number {
    return this.maxSlots;
  }

  clear(): void {
    this.slots = [];
  }

  private generateId(): string {
    return `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  serialize(): SaveSlot[] {
    return [...this.slots];
  }

  static deserialize(data: SaveSlot[]): SaveSlotManager {
    const manager = new SaveSlotManager();
    manager.slots = [...data];
    return manager;
  }
}
