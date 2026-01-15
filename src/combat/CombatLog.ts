import { CombatLogEntry } from './types';

export class CombatLog {
  private entries: CombatLogEntry[];

  constructor() {
    this.entries = [];
  }

  addEntry(entry: CombatLogEntry): void {
    this.entries.push(entry);
  }

  logAttack(attackerId: string, defenderId: string): void {
    this.addEntry({
      timestamp: Date.now(),
      type: 'attack',
      message: `${attackerId} attacks ${defenderId}`,
      attackerId,
      defenderId
    });
  }

  logDamage(attackerId: string, defenderId: string, damage: number, isCritical: boolean): void {
    const criticalText = isCritical ? 'CRITICAL ' : '';
    this.addEntry({
      timestamp: Date.now(),
      type: 'damage',
      message: `${attackerId} deals ${criticalText}${damage} damage to ${defenderId}`,
      attackerId,
      defenderId,
      damage,
      isCritical
    });
  }

  logHeal(targetId: string, amount: number): void {
    this.addEntry({
      timestamp: Date.now(),
      type: 'heal',
      message: `${targetId} heals for ${amount} HP`,
      defenderId: targetId,
      damage: amount
    });
  }

  logDeath(targetId: string): void {
    this.addEntry({
      timestamp: Date.now(),
      type: 'death',
      message: `${targetId} has been defeated`,
      defenderId: targetId
    });
  }

  logEscape(attackerId: string): void {
    this.addEntry({
      timestamp: Date.now(),
      type: 'escape',
      message: `${attackerId} escaped from combat`,
      attackerId
    });
  }

  logVictory(winnerId: string): void {
    this.addEntry({
      timestamp: Date.now(),
      type: 'victory',
      message: `${winnerId} wins the battle`,
      attackerId: winnerId
    });
  }

  logDefeat(loserId: string): void {
    this.addEntry({
      timestamp: Date.now(),
      type: 'defeat',
      message: `${loserId} has been defeated`,
      defenderId: loserId
    });
  }

  getEntries(): CombatLogEntry[] {
    return [...this.entries];
  }

  getRecentEntries(count: number): CombatLogEntry[] {
    return this.entries.slice(-count);
  }

  getEntriesByType(type: CombatLogEntry['type']): CombatLogEntry[] {
    return this.entries.filter(entry => entry.type === type);
  }

  getEntriesByParticipant(participantId: string): CombatLogEntry[] {
    return this.entries.filter(entry => 
      entry.attackerId === participantId || entry.defenderId === participantId
    );
  }

  clear(): void {
    this.entries = [];
  }

  getEntryCount(): number {
    return this.entries.length;
  }

  serialize(): CombatLogEntry[] {
    return [...this.entries];
  }

  static deserialize(entries: CombatLogEntry[]): CombatLog {
    const log = new CombatLog();
    entries.forEach(entry => log.addEntry(entry));
    return log;
  }
}
