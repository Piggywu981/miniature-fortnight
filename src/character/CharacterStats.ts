import { CharacterStats } from './types';

export class CharacterStatsManager {
  private stats: CharacterStats;

  constructor(config: { maxHealth: number; attack: number; defense: number; speed: number }) {
    this.stats = {
      maxHealth: config.maxHealth,
      currentHealth: config.maxHealth,
      attack: config.attack,
      defense: config.defense,
      speed: config.speed,
      level: 1,
      experience: 0,
      experienceToNextLevel: 100
    };
  }

  getStats(): CharacterStats {
    return { ...this.stats };
  }

  getMaxHealth(): number {
    return this.stats.maxHealth;
  }

  getCurrentHealth(): number {
    return this.stats.currentHealth;
  }

  setCurrentHealth(value: number): void {
    this.stats.currentHealth = Math.max(0, Math.min(value, this.stats.maxHealth));
  }

  getAttack(): number {
    return this.stats.attack;
  }

  setAttack(value: number): void {
    this.stats.attack = value;
  }

  getDefense(): number {
    return this.stats.defense;
  }

  setDefense(value: number): void {
    this.stats.defense = value;
  }

  getSpeed(): number {
    return this.stats.speed;
  }

  setSpeed(value: number): void {
    this.stats.speed = value;
  }

  getLevel(): number {
    return this.stats.level;
  }

  getExperience(): number {
    return this.stats.experience;
  }

  getExperienceToNextLevel(): number {
    return this.stats.experienceToNextLevel;
  }

  gainExperience(amount: number): boolean {
    this.stats.experience += amount;
    let leveledUp = false;
    while (this.stats.experience >= this.stats.experienceToNextLevel) {
      this.levelUp();
      leveledUp = true;
    }
    return leveledUp;
  }

  private levelUp(): void {
    this.stats.level++;
    this.stats.experience -= this.stats.experienceToNextLevel;
    this.stats.experienceToNextLevel = Math.floor(this.stats.experienceToNextLevel * 1.5);
    this.stats.maxHealth += 10;
    this.stats.currentHealth = this.stats.maxHealth;
    this.stats.attack += 2;
    this.stats.defense += 1;
    this.stats.speed += 1;
  }

  modifyMaxHealth(amount: number): void {
    this.stats.maxHealth += amount;
    this.stats.currentHealth += amount;
  }

  modifyAttack(amount: number): void {
    this.stats.attack += amount;
  }

  modifyDefense(amount: number): void {
    this.stats.defense += amount;
  }

  modifySpeed(amount: number): void {
    this.stats.speed += amount;
  }

  isDead(): boolean {
    return this.stats.currentHealth <= 0;
  }

  reset(): void {
    this.stats.currentHealth = this.stats.maxHealth;
  }
}
