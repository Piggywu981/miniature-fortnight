import { CharacterStateManager } from '../CharacterState';
import { CharacterStateType } from '../types';

describe('CharacterStateManager', () => {
  let stateManager: CharacterStateManager;

  beforeEach(() => {
    stateManager = new CharacterStateManager();
  });

  describe('state management', () => {
    it('should add a new state', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      expect(stateManager.hasState(CharacterStateType.POISONED)).toBe(true);
    });

    it('should update existing state duration', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 5, intensity: 3 });
      const state = stateManager.getState(CharacterStateType.POISONED);
      expect(state?.duration).toBe(5);
      expect(state?.intensity).toBe(3);
    });

    it('should remove a state', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3 });
      stateManager.removeState(CharacterStateType.POISONED);
      expect(stateManager.hasState(CharacterStateType.POISONED)).toBe(false);
    });

    it('should get all states', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3 });
      stateManager.addState({ type: CharacterStateType.STUNNED, duration: 2 });
      const allStates = stateManager.getAllStates();
      expect(allStates.length).toBe(2);
    });

    it('should clear all states', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3 });
      stateManager.addState({ type: CharacterStateType.STUNNED, duration: 2 });
      stateManager.clearAllStates();
      expect(stateManager.getAllStates().length).toBe(0);
    });
  });

  describe('state updates', () => {
    it('should decrease state duration on update', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3 });
      stateManager.updateStates();
      const state = stateManager.getState(CharacterStateType.POISONED);
      expect(state?.duration).toBe(2);
    });

    it('should remove expired states', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 1 });
      stateManager.updateStates();
      expect(stateManager.hasState(CharacterStateType.POISONED)).toBe(false);
    });

    it('should handle multiple state updates', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 2 });
      stateManager.addState({ type: CharacterStateType.STUNNED, duration: 3 });
      stateManager.updateStates();
      expect(stateManager.hasState(CharacterStateType.POISONED)).toBe(true);
      expect(stateManager.hasState(CharacterStateType.STUNNED)).toBe(true);
      stateManager.updateStates();
      expect(stateManager.hasState(CharacterStateType.POISONED)).toBe(false);
      expect(stateManager.hasState(CharacterStateType.STUNNED)).toBe(true);
    });
  });

  describe('state checks', () => {
    it('should check if character is stunned', () => {
      expect(stateManager.isStunned()).toBe(false);
      stateManager.addState({ type: CharacterStateType.STUNNED, duration: 2 });
      expect(stateManager.isStunned()).toBe(true);
    });

    it('should check if character is confused', () => {
      expect(stateManager.isConfused()).toBe(false);
      stateManager.addState({ type: CharacterStateType.CONFUSED, duration: 2 });
      expect(stateManager.isConfused()).toBe(true);
    });
  });

  describe('damage multiplier', () => {
    it('should return 1.0 for normal state', () => {
      expect(stateManager.getDamageMultiplier()).toBe(1);
    });

    it('should reduce damage when poisoned', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      expect(stateManager.getDamageMultiplier()).toBe(0.8);
    });

    it('should reduce damage when burning', () => {
      stateManager.addState({ type: CharacterStateType.BURNING, duration: 3, intensity: 2 });
      expect(stateManager.getDamageMultiplier()).toBe(0.7);
    });

    it('should have minimum damage multiplier of 0.1', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 10 });
      expect(stateManager.getDamageMultiplier()).toBe(0.1);
    });
  });

  describe('speed multiplier', () => {
    it('should return 1.0 for normal state', () => {
      expect(stateManager.getSpeedMultiplier()).toBe(1);
    });

    it('should reduce speed when frozen', () => {
      stateManager.addState({ type: CharacterStateType.FROZEN, duration: 3, intensity: 2 });
      expect(stateManager.getSpeedMultiplier()).toBe(0.6);
    });

    it('should reduce speed when poisoned', () => {
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      expect(stateManager.getSpeedMultiplier()).toBe(0.8);
    });

    it('should have minimum speed multiplier of 0.1', () => {
      stateManager.addState({ type: CharacterStateType.FROZEN, duration: 3, intensity: 10 });
      expect(stateManager.getSpeedMultiplier()).toBe(0.1);
    });
  });

  describe('state effects', () => {
    it('should apply poison damage', () => {
      let damageTaken = 0;
      const mockCharacter = {
        takeDamage: (amount: number) => { damageTaken += amount; }
      };
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      stateManager.applyStateEffects(mockCharacter);
      expect(damageTaken).toBe(4);
    });

    it('should apply burning damage', () => {
      let damageTaken = 0;
      const mockCharacter = {
        takeDamage: (amount: number) => { damageTaken += amount; }
      };
      stateManager.addState({ type: CharacterStateType.BURNING, duration: 3, intensity: 2 });
      stateManager.applyStateEffects(mockCharacter);
      expect(damageTaken).toBe(6);
    });

    it('should apply both poison and burning damage', () => {
      let damageTaken = 0;
      const mockCharacter = {
        takeDamage: (amount: number) => { damageTaken += amount; }
      };
      stateManager.addState({ type: CharacterStateType.POISONED, duration: 3, intensity: 2 });
      stateManager.addState({ type: CharacterStateType.BURNING, duration: 3, intensity: 2 });
      stateManager.applyStateEffects(mockCharacter);
      expect(damageTaken).toBe(10);
    });
  });
});
