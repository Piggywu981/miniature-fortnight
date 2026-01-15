/**
 * 敌人类型配置
 * 定义所有敌人及其属性
 */
export const EnemyConfig = {
    // 基础敌人 - 弱小但数量多
    BASIC: {
        name: '基础敌人',
        health: 3,
        speed: 50,
        damage: 1,
        size: 16,
        color: 0xff00ff,
        score: 10,
        type: 'basic',
        spawnWeight: 40, // 生成权重
        description: '最普通的敌人，移动缓慢'
    },

    // 快速敌人 - 速度快但脆弱
    RUSH: {
        name: '快速敌人',
        health: 2,
        speed: 120,
        damage: 1,
        size: 12,
        color: 0x00ffff,
        score: 20,
        type: 'rush',
        spawnWeight: 25,
        description: '移动速度快，但生命值较低'
    },

    // 坦克敌人 - 血厚速度慢
    TANK: {
        name: '坦克敌人',
        health: 15,
        speed: 25,
        damage: 2,
        size: 24,
        color: 0xff8800,
        score: 50,
        type: 'tank',
        spawnWeight: 15,
        description: '拥有高血量和伤害，但移动缓慢'
    },

    // 分裂敌人 - 被击杀后会分裂成多个小敌人
    SPLIT: {
        name: '分裂敌人',
        health: 6,
        speed: 60,
        damage: 1,
        size: 18,
        color: 0x00ff00,
        score: 30,
        type: 'split',
        spawnWeight: 10,
        description: '被消灭后会分裂成3个小敌人',
        splitCount: 3, // 分裂成小敌人的数量
        splitEnemy: 'MINI' // 分裂成的敌人类型
    },

    // 小敌人 - 分裂后的小敌人
    MINI: {
        name: '小敌人',
        health: 1,
        speed: 80,
        damage: 1,
        size: 8,
        color: 0xaaff00,
        score: 5,
        type: 'mini',
        spawnWeight: 0, // 不会自然生成
        description: '小型敌人，生命值极低'
    },

    // 射击敌人 - 可以远程射击
    SHOOTER: {
        name: '射击敌人',
        health: 5,
        speed: 40,
        damage: 1,
        projectileDamage: 2,
        projectileSpeed: 200,
        fireRate: 2000, // 2秒射击一次
        size: 18,
        color: 0xff0088,
        score: 35,
        type: 'shooter',
        spawnWeight: 10,
        description: '远程攻击敌人，在安全距离射击',
        range: 200 // 射击范围
    },

    // 爆炸敌人 - 靠近玩家会爆炸
    EXPLODER: {
        name: '爆炸敌人',
        health: 8,
        speed: 70,
        damage: 3, // 接触伤害
        explosionDamage: 5,
        explosionRadius: 100,
        size: 20,
        color: 0xff0000,
        score: 40,
        type: 'exploder',
        spawnWeight: 10,
        description: '靠近玩家会自爆，造成高额伤害',
        explosionDelay: 1000, // 爆炸延迟
        approachRadius: 150 // 靠近到这个距离开始准备爆炸
    }
};

/**
 * 敌人生成阶段配置
 * 根据时间和击杀数决定生成哪些敌人
 */
export const EnemySpawnPhase = [
    {
        name: '阶段1：初期',
        minKills: 0,
        maxKills: 50,
        spawnRate: 3000, // 3秒刷一波
        spawnCount: 3, // 每波数量
        allowedTypes: ['BASIC', 'RUSH'],
        weights: { BASIC: 70, RUSH: 30 },
        description: '只有基础敌人和快速敌人'
    },
    {
        name: '阶段2：坦克出现',
        minKills: 50,
        maxKills: 150,
        spawnRate: 2500,
        spawnCount: 4,
        allowedTypes: ['BASIC', 'RUSH', 'TANK'],
        weights: { BASIC: 50, RUSH: 30, TANK: 20 },
        description: '坦克敌人加入战斗'
    },
    {
        name: '阶段3：精英敌人',
        minKills: 150,
        maxKills: 300,
        spawnRate: 2000,
        spawnCount: 5,
        allowedTypes: ['BASIC', 'RUSH', 'TANK', 'SPLIT', 'SHOOTER'],
        weights: { BASIC: 30, RUSH: 25, TANK: 20, SPLIT: 15, SHOOTER: 10 },
        description: '分裂敌人和射击敌人出现'
    },
    {
        name: '阶段4：全面战争',
        minKills: 300,
        maxKills: 500,
        spawnRate: 1500,
        spawnCount: 6,
        allowedTypes: ['BASIC', 'RUSH', 'TANK', 'SPLIT', 'SHOOTER', 'EXPLODER'],
        weights: { BASIC: 20, RUSH: 20, TANK: 20, SPLIT: 15, SHOOTER: 15, EXPLODER: 10 },
        description: '所有敌人类型已解锁'
    },
    {
        name: '阶段5：无尽杀戮',
        minKills: 500,
        maxKills: Infinity,
        spawnRate: 1000,
        spawnCount: 8,
        allowedTypes: ['BASIC', 'RUSH', 'TANK', 'SPLIT', 'SHOOTER', 'EXPLODER'],
        weights: { BASIC: 15, RUSH: 20, TANK: 25, SPLIT: 15, SHOOTER: 15, EXPLODER: 10 },
        description: '更快速、更强的敌人波次',
        difficultyMultiplier: 1.5 // 敌人生命值和伤害倍数
    }
];