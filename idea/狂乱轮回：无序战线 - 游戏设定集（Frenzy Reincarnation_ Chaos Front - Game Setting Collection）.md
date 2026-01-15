# 狂乱轮回：无序战线 - 游戏设定集（Frenzy Reincarnation: Chaos Front - Game Setting Collection）

# 一、核心设定（Core Settings）

## 1. 世界观（Worldview）

世界陷入“无序裂隙（Chaos Rift）”的循环诅咒，这片随机生成的扭曲空间中，怪物肆虐、法则混乱。被选中的“裂隙行者（Rift Walker）”需在无尽轮回（Endless Reincarnation）中战斗、成长，突破裂隙核心（Rift Core），寻找打破循环的契机。而被选中的行者，恰好是一群性格迥异、各怀执念的“问题人物”——疯子、傻子、乐子人、谨慎军师与踏实干活的执行者，他们的荒诞组合，成了混乱裂隙中唯一的变数。

## 2. 核心玩法（Core Gameplay）

俯视角枪战肉鸽（Top-Down Shooter Roguelike），核心是“随机成长+策略适配（Random Growth + Strategy Adaptation）”。每局游戏地图、敌人、道具完全随机，玩家选择一名行者深入裂隙，通过击杀敌人获取经验（Experience）与道具（Item），强化自身能力，组建专属战斗流派（Exclusive Combat Build）。死亡即为轮回重置（Reincarnation Reset），局外仅保留“裂隙解锁进度（Rift Unlock Progress）”，解锁新角色、基础道具与世界观碎片（Worldview Fragment），每一轮轮回都是全新的挑战与可能性。

## 3. 基础规则（Basic Rules）

- 血（Health）：角色基础生存值，受击一次固定扣1点，归零则角色死亡，触发轮回。

- 盾（Shield）：额外生存屏障，受击一次固定扣1点，每60秒自动恢复1点（傻子角色除外，其盾恢复规则特殊）；盾值耗尽前，优先消耗盾，不消耗血量。

- 闪避（Dodge）：受击时随机触发，免疫本次伤害，触发概率受角色基础加成与道具影响，最高可叠加至60%。

- 元素伤害（Elemental Damage）：包含冰冻（Freeze）、火焰（Fire）、毒（Poison）三种类型，具体效果如下：

    - 冰冻（Freeze）：命中后使敌人减速50%，持续2秒；若连续命中3次，可短暂禁锢（Imprison）敌人0.5秒。

    - 火焰（Fire）：命中后使敌人进入“灼烧（Burning）”状态，每秒扣除1点生命值，持续3秒；可叠加层数，每层提升灼烧伤害0.5点。

    - 毒（Poison）：命中后使敌人进入“中毒（Poisoned）”状态，每秒扣除0.5点生命值，持续5秒；叠加3层后，额外降低敌人20%攻击力（Attack Power）。

# 二、角色设定（裂隙行者）（Character Settings: Rift Walkers）

## 1. 干活的 - 伊娜（The Worker - Ina）

背景（Background）：前佣兵团后勤兵（Former Mercenary Corps Logistics Soldier），习惯在混乱中保持秩序，擅长高效完成任务，对“生存”有着极致的务实追求。

基础属性（Basic Attributes）：4点血（Health），1点盾（Shield）

核心加成（Core Bonus）：武器伤害（Weapon Damage）+5%，经验获取（Experience Gain）+30%，每杀死1000名敌人掉落1个治疗道具（Healing Item）（可恢复3点血）

武器适配（Weapon Adaptation）：使用霰弹枪（Shotgun）时无视开火移速惩罚（Firing Movement Speed Penalty）

右键技能（Right-Click Skill）：近战突刺（Melee Thrust）（划一次小刀），造成自身子弹伤害（Bullet Damage）10%的伤害；若在敌人子弹即将命中瞬间释放，可弹反子弹（Bullet Parry）（反弹方向为敌人方向），冷却时间（Cooldown Time）8秒。

## 2. 疯子 - 米什卡（The Madman - Misha）

背景（Background）：沉迷战斗的狂战士（Battle-Obsessed Berserker），对疼痛毫无感知，唯一的乐趣是用火力压制（Fire Suppression）一切，认为“混乱才是最好的秩序”。

基础属性（Basic Attributes）：12点血（Health），0点盾（Shield）

