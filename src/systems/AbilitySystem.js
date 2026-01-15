import { Physics } from 'phaser';

/**
 * 技能系统 - 处理所有角色的右键技能
 */
export class AbilitySystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.isActive = false;
        this.duration = 0;
        this.remainingTime = 0;
    }

    /**
     * 使用右键技能
     * @param {number} targetX - 目标X坐标
     * @param {number} targetY - 目标Y坐标
     * @returns {boolean} 技能是否成功释放
     */
    useAbility(targetX, targetY) {
        if (this.player.abilityCooldown > 0 || this.isActive) {
            return false;
        }

        const characterClass = this.player.config.class;
        
        switch (characterClass) {
            case '干活的':
                return this.useMeleeAttack(targetX, targetY);
            case '疯子':
                return this.useChargeAttack(targetX, targetY);
            case '谨慎军师':
                return this.useCloneSummon();
            case '傻子':
                return this.useInvincibility();
            case '乐子人':
                return this.useChainGrenade();
            default:
                return false;
        }
    }

    update(delta) {
        if (this.isActive) {
            this.remainingTime -= delta;
            if (this.remainingTime <= 0) {
                this.deactivate();
            }
        }
    }

    /**
     * 伊娜 - 近战攻击
     * 效果：对小范围内的敌人造成子弹伤害10%的伤害，可弹反敌人子弹
     */
    useMeleeAttack(targetX, targetY) {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);
        const swingDistance = 30;
        const damage = this.player.damage * 0.1;
        
        // 创建近战攻击区域
        const hitX = this.player.x + Math.cos(angle) * swingDistance;
        const hitY = this.player.y + Math.sin(angle) * swingDistance;
        
        // 视觉反馈
        this.createMeleeEffect(hitX, hitY);
        
        // 检测击中敌人
        const enemies = this.scene.enemies.children.entries;
        let hitCount = 0;
        
        enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            const distance = Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y);
            if (distance < 20) {
                this.player.dealDamageToEnemy(enemy, damage);
                hitCount++;
            }
        });
        
        // 弹反附近子弹（简化版）
        this.deflectNearbyBullets(hitX, hitY, 30);
        
        // 设置冷却
        this.player.abilityCooldown = 1000; // 1秒冷却
        
        return hitCount > 0;
    }

    createMeleeEffect(x, y) {
        const swing = this.scene.add.circle(x, y, 15, 0x00ffff, 0.5);
        this.scene.time.delayedCall(150, () => {
            if (swing && !swing.destroyed) {
                swing.destroy();
            }
        });
    }

    deflectNearbyBullets(x, y, radius) {
        // 简化版弹反逻辑 - 在实际游戏中应该有专门的子弹管理系统
        this.scene.enemyProjectiles.children.entries.forEach(bullet => {
            const distance = Phaser.Math.Distance.Between(x, y, bullet.x, bullet.y);
            if (distance < radius) {
                // 反向子弹
                bullet.body.velocity.x *= -1;
                bullet.body.velocity.y *= -1;
                bullet.damage = 0; // 弹反的子弹不会造成伤害
            }
        });
    }

    /**
     * 米什卡 - 冲撞
     * 效果：向指定方向冲撞，造成200%子弹伤害
     */
    useChargeAttack(targetX, targetY) {
        this.isActive = true;
        this.duration = 300; // 0.3秒
        this.remainingTime = this.duration;
        
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetX, targetY);
        const chargeSpeed = 500;
        const damage = this.player.damage * 2.0;
        
        // 冲撞期间无敌
        this.player.isInvincible = true;
        
        // 设置冲撞速度
        this.player.setVelocity(
            Math.cos(angle) * chargeSpeed,
            Math.sin(angle) * chargeSpeed
        );
        
        // 视觉反馈
        this.createChargeEffect();
        
        // 检测途经的敌人
        const checkInterval = this.scene.time.addEvent({
            delay: 16,
            callback: () => {
                if (!this.isActive) {
                    checkInterval.remove();
                    return;
                }
                
                const enemies = this.scene.enemies.children.entries;
                enemies.forEach(enemy => {
                    if (!enemy.active) return;
                    
                    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                    if (distance < 40) {
                        this.player.dealDamageToEnemy(enemy, damage);
                    }
                });
            },
            repeat: Math.floor(this.duration / 16)
        });
        
        this.player.abilityCooldown = 1000; // 1秒冷却
        return true;
    }

    createChargeEffect() {
        const trail = this.scene.add.circle(this.player.x, this.player.y, 20, 0xff8800, 0.3);
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => {
                if (trail && !trail.destroyed) {
                    trail.destroy();
                }
            }
        });
    }

    deactivateCharge() {
        this.player.isInvincible = false;
        this.player.setVelocity(0, 0);
        this.isActive = false;
    }

    /**
     * 安娜 - 召唤克隆
     * 效果：在原地召唤一个已获得的召唤物复制，持续5秒
     */
    useCloneSummon() {
        this.isActive = true;
        this.duration = 5000; // 5秒
        this.remainingTime = this.duration;
        
        // 在玩家位置创建克隆
        const clone = this.scene.add.circle(this.player.x, this.player.y, 12, 0x00ffff);
        clone.alpha = 0.6;
        this.scene.physics.add.existing(clone);
        
        // 克隆会自动攻击附近的敌人
        const attackInterval = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!clone.active || !this.isActive) {
                    attackInterval.remove();
                    return;
                }
                
                // 找到最近的敌人
                const enemies = this.scene.enemies.children.entries;
                let closestEnemy = null;
                let closestDistance = 200; // 攻击范围
                
                enemies.forEach(enemy => {
                    if (!enemy.active) return;
                    
                    const distance = Phaser.Math.Distance.Between(clone.x, clone.y, enemy.x, enemy.y);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });
                
                // 攻击敌人
                if (closestEnemy) {
                    const damage = this.player.damage * 0.5; // 召唤物造成50%伤害
                    this.player.dealDamageToEnemy(closestEnemy, damage);
                    
                    // 显示攻击效果
                    const projectile = this.scene.add.circle(clone.x, clone.y, 4, 0x00ffff);
                    this.scene.physics.add.existing(projectile);
                    
                    const angle = Phaser.Math.Angle.Between(clone.x, clone.y, closestEnemy.x, closestEnemy.y);
                    projectile.setVelocity(
                        Math.cos(angle) * 400,
                        Math.sin(angle) * 400
                    );
                    
                    this.scene.time.delayedCall(500, () => {
                        if (projectile && !projectile.destroyed) {
                            projectile.destroy();
                        }
                    });
                }
            },
            repeat: 4 // 5秒内攻击5次
        });
        
        // 记录克隆引用以便清理
        this.activeClone = clone;
        this.player.abilityCooldown = 30000; // 30秒冷却
        
        return true;
    }

    deactivateClone() {
        if (this.activeClone && !this.activeClone.destroyed) {
            // 淡出效果
            this.scene.tweens.add({
                targets: this.activeClone,
                alpha: 0,
                scale: 0.5,
                duration: 300,
                onComplete: () => {
                    if (this.activeClone && !this.activeClone.destroyed) {
                        this.activeClone.destroy();
                    }
                }
            });
        }
        this.activeClone = null;
        this.isActive = false;
    }

    /**
     * 米兰 - 激活无敌
     * 效果：获得3秒无敌，并每秒弹开周围敌人
     */
    useInvincibility() {
        this.isActive = true;
        this.duration = 3000; // 3秒
        this.remainingTime = this.duration;
        
        this.player.isInvincible = true;
        this.player.alpha = 0.7;
        this.player.setTint(0x00ffff);
        
        // 每秒弹开敌人
        const pushEnemies = () => {
            if (!this.isActive) return;
            
            const enemies = this.scene.enemies.children.entries;
            enemies.forEach(enemy => {
                if (!enemy.active) return;
                
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                if (distance < 80) {
                    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                    const pushForce = 200;
                    enemy.body.setVelocity(
                        Math.cos(angle) * pushForce,
                        Math.sin(angle) * pushForce
                    );
                }
            });
            
            if (this.isActive) {
                this.scene.time.delayedCall(1000, pushEnemies);
            }
        };
        
        pushEnemies();
        this.player.abilityCooldown = 60000; // 60秒冷却
        
        return true;
    }

    deactivateInvincibility() {
        if (this.player && !this.player.destroyed) {
            this.player.isInvincible = false;
            this.player.alpha = 1;
            this.player.clearTint();
        }
        this.isActive = false;
    }

    /**
     * 玉子 - 连锁榴弹
     * 效果：杀死最近的敌人并发射6枚特殊榴弹，连锁反应
     */
    useChainGrenade() {
        const enemies = this.scene.enemies.children.entries;
        if (enemies.length === 0) return false;
        
        // 找到最近的敌人
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (!enemy.active) return;
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (!closestEnemy) return false;
        
        // 杀死最近的敌人
        this.player.dealDamageToEnemy(closestEnemy, 10000); // 造成巨量伤害确保必杀
        
        // 在敌人死亡位置发射6枚榴弹
        this.fireSpecialGrenades(closestEnemy.x, closestEnemy.y);
        
        this.player.abilityCooldown = 20000; // 20秒冷却
        return true;
    }

    fireSpecialGrenades(x, y) {
        const grenadeCount = 6;
        const damage = this.player.damage;
        
        for (let i = 0; i < grenadeCount; i++) {
            const grenade = this.scene.add.circle(x, y, 8, 0xff8800);
            this.scene.physics.add.existing(grenade);
            this.scene.projectiles.add(grenade);
            
            const angle = (Math.PI * 2 / grenadeCount) * i;
            grenade.setVelocity(
                Math.cos(angle) * 300,
                Math.sin(angle) * 300
            );
            grenade.damage = damage;
            grenade.isSpecial = true; // 特殊榴弹标记
            grenade.lifespan = 2000; // 2秒生命周期
            
            // 连锁反应检测
            this.setupChainReaction(grenade);
        }
    }

    setupChainReaction(grenade) {
        // 检查特殊榴弹是否击中敌人
        this.scene.physics.overlap(grenade, this.scene.enemies, (grenade, enemy) => {
            if (!grenade.active || !enemy.active) return;
            
            this.player.dealDamageToEnemy(enemy, grenade.damage);
            
            // 如果敌人被消灭，触发连锁反应
            if (enemy.health <= 0) {
                // 延迟一下避免立即触发
                this.scene.time.delayedCall(50, () => {
                    this.fireSpecialGrenades(enemy.x, enemy.y);
                });
            }
            
            // 销毁榴弹
            grenade.destroy();
        });
        
        // 生命周期结束后自动销毁
        this.scene.time.delayedCall(grenade.lifespan, () => {
            if (grenade && !grenade.destroyed) {
                grenade.destroy();
            }
        });
    }

    deactivate() {
        // 通用停用函数
        switch (this.player.config.class) {
            case '疯子':
                this.deactivateCharge();
                break;
            case '谨慎军师':
                this.deactivateClone();
                break;
            case '傻子':
                this.deactivateInvincibility();
                break;
            default:
                this.isActive = false;
        }
    }
}