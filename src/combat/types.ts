export interface CombatResult {
  attackerId: string;
  defenderId: string;
  damage: number;
  isCritical: boolean;
  isBlocked: boolean;
  blockedDamage: number;
}

export enum CombatState {
  IDLE = 'idle',
  IN_COMBAT = 'in_combat',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  ESCAPED = 'escaped'
}

export interface CombatParticipant {
  getId(): string;
  getAttackPower(): number;
  getDefensePower(): number;
  getSpeed(): number;
  takeDamage(amount: number): void;
  isDead(): boolean;
}

export interface CombatLogEntry {
  timestamp: number;
  type: 'attack' | 'damage' | 'heal' | 'death' | 'escape' | 'victory' | 'defeat';
  message: string;
  attackerId?: string;
  defenderId?: string;
  damage?: number;
  isCritical?: boolean;
}

export interface CombatConfig {
  turnOrder: 'speed' | 'random';
  allowEscape: boolean;
  escapeChance: number;
}
