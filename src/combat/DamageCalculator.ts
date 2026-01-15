import { CombatParticipant } from './types';

export class DamageCalculator {
  private static readonly CRITICAL_MULTIPLIER = 2.0;

  calculateDamage(attacker: CombatParticipant, defender: CombatParticipant, isCritical: boolean): number {
    const baseDamage = attacker.getAttackPower();
    const defense = defender.getDefensePower();
    
    const MIN_DAMAGE_MULTIPLIER = 0.1;
    const MAX_DAMAGE_MULTIPLIER = 1.5;
    const damageBeforeDefense = this.applyDamageVariance(baseDamage, MIN_DAMAGE_MULTIPLIER, MAX_DAMAGE_MULTIPLIER);
    const damageAfterDefense = this.applyDefense(damageBeforeDefense, defense);
    const finalDamage = isCritical ? this.applyCritical(damageAfterDefense) : damageAfterDefense;
    
    return Math.max(1, Math.floor(finalDamage));
  }

  calculateBlockedDamage(damage: number, defense: number): number {
    const blockChance = this.calculateBlockChance(defense);
    if (Math.random() < blockChance) {
      const blockedAmount = Math.floor(damage * this.calculateBlockMultiplier(defense));
      return Math.min(damage, blockedAmount);
    }
    return 0;
  }

  private applyDamageVariance(baseDamage: number, MIN_DAMAGE_MULTIPLIER: number, MAX_DAMAGE_MULTIPLIER: number): number {
    const variance = (Math.random() * (MAX_DAMAGE_MULTIPLIER - MIN_DAMAGE_MULTIPLIER)) + MIN_DAMAGE_MULTIPLIER;
    return baseDamage * variance;
  }

  private applyDefense(damage: number, defense: number): number {
    const defenseReduction = defense * 0.5;
    const reducedDamage = damage - defenseReduction;
    return Math.max(damage * 0.2, reducedDamage);
  }

  private applyCritical(damage: number): number {
    return damage * DamageCalculator.CRITICAL_MULTIPLIER;
  }

  private calculateBlockChance(defense: number): number {
    const baseBlockChance = 0.1;
    const defenseBonus = defense * 0.01;
    return Math.max(0, Math.min(0.5, baseBlockChance + defenseBonus));
  }

  private calculateBlockMultiplier(defense: number): number {
    const baseMultiplier = 0.3;
    const defenseBonus = defense * 0.02;
    return Math.max(0.1, Math.min(0.7, baseMultiplier + defenseBonus));
  }
}
