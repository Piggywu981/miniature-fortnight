import { Scene } from 'phaser';
import { CharacterConfig } from '../characters/CharacterConfig.js';
import { Player } from '../characters/Player.js';

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
    }

    preload() {
        // 创建简单的占位图形
        this.createPlaceholderGraphics();
    }

    create() {
        // 初始化输入
        this.initializeInput();
        
        // 创建地图
        this.createMap();
        
        // 创建玩家（默认使用伊娜）
        this.createPlayer('INA');
        
        // 创建游戏对象组
        this.createGroups();
        
        // 创建UI
        this.createUI();
        
        // 生成初始敌人
        this.spawnEnemies(5);
    }

    update(time, delta) {
        this.gameTime += delta;
        
        // 更新玩家
        if (this.player && this.player.active) {
            this.player.update(time, delta);
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
        
        // 鼠标输入
        this.input.on('pointerdown', (pointer) => {
            if (this.player && this.player.active) {
                if (pointer.rightButtonDown()) {
                    this.player.useRightClickAbility(pointer.x, pointer.y);
                } else {
                    this.player.startShooting(pointer.x, pointer.y);
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
        // 创建简单的tilemap
        this.map = this.make.tilemap({ 
            tileWidth: 32, 
            tileHeight: 32,
            width: 50,
            height: 50
        });
        
        const tiles = this.map.addTilesetImage('tiles', null, 32, 32);
        this.groundLayer = this.map.createBlankLayer('ground', tiles);
        this.wallsLayer = this.map.createBlankLayer('walls', tiles);
        
        // 填充地面
        this.groundLayer.fill(0);
        
        // 创建墙壁边界
        this.wallsLayer.fill(1, 0, 0, 50, 1);
        this.wallsLayer.fill(1, 0, 49, 50, 1);
        this.wallsLayer.fill(1, 0, 0, 1, 50);
        this.wallsLayer.fill(1, 49, 0, 1, 50);
        
        // 设置碰撞
        this.wallsLayer.setCollision([1]);
    }

    createPlayer(characterId) {
        const config = CharacterConfig[characterId];
        const startX = this.game.config.width / 2;
        const startY = this.game.config.height / 2;
        
        this.player = new Player(this, startX, startY, config);
        
        // 相机跟随
        this.cameras.main.startFollow(this.player);
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
        // 创建UI容器
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);
        
        // 血条
        this.healthBar = this.createHealthBar();
        this.shieldBar = this.createShieldBar();
        
        this.uiContainer.add([this.healthBar.container, this.shieldBar.container]);
    }

    createHealthBar() {
        const container = this.add.container(20, 20);
        
        const bg = this.add.rectangle(0, 0, 200, 20, 0x000000);
        const bar = this.add.rectangle(-100, 0, 200, 20, 0xff0000);
        bar.setOrigin(0, 0.5);
        const text = this.add.text(0, -25, 'HP: 0/0', { 
            fontSize: '14px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });
        
        container.add([bg, bar, text]);
        
        return { container, bar, text };
    }

    createShieldBar() {
        const container = this.add.container(20, 50);
        
        const bg = this.add.rectangle(0, 0, 200, 20, 0x000000);
        const bar = this.add.rectangle(-100, 0, 200, 20, 0x00ffff);
        bar.setOrigin(0, 0.5);
        const text = this.add.text(0, -25, 'Shield: 0/0', { 
            fontSize: '14px', 
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 2
        });
        
        container.add([bg, bar, text]);
        
        return { container, bar, text };
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(100, this.game.config.width - 100);
            const y = Phaser.Math.Between(100, this.game.config.height - 100);
            
            const enemy = this.add.rectangle(x, y, 20, 20, 0xff00ff);
            
            enemy.health = 3;
            enemy.speed = 50;
            
            this.physics.add.existing(enemy);
            this.enemies.add(enemy);
        }
    }

    updateCollisions() {
        if (!this.player || !this.player.active) return;
        
        // 玩家与墙壁的碰撞
        this.physics.collide(this.player, this.wallsLayer);
        
        // 敌人与墙壁的碰撞
        this.physics.collide(this.enemies, this.wallsLayer);
        
        // 敌人跟随玩家
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                const angle = Phaser.Math.Angle.Between(
                    enemy.x, enemy.y,
                    this.player.x, this.player.y
                );
                
                enemy.body.setVelocity(
                    Math.cos(angle) * enemy.speed,
                    Math.sin(angle) * enemy.speed
                );
            }
        });
    }

    updateUI(time, delta) {
        if (!this.player || !this.player.active) return;
        
        // 更新血条
        const healthPercent = this.player.currentHealth / this.player.maxHealth;
        this.healthBar.bar.width = 200 * healthPercent;
        this.healthBar.text.setText(`HP: ${this.player.currentHealth}/${this.player.maxHealth}`);
        
        // 更新护盾条
        const shieldPercent = this.player.currentShield / this.player.maxShield;
        this.shieldBar.bar.width = 200 * shieldPercent;
        this.shieldBar.text.setText(`Shield: ${this.player.currentShield}/${this.player.maxShield}`);
    }

    createPlaceholderGraphics() {
        // 创建临时图形资源
        const graphics = this.add.graphics();
        
        // 地面瓷砖
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('ground-tile', 32, 32);
        
        // 墙壁瓷砖
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('wall-tile', 32, 32);
        
        // 玩家图形
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillCircle(16, 16, 12);
        graphics.generateTexture('player', 32, 32);
        
        // 子弹图形
        graphics.clear();
        graphics.fillStyle(0xffff00);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);
        
        graphics.destroy();
    }

    handleEnemyDeath(enemy) {
        this.killCount++;
        enemy.destroy();
        
        // 检查特殊条件
        if (this.killCount % 1000 === 0) {
            // 伊娜的治疗道具掉落
            if (this.player.config.class === '干活的') {
                this.dropHealthItem(enemy.x, enemy.y);
            }
        }
        
        // 玉子的随机升级
        if (this.player.config.class === '乐子人' && this.killCount % 1000 === 0) {
            // 触发随机升级
            this.triggerRandomUpgrade();
        }
        
        // 玉子的受伤复仇
        if (this.player.config.class === '乐子人') {
            // 受伤后消灭最近的10个敌人（代码中在其他地方处理）
        }
    }

    dropHealthItem(x, y) {
        const item = this.add.rectangle(x, y, 15, 15, 0x00ff00);
        this.physics.add.existing(item);
        this.items.add(item);
        
        // 拾取检测
        this.physics.add.overlap(this.player, item, () => {
            item.destroy();
            this.player.heal(2);
        });
    }

    triggerRandomUpgrade() {
        // 实现随机升级逻辑
        console.log('随机升级触发！');
    }
}