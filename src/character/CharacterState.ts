import { CharacterState, CharacterStateType } from './types';

export class CharacterStateManager {
  private states: Map<CharacterStateType, CharacterState>;

  constructor() {
    this.states = new Map();
  }

  addState(state: CharacterState): void {
    const existingState = this.states.get(state.type);
    if (existingState) {
      existingState.duration = Math.max(existingState.duration, state.duration);
      if (state.intensity !== undefined) {
        existingState.intensity = state.intensity;
      }
    } else {
      this.states.set(state.type, { ...state });
    }
  }

  removeState(type: CharacterStateType): void {
    this.states.delete(type);
  }

  hasState(type: CharacterStateType): boolean {
    return this.states.has(type);
  }

  getState(type: CharacterStateType): CharacterState | undefined {
    return this.states.get(type);
  }

  getAllStates(): CharacterState[] {
    return Array.from(this.states.values());
  }

  updateStates(): void {
    const toRemove: CharacterStateType[] = [];
    for (const [type, state] of this.states) {
      state.duration--;
      if (state.duration <= 0) {
        toRemove.push(type);
      }
    }
    toRemove.forEach(type => this.removeState(type));
  }

  clearAllStates(): void {
    this.states.clear();
  }

  isStunned(): boolean {
    return this.hasState(CharacterStateType.STUNNED);
  }

  isConfused(): boolean {
    return this.hasState(CharacterStateType.CONFUSED);
  }

  getDamageMultiplier(): number {
    let multiplier = 1;
    const poisoned = this.getState(CharacterStateType.POISONED);
    if (poisoned && poisoned.intensity) {
      multiplier *= (1 - poisoned.intensity * 0.1);
    }
    const burning = this.getState(CharacterStateType.BURNING);
    if (burning && burning.intensity) {
      multiplier *= (1 - burning.intensity * 0.15);
    }
    return Math.max(0.1, multiplier);
  }

  getSpeedMultiplier(): number {
    let multiplier = 1;
    const frozen = this.getState(CharacterStateType.FROZEN);
    if (frozen && frozen.intensity) {
      multiplier *= (1 - frozen.intensity * 0.2);
    }
    const poisoned = this.getState(CharacterStateType.POISONED);
    if (poisoned && poisoned.intensity) {
      multiplier *= (1 - poisoned.intensity * 0.1);
    }
    return Math.max(0.1, multiplier);
  }

  applyStateEffects(character: { takeDamage: (amount: number) => void }): void {
    const poisoned = this.getState(CharacterStateType.POISONED);
    if (poisoned && poisoned.intensity) {
      character.takeDamage(poisoned.intensity * 2);
    }

    const burning = this.getState(CharacterStateType.BURNING);
    if (burning && burning.intensity) {
      character.takeDamage(burning.intensity * 3);
    }
  }
}