核心加成（Core Bonus）：武器攻速（Weapon Attack Speed）+30%，武器伤害（Weapon Damage）+10%，无视所有元素伤害（Elemental Damage），无视开火移速惩罚（Firing Movement Speed Penalty）

限制（Restriction）：不可闪避（Dodge）敌人攻击，不可获取额外防御属性（Defense Attribute），不可拥有召唤物（Summon）

武器适配（Weapon Adaptation）：使用机枪（Machine Gun）时，攻速额外+15%（叠加核心加成后共+45%）

右键技能（Right-Click Skill）：狂怒冲撞（Frenzy Charge），对准星方向快速冲撞，撞到敌人后造成200%子弹伤害（Bullet Damage），若撞墙则自身短暂眩晕（Stun）0.3秒，冷却时间（Cooldown Time）12秒。

## 3. 谨慎军师 - 安娜（The Cautious Strategist - Anna）

背景（Background）：前战略参谋（Former Strategic Staff Officer），因一次决策失误导致全军覆没，从此变得极度谨慎，擅长用策略与召唤物（Summon）规避风险、掌控战局（Battlefield Control）。

基础属性（Basic Attributes）：2点血（Health），2点盾（Shield）

核心加成（Core Bonus）：经验获取（Experience Gain）+100%，召唤物伤害（Summon Damage）+10%，召唤物攻速（Summon Attack Speed）+20%，元素伤害（Elemental Damage）+35%

限制（Restriction）：武器伤害（Weapon Damage）减半

额外能力（Additional Ability）：基础闪避概率（Base Dodge Rate）+20%（可叠加至上限60%）

右键技能（Right-Click Skill）：召唤回响（Summon Echo），在原地随机召唤一个已获得的召唤物复制体（Summon Clone），持续5秒，复制体仅拥有原召唤物70%的属性，冷却时间（Cooldown Time）30秒。

## 4. 傻子（自奶）- 米兰（The Fool (Self-Healing) - Milan）

背景（Background）：天生对危险感知迟钝，却拥有极强的自愈（Self-Healing）与防御天赋（Defense Talent），认为“只要扛得住，就不用躲”，战斗风格笨拙却异常坚韧。

基础属性（Basic Attributes）：1点血（Health），5点盾（Shield）

核心加成（Core Bonus）：每180秒增加1个盾位槽（Shield Slot）（最多叠加3个，即最大盾值8点），召唤物伤害（Summon Damage）翻倍

限制（Restriction）：盾的恢复速度（Shield Recovery Speed）减半（每120秒恢复1点），开火移速惩罚（Firing Movement Speed Penalty）翻倍，自身移速（Movement Speed）-20%，武器攻速（Weapon Attack Speed）-20%，武器伤害（Weapon Damage）-20%

右键技能（Right-Click Skill）：愚者守护（Fool's Guard），获得3秒无敌时间（Invincibility Time），期间每秒弹开周围5米内的敌人（弹开时造成少量击退伤害（Knockback Damage）），冷却时间（Cooldown Time）60秒。

## 5. 乐子人 - 玉子（The Entertainer - Yuko）

背景（Background）：神秘的流浪枪手（Mysterious Wanderer Gunner），将裂隙轮回视为一场“大型娱乐节目”，热衷于用爆炸（Explosion）与随机事件（Random Event）制造混乱，享受战斗中的未知乐趣。

基础属性（Basic Attributes）：4点血（Health），4点盾（Shield）

核心加成（Core Bonus）：每杀死1000个敌人，随机获得一项升级（Random Upgrade）（可选择保留或丢弃），免疫爆炸伤害（Explosion Damage）

武器适配（Weapon Adaptation）：使用榴弹炮（Grenade Launcher）与炸弹（Bomb）时，无视开火移速惩罚（Firing Movement Speed Penalty），弹匣容量（Magazine Capacity）翻倍，子弹伤害（Bullet Damage）+50%

限制（Restriction）：使用非榴弹/炸弹类武器时，开火时不可移动，不可获得召唤物（Summon），不可使用治疗道具（Healing Item）

额外能力（Additional Ability）：受伤后自动触发“复仇爆破（Vengeance Blast）”，消灭距离自己最近的十个敌人（冷却时间（Cooldown Time）60秒，每次轮回仅可触发3次）

右键技能（Right-Click Skill）：连锁爆弹（Chain Grenade），杀死距离自己最近的敌人，并以其死亡地点为中心发射6枚特殊榴弹（Special Grenade）（伤害与自身子弹伤害（Bullet Damage）等同）；若特殊榴弹消灭敌人，可再次触发此效果（最多连锁5次），冷却时间（Cooldown Time）20秒。

