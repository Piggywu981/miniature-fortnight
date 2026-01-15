# 技能和特殊能力系统文档

## 系统概述

这个文档说明如何使用游戏中新实现的技能和特殊能力系统。系统分为三个主要模块：

1. **AbilitySystem** - 处理所有主动技能（右键技能）
2. **SpecialAbilitySystem** - 处理被动触发能力
3. **KillCountManager** - 统一管理击杀统计和里程碑

## 1. AbilitySystem（技能系统）

### 功能
处理所有角色的右键使用技能，包括：
- 伊娜（干活的）- 近战攻击
- 米什卡（疯子）- 冲撞攻击
- 安娜（谨慎军师）- 召唤克隆
- 米兰（傻子）- 无敌状态
- 玉子（乐子人）- 连锁榴弹

### 使用方法

#### 在Player类中初始化

```javascript
// 已经在Player.js中自动初始化
this.abilitySystem = new AbilitySystem(scene, this);
```

#### 使用技能

```javascript
// 在GameScene.js中使用右键技能
this.player.useRightClickAbility(targetX, targetY);
```

#### 在update中更新

```javascript
// 在Player.update中已经自动更新
this.abilitySystem.update(delta);
```

### 技能详情

#### 伊娜 - 近战攻击
- **效果**：造成10%子弹伤害的近战攻击，可弹反子弹
- **冷却**：1秒
- **范围**：20像素范围

#### 米什卡 - 冲撞
- **效果**：向指定方向冲锋，造成200%子弹伤害
- **冷却**：1秒
- **距离**：最高500速度，持续0.3秒

#### 安娜 - 召唤克隆
- **效果**：召唤一个会自动攻击的克隆体，持续5秒
- **冷却**：30秒
- **伤害**：克隆体造成50%子弹伤害，每秒攻击1次

#### 米兰 - 无敌
- **效果**：3秒无敌时间，每秒弹开周围敌人
- **冷却**：60秒
- **范围**：80像素击退距离

#### 玉子 - 连锁榴弹
- **效果**：秒杀最近敌人并发射6枚连锁榴弹
- **冷却**：20秒
- **连锁**：被榴弹击杀的敌人会触发新的榴弹

## 2. SpecialAbilitySystem（特殊能力系统）

### 功能
处理所有被动触发的特殊能力：
- 击杀里程碑效果
- 受伤复仇（玉子）
- 自动掉落物品（伊娜）
- 升级选择（玉子）

### 使用方法

#### 在Player类中初始化

```javascript
// 已经在Player.js中自动初始化
this.specialAbilitySystem = new SpecialAbilitySystem(scene, this);
```

#### 处理击杀事件

```javascript
// 自动通过KillCountManager处理
this.killCountManager.incrementKillCount();
```

#### 触发玉子的复仇

```javascript
// 在Player.takeDamage中自动触发
if (this.config.class === '乐子人') {
    this.specialAbilitySystem.triggerRevengeAbility();
}
```

### 特殊能力详情

#### 伊娜 - 治疗道具掉落
- **触发**：每1000击杀
- **效果**：生成一个治疗道具，恢复2点生命

#### 玉子 - 随机升级
- **触发**：每1000击杀
- **效果**：从6种随机升级中选择一项
- **升级选项**：
  - 最大生命值+2
  - 武器伤害+20%
  - 攻击速度+15%
  - 移动速度+10%
  - 护盾容量+1
  - 闪避率+5%

#### 玉子 - 受伤复仇
- **触发**：受到伤害时
- **效果**：立即消灭最近的10个敌人

## 3. KillCountManager（击杀计数管理器）

### 功能
- 统一管理所有角色的击杀统计
- 追踪连杀数（3秒内连续击杀）
- 管理击杀里程碑
- 提供击杀数据查询接口

### 使用方法

#### 在Player类中初始化

```javascript
// 已经在Player.js中自动初始化
this.killCountManager = new KillCountManager(scene, this, this.specialAbilitySystem);
```

#### 记录击杀

```javascript
// 在GameScene.js的handleEnemyDeath中
if (this.player.killCountManager) {
    this.player.killCountManager.incrementKillCount();
}
```

#### 获取击杀统计

```javascript
const stats = this.player.killCountManager.getStats();
console.log(`总击杀：${stats.totalKills}`);
console.log(`当前连杀：${stats.currentStreak}`);
console.log(`下一个里程碑：${stats.nextMilestone}`);
```

### 连杀系统

- **5连杀**：3秒内获得5次击杀，获得5秒20%移速加成
- **10连杀**：3秒内获得10次击杀，立即恢复1点生命

### 击杀里程碑

- 1000、2000、3000、4000、5000击杀里程碑
- 每个里程碑会触发角色的特殊能力

## 集成步骤

### 1. 确保导入模块

```javascript
// 在Player.js中（已自动添加）
import { AbilitySystem } from '../systems/AbilitySystem.js';
import { SpecialAbilitySystem } from '../systems/SpecialAbilitySystem.js';
import { KillCountManager } from '../systems/KillCountManager.js';
```

### 2. 初始化系统

```javascript
// 在Player构造函数中（已自动添加）
this.abilitySystem = new AbilitySystem(scene, this);
this.specialAbilitySystem = new SpecialAbilitySystem(scene, this);
this.killCountManager = new KillCountManager(scene, this, this.specialAbilitySystem);
```

### 3. 更新系统

```javascript
// 在Player.update中（已自动添加）
this.abilitySystem.update(delta);
```

### 4. 处理击杀事件

```javascript
// 在GameScene.handleEnemyDeath中（已自动更新）
if (this.player.killCountManager) {
    this.player.killCountManager.incrementKillCount();
}
```

## 调试和测试

### 测试技能系统

```javascript
// 在浏览器控制台测试技能
player.useRightClickAbility(player.x + 100, player.y); // 测试技能
```

### 检查击杀计数

```javascript
// 获取当前击杀数
console.log(player.killCountManager.killCount);

// 获取完整统计
console.log(player.killCountManager.getStats());
```

### 测试特殊能力

```javascript
// 直接触发特殊能力
player.specialAbilitySystem.triggerRandomUpgrade(); // 玉子的升级
player.specialAbilitySystem.dropHealthItem(); // 伊娜的掉落
```

## 扩展和自定义

### 添加新技能

1. 在AbilitySystem中添加新的技能方法
2. 在useAbility中添加case分支
3. 在CharacterConfig中添加角色配置

### 添加新升级选项

1. 在SpecialAbilitySystem中添加新的升级方法
2. 在triggerRandomUpgrade的upgrades数组中添加新方法

### 修改击杀里程碑

在KillCountManager中修改killMilestones数组：

```javascript
this.killMilestones = [500, 1000, 1500, 2000]; // 自定义里程碑
```

## 注意事项

1. **冷却时间**：所有技能都有冷却时间，确保不能连续使用
2. **状态同步**：Player.js中的killCount会自动同步killCountManager的数据
3. **性能考虑**：技能效果有自动清理机制，确保不会内存泄漏
4. **兼容性**：新系统向下兼容旧代码，不需要修改现有游戏逻辑

## 常见问题

### Q: 技能没有反应？
A: 检查技能是否在冷却中，查看abilityCooldown值

### Q: 击杀里程碑没有触发？
A: 确保使用了killCountManager.incrementKillCount()而不是直接增加killCount

### Q: 玉子的升级没有显示？
A: 检查控制台是否有错误，或者查看文本显示位置是否正确