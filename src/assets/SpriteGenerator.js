import { PALETTE } from './Palette.js';

export class SpriteGenerator {
  constructor(scene) {
    this.scene = scene;
  }
  
  generateAllSprites() {
    this.generatePlayerSprites();
    this.generateEnemySprites();
    this.generateItemSprites();
    this.generateUISprites();
    this.generateEffectSprites();
  }
  
  generatePlayerSprites() {
    const characters = ['INA', 'MISHKA', 'ANNA', 'MILAN', 'YUKO'];
    const directions = ['down', 'left', 'right', 'up'];
    const frames = [0, 1, 2];
    
    characters.forEach(char => {
      directions.forEach(dir => {
        frames.forEach(frame => {
          const textureKey = `player-${char}-${dir}-${frame}`;
          this.createPlayerSprite(char, dir, frame, textureKey);
        });
      });
    });
  }
  
  createPlayerSprite(character, direction, frame, key) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    const color = PALETTE.characters[character];
    
    graphics.fillStyle(color);
    graphics.fillRect(10, 2, 12, 10);
    
    graphics.fillRect(8, 14, 16, 12);
    
    if (direction === 'down') {
      graphics.fillRect(4, 16, 4, 8);
      graphics.fillRect(24, 16, 4, 8);
    } else if (direction === 'up') {
      graphics.fillRect(4, 14, 4, 6);
      graphics.fillRect(24, 14, 4, 6);
    }
    
    const legOffset = frame * 2;
    graphics.fillRect(10 + legOffset, 26, 4, 6);
    graphics.fillRect(18 - legOffset, 26, 4, 6);
    
