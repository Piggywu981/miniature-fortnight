import { CharacterStatsManager } from '../CharacterStats';

describe('CharacterStatsManager', () => {
  let stats: CharacterStatsManager;

  beforeEach(() => {
    stats = new CharacterStatsManager({
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 8
    });
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const currentStats = stats.getStats();
      expect(currentStats.maxHealth).toBe(100);
      expect(currentStats.currentHealth).toBe(100);
      expect(currentStats.attack).toBe(10);
      expect(currentStats.defense).toBe(5);
      expect(currentStats.speed).toBe(8);
      expect(currentStats.level).toBe(1);
      expect(currentStats.experience).toBe(0);
      expect(currentStats.experienceToNextLevel).toBe(100);
    });
  });

  describe('health management', () => {
    it('should set current health correctly', () => {
      stats.setCurrentHealth(50);
      expect(stats.getCurrentHealth()).toBe(50);
    });

    it('should not allow current health to exceed max health', () => {
      stats.setCurrentHealth(150);
      expect(stats.getCurrentHealth()).toBe(100);
    });

    it('should not allow negative health', () => {
      stats.setCurrentHealth(-10);
      expect(stats.getCurrentHealth()).toBe(0);
    });

    it('should correctly identify dead character', () => {
      stats.setCurrentHealth(0);
      expect(stats.isDead()).toBe(true);
    });

    it('should correctly identify alive character', () => {
      stats.setCurrentHealth(1);
      expect(stats.isDead()).toBe(false);
    });
  });

  describe('attribute modification', () => {
    it('should modify max health', () => {
      stats.modifyMaxHealth(20);
      expect(stats.getMaxHealth()).toBe(120);
      expect(stats.getCurrentHealth()).toBe(120);
    });

    it('should modify attack', () => {
      stats.modifyAttack(5);
      expect(stats.getAttack()).toBe(15);
    });

    it('should modify defense', () => {
      stats.modifyDefense(3);
      expect(stats.getDefense()).toBe(8);
    });

    it('should modify speed', () => {
      stats.modifySpeed(2);
      expect(stats.getSpeed()).toBe(10);
    });
  });

  describe('experience and leveling', () => {
    it('should gain experience', () => {
      stats.gainExperience(50);
      expect(stats.getExperience()).toBe(50);
    });

    it('should not level up with insufficient experience', () => {
      const leveledUp = stats.gainExperience(50);
      expect(leveledUp).toBe(false);
      expect(stats.getLevel()).toBe(1);
    });

    it('should level up with sufficient experience', () => {
      const leveledUp = stats.gainExperience(100);
      expect(leveledUp).toBe(true);
      expect(stats.getLevel()).toBe(2);
      expect(stats.getExperience()).toBe(0);
      expect(stats.getExperienceToNextLevel()).toBe(150);
    });

    it('should increase stats on level up', () => {
      stats.gainExperience(100);
      const currentStats = stats.getStats();
      expect(currentStats.maxHealth).toBe(110);
      expect(currentStats.currentHealth).toBe(110);
      expect(currentStats.attack).toBe(12);
      expect(currentStats.defense).toBe(6);
      expect(currentStats.speed).toBe(9);
    });

    it('should handle multiple level ups', () => {
      stats.gainExperience(250);
      expect(stats.getLevel()).toBe(3);
      expect(stats.getExperience()).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset health to max', () => {
      stats.setCurrentHealth(30);
      stats.reset();
      expect(stats.getCurrentHealth()).toBe(100);
    });
  });
});
