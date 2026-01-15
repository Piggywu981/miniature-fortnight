import { Physics } from 'phaser';

/**
 * 敌人类 - 包含不同类型敌人的AI和行为
 */
export class Enemy extends Physics.Arcade.Sprite {
    constructor(scene, x, y, enemyConfig) {
        super(scene, x, y, 'enemy');
        
        this.scene = scene;
        this.config = enemyConfig;
        this.enemyType = enemyConfig.type;
        
        // 设置敌人纹理（根据类型）
        const textureName = this.getTextureName();
        this.setTexture(textureName);
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 生成持续时间（防止敌人生在不合理位置）
        this.spawnTime = scene.gameTime || 0;
        this.invulnerableTime = 500; // 500ms出生无敌
        
        // 基础属性
        this.health = enemyConfig.health;
        this.maxHealth = enemyConfig.health;
        this.speed = enemyConfig.speed;
        this.damage = enemyConfig.damage;
        this.score = enemyConfig.score;
        this.size = enemyConfig.size;
        this.color = enemyConfig.color;
        
        // 类型特定属性
        this.lastShotTime = 0; // 射击敌人使用
        this.isExploding = false; // 爆炸敌人使用
        this.explodeTimer = 0;
        this.lastDirectionChange = 0;
        this.lastSpeedChange = 0;
        
        // 分裂敌人使用
        this.splitCount = enemyConfig.splitCount || 0;
        this.splitEnemy = enemyConfig.splitEnemy || null;
        
        // 状态
        this.aiState = 'normal'; // normal, chasing, fleeing, attacking
        this.targetPosition = null;
        this.attackCooldown = 0;
        
        // 设置物理
        this.setCircle(this.size / 2);
        this.setCollideWorldBounds(true);
        this.setTint(this.color);
        
        // 设置尺寸
        this.setDisplaySize(this.size, this.size);
        
        // 视觉缩放效果
        this.setScale(0);
        this.scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    /**
     * 获取纹理名称
     */
    getTextureName() {
        const textureMap = {
            'basic': 'enemy-basic',
            'rush': 'enemy-rush',
            'tank': 'enemy-tank',
            'split': 'enemy-split',
            'mini': 'enemy-mini',
            'shooter': 'enemy-shooter',
            'exploder': 'enemy-exploder'
        };
        
        return textureMap[this.enemyType] || 'enemy';
    }

    update(time, delta) {
        // 计算实际时间和游戏时间
        const gameTime = this.scene.gameTime || 0;
        const actualDelta = delta || 16;
        
        // 更新冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= actualDelta;
        }
        
        // 根据不同类型执行不同AI
        switch (this.enemyType) {
            case 'basic':
                this.updateBasicAI();
                break;
            case 'rush':
                this.updateRushAI();
                break;
            case 'tank':
                this.updateTankAI();
                break;
            case 'split':
                this.updateSplitAI();
                break;
            case 'mini':
                this.updateMiniAI();
                break;
            case 'shooter':
                this.updateShooterAI(gameTime);
                break;
            case 'exploder':
                this.updateExploderAI(gameTime);
                break;
        }
        
        // 更新状态视觉效果
        this.updateVisualState();
    }

    // 基础AI - 直线追踪玩家
    updateBasicAI() {
        if (!this.scene.player || !this.scene.player.active) return;
        
        const player = this.scene.player;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        this.setVelocity(
            Math.cos(angle) * this.speed,
            Math.sin(angle) * this.speed
        );
    }

    // 快速AI - 更快速度，zigzag移动
    updateRushAI() {
        if (!this.scene.player || !this.scene.player.active) return;
        
        const player = this.scene.player;
        const time = this.scene.gameTime || 0;
        
        let targetX = player.x;
        let targetY = player.y;
        
        // zigzag移动模式
        if (time - this.lastDirectionChange > 500) { // 每500ms改变方向模式
            this.zigzagOffset = (this.zigzagOffset || 0) + Math.PI / 2;
            this.lastDirectionChange = time;
        }
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const zigzagAngle = angle + Math.sin((time / 100) + this.zigzagOffset) * 0.5;
        
        this.setVelocity(
            Math.cos(zigzagAngle) * this.speed,
            Math.sin(zigzagAngle) * this.speed
        );
    }