# 三、关卡与敌人设定（Level & Enemy Settings）

## 1. 关卡生成规则（Level Generation Rules）

每轮轮回的关卡由“随机模块（Random Module）”组合生成，包含3个普通层（Normal Floor）+1个精英层（Elite Floor）+1个BOSS层（BOSS Floor），每层有3-5个房间（Room）（随机包含战斗房（Combat Room）、补给房（Supply Room）、商店房（Shop Room）、事件房（Event Room））。通关每层后可选择一项“层奖励（Floor Reward）”（属性加成（Attribute Bonus）/道具（Item）/召唤物（Summon）），BOSS层通关后可挑战裂隙核心（Rift Core）（终极目标（Ultimate Goal））。

## 2. 敌人类型（Enemy Types）

- 普通敌人（Normal Enemies）：
        

    - 裂隙杂兵（Rift Grunt）：近战型（Melee Type），1点血（Health），无盾（No Shield），移动速度（Movement Speed）中等，攻击力（Attack Power）1点。

    - 裂隙射手（Rift Shooter）：远程型（Ranged Type），1点血（Health），无盾（No Shield），移动速度（Movement Speed）慢，发射普通子弹（Normal Bullet）（攻击力（Attack Power）1点）。

    - 元素仆从（Elemental Minion）：元素型（Elemental Type），2点血（Health），1点盾（Shield），分为冰/火/毒三种，攻击附带对应元素效果（Elemental Effect）（攻击力（Attack Power）1点）。

- 精英敌人（Elite Enemies）：
        

    - 裂隙狂徒（Rift Fanatic）：近战精英（Melee Elite），4点血（Health），2点盾（Shield），移动速度（Movement Speed）快，攻击力（Attack Power）2点，附带“流血（Bleeding）”效果（每秒扣1点血，持续2秒）。

    - 元素祭司（Elemental Priest）：元素精英（Elemental Elite），3点血（Health），2点盾（Shield），远程攻击（Ranged Attack），发射大范围元素弹幕（Large-Area Elemental Barrage）（攻击力（Attack Power）2点，附带对应元素效果（Elemental Effect）），可召唤2个元素仆从（Elemental Minion）。

- BOSS敌人（BOSS Enemies）（每层1个，随机生成）：
        

    - 裂魂巨兽（Soul Rift Behemoth）：近战BOSS（Melee BOSS），15点血（Health），5点盾（Shield），移动速度（Movement Speed）中等，攻击范围（Attack Range）大（攻击力（Attack Power）3点），技能（Skills）：咆哮（Roar）（击退周围敌人并造成1点伤害）、重击（Heavy Strike）（砸向地面，造成范围2点伤害）。

    - 元素君主（Elemental Monarch）：元素BOSS（Elemental BOSS），12点血（Health），4点盾（Shield），远程BOSS（Ranged BOSS），可切换冰/火/毒三种元素形态（Elemental Form），技能（Skills）：元素风暴（Elemental Storm）（大范围元素持续伤害）、元素护盾（Elemental Shield）（吸收5点伤害，护盾破碎后释放元素爆炸（Elemental Explosion））。

    - 混沌枪手（Chaos Gunslinger）：远程BOSS（Ranged BOSS），10点血（Health），3点盾（Shield），使用双枪射击（Dual Wield Shooting），技能（Skills）：弹幕压制（Barrage Suppression）（大范围子弹覆盖）、瞬移（Teleport）（随机瞬移到玩家周围），攻击附带“穿透（Penetration）”效果（可同时击中2个目标）。

# 四、道具与成长设定（Item &amp; Growth Settings）

## 1. 道具类型（Item Types）

- 消耗品（Consumables）：
        

    - 急救包（First Aid Kit）：恢复3点血（Health）（伊娜专属掉落，其他角色可在商店购买）。

    - 护盾包（Shield Pack）：恢复2点盾（Shield），立即生效。

    - 元素抗性瓶（Elemental Resistance Vial）：获得10秒全元素伤害免疫（Full Elemental Damage Immunity）。

