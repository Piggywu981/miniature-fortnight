export const CharacterConfig = {
    // 初始角色 - 干活的：伊娜
    INA: {
        name: '伊娜',
        class: '干活的',
        stats: {
            health: 4,
            shield: 1,
            baseDodge: 0,
            maxDodge: 60
        },
        modifiers: {
            damageBonus: 0.05,
            expBonus: 0.30,
            shotgunNoMovePenalty: true
        },
        abilities: {
            melee: {
                damage: 0.1, // 10% of bullet damage
                canDeflect: true,
                description: '近战造成子弹伤害10%的伤害，可弹反敌人子弹'
            },
            special: {
                description: '每杀死1000人掉落一个治疗道具'
            }
        }
    },
    
    // 疯子：米什卡
    MISHKA: {
        name: '米什卡',
        class: '疯子',
        stats: {
            health: 12,
            shield: 0,
            baseDodge: 0,
            maxDodge: 60
        },
        modifiers: {
            attackSpeedBonus: 0.30,
            damageBonus: 0.10,
            ignoreElementalDamage: true,
            ignoreMovePenalty: true,
            machineGunNoMovePenalty: true
        },
        abilities: {
            restrictions: {
                noDodge: true,
                noExtraDefense: true,
                noSummons: true
            },
            charge: {
                damage: 2.0, // 200% bullet damage
                description: '冲撞造成200%子弹伤害'
            }
        }
    },
    
    // 谨慎军师：安娜
    ANNA: {
        name: '安娜',
        class: '谨慎军师',
        stats: {
            health: 2,
            shield: 2,
            baseDodge: 0.20,
            maxDodge: 60
        },
        modifiers: {
            expBonus: 1.0,
            damagePenalty: 0.5,
            summonDamageBonus: 0.10,
            summonAttackSpeedBonus: 0.20,
            elementalDamageBonus: 0.35
        },
        abilities: {
            cloneSummon: {
                duration: 5000, // 5 seconds
                cooldown: 30000, // 30 seconds
                description: '在原地随机召唤一个已经获得的召唤物的复制，持续时间5秒'
            }
        }
    },
    
    // 傻子：米兰
    MILAN: {
        name: '米兰',
        class: '傻子',
        stats: {
            health: 1,
            shield: 5,
            baseDodge: 0,
            maxDodge: 60
        },
        modifiers: {
            shieldSlotInterval: 180000, // 180 seconds
            shieldRecoveryPenalty: 0.5,
            movePenalty: 0.20,
            attackSpeedPenalty: 0.20,
            damagePenalty: 0.20,
            summonDamageBonus: 1.0 // 翻倍
        },
        abilities: {
            invincibility: {
                duration: 3000, // 3 seconds
                cooldown: 60000, // 60 seconds
                description: '获得3秒无敌时间，并每秒弹开周围敌人一次'
            }
        }
    },
    
    // 乐子人：玉子
    YUKO: {
        name: '玉子',
        class: '乐子人',
        stats: {
            health: 4,
            shield: 4,
            baseDodge: 0,
            maxDodge: 60
        },
        modifiers: {
            specialUpgradeInterval: 1000,
            grenadeBonus: 0.50,
            grenadeMagazineDouble: true,
            grenadeNoMovePenalty: true,
            immuneToExplosion: true,
            otherWeaponsCantMove: true
        },
        abilities: {
            restrictions: {
                noSummons: true,
                noHealingItems: true
            },
            chainGrenade: {
                damage: 1.0, // Same as bullet damage
                grenadeCount: 6,
                cooldown: 20000, // 20 seconds
                description: '杀死最近的敌人并发射6枚特殊榴弹，连锁反应'
            },
            revenge: {
                description: '受伤后消灭距离自己最近的十个敌人'
            }
        }
    }
};

// 元素伤害类型
export const ElementTypes = {
    ICE: '冰冻',
    FIRE: '火焰',
    POISON: '毒'
};

// 武器类型
export const WeaponTypes = {
    SHOTGUN: '霰弹枪',
    MACHINE_GUN: '机枪',
    GRENADE_LAUNCHER: '榴弹炮',
    BOMB: '炸弹',
    OTHER: '其他'
};