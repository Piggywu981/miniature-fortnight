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
        // 预加载阶段不需要做什么
    }

    create() {
        // 在 create 阶段开始时创建所有纹理
        this.createPlaceholderGraphics();
        
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
        // 创建简单的游戏世界边界
        const wallThickness = 20;
        const worldWidth = 1200;
        const worldHeight = 900;
        
        // 创建地面背景
        const ground = this.add.rectangle(
            worldWidth / 2, 
            worldHeight / 2, 
            worldWidth, 
            worldHeight, 
            0x333333
        );
        ground.setDepth(-1); // 设置在最底层
        
        // 创建墙壁组
        this.walls = this.physics.add.staticGroup();
        
        // 上墙
        this.walls.create(worldWidth / 2, wallThickness / 2, 'wall-tile')
            .setDisplaySize(worldWidth, wallThickness).refreshBody();
        
        // 下墙
        this.walls.create(worldWidth / 2, worldHeight - wallThickness / 2, 'wall-tile')
            .setDisplaySize(worldWidth, wallThickness).refreshBody();
        
        // 左墙
        this.walls.create(wallThickness / 2, worldHeight / 2, 'wall-tile')
            .setDisplaySize(wallThickness, worldHeight).refreshBody();
        
        // 右墙
        this.walls.create(worldWidth - wallThickness / 2, worldHeight / 2, 'wall-tile')
            .setDisplaySize(wallThickness, worldHeight).refreshBody();
        
        // 设置世界边界
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
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
            
            const enemy = this.physics.add.sprite(x, y, 'enemy');
            
            enemy.health = 3;
            enemy.speed = 50;
            
            // 设置物理属性
            enemy.setCircle(10); // 设置圆形碰撞体
            enemy.setCollideWorldBounds(true);
            
            this.enemies.add(enemy);
        }
    }

    updateCollisions() {
        if (!this.player || !this.player.active) return;
        
        // 玩家与墙壁的碰撞
        this.physics.collide(this.player, this.walls);
        
        // 敌人与墙壁的碰撞
        this.physics.collide(this.enemies, this.walls);
        
        // 玩家与敌人的碰撞（受到伤害）
        this.physics.overlap(this.player, this.enemies, (player, enemy) => {
            player.takeDamage(1); // 每次碰撞受1点伤害
            
            // 击退敌人
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
            enemy.x += Math.cos(angle) * 20;
            enemy.y += Math.sin(angle) * 20;
        });
        
        // 子弹与敌人的碰撞
        this.physics.overlap(this.projectiles, this.enemies, (bullet, enemy) => {
            bullet.destroy();
            this.handleEnemyDeath(enemy);
        });
        
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
        
        // 敌�纹理
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