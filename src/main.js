import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

// Phaser游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, GameOverScene]
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 游戏特性摘要：
// 1. 五个不同职业的角色系统
// 2. 生命值、护盾、闪避机制
// 3. 元素伤害系统（火焰、冰冻、毒）
// 4. 武器系统与开火惩罚
// 5. 每名角色独特的右键能力
// 6. 召唤物系统（安娜专用）
// 7. 随机升级系统
// 8. 地牢探索和敌人战斗
// 9. 开始/结束界面
// 10. 角色选择与评级系统