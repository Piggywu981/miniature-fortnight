/**
 * 特殊能力系统 - 处理被动触发的能力
 * 如：击杀掉落、击杀升级、受伤复仇、元素免疫等
 */
export class SpecialAbilitySystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        
        // 哪个角色
        this.characterClass = player.config.class;
        this.characterConfig = player.config;
        
        // 计数器
        this.killCount = 0;
        this.lastKillMilestone = 0;
    }

    /**
     * 处理击杀事件
     * @param {Enemy} enemy - 被杀死的敌人
     */
    onEnemyKilled(enemy) {
        this.killCount++;
        
        const className = this.characterClass;
        
        // 每1000击杀特殊效果
        if (this.killCount % 1000 === 0) {
            this.onKillMilestone();
        }
        
        // 如果受伤，触发玉子的复仇
        if (className === '乐子人' && this.player.hurtCooldown > 0) {
            // 受伤后立即复仇
        }
    }

    /**
     * 处理击杀千位数里程碑
     */
    onKillMilestone() {
        const className = this.characterClass;
        
        switch (className) {
            case '干活的':
                // 伊娜 - 掉落治疗道具
                this.dropHealthItem();
                break;
            case '乐子人':
                // 玉子 - 随机获得一项升级
                this.triggerRandomUpgrade();
                break;
        }
    }

    /**
     * 伊娜 - 掉落治疗道具
     */
    dropHealthItem() {
        // 在玩家周围随机位置生成治疗道具
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        
        this.spawnHealthItem(x, y);
    }

    /**
     * 在地面上生成治疗道具
     */
    spawnHealthItem(x, y) {
        const item = this.scene.add.rectangle(x, y, 15, 15, 0x00ff00);
        this.scene.physics.add.existing(item);
        this.scene.items.add(item);
        
        // 添加发光动画
        this.scene.tweens.add({
            targets: item,
            alpha: 0.5,
            yoyo: true,
            repeat: -1,
            duration: 500
        });
        
        // 拾取检测
        this.scene.physics.add.overlap(this.player, item, () => {
            // 检查是否能使用治疗道具
            const canHeal = !this.player.config.abilities?.restrictions?.noHealingItems;
            
            if (canHeal) {
                item.destroy();
                this.player.heal(2); // 恢复2点生命
                
                // 治疗视觉效果
                const effect = this.scene.add.circle(this.player.x, this.player.y, 20, 0x00ff00, 0.3);
                this.scene.tweens.add({
                    targets: effect,
                    scale: 1.5,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        if (effect && !effect.destroyed) {
                            effect.destroy();
                        }
                    }
                });
            }
        });
        
        // 道具存在时间限制（30秒）
        this.scene.time.delayedCall(30000, () => {
            if (item && !item.destroyed) {
                // 淡出后销毁
                this.scene.tweens.add({
                    targets: item,
                    alpha: 0,
                    scale: 0,
                    duration: 300,
                    onComplete: () => {
                        if (item && !item.destroyed) {
                            item.destroy();
                        }
                    }
                });
            }
        });
    }

    /**
     * 玉子 - 触发随机升级
     */
    triggerRandomUpgrade() {
        // 随机选择一个升级
        const upgrades = [
            this.upgradeHealth,
            this.upgradeDamage,
            this.upgradeAttackSpeed,
            this.upgradeMovementSpeed,
            this.upgradeShield,
            this.upgradeDodgeChance
        ];
        
        // 随机选择并且再打乱
        const randomUpgrades = this.shuffleArray([...upgrades]).slice(0, 3);
        this.showUpgradeSelection(randomUpgrades);
    }

    /**
     * 显示升级选择界面
     */
    showUpgradeSelection(upgrades) {
        const upgradeNames = {
            'upgradeHealth': '最大生命值+2',
            'upgradeDamage': '武器伤害+20%',
            'upgradeAttackSpeed': '攻击速度+15%',
            'upgradeMovementSpeed': '移动速度+10%',
            'upgradeShield': '护盾容量+1',
            'upgradeDodgeChance': '闪避率+5%'
        };
        
        // 简化版 - 直接应用第一个升级
        if (upgrades.length > 0) {
            upgrades[0].call(this);
            
            // 升级提示
            const upgradeName = upgradeNames[upgrades[0].name] || '未知升级';
            this.showUpgradeNotification(upgradeName);
        }
    }

    showUpgradeNotification(upgradeName) {
        // 屏幕中央显示升级通知
        const x = this.scene.cameras.main.width / 2;
        const y = this.scene.cameras.main.height / 2;
        
        const text = this.scene.add.text(x, y, `获得升级：${upgradeName}`, {
            fontSize: '24px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4,
            fontWeight: 'bold'
        });
        text.setOrigin(0.5);
        text.setScrollFactor(0);
        
        // 动画效果
        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                if (text && !text.destroyed) {
                    text.destroy();
                }
            }
        });
    }

    /**
     * 升级函数
     */
    upgradeHealth() {
        this.player.maxHealth += 2;
        this.player.currentHealth += 2;
    }

    upgradeDamage() {
        this.player.damage *= 1.2;
    }

    upgradeAttackSpeed() {
        this.player.attackSpeed *= 0.85; // 攻击间隔减少
    }

    upgradeMovementSpeed() {
        this.player.baseSpeed *= 1.1;
    }

    upgradeShield() {
        this.player.maxShield += 1;
        this.player.currentShield += 1;
    }

    upgradeDodgeChance() {
        this.player.dodgeChance = Math.min(0.6, this.player.dodgeChance + 0.05);
    }

    
    /**
     * 玉子 - 受伤复仇
     * 受伤后立即消灭距离最近的十个敌人
     */
    triggerRevengeAbility() {
        if (this.characterClass !== '乐子人') return;
        
        // 获取所有敌人并按距离排序
        const enemies = this.scene.enemies.children.entries.slice();
        
        if (enemies.length === 0) return;
        
        // 按距离排序
        enemies.sort((a, b) => {
            const distA = Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y);
            const distB = Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y);
            return distA - distB;
        });
        
        // 消灭最近的10个敌人
        const killCount = Math.min(10, enemies.length);
        for (let i = 0; i < killCount; i++) {
            if (enemies[i].active) {
                this.scene.handleEnemyDeath(enemies[i]);
            }
        }
        
        // 复仇视觉效果
        this.createRevengeEffect();
    }

    /**
     * 受伤复仇
     */
    createRevengeEffect() {
        const effect = this.scene.add.circle(this.player.x, this.player.y, 100, 0xff0000, 0.2);
        
        this.scene.tweens.add({
            targets: effect,
            scale: 1.5,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                if (effect && !effect.destroyed) {
                    effect.destroy();
                }
            }
        });
    }

    /**
     * 疯子 - 元素伤害免疫
     * 检查是否免疫元素伤害
     */
    isImmuneToElementalDamage() {
        return this.characterConfig.modifiers.ignoreElementalDamage === true;
    }

    /**
     * 米兰 - 护盾槽自动增加
     * 每180秒增加一个护盾槽位
     */
    updateShieldSlot(timers) {
        if (this.characterClass !== '傻子') return;
        
        // 这个逻辑在Player.js中已经实现，这里只是提供辅助函数
        const shieldInterval = this.characterConfig.modifiers.shieldSlotInterval;
        let shieldSlotTimer = timers.shieldSlotTimer || 0;
        
        return {
            shieldSlotTimer: shieldSlotTimer,
            interval: shieldInterval
        };
    }

    /**
     * 能帮辅助数组
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * 获取击杀计数
     */
    getKillCount() {
        return this.killCount;
    }

    /**
     * 重置击杀计数
     */
    resetKillCount() {
        this.killCount = 0;
        this.lastKillMilestone = 0;
    }
}