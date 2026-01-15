import { AttackCalculator } from '../AttackCalculator';
import { CombatParticipant } from '../types';

describe('AttackCalculator', () => {
  let calculator: AttackCalculator;
  let mockAttacker: CombatParticipant;
  let mockDefender: CombatParticipant;

  beforeEach(() => {
    calculator = new AttackCalculator();
    mockAttacker = {
      getId: () => 'attacker',
      getAttackPower: () => 10,
      getDefensePower: () => 5,
      getSpeed: () => 10,
      takeDamage: jest.fn(),
      isDead: () => false
    };
    mockDefender = {
      getId: () => 'defender',
      getAttackPower: () => 5,
      getDefensePower: () => 8,
      getSpeed: () => 5,
      takeDamage: jest.fn(),
      isDead: () => false
    };
  });

  describe('hit chance calculation', () => {
    it('should calculate base hit chance', () => {
      const hitChance = calculator.calculateHitChance(mockAttacker, mockDefender);
      expect(hitChance).toBeGreaterThan(0.1);
      expect(hitChance).toBeLessThan(0.95);
    });

    it('should increase hit chance with higher speed', () => {
      const fastAttacker = { ...mockAttacker, getSpeed: () => 20 };
      const hitChance = calculator.calculateHitChance(fastAttacker, mockDefender);
      expect(hitChance).toBeGreaterThan(0.8);
    });

    it('should decrease hit chance with lower speed', () => {
      const slowAttacker = { ...mockAttacker, getSpeed: () => 2 };
      const hitChance = calculator.calculateHitChance(slowAttacker, mockDefender);
      expect(hitChance).toBeLessThan(0.8);
    });

    it('should clamp hit chance between 0.1 and 0.95', () => {
      const veryFastAttacker = { ...mockAttacker, getSpeed: () => 100 };
      const verySlowAttacker = { ...mockAttacker, getSpeed: () => -100 };
      
      expect(calculator.calculateHitChance(veryFastAttacker, mockDefender)).toBe(0.95);
      expect(calculator.calculateHitChance(verySlowAttacker, mockDefender)).toBe(0.1);
    });
  });

  describe('critical chance calculation', () => {
    it('should calculate base critical chance', () => {
      const critChance = calculator.calculateCriticalChance(mockAttacker);
      expect(critChance).toBeGreaterThan(0);
      expect(critChance).toBeLessThan(0.5);
    });

    it('should increase critical chance with higher speed', () => {
      const fastAttacker = { ...mockAttacker, getSpeed: () => 20 };
      const critChance = calculator.calculateCriticalChance(fastAttacker);
      expect(critChance).toBeGreaterThan(0.05);
    });

    it('should clamp critical chance between 0 and 0.5', () => {
      const veryFastAttacker = { ...mockAttacker, getSpeed: () => 100 };
      const verySlowAttacker = { ...mockAttacker, getSpeed: () => -100 };
      
      expect(calculator.calculateCriticalChance(veryFastAttacker)).toBe(0.5);
      expect(calculator.calculateCriticalChance(verySlowAttacker)).toBe(0);
    });
  });

  describe('hit determination', () => {
    it('should determine hit based on hit chance', () => {
      const hits = Array(1000).fill(0).map(() => calculator.isHit(mockAttacker, mockDefender));
      const hitRate = hits.filter(hit => hit).length / hits.length;
      expect(hitRate).toBeGreaterThan(0.5);
      expect(hitRate).toBeLessThan(1);
    });
  });

  describe('critical determination', () => {
    it('should determine critical based on critical chance', () => {
      const crits = Array(1000).fill(0).map(() => calculator.isCritical(mockAttacker));
      const critRate = crits.filter(crit => crit).length / crits.length;
      expect(critRate).toBeGreaterThan(0);
      expect(critRate).toBeLessThan(0.3);
    });
  });

  describe('action capability', () => {
    it('should allow action for alive participant', () => {
      expect(calculator.canAct(mockAttacker)).toBe(true);
    });

    it('should not allow action for dead participant', () => {
      const deadParticipant = { ...mockAttacker, isDead: () => true };
      expect(calculator.canAct(deadParticipant)).toBe(false);
    });
  });
});
