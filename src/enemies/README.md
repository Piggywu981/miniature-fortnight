# 敌人系统文档

## 系统概述

敌人系统已经完全重构，现在包含以下核心组件：

1. **EnemyConfig.js** - 敌人类型和生成阶段配置
2. **Enemy.js** - 敌人基类，包含不同类型敌人的AI行为
3. **EnemyManager.js** - 敌人管理器，控制刷怪、难度递增和波次系统

## 敌人类型

### 1. 基础敌人 (BASIC)
- **属性**: 3生命值，50速度，1伤害
- **AI**: 直接追踪玩家
- **颜色**: 紫色
- **特点**: 基础敌人类型，适合前期

### 2. 快速敌人 (RUSH)
- **属性**: 2生命值，120速度，1伤害
- **AI**: ZigZag移动模式，更难被击中
- **颜色**: 青色
- **特点**: 速度快但脆弱，需要快速应对

### 3. 坦克敌人 (TANK)
- **属性**: 15生命值，25速度，2伤害
- **AI**: 缓慢但定期冲锋
- **颜色**: 橙色
- **特点**: 高血量，需要集中火力

### 4. 分裂敌人 (SPLIT)
- **属性**: 6生命值，60速度，1伤害
- **AI**: 正常追踪，死亡时分裂
- **颜色**: 绿色，带白边
- **特点**: 消灭后分裂成3个小敌人

### 5. 小敌人 (MINI)
- **属性**: 1生命值，80速度，1伤害
- **AI**: 快速但不稳定移动
- **颜色**: 黄绿色
- **特点**: 分裂后产生，速度快血量低

### 6. 射击敌人 (SHOOTER)
- **属性**: 5生命值，40速度，1伤害（远程2伤害）
- **AI**: 保持距离并射击，每2秒射击一次
- **颜色**: 粉红色，有黑色瞄准点
- **特点**: 远程威胁，需要优先处理

### 7. 爆炸敌人 (EXPLODER)
- **属性**: 8生命值，70速度，3伤害，爆炸5伤害
- **AI**: 接近玩家后爆炸
- **颜色**: 红色，带红色警告环
- **特点**: 靠近玩家150像素后延迟1秒爆炸

## 生成系统

### 生成阶段

游戏根据总击杀数分为5个阶段：

#### 阶段1：初期 (0-50击杀)
- 生成间隔：3秒
- 每波数量：3个
- 敌人类型：基础、快速
- 权重：基础70%，快速30%

#### 阶段2：坦克出现 (50-150击杀)
- 生成间隔：2.5秒
- 每波数量：4个
- 敌人类型：基础、快速、坦克
- 权重：基础50%，快速30%，坦克20%

#### 阶段3：精英敌人 (150-300击杀)
- 生成间隔：2秒
- 每波数量：5个
- 敌人类型：基础、快速、坦克、分裂、射击
- 权重：基础30%，快速25%，坦克20%，分裂15%，射击10%

#### 阶段4：全面战争 (300-500击杀)
- 生成间隔：1.5秒
- 每波数量：6个
- 敌人类型：所有类型
- 权重：均衡分布

#### 阶段5：无尽杀戮 (500+击杀)
- 生成间隔：1秒
- 每波数量：8个
- 难度倍数：1.5倍
- 敌人类型：所有类型，更多坦克

### 波次系统

- 每个阶段包含多个波次
- 清波后获得奖励
- 低血量时（<30%）清波恢复1点生命
- 显示波次开始提示

### 难度递增

- 每100击杀增加10%难度
- 每200击杀增加5%精英率（最高30%）
- 场上最多50个敌人
- 敌人在视野外生成

### 精英敌人

- 金色外观，放大1.2倍
- 1.5倍生命值
- 1.2倍速度和伤害
- 2倍得分

## 使用方法

### 初始化

```javascript
// 在GameScene中（已自动完成）
import { EnemyManager } from '../enemies/EnemyManager.js';

// 在create方法中
this.enemyManager = new EnemyManager(this);
```

### 更新

```javascript
// 在update方法中（已自动完成）
if (this.enemyManager) {
    this.enemyManager.update(time, delta);
}
```

### 处理敌人死亡

```javascript
// 使用敌人的takeDamage方法
enemy.takeDamage(damage);

// 或在子弹碰撞时自动处理
this.physics.overlap(this.projectiles, this.enemies, (bullet, enemy) => {
    bullet.destroy();
    enemy.takeDamage(bullet.damage);
});
```

### 获取统计信息

```javascript
// 获取敌人管理器统计
const stats = this.enemyManager.getStats();
console.log(`当前波次: ${stats.currentWave}`);
console.log(`场上敌人: ${stats.activeEnemies}`);
console.log(`难度倍数: ${stats.difficultyMultiplier}`);
```

## 扩展指南

### 添加新敌人类型

1. 在`EnemyConfig.js`中添加新类型配置：

