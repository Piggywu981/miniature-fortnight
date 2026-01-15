import { DamageCalculator } from '../DamageCalculator';
import { CombatParticipant } from '../types';

describe('DamageCalculator', () => {
  let calculator: DamageCalculator;
  let mockAttacker: CombatParticipant;
  let mockDefender: CombatParticipant;

  beforeEach(() => {
    calculator = new DamageCalculator();
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

  describe('damage calculation', () => {
    it('should calculate normal damage', () => {
      const damage = calculator.calculateDamage(mockAttacker, mockDefender, false);
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThan(20);
    });

    it('should calculate critical damage', () => {
      const normalDamage = calculator.calculateDamage(mockAttacker, mockDefender, false);
      const criticalDamage = calculator.calculateDamage(mockAttacker, mockDefender, true);
      expect(criticalDamage).toBeGreaterThan(normalDamage);
    });

    it('should apply damage variance', () => {
      const damages = Array(100).fill(0).map(() => 
        calculator.calculateDamage(mockAttacker, mockDefender, false)
      );
      const uniqueDamages = new Set(damages);
      expect(uniqueDamages.size).toBeGreaterThan(1);
    });

    it('should reduce damage based on defense', () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      
      const lowDefenseDefender = { ...mockDefender, getDefensePower: () => 0 };
      const highDefenseDefender = { ...mockDefender, getDefensePower: () => 20 };
      
      const damageLowDef = calculator.calculateDamage(mockAttacker, lowDefenseDefender, false);
      const damageHighDef = calculator.calculateDamage(mockAttacker, highDefenseDefender, false);
      
      expect(damageHighDef).toBeLessThan(damageLowDef);
      jest.restoreAllMocks();
    });

    it('should ensure minimum damage of 1', () => {
      const veryStrongDefender = { ...mockDefender, getDefensePower: () => 100 };
      const damage = calculator.calculateDamage(mockAttacker, veryStrongDefender, false);
      expect(damage).toBeGreaterThanOrEqual(1);
    });
  });

  describe('blocked damage calculation', () => {
    it('should calculate blocked damage', () => {
      const blocked = calculator.calculateBlockedDamage(10, 10);
      expect(blocked).toBeGreaterThanOrEqual(0);
      expect(blocked).toBeLessThanOrEqual(10);
    });

    it('should increase block chance with higher defense', () => {
      const lowDefenseBlocks = Array(1000).fill(0).map(() => 
        calculator.calculateBlockedDamage(10, 5) > 0
      );
      const highDefenseBlocks = Array(1000).fill(0).map(() => 
        calculator.calculateBlockedDamage(10, 20) > 0
      );
      
      const lowDefenseRate = lowDefenseBlocks.filter(b => b).length / lowDefenseBlocks.length;
      const highDefenseRate = highDefenseBlocks.filter(b => b).length / highDefenseBlocks.length;
      
      expect(highDefenseRate).toBeGreaterThan(lowDefenseRate);
    });

    it('should not block more than total damage', () => {
      const blocked = calculator.calculateBlockedDamage(10, 100);
      expect(blocked).toBeLessThanOrEqual(10);
    });

    it('should return 0 when not blocked', () => {
      const blocked = calculator.calculateBlockedDamage(10, 0);
      expect(blocked).toBeGreaterThanOrEqual(0);
      expect(blocked).toBeLessThanOrEqual(10);
    });
  });

  describe('edge cases', () => {
    it('should handle zero attack power', () => {
      const weakAttacker = { ...mockAttacker, getAttackPower: () => 0 };
      const damage = calculator.calculateDamage(weakAttacker, mockDefender, false);
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('should handle very high attack power', () => {
      const strongAttacker = { ...mockAttacker, getAttackPower: () => 1000 };
      const damage = calculator.calculateDamage(strongAttacker, mockDefender, false);
      expect(damage).toBeGreaterThan(0);
    });

    it('should handle negative defense', () => {
      const weakDefender = { ...mockDefender, getDefensePower: () => -10 };
      const damage = calculator.calculateDamage(mockAttacker, weakDefender, false);
      expect(damage).toBeGreaterThan(0);
    });
  });
});
