import { Character } from '../character/Character';
import { MapGridManager } from '../map/MapGrid';
import { RoomGenerator } from '../map/RoomGenerator';
import { Inventory } from '../item/Inventory';
import { CombatManager } from '../combat/CombatManager';
import { SaveManager } from '../save/SaveManager';
import { GameState, GameConfig, GameStats } from './types';
import { GameLoop } from './GameLoop';

export class Game {
  private state: GameState;
  private config: GameConfig;
  private stats: GameStats;
  private gameLoop: GameLoop;
  private player: Character;
  private map: MapGridManager;
  private roomGenerator: RoomGenerator;
  private inventory: Inventory;
  private combatManager: CombatManager;
  private saveManager: SaveManager;
  private currentLevel: number;

  constructor(config?: Partial<GameConfig>) {
    this.config = {
      mapWidth: 50,
      mapHeight: 50,
      maxRooms: 10,
      enableAutoSave: false,
      autoSaveInterval: 300000,
      ...config
    };

    this.state = GameState.INITIALIZING;
    this.stats = this.createDefaultStats();
    this.currentLevel = 1;

    this.gameLoop = new GameLoop(60);
    this.player = new Character({
      name: 'Player',
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 10
    });
    this.map = new MapGridManager(this.config.mapWidth, this.config.mapHeight);
    this.roomGenerator = new RoomGenerator(
      this.map,
      this.config.maxRooms,
      4,
      10
    );
    this.inventory = new Inventory(20);
    this.combatManager = new CombatManager();
    this.saveManager = new SaveManager({
      maxSlots: 5,
      enableAutoSave: this.config.enableAutoSave,
      autoSaveInterval: this.config.autoSaveInterval
    });

    this.setupGameLoop();
  }

  private createDefaultStats(): GameStats {
    return {
      playTime: 0,
      roomsExplored: 0,
      enemiesDefeated: 0,
      itemsCollected: 0,
      damageDealt: 0,
      damageTaken: 0
    };
  }

  private setupGameLoop(): void {
    this.gameLoop.setUpdateCallback((deltaTime: number) => {
      this.update(deltaTime);
    });

    this.gameLoop.setRenderCallback(() => {
      this.render();
    });
  }

  start(): void {
    this.generateMap();
    this.state = GameState.PLAYING;
    this.gameLoop.start();
    this.startAutoSave();
  }

