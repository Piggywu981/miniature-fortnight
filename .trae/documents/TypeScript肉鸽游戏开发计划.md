# TypeScript肉鸽游戏开发计划

## 项目初始化
1. **初始化项目配置**
   - 创建 package.json（配置TypeScript、Jest、ESLint依赖）
   - 创建 tsconfig.json（TypeScript编译配置）
   - 创建 .eslintrc.json（ESLint规则配置）
   - 创建 jest.config.js（Jest测试配置）
   - 创建 .gitignore（忽略node_modules、dist等）

## 核心模块开发（按顺序）

### 模块1: 角色系统 (Character System)
**功能**：
- 角色属性（生命值、攻击力、防御力等）
- 角色状态（正常、中毒、眩晕等）
- 角色升级系统
- 技能系统基础接口

**文件结构**：
- `src/character/Character.ts` - 角色基类
- `src/character/CharacterStats.ts` - 角色属性
- `src/character/CharacterState.ts` - 角色状态
- `src/character/types.ts` - 类型定义
- `src/character/__tests__/Character.test.ts` - 单元测试

**提交信息**：`feat: 实现角色系统核心功能 - 角色属性、状态管理和升级机制`

### 模块2: 地图生成系统 (Map Generation System)
**功能**：
- 地图网格系统
- 房间生成算法
- 迷宫生成算法
- 地图渲染接口

**文件结构**：
- `src/map/MapGrid.ts` - 地图网格
- `src/map/RoomGenerator.ts` - 房间生成器
- `src/map/MazeGenerator.ts` - 迷宫生成器
- `src/map/types.ts` - 类型定义
- `src/map/__tests__/MapGeneration.test.ts` - 单元测试

**提交信息**：`feat: 实现地图生成系统 - 网格系统、房间和迷宫生成算法`

### 模块3: 道具系统 (Item System)
**功能**：
- 道具基类和类型
- 装备系统（武器、防具）
- 消耗品系统
- 道具效果系统
- 背包系统

**文件结构**：
- `src/item/Item.ts` - 道具基类
- `src/item/Equipment.ts` - 装备类
- `src/item/Consumable.ts` - 消耗品类
- `src/item/Inventory.ts` - 背包系统
- `src/item/types.ts` - 类型定义
- `src/item/__tests__/ItemSystem.test.ts` - 单元测试

**提交信息**：`feat: 实现道具系统 - 装备、消耗品和背包管理`

### 模块4: 战斗系统 (Combat System)
**功能**：
- 战斗回合管理
- 攻击计算逻辑
- 伤害计算（考虑防御、暴击等）
- 战斗状态机
- 战斗日志系统

**文件结构**：
- `src/combat/CombatManager.ts` - 战斗管理器
- `src/combat/AttackCalculator.ts` - 攻击计算器
- `src/combat/DamageCalculator.ts` - 伤害计算器
- `src/combat/CombatLog.ts` - 战斗日志
- `src/combat/types.ts` - 类型定义
- `src/combat/__tests__/CombatSystem.test.ts` - 单元测试

**提交信息**：`feat: 实现战斗系统 - 回合管理、攻击计算和战斗日志`

### 模块5: 存档系统 (Save System)
**功能**：
- 存档数据序列化
- 存档文件读写
- 存档槽管理
- 自动存档机制

**文件结构**：
- `src/save/SaveManager.ts` - 存档管理器
- `src/save/SaveSerializer.ts` - 存档序列化器
- `src/save/SaveSlot.ts` - 存档槽
- `src/save/types.ts` - 类型定义
- `src/save/__tests__/SaveSystem.test.ts` - 单元测试

**提交信息**：`feat: 实现存档系统 - 数据序列化、存档槽管理和自动存档`

## 游戏主程序
**功能**：
- 游戏循环
- 模块集成
- 游戏状态管理

**文件结构**：
- `src/Game.ts` - 游戏主类
- `src/GameLoop.ts` - 游戏循环
- `src/index.ts` - 入口文件

**提交信息**：`feat: 实现游戏主程序 - 游戏循环和模块集成`

## 开发流程
每个模块完成后：
1. 运行单元测试：`npm test`
2. 运行ESLint检查：`npm run lint`
3. 运行TypeScript类型检查：`npm run type-check`
4. 修复发现的问题
5. Git提交：`git commit -m "提交信息"`

## 技术栈
- **TypeScript**: 类型安全
- **Jest**: 单元测试框架
- **ESLint**: 代码质量检查
- **Node.js**: 运行环境

## 设计原则
- 单一职责原则：每个类只负责一个功能
- 开闭原则：对扩展开放，对修改关闭
- 依赖倒置原则：依赖抽象而非具体实现
- 接口隔离原则：使用细粒度接口