- 装备（Equipment）：
        

    - 武器（Weapon）：霰弹枪（Shotgun）、机枪（Machine Gun）、榴弹炮（Grenade Launcher）、步枪（Rifle）、狙击枪（Sniper Rifle）等（每种武器有随机词条（Random Affix），如“伤害+10%”“附带冰冻效果”）。

    - 防具（Armor）：头盔（Helmet）（增加1-2点血（Health））、护甲（Armor Plate）（增加1-2点盾（Shield））、靴子（Boots）（提升移速（Movement Speed）5%-10%）。

- 遗物（核心成长道具，局内永久生效，不可叠加相同遗物）（Relic (Core Growth Item, Permanently Effective In-Game, Cannot Stack Same Relic)）：

    - 通用遗物（Universal Relic）：
                

        - 裂隙核心碎片（Rift Core Shard）：所有伤害（All Damage）+5%。

        - 坚韧徽章（Toughness Badge）：盾恢复速度（Shield Recovery Speed）+30%。

        - 闪避护符（Dodge Talisman）：基础闪避概率（Base Dodge Rate）+10%。

    - 角色专属遗物（Character-Specific Relic）：
                

        - 伊娜的后勤包（Ina's Logistics Pack）：治疗道具恢复量（Healing Item Recovery Amount）+50%，经验获取（Experience Gain）额外+10%。

        - 米什卡的狂怒徽章（Misha's Frenzy Badge）：武器攻速（Weapon Attack Speed）额外+10%，冲撞技能冷却时间（Charge Skill Cooldown Time）-3秒。

        - 安娜的战略地图（Anna's Strategic Map）：召唤物属性（Summon Attribute）+20%，召唤回响技能冷却时间（Summon Echo Skill Cooldown Time）-5秒。

        - 米兰的愚者披风（Milan's Fool's Cloak）：盾位槽上限（Shield Slot Limit）+1，无敌技能持续时间（Invincibility Skill Duration）+1秒。

        - 玉子的娱乐手册（Yuko's Entertainment Manual）：连锁爆弹触发次数上限（Chain Grenade Trigger Limit）+2，随机升级出现高品质选项的概率（Probability of High-Quality Options in Random Upgrade）+30%。

## 2. 成长机制（Growth Mechanism）

局内成长（In-Game Growth）：通过击杀敌人获取经验（Experience），升级（Level Up）后可选择“属性加成（Attribute Bonus）”（血/盾/伤害/攻速/闪避）或“技能强化（Skill Enhancement）”（提升右键技能效果）；通过道具（Item）与遗物（Relic）组建专属构筑流派（Exclusive Build）。

局外解锁（Out-of-Game Unlock）：每轮轮回结束后，根据通关层数（Cleared Floor）与击杀数量（Kill Count）获得“裂隙结晶（Rift Crystal）”，可用于解锁新角色（初始仅解锁伊娜）、新武器（New Weapon）、新遗物（New Relic）、角色外观皮肤（Character Skin）。解锁内容仅影响开局可选范围，不提供局内属性加成，保证每轮轮回的公平性（Fairness）。

# 五、构筑流派参考（Build Reference）

- 伊娜：霰弹续航流（Shotgun Sustainability Build）（霰弹枪（Shotgun）+闪避护符（Dodge Talisman）+后勤包（Logistics Pack），强化近战弹反（Melee Bullet Parry），靠经验优势快速升级）。

- 米什卡：机枪压制流（Machine Gun Suppression Build）（机枪（Machine Gun）+狂怒徽章（Frenzy Badge）+裂隙核心碎片（Rift Core Shard），靠高攻速高伤害无脑输出，无视元素伤害（Elemental Damage））。

- 安娜：召唤元素流（Summon Elemental Build）（召唤物（Summon）+元素抗性瓶（Elemental Resistance Vial）+战略地图（Strategic Map），靠召唤物输出，自身规避风险，利用元素伤害加成（Elemental Damage Bonus）补伤害）。

- 米兰：召唤坦克流（Summon Tank Build）（高盾（High Shield）+愚者披风（Fool's Cloak）+召唤物伤害加成（Summon Damage Bonus），靠自身高防御扛伤害，召唤物负责输出）。

- 玉子：爆炸连锁流（Explosion Chain Build）（榴弹炮（Grenade Launcher）+娱乐手册（Entertainment Manual）+元素抗性瓶（Elemental Resistance Vial），靠连锁爆弹（Chain Grenade）制造大范围爆炸，利用随机升级（Random Upgrade）强化输出）。

> （注：文档部分内容可能由 AI 生成）
> 
> 
> （注：文档部分内容可能由 AI 生成）