  pause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.gameLoop.pause();
    }
  }

  resume(): void {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.gameLoop.resume();
    }
  }

  stop(): void {
    this.gameLoop.stop();
    this.stopAutoSave();
  }

  private update(deltaTime: number): void {
    this.stats.playTime += deltaTime;

    switch (this.state) {
      case GameState.PLAYING:
        this.updateGamePlay();
        break;
      case GameState.COMBAT:
        this.updateCombat(deltaTime);
        break;
      case GameState.PAUSED:
        break;
      default:
        break;
    }
  }

  private updateGamePlay(): void {
    this.player.update();
    this.checkForCombat();
  }

  private updateCombat(_deltaTime: number): void {
    const combatState = this.combatManager.getState();
    if (combatState !== 'idle') {
      this.combatManager.processTurn();
    }

    if (combatState === 'idle') {
      this.handleCombatEnd();
    }
  }

  private render(): void {
    switch (this.state) {
      case GameState.PLAYING:
        this.renderGamePlay();
        break;
      case GameState.COMBAT:
        this.renderCombat();
        break;
      case GameState.PAUSED:
        this.renderPaused();
        break;
      case GameState.MENU:
        this.renderMenu();
        break;
      case GameState.GAME_OVER:
        this.renderGameOver();
        break;
      case GameState.VICTORY:
        this.renderVictory();
        break;
      default:
        break;
    }
  }

  private renderGamePlay(): void {
    console.log('Rendering game play...');
  }

  private renderCombat(): void {
    console.log('Rendering combat...');
  }

  private renderPaused(): void {
    console.log('Rendering paused...');
  }

  private renderMenu(): void {
    console.log('Rendering menu...');
  }

  private renderGameOver(): void {
    console.log('Rendering game over...');
  }

  private renderVictory(): void {
    console.log('Rendering victory...');
  }

  private generateMap(): void {
    this.map.clearAll();
    this.roomGenerator.generate();
    this.placePlayer();
  }

  private placePlayer(): void {
    const startRoom = this.map.getRooms()[0];
    if (startRoom) {
      const x = Math.floor(startRoom.x + startRoom.width / 2);
      const y = Math.floor(startRoom.y + startRoom.height / 2);
      this.player.setPosition({ x, y });
      this.map.setPlayerStart(x, y);
    }
  }

  private checkForCombat(): void {
    const enemies = this.getEnemiesInPlayerRoom();
    if (enemies.length > 0) {
      this.startCombat(enemies);
    }
  }

  private getEnemiesInPlayerRoom(): Character[] {
    const playerPos = this.player.getPosition();
    const rooms = this.map.getRooms();
    const playerRoom = rooms.find(room => 
      playerPos.x >= room.x && 
      playerPos.x < room.x + room.width &&
      playerPos.y >= room.y && 
      playerPos.y < room.y + room.height
    );
    
    if (!playerRoom) {
      return [];
    }

    return [];
  }

  private startCombat(enemies: Character[]): void {
    this.state = GameState.COMBAT;
    this.combatManager.addParticipant(this.player);
    enemies.forEach(enemy => this.combatManager.addParticipant(enemy));
    this.combatManager.startCombat();
  }

  private handleCombatEnd(): void {
    const combatState = this.combatManager.getState();
    
    if (combatState === 'victory') {
      this.stats.enemiesDefeated++;
      this.state = GameState.PLAYING;
    } else if (combatState === 'defeat') {
      this.state = GameState.GAME_OVER;
    } else if (combatState === 'escaped') {
      this.state = GameState.PLAYING;
    }
  }

  private startAutoSave(): void {
    if (this.config.enableAutoSave) {
      this.saveManager.startAutoSave(() => {
        this.createSave('Auto Save');
      });
    }
  }

  private stopAutoSave(): void {
    this.saveManager.stopAutoSave();
  }

  createSave(name: string): boolean {
    const saveData = {
      player: {
        name: this.player.getName(),
        level: this.player.getStats().level,
        experience: this.player.getStats().experience,
        health: this.player.getStats().currentHealth,
        maxHealth: this.player.getStats().maxHealth,
        position: this.player.getPosition()
      },
      map: {
        level: this.currentLevel,
        width: this.map.getWidth(),
        height: this.map.getHeight(),
        tiles: this.map.serialize(),
        exploredTiles: this.map.getExploredTiles()
      },
      inventory: this.inventory.serialize(),
      equippedItems: []
    };

    const slot = this.saveManager.createSave(name, saveData);
    return slot !== null;
  }

  loadSave(slotId: string): boolean {
    const saveData = this.saveManager.loadSave(slotId);
    if (!saveData) {
      return false;
    }

    this.player = new Character({
      name: saveData.player.name,
      maxHealth: saveData.player.maxHealth,
      attack: 10,
      defense: 5,
      speed: 10
    });
    this.player.gainExperience(saveData.player.experience);
    this.player.takeDamage(saveData.player.maxHealth - saveData.player.health);
    this.player.setPosition(saveData.player.position);
    this.currentLevel = saveData.map.level;
    this.map = new MapGridManager(saveData.map.width, saveData.map.height);
    const deserializedMap = MapGridManager.deserialize(saveData.map.tiles);
    this.map = deserializedMap;
    saveData.map.exploredTiles.forEach(tile => {
      this.map.setExplored(tile.x, tile.y, true);
    });
    this.inventory = Inventory.deserialize(saveData.inventory);

    this.stats.playTime = 0;
    this.stats.roomsExplored = 0;

    return true;
  }

  goToNextLevel(): void {
    this.currentLevel++;
    this.generateMap();
  }

  getState(): GameState {
    return this.state;
  }

  getPlayer(): Character {
    return this.player;
  }

  getMap(): MapGridManager {
    return this.map;
  }

  getInventory(): Inventory {
    return this.inventory;
  }

  getCombatManager(): CombatManager {
    return this.combatManager;
  }

  getSaveManager(): SaveManager {
    return this.saveManager;
  }

  getStats(): GameStats {
    return { ...this.stats };
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getConfig(): GameConfig {
    return { ...this.config };
  }
}
