import { Physics } from 'phaser';
import { ElementTypes } from './CharacterConfig.js';

export class Player extends Physics.Arcade.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, 'player');
        
        this.scene = scene;
        this.config = config;
        
        // 添加到场景
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 基础属性
        this.maxHealth = config.stats.health;
        this.currentHealth = this.maxHealth;
        this.maxShield = config.stats.shield;
        this.currentShield = this.maxShield;
        
        // 战斗属性
        this.damage = 10; // 基础武器伤害
        this.attackSpeed = 100; // 毫秒间隔
        this.lastAttackTime = 0;
        this.isShooting = false;
        this.shootTarget = null;
        
        // 移动属性
        this.baseSpeed = 200;
        this.currentSpeed = this.baseSpeed;
        this.isMoving = false;
        
        // 防御属性
        this.dodgeChance = config.stats.baseDodge;
        this.isInvincible = false;
        
        // 冷却时间
        this.abilityCooldown = 0;
        this.lastShieldRegen = 0;
        this.hurtCooldown = 0;  // 受伤冷却时间（防止连续受伤）
        
        // 角色特定计数器
        this.killCount = 0;
        this.shieldSlotTimer = 0; // 用于傻子
        
        // 设置碰撞
        this.setCollideWorldBounds(true);
        this.body.setSize(24, 24); // 设置碰撞体大小为24x24（精灵是32x32）
        this.body.setOffset(4, 4); // 偏移4像素居中
        
        this.initializeAbilities();
    }

    initializeAbilities() {
        // 初始化角色特定能力
        if (this.config.class === '傻子') {
            // 每180秒增加一个盾位槽
            this.shieldSlotTimer = 0;
        }
    }

    update(time, delta) {
        this.handleMovement();
        this.handleShooting(time);
        this.handleRegeneration(time);
        this.handleAbilityCooldown(delta);
        this.handleHurtCooldown(delta);
        
        // 角色特定更新
        if (this.config.class === '傻子') {
            this.shieldSlotTimer += delta;
            if (this.shieldSlotTimer >= this.config.modifiers.shieldSlotInterval) {
                this.maxShield++;
                this.shieldSlotTimer = 0;
            }
        }
    }

    handleMovement() {
        const cursors = this.scene.cursors;
        const wasd = this.scene.wasd;
        
        let velocityX = 0;
        let velocityY = 0;
        
        // WASD移动
        if (wasd.W.isDown) velocityY = -1;
        if (wasd.S.isDown) velocityY = 1;
        if (wasd.A.isDown) velocityX = -1;
        if (wasd.D.isDown) velocityX = 1;
        
        // 箭头键移动（备用）
        if (cursors.up.isDown) velocityY = -1;
        if (cursors.down.isDown) velocityY = 1;
        if (cursors.left.isDown) velocityX = -1;
        if (cursors.right.isDown) velocityX = 1;
        
        if (velocityX !== 0 || velocityY !== 0) {
            // 标准化速度向量
            const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            velocityX /= length;
            velocityY /= length;
            
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
        
        // 计算移动速度（考虑开火惩罚）
        this.calculateMovementSpeed();
        
        this.setVelocity(velocityX * this.currentSpeed, velocityY * this.currentSpeed);
    }

    calculateMovementSpeed() {
        this.currentSpeed = this.baseSpeed;
        
        // 角色特定惩罚
        if (this.config.class === '傻子') {
            this.currentSpeed *= 0.8; // 20%移速惩罚
        }
        
        // 各类惩罚和增益
        if (this.isShooting && !this.hasIgnoreMovePenalty()) {
            this.currentSpeed *= 0.6; // 开火移速惩罚
        }
        
        if (this.config.class === '傻子' && !this.hasIgnoreMovePenalty()) {
            this.currentSpeed *= 0.5; // 傻子开火惩罚翻倍
        }
    }

    hasIgnoreMovePenalty() {
        switch (this.config.class) {
            case '疯子':
                return true;
            case '干活的':
                return true; // 使用霰弹枪时无视惩罚（当前简化实现）
            case '乐子人':
                return true; // 使用榴弹炮时无视惩罚
            default:
                return false;
        }
    }

    handleShooting(time) {
        if (!this.isShooting || !this.shootTarget) return;
        
        // 攻击速度惩罚/增益
        let attackInterval = this.attackSpeed;
        if (this.config.class === '疯子') {
            attackInterval *= 0.7; // 30%攻速加成
        } else if (this.config.class === '傻子') {
            attackInterval *= 1.2; // 20%攻速惩罚
        }
        
        if (time - this.lastAttackTime >= attackInterval) {
            this.shoot(this.shootTarget.x, this.shootTarget.y);
            this.lastAttackTime = time;
        }
    }

    shoot(targetX, targetY) {
        // 计算子弹伤害
        let bulletDamage = this.damage;
        
        // 伤害加成
        if (this.config.modifiers.damageBonus) {
            bulletDamage *= (1 + this.config.modifiers.damageBonus);
        } else if (this.config.modifiers.damagePenalty) {
            bulletDamage *= (1 - this.config.modifiers.damagePenalty);
        }
        
        // 乐子人的榴弹伤害加成
        if (this.config.class === '乐子人') {
            bulletDamage *= 1.5;
        }
        
        // 创建子弹 - 使用 phaser sprite 确保有物理属性
        const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
        this.scene.projectiles.add(bullet);
        
        // 设置子弹速度和伤害
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        bullet.setVelocity(
            Math.cos(angle) * 500,
            Math.sin(angle) * 500
        );
        bullet.damage = bulletDamage;
        bullet.range = 500;
        bullet.distance = 0;
    }

    startShooting(targetX, targetY) {
        this.isShooting = true;
        this.shootTarget = { x: targetX, y: targetY };
    }

    stopShooting() {
        this.isShooting = false;
        this.shootTarget = null;
    }

    handleRegeneration(time) {
        // 护盾恢复
        if (this.config.stats.shield > 0 && this.currentShield < this.maxShield) {
            const regenInterval = this.config.class === '傻子' ? 120000 : 60000; // 60秒恢复，傻子减半
            
            if (time - this.lastShieldRegen >= regenInterval) {
                this.currentShield++;
                this.lastShieldRegen = time;
            }
        }
    }

    handleAbilityCooldown(delta) {
        if (this.abilityCooldown > 0) {
            this.abilityCooldown = Math.max(0, this.abilityCooldown - delta);
        }
    }

    handleHurtCooldown(delta) {
        if (this.hurtCooldown > 0) {
            this.hurtCooldown -= delta;
        }
    }

    useRightClickAbility(targetX, targetY) {
        if (this.abilityCooldown > 0) return;
        
        switch (this.config.class) {
            case '干活的': // 伊娜 - 近战攻击
                this.meleeAttack(targetX, targetY);
                break;
            case '疯子': // 米什卡 - 冲撞
                this.chargeAttack(targetX, targetY);
                break;
            case '谨慎军师': // 安娜 - 召唤克隆
                this.summonClone();
                break;
            case '傻子': // 米兰 - 无敌
                this.activateInvincibility();
                break;
            case '乐子人': // 玉子 - 连锁榴弹
                this.chainGrenadeAttack();
                break;
        }
    }

    meleeAttack(targetX, targetY) {
        // 近战攻击逻辑
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const swingDistance = 30;
        
        const damage = this.damage * 0.1; // 10%子弹伤害
        
        // 创建近战范围检测
        const hitbox = this.scene.add.rectangle(
            this.x + Math.cos(angle) * swingDistance,
            this.y + Math.sin(angle) * swingDistance,
            20, 20, 0x00ffff
        );
        
        // 暂时显示然后隐藏
        this.scene.time.delayedCall(100, () => {
            if (hitbox && !hitbox.destroyed) {
                hitbox.destroy();
            }
        });
        
        // 检测击中敌人
        const enemies = this.scene.enemies.children.entries;
        enemies.forEach(enemy => {
            if (Phaser.Math.Distance.Between(hitbox.x, hitbox.y, enemy.x, enemy.y) < 20) {
                this.dealDamageToEnemy(enemy, damage);
            }
        });
        
        this.abilityCooldown = 500; // 短暂冷却
    }

    chargeAttack(targetX, targetY) {
        // 冲撞攻击
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const chargeDistance = 100;
        const chargeSpeed = 500;
        
        this.isInvincible = true;
        
        // 设置冲��速度
        this.setVelocity(
            Math.cos(angle) * chargeSpeed,
            Math.sin(angle) * chargeSpeed
        );
        
        // 冲撞伤害
        const damage = this.damage * 2.0; // 200%子弹伤害
        
        // 检测冲撞路径上的敌人
        const enemies = this.scene.enemies.children.entries;
        enemies.forEach(enemy => {
            if (Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < chargeDistance) {
                this.dealDamageToEnemy(enemy, damage);
            }
        });
        
        // 短暂延迟后恢复
        this.scene.time.delayedCall(300, () => {
            if (this && !this.destroyed) {
                this.isInvincible = false;
                this.setVelocity(0, 0);
            }
        });
        
        this.abilityCooldown = 1000;
    }

    summonClone() {
        // 只在安娜（谨慎军师）时生效
        if (this.config.class !== '谨慎军师') return;
        
        // 在原地召唤一个克隆（简化实现）
        const clone = this.scene.add.circle(this.x, this.y, 12, 0x00ffff);
        clone.alpha = 0.5;
        
        this.scene.time.delayedCall(5000, () => {
            if (clone && !clone.destroyed) {
                clone.destroy();
            }
        });
        
        this.abilityCooldown = 30000; // 30秒冷却
    }

    activateInvincibility() {
        // 只在 Milan（傻子）时生效
        if (this.config.class !== '傻子') return;
        
        this.isInvincible = true;
        
        // 视觉反馈
        this.alpha = 0.7;
        this.setTint(0x00ffff);
        
        // 弹开周围的敌人
        const enemies = this.scene.enemies.children.entries;
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance < 80) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
                const pushForce = 200;
                enemy.body.setVelocity(
                    Math.cos(angle) * pushForce,
                    Math.sin(angle) * pushForce
                );
            }
        });
        
        // 持续时间3秒
        this.scene.time.delayedCall(3000, () => {
            if (this && !this.destroyed) {
                this.isInvincible = false;
                this.alpha = 1;
                this.clearTint();
            }
        });
        
        this.abilityCooldown = 60000; // 60秒冷却
    }

    chainGrenadeAttack() {
        // 只在玉子（乐子人）时生效
        if (this.config.class !== '乐子人') return;
        
        const enemies = this.scene.enemies.children.entries;
        if (enemies.length === 0) return;
        
        // 找到最近的敌人
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (closestEnemy) {
            // 杀死最近的敌人
            this.dealDamageToEnemy(closestEnemy, Infinity);
            
            // 发射6枚特殊榴弹
            for (let i = 0; i < 6; i++) {
                const grenade = this.scene.add.circle(
                    closestEnemy.x,
                    closestEnemy.y,
                    8,
                    0xff8800
                );
                this.scene.physics.add.existing(grenade);
                this.scene.projectiles.add(grenade);
                
                const angle = (Math.PI * 2 / 6) * i;
                grenade.setVelocity(
                    Math.cos(angle) * 300,
                    Math.sin(angle) * 300
                );
                grenade.damage = this.damage;
                grenade.isSpecial = true;
            }
        }
        
        this.abilityCooldown = 20000; // 20秒冷却
    }

    takeDamage(amount) {
        if (this.isInvincible || this.hurtCooldown > 0) {
            // 触发玉子的复仇（如果在受到伤害时）
            if (this.config.class === '乐子人' && this.isInvincible) {
                this.triggerRevenge();
            }
            return 0; // 免疫伤害或处于受伤冷却中
        }
        
        // 闪避检查
        if (this.config.class !== '疯子' && Math.random() < this.dodgeChance) {
            return 0; // 闪避成功
        }
        
        // 设置受伤冷却（1秒内不能再次受伤）
        this.hurtCooldown = 1000;
        
        let actualDamage = amount;
        
        // 检查护盾
        if (this.currentShield > 0) {
            if (this.currentShield >= actualDamage) {
                this.currentShield -= actualDamage;
                actualDamage = 0;
            } else {
                actualDamage -= this.currentShield;
                this.currentShield = 0;
            }
        }
        
        // 扣除生命值
        this.currentHealth -= actualDamage;
        
        // 检查死亡
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.die();
        }
        
        // 玉子的复仇
        if (this.config.class === '乐子人') {
            this.triggerRevenge();
        }
        
        return actualDamage;
    }

    triggerRevenge() {
        // 消灭距离自己最近的10个敌人
        const enemies = this.scene.enemies.children.entries.slice();
        
        // 按距离排序
        enemies.sort((a, b) => {
            const distA = Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y);
            const distB = Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y);
            return distA - distB;
        });
        
        // 杀死最近的10个敌人
        for (let i = 0; i < Math.min(10, enemies.length); i++) {
            this.scene.handleEnemyDeath(enemies[i]);
        }
    }

    dealDamageToEnemy(enemy, damage) {
        if (!enemy || !enemy.active) return;
        
        enemy.health -= damage;
        
        if (enemy.health <= 0) {
            this.scene.handleEnemyDeath(enemy);
        }
    }

    heal(amount) {
        if (this.config.class === '乐子人' && this.config.abilities.restrictions.noHealingItems) {
            return; // 不能使用治疗道具
        }
        
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }

    die() {
        // 游戏结束
        if (!this.scene) return;
        
        this.scene.cameras.main.fadeOut(1000);
        this.scene.time.delayedCall(1000, () => {
            if (this && !this.destroyed) {
                this.destroy();
            }
            if (this.scene && this.scene.scene) {
                this.scene.scene.restart();
            }
        });
    }
}