```javascript
NEW_ENEMY: {
    name: '新敌人',
    health: 10,
    speed: 60,
    damage: 2,
    size: 20,
    color: 0x00ff00,
    score: 25,
    type: 'newEnemy',
    spawnWeight: 15,
    description: '新敌人类型'
}
```

2. 在`Enemy.js`中添加对应的AI方法：

```javascript
updateNewEnemyAI() {
    // 自定义AI逻辑
}
```

3. 在`update`方法的switch中添加case：

```javascript
case 'newEnemy':
    this.updateNewEnemyAI();
    break;
```

4. 在`GameScene.js`的`createPlaceholderGraphics`中添加纹理：

```javascript
// 新敌人类型
graphics.clear();
graphics.fillStyle(0x00ff00);
graphics.fillCircle(10, 10, 10);
graphics.generateTexture('enemy-newEnemy', 20, 20);
```

### 修改生成阶段

在`EnemyConfig.js`的`EnemySpawnPhase`数组中修改阶段配置：

```javascript
{
    name: '新阶段',
    minKills: 1000,
    maxKills: Infinity,
    spawnRate: 800,      // 0.8秒
    spawnCount: 10,      // 每波10个
    allowedTypes: ['BASIC', 'RUSH'], // 允许的敌人类型
    weights: { BASIC: 50, RUSH: 50 }, // 生成权重
    difficultyMultiplier: 2.0 // 难度倍数
}
```

### 调整难度递增

在`EnemyManager.js`的`increaseDifficulty`方法中修改：

```javascript
// 修改难度递增速度
this.difficultyMultiplier = 1.0 + (difficultyStep * 0.15); // 每波增加15%

// 修改精英率递增
this.eliteRate = Math.min(0.5, difficultyStep * 0.08); // 最高50%
```

## 敌人AI详解

### 追踪算法

所有追踪型敌人都使用角度计算追踪：

```javascript
const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
velocityX = Math.cos(angle) * speed;
velocityY = Math.sin(angle) * speed;
```

### 特殊AI行为

#### 射击敌人
- 保持距离策略
- 后退/前进逻辑
- 冷却时间管理

#### ZigZag移动
```javascript
const zigzagAngle = angle + Math.sin(time + offset) * amplitude;
```

#### 爆炸敌人
- 接近检测
- 闪烁警告
- 爆炸倒计时
- AoE伤害计算

#### 分裂敌人
- 子敌人生成
- 圆形分布生成
- 自动添加到管理器

## 性能优化

### 生命周期管理

- 敌人出生时500ms无敌
- 视觉缩放效果
- 死亡动画后销毁
- 子弹生命周期限制

### 渲染优化

- 圆形碰撞体代替精确碰撞
- 出生/死亡时使用缩放和透明度动画
- 使用简单的颜色视觉反馈

### AI优化

- 帧率独立更新
- 避免每帧计算复杂路径
- 使用简单的距离检测

## 调试技巧

### 查看当前阶段

```javascript
console.log(this.enemyManager.getCurrentPhase());
```

### 强制生成特定敌人类型

```javascript
// 获取配置
const enemyConfig = this.enemyManager.getEnemyConfig('TANK');

// 创建敌人
const enemy = new Enemy(this, x, y, enemyConfig);
this.enemies.add(enemy);
```

### 控制台命令

在浏览器控制台中：

```javascript
// 查看敌人统计
scene.enemyManager.getStats()

// 清理所有敌人
scene.enemyManager.clearAllEnemies()

// 查看当前波次
scene.enemyManager.currentWave

// 跳到下阶段
scene.enemyManager.currentWave = 10
scene.killCount = 500
```

## 常见问题

### Q: 敌人不生成？
A: 检查：
1. 是否在其他敌人组初始化后初始化了EnemyManager
2. gameTime是否正确更新
3. 场上敌人是否达到上限(50个)

### Q: 敌人生成太频繁/太慢？
A: 在`EnemyConfig.js`的`EnemySpawnPhase`中调整`spawnRate`值（毫秒）

### Q: 想要更多某种敌人？
在对应阶段的`weights`中增加该敌人权重

### Q: 敌人太简单/太难？
调整：
- 阶段配置中的`difficultyMultiplier`
- EnemyConfig中各敌人的基础属性
- 难度递增公式

## 注意事项

1. **纹理名称**：确保纹理名称与`getTextureName()`返回一致
2. **敌人组**：所有敌人必须添加到`this.enemies`组中
3. **击杀计数**：必须通过`killCountManager`或`handleEnemyDeath`处理
4. **性能**：场上敌人数量有限制（默认50）
5. **内存**：敌人死亡后自动清理，无需手动处理

## 未来扩展建议

- [ ] 添加Boss敌人类型
- [ ] 实现敌人路径寻路
- [ ] 添加敌人攻击模式（弹幕、激光等）
- [ ] 实现敌人掉落系统
- [ ] 添加环境因素（雪地减速、火焰伤害等）
- [ ] 多人游戏中的敌人同步
- [ ] 保存/加载生成进度