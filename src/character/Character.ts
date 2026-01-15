import { CharacterConfig, Skill, Position } from './types';
import { CharacterStatsManager } from './CharacterStats';
import { CharacterStateManager } from './CharacterState';

export class Character {
  private id: string;
  private name: string;
  private stats: CharacterStatsManager;
  private stateManager: CharacterStateManager;
  private skills: Skill[];
  private position: Position;

  constructor(config: CharacterConfig & { id?: string }) {
    this.id = config.id || this.generateId();
    this.name = config.name;
    this.stats = new CharacterStatsManager({
      maxHealth: config.maxHealth,
      attack: config.attack,
      defense: config.defense,
      speed: config.speed
    });
    this.stateManager = new CharacterStateManager();
    this.skills = [];
    this.position = { x: 0, y: 0 };
  }

  private generateId(): string {
    return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getStats() {
    return this.stats.getStats();
  }

  takeDamage(amount: number): void {
    const damageMultiplier = this.stateManager.getDamageMultiplier();
    const finalDamage = Math.floor(amount * damageMultiplier);
    const currentHealth = this.stats.getCurrentHealth();
    this.stats.setCurrentHealth(currentHealth - finalDamage);
  }

  heal(amount: number): void {
    const currentHealth = this.stats.getCurrentHealth();
    this.stats.setCurrentHealth(currentHealth + amount);
  }

  gainExperience(amount: number): boolean {
    return this.stats.gainExperience(amount);
  }

  addSkill(skill: Skill): void {
    if (!this.skills.find(s => s.id === skill.id)) {
      this.skills.push(skill);
    }
  }

  removeSkill(skillId: string): void {
    this.skills = this.skills.filter(s => s.id !== skillId);
  }

  getSkills(): Skill[] {
    return [...this.skills];
  }

  useSkill(skillId: string, target?: Character): boolean {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0 || this.stateManager.isStunned()) {
      return false;
    }
    skill.execute(this, target);
    skill.currentCooldown = skill.cooldown;
    return true;
  }

  updateCooldowns(): void {
    this.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  }

  getPosition(): Position {
    return { ...this.position };
  }

  setPosition(position: Position): void {
    this.position = { ...position };
  }

  getStateManager(): CharacterStateManager {
    return this.stateManager;
  }

  update(): void {
    this.stateManager.updateStates();
    this.stateManager.applyStateEffects(this);
    this.updateCooldowns();
  }

  isDead(): boolean {
    return this.stats.isDead();
  }

  getAttackPower(): number {
    const baseAttack = this.stats.getAttack();
    const damageMultiplier = this.stateManager.getDamageMultiplier();
    return Math.floor(baseAttack * damageMultiplier);
  }

  getDefensePower(): number {
    return this.stats.getDefense();
  }

  getSpeed(): number {
    const baseSpeed = this.stats.getSpeed();
    const speedMultiplier = this.stateManager.getSpeedMultiplier();
    return Math.floor(baseSpeed * speedMultiplier);
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      stats: this.stats.getStats(),
      states: this.stateManager.getAllStates(),
      skills: this.skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        cooldown: skill.cooldown,
        currentCooldown: skill.currentCooldown
      })),
      position: this.position
    };
  }

  static deserialize(data: {
    id: string;
    name: string;
    stats: any;
    states: any[];
    position: Position;
  }): Character {
    const character = new Character({
      id: data.id,
      name: data.name,
      maxHealth: data.stats.maxHealth,
      attack: data.stats.attack,
      defense: data.stats.defense,
      speed: data.stats.speed
    });
    character.setPosition(data.position);
    data.states.forEach((state: any) => {
      character.getStateManager().addState(state);
    });
    return character;
  }
}
