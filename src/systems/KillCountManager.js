/**
 * 击杀计数管理器 - 统一管理所有与击杀相关的事件和统计
 */
export class KillCountManager {
    constructor(scene, player, specialAbilitySystem) {
        this.scene = scene;
        this.player = player;
        this.specialAbilitySystem = specialAbilitySystem;
        
        // 基础击杀统计
        this._killCount = 0;
        this.killStreak = 0; // 连杀计数
        this.lastKillTime = 0;
        
        // 里程碑记录
        this.killMilestones = [1000, 2000, 3000, 4000, 5000]; // 千杀里程碑
        this.reachedMilestones = new Set(); // 已触发的里程碑
        
        // 角色特定计数器
        this.characterClass = player.config.class;
        this.characterConfig = player.config;
        
        // 事件回调
        this.onKillCallbacks = [];
    }

    /**
     * 获取当前击杀数
     */
    get killCount() {
        return this._killCount;
    }

    /**
     * 增加击杀数
     */
    incrementKillCount() {
        this._killCount++;
        
        // 更新连杀计数
        this.updateKillStreak();
        
        // 处理击杀事件
        this.handleKillEvent();
        
        // 检查角色特定效果
        this.checkCharacterSpecificEffects();
        
        // 触发所有订阅的回调
        this.triggerKillCallbacks();
        
        return this._killCount;
    }

    /**
     * 更新连杀计数
     */
    updateKillStreak() {
        const currentTime = this.scene.gameTime || 0;
        const timeSinceLastKill = currentTime - this.lastKillTime;
        
        // 如果在3秒内连续击杀，增加连杀
        if (timeSinceLastKill < 3000) {
            this.killStreak++;
        } else {
            this.killStreak = 1; // 重置连杀
        }
        
        this.lastKillTime = currentTime;
        
        // 连杀奖励（未来可以扩展）
        if (this.killStreak >= 10) {
            this.onKillStreak(10);
        } else if (this.killStreak >= 5) {
            this.onKillStreak(5);
        }
    }

    /**
     * 连杀奖励
     */
    onKillStreak(streak) {
        switch (streak) {
            case 5:
                // 5连杀：短暂移速提升
                const originalSpeed = this.player.baseSpeed;
                this.player.baseSpeed *= 1.2;
                
                this.scene.time.delayedCall(3000, () => {
                    this.player.baseSpeed = originalSpeed;
                });
                break;
            case 10:
                // 10连杀：立即恢复少量生命
                this.player.heal(1);
                break;
        }
    }

    /**
     * 处理击杀事件
     */
    handleKillEvent() {
        // 将击杀事件转发给特殊能力系统
        this.specialAbilitySystem.onEnemyKilled();
        
        // 检查千杀里程碑
        this.checkKillMilestones();
    }

    /**
     * 检查击杀里程碑
     */
    checkKillMilestones() {
        this.killMilestones.forEach(milestone => {
            if (this._killCount >= milestone && !this.reachedMilestones.has(milestone)) {
                this.reachedMilestones.add(milestone);
                this.onKillMilestone(milestone);
            }
        });
    }

    /**
     * 击杀里程碑事件
     */
    onKillMilestone(milestone) {
        // 可以在游戏UI中显示里程碑成就
        console.log(`击杀里程碑：${milestone}击杀！`);
    }

    /**
     * 检查角色特定的击杀效果
     */
    checkCharacterSpecificEffects() {
        switch (this.characterClass) {
            case '乐子人':
                // 玉子的特殊处理已经在特殊能力系统中完成
                break;
            case '干活的':
                // 伊娜的特殊处理已经在特殊能力系统中完成
                break;
        }
    }

    /**
     * 触发所有击杀回调
     */
    triggerKillCallbacks() {
        this.onKillCallbacks.forEach(callback => {
            try {
                callback(this._killCount, this.killStreak);
            } catch (error) {
                console.error('击杀回调错误：', error);
            }
        });
    }

    /**
     * 订阅击杀事件
     */
    subscribeToKill(callback) {
        if (typeof callback === 'function') {
            this.onKillCallbacks.push(callback);
        }
    }

    /**
     * 取消订阅击杀事件
     */
    unsubscribeFromKill(callback) {
        const index = this.onKillCallbacks.indexOf(callback);
        if (index > -1) {
            this.onKillCallbacks.splice(index, 1);
        }
    }

    /**
     * 重置所有统计数据
     */
    reset() {
        this._killCount = 0;
        this.killStreak = 0;
        this.lastKillTime = 0;
        this.reachedMilestones.clear();
        this.onKillCallbacks = [];
        
        // 重置特殊能力系统的计数
        if (this.specialAbilitySystem) {
            this.specialAbilitySystem.resetKillCount();
        }
    }

    /**
     * 获取击杀统计信息
     */
    getStats() {
        return {
            totalKills: this._killCount,
            currentStreak: this.killStreak,
            lastKillTime: this.lastKillTime,
            reachedMilestones: Array.from(this.reachedMilestones),
            nextMilestone: this.getNextMilestone(),
            progressToNextMilestone: this.getProgressToNextMilestone()
        };
    }

    /**
     * 获取下一个里程碑
     */
    getNextMilestone() {
        for (const milestone of this.killMilestones) {
            if (this._killCount < milestone) {
                return milestone;
            }
        }
        return null; // 已经达成所有里程碑
    }

    /**
     * 获取到下一个里程碑的进度
     */
    getProgressToNextMilestone() {
        const nextMilestone = this.getNextMilestone();
        if (!nextMilestone) return 1.0; // 100% (已完成所有里程碑)
        
        const previousMilestone = this.getPreviousMilestone();
        const start = previousMilestone || 0;
        const end = nextMilestone;
        const current = this._killCount;
        
        return Math.min(1.0, (current - start) / (end - start));
    }

    /**
     * 获取上一个里程碑
     */
    getPreviousMilestone() {
        let previous = null;
        for (const milestone of this.killMilestones) {
            if (this._killCount < milestone) {
                break;
            }
            previous = milestone;
        }
        return previous;
    }

    /**
     * 获取击杀率（每分钟）
     */
    getKillRate() {
        const gameTimeMinutes = (this.scene.gameTime || 0) / 60000; // 转换为分钟
        if (gameTimeMinutes <= 0) return 0;
        
        return this._killCount / gameTimeMinutes;
    }

    /**
     * 获取预期的下一个里程碑时间
     */
    getEstimatedTimeToNextMilestone() {
        const nextMilestone = this.getNextMilestone();
        if (!nextMilestone) return null;
        
        const killRate = this.getKillRate();
        if (killRate <= 0) return null;
        
        const killsNeeded = nextMilestone - this._killCount;
        const minutesNeeded = killsNeeded / killRate;
        
        return minutesNeeded * 60000; // 返回毫秒数
    }

    /**
     * 保存和加载数据
     */
    saveData() {
        return {
            killCount: this._killCount,
            killStreak: this.killStreak,
            lastKillTime: this.lastKillTime,
            reachedMilestones: Array.from(this.reachedMilestones)
        };
    }

    loadData(data) {
        if (!data) return;
        
        this._killCount = data.killCount || 0;
        this.killStreak = data.killStreak || 0;
        this.lastKillTime = data.lastKillTime || 0;
        this.reachedMilestones = new Set(data.reachedMilestones || []);
    }
}