    // 坦克AI - 缓慢但持续追踪，偶尔加速冲锋
    updateTankAI() {
        if (!this.scene.player || !this.scene.player.active) return;
        
        const player = this.scene.player;
        const time = this.scene.gameTime || 0;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        let speed = this.speed;
        
        // 偶尔冲锋（每5秒一次）
        if (time - this.lastSpeedChange > 5000 && distance < 150) {
            speed = this.speed * 2.5; // 2.5倍速度冲锋
            if (time - this.lastSpeedChange > 5500) { // 冲锋持续0.5秒
                this.lastSpeedChange = time;
            }
        }
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        this.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    // 分裂AI - 正常追踪，被击杀时分裂
    updateSplitAI() {
        this.updateBasicAI(); // 使用基础AI
    }

    // 小敌人AI - 非常快，但生命值极低
    updateMiniAI() {
        if (!this.scene.player || !this.scene.player.active) return;
        
        const player = this.scene.player;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        
        // 小敌人更快，但不稳定
        const speed = this.speed * (0.8 + Math.random() * 0.4);
        
        this.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }

    // 射击AI - 保持距离并射击
    updateShooterAI(time) {
        if (!this.scene.player || !this.scene.player.active) return;
        
        const player = this.scene.player;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const desiredRange = this.config.range || 150;
        
        if (distance < desiredRange) {
            // 距离太近，后退
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            const fleeAngle = angle + Math.PI; // 相反方向
            
            this.setVelocity(
                Math.cos(fleeAngle) * this.speed * 0.7,
                Math.sin(fleeAngle) * this.speed * 0.7
            );
        } else if (distance > desiredRange + 50) {
            // 距离太远，靠近
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocity(
                Math.cos(angle) * this.speed * 0.5,
                Math.sin(angle) * this.speed * 0.5
            );
        } else {
            // 理想距离，停止移动
            this.setVelocity(0, 0);
            
            // 射击
            if (time - this.lastShotTime > this.config.fireRate) {
                this.shootAtPlayer();
                this.lastShotTime = time;
            }
        }
    }

    // 射击逻辑
    shootAtPlayer() {
        const player = this.scene.player;
        if (!player || !player.active) return;
        
        const projectile = this.scene.add.circle(this.x, this.y, 4, 0xff0088);
        this.scene.physics.add.existing(projectile);
        this.scene.enemyProjectiles.add(projectile);
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const speed = this.config.projectileSpeed || 200;
        const damage = this.config.projectileDamage || 2;
        
        projectile.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        projectile.damage = damage;
        projectile.lifespan = 3000; // 3秒后销毁
        
        // 自动销毁
        this.scene.time.delayedCall(projectile.lifespan, () => {
            if (projectile && !projectile.destroyed) {
                projectile.destroy();
            }
        });
    }

    // 爆炸AI - 接近玩家会自爆
    updateExploderAI(time) {
        if (!this.scene.player || !this.scene.player.active) return;
        
        const player = this.scene.player;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const approachRadius = this.config.approachRadius || 150;
        
        if (distance < approachRadius && !this.isExploding) {
            // 开始爆炸倒计时
            this.isExploding = true;
            this.explodeTimer = this.config.explosionDelay || 1000;
            
            // 闪烁警告
            this.scene.tweens.add({
                targets: this,
                alpha: 0.3,
                yoyo: true,
                repeat: 5,
                duration: 100
            });
        }
        
        if (this.isExploding) {
            this.explodeTimer -= 16; // 假设60fps
            
            if (this.explodeTimer <= 0) {
                this.explode();
            } else {
                // 停止移动
                this.setVelocity(0, 0);
            }
        } else {
            // 正常追踪
            this.updateBasicAI();
        }
    }

    // 爆炸逻辑
    explode() {
        const explosionRadius = this.config.explosionRadius || 100;
        const explosionDamage = this.config.explosionDamage || 5;
        
        // 爆炸视觉效果
        const explosion = this.scene.add.circle(this.x, this.y, explosionRadius, 0xff0000, 0.3);
        
        this.scene.tweens.add({
            targets: explosion,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                if (explosion && !explosion.destroyed) {
                    explosion.destroy();
                }
            }
        });
        
        // 对范围内敌人造成伤害
        const enemies = this.scene.enemies.children.entries;
        enemies.forEach(enemy => {
            if (enemy === this || !enemy.active) return;
            
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance < explosionRadius) {
                enemy.health -= explosionDamage;
                
                if (enemy.health <= 0) {
                    this.scene.handleEnemyDeath(enemy);
                }
            }
        });
        
