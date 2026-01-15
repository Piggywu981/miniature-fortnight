import { CombatParticipant } from './types';

export class AttackCalculator {
  calculateHitChance(attacker: CombatParticipant, defender: CombatParticipant): number {
    const attackerSpeed = attacker.getSpeed();
    const defenderSpeed = defender.getSpeed();
    
    const baseHitChance = 0.8;
    const speedBonus = (attackerSpeed - defenderSpeed) * 0.02;
    
    return Math.max(0.1, Math.min(0.95, baseHitChance + speedBonus));
  }

  calculateCriticalChance(attacker: CombatParticipant): number {
    const speed = attacker.getSpeed();
    const baseCriticalChance = 0.05;
    const speedBonus = speed * 0.005;
    
    return Math.max(0, Math.min(0.5, baseCriticalChance + speedBonus));
  }

  isHit(attacker: CombatParticipant, defender: CombatParticipant): boolean {
    const hitChance = this.calculateHitChance(attacker, defender);
    return Math.random() < hitChance;
  }

  isCritical(attacker: CombatParticipant): boolean {
    const criticalChance = this.calculateCriticalChance(attacker);
    return Math.random() < criticalChance;
  }

  canAct(participant: CombatParticipant): boolean {
    return !participant.isDead();
  }
}