    this.addClassFeatures(graphics, character);
    
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }
  
  addClassFeatures(graphics, character) {
    switch(character) {
      case 'INA':
        graphics.fillRect(26, 16, 6, 12);
        break;
      case 'MISHKA':
        graphics.fillRect(6, 12, 4, 8);
        graphics.fillRect(22, 12, 4, 8);
        break;
      case 'ANNA':
        graphics.fillRect(8, 0, 16, 4);
        break;
      case 'MILAN':
        graphics.fillStyle(0x888888);
        graphics.fillRect(24, 10, 4, 16);
        break;
      case 'YUKO':
        graphics.fillRect(20, 20, 12, 8);
        break;
    }
  }
  
  generateEnemySprites() {
    const enemyTypes = ['BASIC', 'RUSH', 'TANK', 'SPLIT', 'MINI', 'SHOOTER', 'EXPLODER'];
    
    enemyTypes.forEach(type => {
      this.createEnemySprite(type);
    });
  }
  
  createEnemySprite(type) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    const config = this.getEnemyConfig(type);
    
    switch(type) {
      case 'BASIC':
        this.drawBasicEnemy(graphics, config.color);
        break;
      case 'RUSH':
        this.drawRushEnemy(graphics, config.color);
        break;
      case 'TANK':
        this.drawTankEnemy(graphics, config.color);
        break;
      case 'SPLIT':
        this.drawSplitEnemy(graphics, config.color);
        break;
      case 'MINI':
        this.drawMiniEnemy(graphics, config.color);
        break;
      case 'SHOOTER':
        this.drawShooterEnemy(graphics, config.color);
        break;
      case 'EXPLODER':
        this.drawExploderEnemy(graphics, config.color);
        break;
    }
    
    graphics.generateTexture(`enemy-${type.toLowerCase()}`, 32, 32);
    graphics.destroy();
  }
  
  drawBasicEnemy(graphics, color) {
    graphics.fillStyle(color);
    graphics.fillCircle(16, 16, 12);
    graphics.fillStyle(0x000000);
    graphics.fillRect(10, 12, 4, 4);
    graphics.fillRect(18, 12, 4, 4);
  }
  
  drawRushEnemy(graphics, color) {
    graphics.fillStyle(color);
    graphics.beginPath();
    graphics.moveTo(16, 4);
    graphics.lineTo(28, 28);
    graphics.lineTo(4, 28);
    graphics.closePath();
    graphics.fillPath();
    graphics.fillStyle(0xff0000);
    graphics.fillRect(12, 16, 8, 4);
  }
  
  drawTankEnemy(graphics, color) {
    graphics.fillStyle(color);
    graphics.fillRect(6, 6, 20, 20);
    graphics.fillStyle(0x000000);
    graphics.fillRect(8, 8, 4, 16);
    graphics.fillRect(20, 8, 4, 16);
  }
  
  drawSplitEnemy(graphics, color) {
    graphics.fillStyle(color);
    graphics.fillCircle(16, 16, 10);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(16, 16, 6);
    graphics.fillStyle(color);
    graphics.fillCircle(16, 16, 3);
  }
  
  drawMiniEnemy(graphics, color) {
    graphics.fillStyle(color);
    graphics.fillCircle(16, 16, 8);
    graphics.fillStyle(0xffffff);
    graphics.fillRect(14, 14, 4, 4);
  }
  
  drawShooterEnemy(graphics, color) {
    graphics.fillStyle(color);
    graphics.fillRect(8, 8, 16, 16);
    graphics.fillStyle(0x000000);
    graphics.fillRect(24, 14, 6, 4);
    graphics.fillStyle(0xffffff);
    graphics.fillRect(10, 10, 4, 4);
    graphics.fillRect(18, 10, 4, 4);
  }
  
  drawExploderEnemy(graphics, color) {
    graphics.fillStyle(color);
    graphics.fillCircle(16, 16, 8);
    graphics.fillRect(14, 4, 4, 4);
    graphics.fillStyle(0xffff00);
    graphics.fillRect(15, 2, 2, 3);
    graphics.lineStyle(2, color);
    graphics.strokeCircle(16, 16, 12);
  }
  
  generateItemSprites() {
    this.createItemSprite('health', 0xff0000, 'heart');
    this.createItemSprite('shield', 0x00ffff, 'shield');
    this.createItemSprite('damage', 0xff8800, 'power');
    this.createItemSprite('speed', 0x00ff00, 'lightning');
  }
  
  createItemSprite(type, color, shape) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    switch(shape) {
      case 'heart':
        graphics.fillStyle(color);
        graphics.fillRect(4, 8, 8, 8);
        graphics.fillRect(20, 8, 8, 8);
        graphics.beginPath();
        graphics.moveTo(16, 8);
        graphics.lineTo(16, 24);
        graphics.lineTo(4, 14);
        graphics.closePath();
        graphics.fillPath();
        break;
      case 'shield':
        graphics.fillStyle(color);
        graphics.beginPath();
        graphics.moveTo(8, 4);
        graphics.lineTo(24, 4);
        graphics.lineTo(28, 10);
        graphics.lineTo(28, 20);
        graphics.lineTo(16, 28);
        graphics.lineTo(4, 20);
        graphics.lineTo(4, 10);
        graphics.closePath();
        graphics.fillPath();
        break;
      case 'power':
        graphics.fillStyle(color);
        graphics.fillCircle(16, 16, 10);
        graphics.fillStyle(0xffffff);
        graphics.fillRect(14, 8, 4, 16);
        graphics.fillRect(8, 14, 16, 4);
        break;
      case 'lightning':
        graphics.fillStyle(color);
        graphics.beginPath();
        graphics.moveTo(18, 4);
        graphics.lineTo(10, 16);
        graphics.lineTo(16, 16);
        graphics.lineTo(14, 28);
        graphics.lineTo(22, 14);
        graphics.lineTo(16, 14);
        graphics.closePath();
        graphics.fillPath();
        break;
    }
    
    graphics.generateTexture(`item-${type}`, 32, 32);
    graphics.destroy();
  }
  
  generateUISprites() {
    this.createButtonSprite('normal', 0x333333);
    this.createButtonSprite('hover', 0x555555);
    this.createButtonSprite('active', 0x00ff00);
    
    this.createBorderSprite('border-thin', 0x666666, 2);
    this.createBorderSprite('border-thick', 0x888888, 4);
    
    this.generatePixelNumbers();
  }
  
  createButtonSprite(state, color) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, 64, 32);
    
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 64, 2);
    graphics.fillRect(0, 0, 2, 32);
    graphics.fillRect(62, 0, 2, 32);
    graphics.fillRect(0, 30, 64, 2);
    
    graphics.generateTexture(`button-${state}`, 64, 32);
    graphics.destroy();
  }
  
  createBorderSprite(name, color, thickness) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, 32, thickness);
    graphics.fillRect(0, 0, thickness, 32);
    graphics.fillRect(32 - thickness, 0, thickness, 32);
    graphics.fillRect(0, 32 - thickness, 32, thickness);
    graphics.generateTexture(name, 32, 32);
    graphics.destroy();
  }
  
  generatePixelNumbers() {
    const numbers = '0123456789';
    for (let i = 0; i < numbers.length; i++) {
      this.createPixelNumber(numbers[i], i);
    }
  }
  
  createPixelNumber(num, index) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff);
    
    const patterns = {
      '0': [[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1]],
      '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
      '2': [[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1]],
      '3': [[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1]],
      '4': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1]],
      '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1]],
      '6': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1]],
      '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
      '8': [[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1]],
      '9': [[1,1,1,1,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,1],[1,1,1,1,1]]
    };
    
    const pattern = patterns[num];
    pattern.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel) {
          graphics.fillRect(x * 5, y * 5, 4, 4);
        }
      });
    });
    
    graphics.generateTexture(`pixel-${num}`, 25, 35);
    graphics.destroy();
  }
  
  generateEffectSprites() {
    this.createExplosionSprite('small', 8, 0xffff00);
    this.createExplosionSprite('medium', 16, 0xff8800);
    this.createExplosionSprite('large', 24, 0xff0000);
    
    this.createSparkSprite();
    
    this.createSmokeSprite();
  }
  
  createExplosionSprite(size, color) {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(color);
    graphics.fillRect(16-size/2, 16-size/2, size, size);
    graphics.generateTexture(`explosion-${size}`, 32, 32);
    graphics.destroy();
  }
  
  createSparkSprite() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffff00);
    graphics.fillRect(14, 12, 4, 8);
    graphics.fillRect(12, 14, 8, 4);
    graphics.generateTexture('spark', 32, 32);
    graphics.destroy();
  }
  
  createSmokeSprite() {
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0x888888);
    graphics.fillCircle(16, 16, 10);
    graphics.generateTexture('smoke', 32, 32);
    graphics.destroy();
  }
  
  pixelate(graphics) {
  }
  
  getEnemyConfig(type) {
    const configs = {
      BASIC: { color: PALETTE.enemies.BASIC },
      RUSH: { color: PALETTE.enemies.RUSH },
      TANK: { color: PALETTE.enemies.TANK },
      SPLIT: { color: PALETTE.enemies.SPLIT },
      MINI: { color: PALETTE.enemies.MINI },
      SHOOTER: { color: PALETTE.enemies.SHOOTER },
      EXPLODER: { color: PALETTE.enemies.EXPLODER }
    };
    return configs[type] || configs.BASIC;
  }
}
