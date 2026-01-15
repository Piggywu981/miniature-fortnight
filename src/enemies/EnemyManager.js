import { Enemy } from './Enemy.js';
import { EnemyConfig, EnemySpawnPhase } from './EnemyConfig.js';

/**
 * 敌人管理器 - 负责生成、管理和控制所有敌人
 */
export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.enemies;
        this.player = scene.player;
        this.gameTime = 0;
        
        // 生成系统
        this.currentPhase = 0;
        this.lastSpawnTime = 0;
        this.enemyCount = 0;
        this.maxEnemies = 50; // 场上最多敌人数量
        
        // 难度递增
        this.difficultyMultiplier = 1.0;
        this.waveNumber = 1;
        this.eliteRate = 0; // 精英敌人出现率
        
        // 波次系统
        this.currentWave = 1;
        this.waveEnemiesSpawned = 0;
        this.waveEnemiesKilled = 0;
        this.waveInProgress = false;
        this.waveClearDelay = 2000; // 清波后延迟
        
        // 统计
        this.totalEnemiesSpawned = 0;
        this.totalEnemiesKilled = 0;
    }

    update(time, delta) {
        this.gameTime = this.scene.gameTime || 0;
        
        // 更新当前阶段
        this.updateCurrentPhase();
        
        // 生成敌人
        this.spawnEnemiesBasedOnPhase();
        
        // 更新场上敌人
        this.updateEnemies(time, delta);
        
        // 检查波次状态
        this.checkWaveStatus();
        
        // 增加难度
        this.increaseDifficulty();
    }

    /**
     * 根据击杀数更新当前阶段
     */
    updateCurrentPhase() {
        const killCount = this.scene.killCount || 0;
        
        for (let i = EnemySpawnPhase.length - 1; i >= 0; i--) {
            const phase = EnemySpawnPhase[i];
            if (killCount >= phase.minKills && killCount < phase.maxKills) {
                if (this.currentPhase !== i) {
                    this.currentPhase = i;
                    console.log(`进入${phase.name}`);
                }
                break;
            }
        }
    }

    /**
     * 根据当前阶段生成敌人
     */
    spawnEnemiesBasedOnPhase() {
        const phase = EnemySpawnPhase[this.currentPhase];
        
        if (!phase) return;
        
        // 检查生成条件
        if (this.gameTime - this.lastSpawnTime < phase.spawnRate) return;
        
        // 检查场上敌人数量
        if (this.enemies.children.entries.filter(e => e.active).length >= this.maxEnemies) return;
        
        // 开始新波次（如果没有波次进行中）
        if (!this.waveInProgress) {
            this.startNewWave();
        }
        
        // 生成波次敌人
        const remainingInWave = phase.spawnCount - this.waveEnemiesSpawned;
        
        if (remainingInWave > 0 && this.waveEnemiesSpawned < phase.spawnCount) {
            this.spawnEnemyWave(1, phase);
            this.waveEnemiesSpawned++;
            this.lastSpawnTime = this.gameTime;
        }
    }

    /**
     * 开始新波次
     */
    startNewWave() {
        this.waveInProgress = true;
        this.waveEnemiesSpawned = 0;
        this.waveEnemiesKilled = 0;
        
        // 显示波次提示
        this.showWaveAnnouncement();
    }

    /**
     * 显示波次开始提示
     */
    showWaveAnnouncement() {
        const phase = EnemySpawnPhase[this.currentPhase] || { name: '波次' };
        
        const text = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            `第 ${this.currentWave} 波 - ${phase.name}`,
            {
                fontSize: '32px',
                fill: '#ffff00',
                stroke: '#000',
                strokeThickness: 4,
                fontWeight: 'bold'
            }
        );
        text.setOrigin(0.5);
        text.setScrollFactor(0);
        
        this.scene.tweens.add({
            targets: text,
            y: this.scene.cameras.main.centerY - 50,
            alpha: 0,
            scale: 0.5,
            duration: 2000,
            onComplete: () => {
                if (text && !text.destroyed) {
                    text.destroy();
                }
            }
        });
    }

    /**
     * 生成一波敌人
     */
    spawnEnemyWave(count, phase) {
        for (let i = 0; i < count; i++) {
            const enemyType = this.selectEnemyType(phase);
            const enemyConfig = this.getEnemyConfig(enemyType);
            
            if (!enemyConfig) continue;
            
            // 随机生成位置（在屏幕外出生，但不要太远）
            const spawnPos = this.getRandomSpawnPosition();
            
            // 创建敌人
            const enemy = new Enemy(this.scene, spawnPos.x, spawnPos.y, enemyConfig);
            
            // 应用难度倍数
            this.applyDifficultyScaling(enemy);
            
            // 添加到敌人组
            this.enemies.add(enemy);
            
            this.totalEnemiesSpawned++;
        }
    }

    /**
     * 选择敌人类型（根据权重）
     */
    selectEnemyType(phase) {
        const weights = phase.weights || {};
        const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        
        if (totalWeight <= 0) return 'BASIC';
        
        let random = Math.random() * totalWeight;
        
        for (const [type, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'BASIC'; // 默认
    }

    /**
     * 获取随机生成位置
     */
    getRandomSpawnPosition() {
        const camera = this.scene.cameras.main;
        const worldBounds = this.scene.physics.world.bounds;
        
        // 在视野外随机生成，但确保在游戏世界内
        const margin = 100;
        const spawnDistance = 150; // 在视野外150像素
        
        let x, y;
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // 上
                x = camera.scrollX + Math.random() * camera.width;
                y = camera.scrollY - spawnDistance;
                break;
            case 1: // 右
                x = camera.scrollX + camera.width + spawnDistance;
                y = camera.scrollY + Math.random() * camera.height;
                break;
            case 2: // 下
                x = camera.scrollX + Math.random() * camera.width;
                y = camera.scrollY + camera.height + spawnDistance;
                break;
            case 3: // 左
                x = camera.scrollX - spawnDistance;
                y = camera.scrollY + Math.random() * camera.height;
                break;
        }
        
        // 限制在世界范围内
        x = Phaser.Math.Clamp(x, margin, worldBounds.width - margin);
        y = Phaser.Math.Clamp(y, margin, worldBounds.height - margin);
        
        return { x, y };
    }

    /**
     * 应用难度倍数
     */
    applyDifficultyScaling(enemy) {
        const phase = EnemySpawnPhase[this.currentPhase];
        
        if (phase && phase.difficultyMultiplier) {
            const multiplier = phase.difficultyMultiplier;
            
            // 增加精英率
            if (Math.random() < this.eliteRate) {
                enemy.maxHealth *= 1.5;
                enemy.health = enemy.maxHealth;
                enemy.speed *= 1.2;
                enemy.damage *= 1.2;
                enemy.score *= 2;
                
                // 精英视觉特效
                enemy.setScale(1.2);
                enemy.setTint(Phaser.Display.Color.GetColor(255, 215, 0)); // 金色
            } else {
                enemy.health *= multiplier;
                enemy.maxHealth = enemy.health;
                enemy.damage *= multiplier;
            }
        }
    }

    /**
     * 更新所有敌人
     */
    updateEnemies(time, delta) {
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active && enemy.update) {
                enemy.update(time, delta);
            }
        });
    }

    /**
     * 检查波次状态
     */
    checkWaveStatus() {
        // 如果波次中所有敌人都生成了
        if (this.waveInProgress && this.waveEnemiesSpawned >= this.getCurrentPhase().spawnCount) {
            // 检查是否场上没有敌人了
            const activeEnemies = this.enemies.children.entries.filter(e => e.active).length;
            
            if (activeEnemies === 0) {
                // 波次完成
                this.completeWave();
            }
        }
    }

    /**
     * 波次完成
     */
    completeWave() {
        this.waveInProgress = false;
        this.currentWave++;
        
        // 波次奖励
        this.waveClearBonus();
        
        // 准备下一波（有延迟）
        this.scene.time.delayedCall(this.waveClearDelay, () => {
            console.log(`第${this.currentWave-1}波完成！`);
        });
    }

    /**
     * 波次清空奖励
     */
    waveClearBonus() {
        // 奖励生命值（低血量时）
        if (this.player && this.player.currentHealth <= this.player.maxHealth * 0.3) {
            this.player.heal(1);
        }
    }

    /**
     * 逐渐增加难度
     */
    increaseDifficulty() {
        const killCount = this.scene.killCount || 0;
        
        // 每100击杀增加难度被数
        const difficultyStep = Math.floor(killCount / 100);
        this.difficultyMultiplier = 1.0 + (difficultyStep * 0.1);
        
        // 每200击杀增加精英率
        this.eliteRate = Math.min(0.3, difficultyStep * 0.05);
    }

    /**
     * 获取当前阶段
     */
    getCurrentPhase() {
        return EnemySpawnPhase[this.currentPhase] || EnemySpawnPhase[0];
    }

    /**
     * 清理所有敌人
     */
    clearAllEnemies() {
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                enemy.destroy();
            }
        });
        
        this.waveInProgress = false;
    }

    /**
     * 获取敌人类型配置
     */
    getEnemyConfig(type) {
        return EnemyConfig[type] || EnemyConfig.BASIC;
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            currentWave: this.currentWave,
            currentPhase: this.currentPhase,
            phaseName: this.getCurrentPhase().name,
            totalEnemiesSpawned: this.totalEnemiesSpawned,
            totalEnemiesKilled: this.totalEnemiesKilled,
            activeEnemies: this.enemies.children.entries.filter(e => e.active).length,
            difficultyMultiplier: this.difficultyMultiplier,
            eliteRate: this.eliteRate,
            waveInProgress: this.waveInProgress
        };
    }
}