import { CombatParticipant, CombatState, CombatResult, CombatConfig } from './types';
import { AttackCalculator } from './AttackCalculator';
import { DamageCalculator } from './DamageCalculator';
import { CombatLog } from './CombatLog';

export class CombatManager {
  private participants: CombatParticipant[];
  private currentTurnIndex: number;
  private state: CombatState;
  private attackCalculator: AttackCalculator;
  private damageCalculator: DamageCalculator;
  private combatLog: CombatLog;
  private config: CombatConfig;

  constructor(config?: Partial<CombatConfig>) {
    this.participants = [];
    this.currentTurnIndex = 0;
    this.state = CombatState.IDLE;
    this.attackCalculator = new AttackCalculator();
    this.damageCalculator = new DamageCalculator();
    this.combatLog = new CombatLog();
    this.config = {
      turnOrder: 'speed',
      allowEscape: true,
      escapeChance: 0.3,
      ...config
    };
  }

  addParticipant(participant: CombatParticipant): void {
    if (this.state !== CombatState.IDLE) {
      throw new Error('Cannot add participants while combat is in progress');
    }
    this.participants.push(participant);
  }

  startCombat(): void {
    if (this.participants.length < 2) {
      throw new Error('At least 2 participants are required for combat');
    }

    this.state = CombatState.IN_COMBAT;
    this.sortParticipants();
    this.currentTurnIndex = 0;
    this.combatLog.addEntry({
      timestamp: Date.now(),
      type: 'attack',
      message: 'Combat has started'
    });
  }

  processTurn(): CombatResult | null {
    if (this.state !== CombatState.IN_COMBAT) {
      return null;
    }

    const attacker = this.participants[this.currentTurnIndex];
    
    if (!this.attackCalculator.canAct(attacker)) {
      if (this.checkCombatEnd()) {
        this.endCombat();
      } else {
        this.advanceTurn();
      }
      return null;
    }

    const defender = this.selectTarget(attacker);
    if (!defender) {
      if (this.checkCombatEnd()) {
        this.endCombat();
      }
      return null;
    }

    const result = this.executeAttack(attacker, defender);

    if (this.checkCombatEnd()) {
      this.endCombat();
    } else {
      this.advanceTurn();
    }

    return result;
  }

  attemptEscape(attacker: CombatParticipant): boolean {
    if (!this.config.allowEscape || this.state !== CombatState.IN_COMBAT) {
      return false;
    }

    if (Math.random() < this.config.escapeChance) {
      this.combatLog.logEscape(attacker.getId());
      this.state = CombatState.ESCAPED;
      return true;
    }

    return false;
  }

  private selectTarget(attacker: CombatParticipant): CombatParticipant | null {
    const aliveParticipants = this.participants.filter(p => 
      p.getId() !== attacker.getId() && !p.isDead()
    );

    if (aliveParticipants.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * aliveParticipants.length);
    return aliveParticipants[randomIndex];
  }

  private executeAttack(attacker: CombatParticipant, defender: CombatParticipant): CombatResult {
    this.combatLog.logAttack(attacker.getId(), defender.getId());

    const isHit = this.attackCalculator.isHit(attacker, defender);
    const isCritical = this.attackCalculator.isCritical(attacker);

    if (!isHit) {
      return {
        attackerId: attacker.getId(),
        defenderId: defender.getId(),
        damage: 0,
        isCritical: false,
        isBlocked: false,
        blockedDamage: 0
      };
    }

    const damage = this.damageCalculator.calculateDamage(attacker, defender, isCritical);
    const blockedDamage = this.damageCalculator.calculateBlockedDamage(damage, defender.getDefensePower());
    const finalDamage = damage - blockedDamage;

    defender.takeDamage(finalDamage);
    this.combatLog.logDamage(attacker.getId(), defender.getId(), finalDamage, isCritical);

    if (defender.isDead()) {
      this.combatLog.logDeath(defender.getId());
    }

    return {
      attackerId: attacker.getId(),
      defenderId: defender.getId(),
      damage: finalDamage,
      isCritical,
      isBlocked: blockedDamage > 0,
      blockedDamage
    };
  }

  private sortParticipants(): void {
    if (this.config.turnOrder === 'speed') {
      this.participants.sort((a, b) => b.getSpeed() - a.getSpeed());
    } else {
      this.shuffleParticipants();
    }
  }

  private shuffleParticipants(): void {
    for (let i = this.participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.participants[i], this.participants[j]] = [this.participants[j], this.participants[i]];
    }
  }

  private advanceTurn(): void {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.participants.length;
  }

  private checkCombatEnd(): boolean {
    const aliveParticipants = this.participants.filter(p => !p.isDead());
    return aliveParticipants.length <= 1;
  }

  private endCombat(): void {
    const aliveParticipants = this.participants.filter(p => !p.isDead());
    
    if (aliveParticipants.length === 1) {
      const winner = aliveParticipants[0];
      this.combatLog.logVictory(winner.getId());
      this.state = CombatState.VICTORY;
    } else {
      this.state = CombatState.DEFEAT;
    }
  }

  getState(): CombatState {
    return this.state;
  }

  getCurrentParticipant(): CombatParticipant | null {
    if (this.state !== CombatState.IN_COMBAT) {
      return null;
    }
    return this.participants[this.currentTurnIndex];
  }

  getParticipants(): CombatParticipant[] {
    return [...this.participants];
  }

  getCombatLog(): CombatLog {
    return this.combatLog;
  }

  getAliveParticipants(): CombatParticipant[] {
    return this.participants.filter(p => !p.isDead());
  }

  getDeadParticipants(): CombatParticipant[] {
    return this.participants.filter(p => p.isDead());
  }

  reset(): void {
    this.participants = [];
    this.currentTurnIndex = 0;
    this.state = CombatState.IDLE;
    this.combatLog.clear();
  }
}