        // 对玩家造成伤害
        if (this.scene.player && this.scene.player.active) {
            const playerDistance = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
            if (playerDistance < explosionRadius) {
                this.scene.player.takeDamage(explosionDamage);
            }
        }
        
        // 处理自身死亡（不计分，因为是自爆）
        this.health = 0;
        this.scene.handleEnemyDeath(this, false); // false表示不计分
        this.destroy();
    }

    // 更新视觉状态
    updateVisualState() {
        // 出生无敌时闪烁
        const gameTime = this.scene.gameTime || 0;
        const timeSinceSpawn = gameTime - this.spawnTime;
        
        if (timeSinceSpawn < this.invulnerableTime) {
            this.alpha = 0.5 + Math.sin(timeSinceSpawn / 50) * 0.5;
        } else {
            this.alpha = 1;
        }
        
        // 根据血量改变颜色深度
        if (this.maxHealth > 1) {
            const healthRatio = this.health / this.maxHealth;
            this.alpha = 0.7 + healthRatio * 0.3;
        }
    }

    // 受到伤害
    takeDamage(damage) {
        // 出生无敌期间免疫伤害
        const gameTime = this.scene.gameTime || 0;
        const timeSinceSpawn = gameTime - this.spawnTime;
        
        if (timeSinceSpawn < this.invulnerableTime) {
            // 无敌时闪烁白色
            this.setTint(0xffffff);
            this.scene.time.delayedCall(100, () => {
                if (this && !this.destroyed) {
                    this.setTint(this.color);
                }
            });
            return 0;
        }
        
        this.health -= damage;
        
        // 受伤反馈
        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this && !this.destroyed) {
                this.setTint(this.color);
            }
        });
        
        // 检查死亡
        if (this.health <= 0) {
            this.health = 0;
            this.die();
            return damage; // 返回实际造成的伤害
        }
        
        return damage;
    }

    // 死亡处理
    die() {
        // 检查是否是分裂敌人
        if (this.enemyType === 'split' && this.splitCount > 0 && this.splitEnemy) {
            this.split();
        }
        
        // 死亡动画
        this.playDeathAnimation();
        
        // 处理击杀计数和得分
        if (this.scene && this.scene.handleEnemyDeath) {
            this.scene.handleEnemyDeath(this);
        }
    }

    // 分裂逻辑
    split() {
        const splitConfig = this.scene.enemyManager.getEnemyConfig(this.splitEnemy);
        
        if (!splitConfig) return;
        
        for (let i = 0; i < this.splitCount; i++) {
            // 在死亡位置附近生成小敌人
            const angle = (Math.PI * 2 / this.splitCount) * i;
            const distance = 20;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            const miniEnemy = new Enemy(this.scene, x, y, splitConfig);
            this.scene.enemies.add(miniEnemy);
        }
    }

    // 死亡动画
    playDeathAnimation() {
        // 缩放消失效果
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            alpha: 0,
            rotation: Math.PI * 2,
            duration: 200,
            onComplete: () => {
                if (this && !this.destroyed) {
                    this.destroy();
                }
            }
        });
    }

    // 销毁时清理
    destroy() {
        // 可以在这里清理任何定时器或事件
        super.destroy();
    }
}