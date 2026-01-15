import { CombatManager } from '../CombatManager';
import { CombatState, CombatParticipant } from '../types';

class MockParticipant implements CombatParticipant {
  private health: number;
  private readonly id: string;
  private readonly attack: number;
  private readonly defense: number;
  private readonly speed: number;

  constructor(id: string, attack: number, defense: number, speed: number, health: number = 100) {
    this.id = id;
    this.attack = attack;
    this.defense = defense;
    this.speed = speed;
    this.health = health;
  }

  getId(): string {
    return this.id;
  }

  getAttackPower(): number {
    return this.attack;
  }

  getDefensePower(): number {
    return this.defense;
  }

  getSpeed(): number {
    return this.speed;
  }

  takeDamage(amount: number): void {
    this.health -= amount;
  }

  isDead(): boolean {
    return this.health <= 0;
  }
}

describe('CombatManager', () => {
  let manager: CombatManager;

  beforeEach(() => {
    manager = new CombatManager();
  });

  let mockParticipant1: CombatParticipant;
  let mockParticipant2: CombatParticipant;
  let mockParticipant3: CombatParticipant;

  beforeEach(() => {
    mockParticipant1 = new MockParticipant('participant1', 10, 5, 10);
    mockParticipant2 = new MockParticipant('participant2', 8, 6, 8);
    mockParticipant3 = new MockParticipant('participant3', 12, 4, 12);
  });

  describe('initialization', () => {
    it('should initialize with idle state', () => {
      expect(manager.getState()).toBe(CombatState.IDLE);
    });

    it('should initialize with default config', () => {
      expect(manager.getParticipants()).toEqual([]);
    });
  });

  describe('participant management', () => {
    it('should add participant', () => {
      manager.addParticipant(mockParticipant1);
      expect(manager.getParticipants().length).toBe(1);
    });

    it('should add multiple participants', () => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      expect(manager.getParticipants().length).toBe(2);
    });

    it('should not add participant during combat', () => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      manager.startCombat();
      expect(() => manager.addParticipant(mockParticipant3)).toThrow();
    });
  });

  describe('combat start', () => {
    it('should start combat with 2 participants', () => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      manager.startCombat();
      expect(manager.getState()).toBe(CombatState.IN_COMBAT);
    });

    it('should not start combat with less than 2 participants', () => {
      manager.addParticipant(mockParticipant1);
      expect(() => manager.startCombat()).toThrow();
    });

    it('should sort participants by speed', () => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      manager.addParticipant(mockParticipant3);
      manager.startCombat();
      const participants = manager.getParticipants();
      expect(participants[0].getId()).toBe('participant3');
      expect(participants[1].getId()).toBe('participant1');
      expect(participants[2].getId()).toBe('participant2');
    });
  });

  describe('turn processing', () => {
    beforeEach(() => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      manager.startCombat();
    });

    it('should process turn', () => {
      const result = manager.processTurn();
      expect(result).not.toBeNull();
      expect(result?.attackerId).toBeDefined();
      expect(result?.defenderId).toBeDefined();
    });

    it('should advance turn after processing', () => {
      manager.processTurn();
      const currentAfter = manager.getCurrentParticipant()?.getId();
      expect(currentAfter).toBeDefined();
    });

    it('should log combat events', () => {
      manager.processTurn();
      const log = manager.getCombatLog();
      expect(log.getEntryCount()).toBeGreaterThan(0);
    });
  });

  describe('escape', () => {
    beforeEach(() => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      manager.startCombat();
    });

    it('should attempt escape', () => {
      const escaped = manager.attemptEscape(mockParticipant1);
      expect(typeof escaped).toBe('boolean');
    });

    it('should set escaped state on successful escape', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      const escaped = manager.attemptEscape(mockParticipant1);
      expect(escaped).toBe(true);
      expect(manager.getState()).toBe(CombatState.ESCAPED);
      jest.restoreAllMocks();
    });

    it('should not escape when not allowed', () => {
      const noEscapeManager = new CombatManager({ allowEscape: false });
      noEscapeManager.addParticipant(mockParticipant1);
      noEscapeManager.addParticipant(mockParticipant2);
      noEscapeManager.startCombat();
      const escaped = noEscapeManager.attemptEscape(mockParticipant1);
      expect(escaped).toBe(false);
    });
  });

  describe('combat end', () => {
    it('should end combat when one participant dies', () => {
      const weakParticipant = new MockParticipant('weak', 5, 1, 5, 10);
      const strongParticipant = new MockParticipant('strong', 20, 5, 5);
      
      manager.addParticipant(weakParticipant);
      manager.addParticipant(strongParticipant);
      manager.startCombat();
      
      const maxTurns = 20;
      for (let i = 0; i < maxTurns && manager.getState() === CombatState.IN_COMBAT; i++) {
        manager.processTurn();
      }
      
      expect(manager.getState()).not.toBe(CombatState.IN_COMBAT);
    });

    it('should set victory state when winner exists', () => {
      const weakParticipant = new MockParticipant('weak', 5, 1, 5, 10);
      const strongParticipant = new MockParticipant('strong', 20, 5, 5);
      
      manager.addParticipant(weakParticipant);
      manager.addParticipant(strongParticipant);
      manager.startCombat();
      
      const maxTurns = 20;
      for (let i = 0; i < maxTurns && manager.getState() === CombatState.IN_COMBAT; i++) {
        manager.processTurn();
      }
      
      expect(manager.getState()).toBe(CombatState.VICTORY);
    });

    it('should set defeat state when all die', () => {
      const participant1 = new MockParticipant('p1', 5, 1, 5, 10);
      const participant2 = new MockParticipant('p2', 5, 1, 5, 10);
      
      manager.addParticipant(participant1);
      manager.addParticipant(participant2);
      manager.startCombat();
      
      participant1.takeDamage(1000);
      participant2.takeDamage(1000);
      
      const maxTurns = 5;
      for (let i = 0; i < maxTurns && manager.getState() === CombatState.IN_COMBAT; i++) {
        manager.processTurn();
      }
      
      expect(manager.getState()).toBe(CombatState.DEFEAT);
    });
  });

  describe('participant queries', () => {
    let deadParticipant3: CombatParticipant;

    beforeEach(() => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      deadParticipant3 = new MockParticipant('participant3', 12, 4, 12);
      deadParticipant3.takeDamage(1000);
      manager.addParticipant(deadParticipant3);
      manager.startCombat();
    });

    it('should get alive participants', () => {
      const alive = manager.getAliveParticipants();
      expect(alive.length).toBe(2);
      expect(alive.every(p => !p.isDead())).toBe(true);
    });

    it('should get dead participants', () => {
      const dead = manager.getDeadParticipants();
      expect(dead.length).toBe(1);
      expect(dead.every(p => p.isDead())).toBe(true);
    });

    it('should get current participant', () => {
      const current = manager.getCurrentParticipant();
      expect(current).not.toBeNull();
      expect(current?.getId()).toBeDefined();
    });
  });

  describe('reset', () => {
    it('should reset manager', () => {
      manager.addParticipant(mockParticipant1);
      manager.addParticipant(mockParticipant2);
      manager.startCombat();
      manager.processTurn();
      
      manager.reset();
      
      expect(manager.getState()).toBe(CombatState.IDLE);
      expect(manager.getParticipants()).toEqual([]);
      expect(manager.getCombatLog().getEntryCount()).toBe(0);
    });
  });
});
