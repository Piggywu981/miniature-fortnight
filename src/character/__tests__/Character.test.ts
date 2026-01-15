import { Character } from '../Character';
import { CharacterStateType } from '../types';

describe('Character', () => {
  let character: Character;

  beforeEach(() => {
    character = new Character({
      name: 'Hero',
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 8
    });
  });

  describe('initialization', () => {
    it('should initialize with correct values', () => {
      expect(character.getName()).toBe('Hero');
      expect(character.getStats().maxHealth).toBe(100);
      expect(character.getStats().currentHealth).toBe(100);
      expect(character.getStats().attack).toBe(10);
      expect(character.getStats().defense).toBe(5);
      expect(character.getStats().speed).toBe(8);
    });

    it('should generate unique ID', () => {
      const character2 = new Character({
        name: 'Hero2',
        maxHealth: 100,
        attack: 10,
        defense: 5,
        speed: 8
      });
      expect(character.getId()).not.toBe(character2.getId());
    });
  });

  describe('health management', () => {
    it('should take damage correctly', () => {
      character.takeDamage(20);
      expect(character.getStats().currentHealth).toBe(80);
    });

    it('should heal correctly', () => {
      character.takeDamage(30);
      character.heal(20);
      expect(character.getStats().currentHealth).toBe(90);
    });

    it('should not heal above max health', () => {
      character.heal(20);
      expect(character.getStats().currentHealth).toBe(100);
    });

    it('should die when health reaches 0', () => {
      character.takeDamage(100);
      expect(character.isDead()).toBe(true);
    });
  });

  describe('experience and leveling', () => {
    it('should gain experience', () => {
      const leveledUp = character.gainExperience(50);
      expect(leveledUp).toBe(false);
      expect(character.getStats().experience).toBe(50);
    });

    it('should level up with sufficient experience', () => {
      const leveledUp = character.gainExperience(100);
      expect(leveledUp).toBe(true);
      expect(character.getStats().level).toBe(2);
    });

    it('should increase stats on level up', () => {
      character.gainExperience(100);
      expect(character.getStats().maxHealth).toBe(110);
      expect(character.getStats().attack).toBe(12);
      expect(character.getStats().defense).toBe(6);
      expect(character.getStats().speed).toBe(9);
    });
  });

  describe('skill management', () => {
    it('should add skill', () => {
      const skill = {
        id: 'fireball',
        name: 'Fireball',
        description: 'A powerful fire attack',
        cooldown: 3,
        currentCooldown: 0,
        execute: jest.fn()
      };
      character.addSkill(skill);
      expect(character.getSkills().length).toBe(1);
    });

    it('should not add duplicate skill', () => {
      const skill = {
        id: 'fireball',
        name: 'Fireball',
        description: 'A powerful fire attack',
        cooldown: 3,
        currentCooldown: 0,
        execute: jest.fn()
      };
      character.addSkill(skill);
      character.addSkill(skill);
      expect(character.getSkills().length).toBe(1);
    });

    it('should remove skill', () => {
      const skill = {
        id: 'fireball',
        name: 'Fireball',
        description: 'A powerful fire attack',
        cooldown: 3,
        currentCooldown: 0,
        execute: jest.fn()
      };
      character.addSkill(skill);
      character.removeSkill('fireball');
      expect(character.getSkills().length).toBe(0);
    });

    it('should use skill', () => {
      const skill = {
        id: 'fireball',
        name: 'Fireball',
        description: 'A powerful fire attack',
        cooldown: 3,
        currentCooldown: 0,
        execute: jest.fn()
      };
      character.addSkill(skill);
      const used = character.useSkill('fireball');
      expect(used).toBe(true);
      expect(skill.execute).toHaveBeenCalled();
    });

    it('should not use skill on cooldown', () => {
      const skill = {
        id: 'fireball',
        name: 'Fireball',
        description: 'A powerful fire attack',
        cooldown: 3,
        currentCooldown: 1,
        execute: jest.fn()
      };
      character.addSkill(skill);
      const used = character.useSkill('fireball');
      expect(used).toBe(false);
      expect(skill.execute).not.toHaveBeenCalled();
    });

    it('should not use skill when stunned', () => {
      const skill = {
        id: 'fireball',
        name: 'Fireball',
        description: 'A powerful fire attack',
        cooldown: 3,
        currentCooldown: 0,
        execute: jest.fn()
      };
      character.addSkill(skill);
      character.getStateManager().addState({ type: CharacterStateType.STUNNED, duration: 2 });
      const used = character.useSkill('fireball');
      expect(used).toBe(false);
      expect(skill.execute).not.toHaveBeenCalled();
    });

    it('should update cooldowns', () => {
      const skill = {
        id: 'fireball',
        name: 'Fireball',
        description: 'A powerful fire attack',
        cooldown: 3,
        currentCooldown: 3,
        execute: jest.fn()
      };
      character.addSkill(skill);
      character.updateCooldowns();
      expect(skill.currentCooldown).toBe(2);
    });
  });

  describe('position management', () => {
    it('should set and get position', () => {
      character.setPosition({ x: 5, y: 10 });
      const position = character.getPosition();
      expect(position.x).toBe(5);
      expect(position.y).toBe(10);
    });
  });

  describe('state effects on combat', () => {
    it('should reduce attack power when poisoned', () => {
      character.getStateManager().addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      expect(character.getAttackPower()).toBe(8);
    });

    it('should reduce speed when frozen', () => {
      character.getStateManager().addState({ type: CharacterStateType.FROZEN, duration: 3, intensity: 2 });
      expect(character.getSpeed()).toBe(4);
    });

    it('should apply state damage on update', () => {
      character.getStateManager().addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      character.update();
      expect(character.getStats().currentHealth).toBe(97);
    });
  });

  describe('serialization', () => {
    it('should serialize character data', () => {
      const data = character.serialize();
      expect(data.name).toBe('Hero');
      expect(data.stats.maxHealth).toBe(100);
      expect(data.position).toEqual({ x: 0, y: 0 });
    });

    it('should deserialize character data', () => {
      const data = character.serialize();
      const deserialized = Character.deserialize(data);
      expect(deserialized.getName()).toBe('Hero');
      expect(deserialized.getStats().maxHealth).toBe(100);
    });
  });
});
