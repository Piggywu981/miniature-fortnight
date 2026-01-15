export interface CharacterStats {
  maxHealth: number;
  currentHealth: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

export enum CharacterStateType {
  NORMAL = 'normal',
  POISONED = 'poisoned',
  STUNNED = 'stunned',
  BURNING = 'burning',
  FROZEN = 'frozen',
  CONFUSED = 'confused'
}

export interface CharacterState {
  type: CharacterStateType;
  duration: number;
  intensity?: number;
}

export interface CharacterConfig {
  name: string;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface ICharacter {
  takeDamage: (amount: number) => void;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  execute: (user: ICharacter, target?: ICharacter) => void;
}
