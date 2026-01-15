import { Scene } from 'phaser';
import { CharacterConfig } from '../characters/CharacterConfig.js';
import { Player } from '../characters/Player.js';
import { EnemyManager } from '../enemies/EnemyManager.js';
import { SpriteGenerator } from '../assets/SpriteGenerator.js';
import { PixelParticleSystem } from '../effects/PixelParticleSystem.js';
import { AudioGenerator } from '../assets/AudioGenerator.js';

export class GameScene extends Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.map = null;
        this.enemies = null;
        this.projectiles = null;
        this.items = null;
        this.killCount = 0;
        this.gameTime = 0;
        this.audio = null;
        this.particles = null;
        this.spriteGenerator = null;
    }

    preload() {
        // 预加载阶段不需要做什么
    }

    create(data) {
        const characterId = data && data.characterId ? data.characterId : 'INA';
        
        this.audio = new AudioGenerator();
        this.audio.init().then(() => {
            this.audio.playGameBGM();
        });
        
        this.spriteGenerator = new SpriteGenerator(this);
        this.spriteGenerator.generateAllSprites();
        
        this.particles = new PixelParticleSystem(this);
        
        this.createPlaceholderGraphics();
        
        this.initializeInput();
        
        this.createMap();
        
        this.createPlayer(characterId);
        
        this.createGroups();
        
        this.enemyManager = new EnemyManager(this);
        
        this.createUI();
        
        this.createPlayerAnimations(characterId);
    }

    update(time, delta) {
        this.gameTime += delta;
        
        // 更新玩家
        if (this.player && this.player.active) {
            this.player.update(time, delta);
        }
        
        // 更新敌人管理器
        if (this.enemyManager) {
            this.enemyManager.update(time, delta);
        }
        
        // 更新敌人和碰撞检测
        this.updateCollisions();
        
        // 更新UI
        this.updateUI(time, delta);
    }

    initializeInput() {
        // 键盘输入
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // 鼠标输入 - 使用 worldX/worldY 获取世界坐标
        this.input.on('pointerdown', (pointer) => {
            if (this.player && this.player.active) {
                if (pointer.rightButtonDown()) {
                    this.player.useRightClickAbility(pointer.worldX, pointer.worldY);
                } else {
                    this.player.startShooting(pointer.worldX, pointer.worldY);
                }
            }
        });
        
        this.input.on('pointerup', () => {
            if (this.player && this.player.active) {
                this.player.stopShooting();
            }
        });
    }

    createMap() {
        const wallThickness = 20;
        const worldWidth = 1200;
        const worldHeight = 900;
        
        const ground = this.add.rectangle(
            worldWidth / 2, 
            worldHeight / 2, 
            worldWidth, 
            worldHeight, 
            0x1a1a2e
        );
        ground.setDepth(-1);
        
        this.createPixelGrid(worldWidth, worldHeight);
        
        this.walls = this.physics.add.staticGroup();
        
        this.walls.create(worldWidth / 2, wallThickness / 2, 'wall-tile')
            .setDisplaySize(worldWidth, wallThickness).refreshBody();
        
        this.walls.create(worldWidth / 2, worldHeight - wallThickness / 2, 'wall-tile')
            .setDisplaySize(worldWidth, wallThickness).refreshBody();
        
        this.walls.create(wallThickness / 2, worldHeight / 2, 'wall-tile')
            .setDisplaySize(wallThickness, worldHeight).refreshBody();
        
        this.walls.create(worldWidth - wallThickness / 2, worldHeight / 2, 'wall-tile')
            .setDisplaySize(wallThickness, worldHeight).refreshBody();
        
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    }
    
    createPixelGrid(width, height) {
        const gridSize = 32;
        for (let x = 0; x < width; x += gridSize) {
            this.add.rectangle(x, height/2, 1, height, 0x222222, 0.3);
        }
        for (let y = 0; y < height; y += gridSize) {
            this.add.rectangle(width/2, y, width, 1, 0x222222, 0.3);
        }
    }

    createPlayer(characterId) {
        const config = CharacterConfig[characterId];
        
        config.characterId = characterId;
        
        const startX = this.game.config.width / 2;
        const startY = this.game.config.height / 2;
        
        this.player = new Player(this, startX, startY, config);
        this.player.setTexture(`player-${characterId}-down-0`);
        
        this.cameras.main.startFollow(this.player);
    }
    
    createPlayerAnimations(characterId) {
        const directions = ['down', 'left', 'right', 'up'];
        
        directions.forEach(dir => {
            const frames = [
                { key: `player-${characterId}-${dir}-0` },
                { key: `player-${characterId}-${dir}-1` },
                { key: `player-${characterId}-${dir}-2` },
                { key: `player-${characterId}-${dir}-1` }
            ];
            
            this.anims.create({
                key: `walk-${characterId}-${dir}`,
                frames: frames,
                frameRate: 8,
                repeat: -1
            });
        });
    }

    createGroups() {
        // 敌人组
        this.enemies = this.add.group();
        
        // 弹幕组
        this.projectiles = this.add.group();
        this.enemyProjectiles = this.add.group();
        
        // 道具组
        this.items = this.add.group();
    }

    createUI() {
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);
        
        this.healthBar = this.createSegmentedBar(20, 20, 'HP', 0xff0000);
        this.shieldBar = this.createSegmentedBar(20, 50, 'SH', 0x00ffff);
        
        this.killCounter = this.add.text(20, 90, 'KILLS: 0', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffff00',
            stroke: '#000',
            strokeThickness: 2
        });
        
        this.waveDisplay = this.add.text(20, 110, 'WAVE: 1', {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#00ffff',
            stroke: '#000',
            strokeThickness: 2
        });
        
        this.uiContainer.add([this.healthBar.container, this.shieldBar.container]);
    }

    createSegmentedBar(x, y, label, color) {
        const container = this.add.container(x, y);
        
        const border = this.add.rectangle(100, 0, 200, 24, 0x000000);
        border.setStrokeStyle(2, color);
        
        const segments = [];
        for (let i = 0; i < 10; i++) {
            const segment = this.add.rectangle(
                -90 + i * 20, 0,
                18, 18, color
            );
            segment.alpha = 1;
            segments.push(segment);
        }
        
        const labelText = this.add.text(-110, 0, label, {
            fontSize: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#ffffff'
        });
        labelText.setOrigin(0, 0.5);
        
        container.add([border, labelText, ...segments]);
        
        return { container, segments };
    }

    updateCollisions() {
        if (!this.player || !this.player.active) return;
        
        // 玩家与墙壁的碰撞
        this.physics.collide(this.player, this.walls);
        
        // 敌人与墙壁的碰撞
        this.physics.collide(this.enemies, this.walls);
        
        // 玩家与敌人的碰撞（受到伤害）
        this.physics.overlap(this.player, this.enemies, (player, enemy) => {
            player.takeDamage(enemy.damage || 1); // 使用敌人的伤害值
            
            // 击退敌人
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            enemy.body.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100);
        });
        
        // 子弹与敌人的碰撞
        this.physics.overlap(this.projectiles, this.enemies, (bullet, enemy) => {
            bullet.destroy();
            enemy.takeDamage(bullet.damage || this.player.damage);
        });
        
        // 玩家子弹与敌人子弹的碰撞
        this.physics.overlap(this.projectiles, this.enemyProjectiles, (playerBullet, enemyBullet) => {
            playerBullet.destroy();
            enemyBullet.destroy();
            
            // TODO: 这里可以添加碰撞特效
            const effect = this.add.circle(playerBullet.x, playerBullet.y, 8, 0xffffff, 0.5);
            this.tweens.add({
                targets: effect,
                scale: 2,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    if (effect && !effect.destroyed) {
                        effect.destroy();
                    }
                }
            });
        });
    }

    updateUI(time, delta) {
        if (!this.player || !this.player.active) return;
        
        const healthPercent = this.player.currentHealth / this.player.maxHealth;
        const filledSegments = Math.ceil(healthPercent * 10);
        
        this.healthBar.segments.forEach((segment, index) => {
            segment.alpha = index < filledSegments ? 1 : 0.3;
        });
        
        const shieldPercent = this.player.currentShield / this.player.maxShield;
        const filledShieldSegments = Math.ceil(shieldPercent * 10);
        
        this.shieldBar.segments.forEach((segment, index) => {
            segment.alpha = index < filledShieldSegments ? 1 : 0.3;
        });
        
        this.killCounter.setText(`KILLS: ${this.player.killCount}`);
        this.waveDisplay.setText(`WAVE: ${this.enemyManager.currentWave}`);
    }

    createPlaceholderGraphics() {
        // 创建临时图形资源 - 使用 this.make.graphics() 更安全
        const graphics = this.make.graphics({ x: 0, y: 0 }, false);
        
        // 地面纹理（实际游戏中使用）
        graphics.fillStyle(0x3a3a3a);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('ground-tile', 32, 32);
        
        // 墙壁纹理
        graphics.fillStyle(0x6a6a6a);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('wall-tile', 32, 32);
        
        // 玩家纹理
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillCircle(16, 16, 12);
        graphics.generateTexture('player', 32, 32);
        
        // 敌人纹理 - 基础敌人
        graphics.clear();
        graphics.fillStyle(0xff00ff);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('enemy-basic', 20, 20);
        
        // 快速敌人
        graphics.clear();
        graphics.fillStyle(0x00ffff);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('enemy-rush', 16, 16);
        
        // 坦克敌人
        graphics.clear();
        graphics.fillStyle(0xff8800);
        graphics.fillCircle(14, 14, 14);
        graphics.generateTexture('enemy-tank', 28, 28);
        
        // 分裂敌人
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillCircle(10, 10, 10);
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeCircle(10, 10, 10);
        graphics.generateTexture('enemy-split', 20, 20);
        
        // 小敌人
        graphics.clear();
        graphics.fillStyle(0xaaff00);
        graphics.fillCircle(6, 6, 6);
        graphics.generateTexture('enemy-mini', 12, 12);
        
        // 射击敌人
        graphics.clear();
        graphics.fillStyle(0xff0088);
        graphics.fillCircle(10, 10, 10);
        graphics.fillStyle(0x000000);
        graphics.fillRect(7, 9, 6, 2);
        graphics.generateTexture('enemy-shooter', 20, 20);
        
        // 爆炸敌人
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(10, 10, 10);
        graphics.lineStyle(2, 0xff0000);
        graphics.strokeCircle(10, 10, 12);
        graphics.generateTexture('enemy-exploder', 20, 20);
        
        // 敌人（默认）
        graphics.clear();
        graphics.fillStyle(0xff00ff);
        graphics.fillCircle(10, 10, 10);
        graphics.generateTexture('enemy', 20, 20);
        
        // 子弹纹理
        graphics.clear();
        graphics.fillStyle(0xffff00);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);
        
        // 道具纹理（使用正多边形代替星形）
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        // 手动绘制菱形路径
        graphics.beginPath();
        graphics.moveTo(8, 0);   // 上
        graphics.lineTo(16, 8);  // 右
        graphics.lineTo(8, 16);  // 下
        graphics.lineTo(0, 8);   // 左
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('item', 16, 16);
        
        graphics.destroy();
    }

    handleEnemyDeath(enemy, awardScore = true) {
        if (!enemy || enemy.health > 0) return;
        
        const score = enemy.score || 10;
        const color = enemy.color || 0xff00ff;
        
        this.particles.createExplosion(enemy.x, enemy.y, color, 16, 8);
        this.particles.createScorePopup(enemy.x, enemy.y, score);
        
        if (this.audio) {
            this.audio.enemyDeath();
        }
        
        let killCountWasIncremented = false;
        if (this.player && this.player.killCountManager) {
            this.player.killCountManager.incrementKillCount();
            this.killCount = this.player.killCountManager.killCount;
            killCountWasIncremented = true;
        } else {
            this.killCount++;
            killCountWasIncremented = true;
        }
        
        if (this.enemyManager) {
            this.enemyManager.totalEnemiesKilled++;
        }
        
        enemy.destroy();
    }
}