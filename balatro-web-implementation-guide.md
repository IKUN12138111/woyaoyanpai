# 网页端小丑牌实现指令

## 目标

你现在不是做“像扑克牌的小游戏”，而是做一个 **Balatro 风格的网页端单机卡牌 Roguelike**。  
优先目标是先做出 **可玩、可扩展、规则闭环完整** 的版本，而不是一开始就 1:1 复刻全部内容。

## 先定边界

不要直接尝试完整复刻原版全部系统。原版内容量太大，包含大量 Joker、Tarot、Planet、Spectral、Voucher、Deck、Stake、Tag、Boss Blind、贴纸、版本差异和隐藏规则。  
网页版本第一阶段应该做成：

1. 单机、纯前端、无后端依赖。
2. 用 `HTML + CSS + JavaScript` 即可，先不要引入重框架。
3. 保证手机和桌面浏览器都能玩。
4. 先做 `MVP`，再做“扩展包式”迭代。

## 必须掌握的核心玩法

根据官方 FAQ 和社区规则资料，小丑牌的核心循环是：

1. 一局 Run 由多个 `Ante` 组成。
2. 每个 `Ante` 包含 3 个关卡：
   - `Small Blind`
   - `Big Blind`
   - `Boss Blind`
3. 每个 Blind 都有一个目标分数。
4. 玩家在回合中从手牌中打出一手扑克牌型来得分。
5. 得分本质上是 `Chips × Mult`。
6. 打完一个 Blind 后进入商店，购买 Joker 或功能牌强化构筑。
7. Joker 是构筑核心，每张 Joker 会改写计分、经济或规则。
8. Boss Blind 会附带限制条件，迫使玩家调整打法。

## 第一阶段 MVP 范围

第一阶段必须实现以下系统，缺一不可：

1. 标准 52 张扑克牌牌组。
2. 抽牌、弃牌、出牌、补牌。
3. 基础扑克牌型判定：
   - High Card
   - Pair
   - Two Pair
   - Three of a Kind
   - Straight
   - Flush
   - Full House
   - Four of a Kind
   - Straight Flush
4. 基础计分：
   - 每种牌型有基础 `Chips`
   - 每种牌型有基础 `Mult`
   - 计分卡牌本身再贡献牌面 Chips
5. Blind 关卡流程。
6. 商店。
7. 至少 12 张可用 Joker。
8. 至少 3 个 Boss Blind。
9. 一局通关目标先固定为 `Ante 8`。
10. 本地存档。

## 建议采用的基础规则

为了先做出可玩版本，第一阶段建议采用下面这套稳定规则：

### 手牌与操作次数

1. 每回合起始手牌数：`8`
2. 每个 Blind 可出牌次数：`4`
3. 每个 Blind 可弃牌次数：`3`
4. 每次出牌后，从牌堆补回到手牌上限。
5. 每次弃牌后，也补回到手牌上限。

### 扑克牌型基础分

可先参考以下基础值：

| 牌型 | 基础 Chips | 基础 Mult |
| --- | ---: | ---: |
| High Card | 5 | 1 |
| Pair | 10 | 2 |
| Two Pair | 20 | 2 |
| Three of a Kind | 30 | 3 |
| Straight | 30 | 4 |
| Flush | 35 | 4 |
| Full House | 40 | 4 |
| Four of a Kind | 60 | 7 |
| Straight Flush | 100 | 8 |

### 单牌 Chips

1. `A = 11`
2. `K/Q/J = 10`
3. 数字牌按点数计分

### Ante 目标分建议

先不要追求原版完全一致，第一阶段可用一条平滑曲线：

| Ante | Small | Big | Boss |
| --- | ---: | ---: | ---: |
| 1 | 300 | 450 | 600 |
| 2 | 500 | 750 | 1000 |
| 3 | 900 | 1350 | 1800 |
| 4 | 1500 | 2200 | 3000 |
| 5 | 2600 | 3900 | 5200 |
| 6 | 4200 | 6300 | 8400 |
| 7 | 7000 | 10500 | 14000 |
| 8 | 12000 | 18000 | 24000 |

## Joker 设计要求

不要一开始就做几十张。先做 12 张，但必须覆盖 4 类作用：

1. 加 Chips
2. 加 Mult
3. 乘区倍率
4. 经济或规则修正

### 第一批 Joker 建议

1. `Joker`
   - 效果：`+4 Mult`
2. `Greedy Joker`
   - 效果：若本次计分牌中包含红桃，`+3 Mult`
3. `Sly Joker`
   - 效果：若牌型包含 Pair，`+50 Chips`
4. `Mad Joker`
   - 效果：若牌型包含 Two Pair，`+10 Mult`
5. `Zany Joker`
   - 效果：若牌型包含 Three of a Kind，`+12 Mult`
6. `Crazy Joker`
   - 效果：若牌型包含 Straight，`+12 Mult`
7. `Droll Joker`
   - 效果：若牌型包含 Flush，`+10 Mult`
8. `Clever Joker`
   - 效果：若牌型包含 Two Pair，`+80 Chips`
9. `Half Joker`
   - 效果：若出牌张数小于等于 3，`+20 Mult`
10. `Banner`
   - 效果：按剩余弃牌次数给 Chips
11. `Bull`
   - 效果：按当前金币给 Chips
12. `Riff-Raff`
   - 效果：进入 Blind 时如果 Joker 槽未满，生成临时普通 Joker

### Joker 槽位

1. 初始槽位：`5`
2. 商店可购买 Joker
3. Joker 可出售换回部分金币

## Boss Blind 第一批设计

先做 3 个，目的是验证规则系统可扩展：

1. `The Wall`
   - 目标分翻倍
2. `The Needle`
   - 本 Blind 只允许出 1 次牌
3. `The Eye`
   - 本 Blind 中不能重复打出同一牌型

要求：

1. Boss Blind 必须通过统一规则钩子实现。
2. 不能把限制逻辑写死在 UI 事件里。

## 商店系统

第一阶段商店保持简化，但流程要像样：

1. 每次通过 Blind 后进入商店。
2. 商店展示：
   - 2 个 Joker
   - 1 个消耗牌位，先只放 `Planet`
   - 1 次刷新按钮
3. 玩家可：
   - 购买
   - 刷新
   - 出售 Joker
   - 离开商店

### Planet 卡先做 5 张

用来升级牌型的基础分：

1. `Pluto`：强化 High Card
2. `Mercury`：强化 Pair
3. `Uranus`：强化 Two Pair
4. `Venus`：强化 Three of a Kind
5. `Saturn`：强化 Straight

简化规则：

1. 使用 Planet 后，对应牌型永久 `+10 Chips` 与 `+1 Mult`
2. UI 中必须能看到每种牌型当前等级

## 经济系统

第一阶段建议：

1. 初始金币：`4`
2. 通过 Small Blind：`+3`
3. 通过 Big Blind：`+4`
4. 通过 Boss Blind：`+5`
5. 结余利息：每回合结束时，`每 5 金币 +1`，上限 `+5`
6. Joker 售价返回购买价的 `50%`
7. 商店刷新费用：`1`

## 强制架构要求

普通 AI 实现时，不要写成一坨事件脚本。至少拆成下面几个模块：

1. `game-state.js`
   - 全局运行状态
2. `deck.js`
   - 牌堆、洗牌、抽牌、弃牌、回收
3. `hand-evaluator.js`
   - 扑克牌型判定
   - 计分牌识别
4. `score-engine.js`
   - 基础计分
   - Joker 触发
   - Boss Blind 修正
5. `joker-data.js`
   - Joker 静态定义
6. `shop-engine.js`
   - 商店生成、购买、出售、刷新
7. `boss-rules.js`
   - Boss Blind 限制逻辑
8. `ui-render.js`
   - DOM 更新
9. `main.js`
   - 游戏流程控制

## 数据结构建议

### 卡牌

```js
{
  id: "H-10-001",
  suit: "hearts",
  rank: "10",
  rankValue: 10,
  chips: 10,
  edition: null,
  enhancement: null,
  seal: null
}
```

### Joker

```js
{
  id: "jolly_joker",
  name: "Jolly Joker",
  rarity: "common",
  cost: 3,
  sellValue: 1,
  category: "mult",
  text: "如果本次牌型包含 Pair，+8 Mult",
  triggers: ["onScore"],
  apply(context) {}
}
```

### Blind

```js
{
  ante: 3,
  type: "boss",
  key: "the_eye",
  goal: 1800,
  reward: 5,
  ruleConfig: {
    noRepeatHandType: true
  }
}
```

### 回合状态

```js
{
  money: 7,
  ante: 2,
  blindIndex: 1,
  handsRemaining: 3,
  discardsRemaining: 2,
  handSize: 8,
  jokerSlots: 5,
  scoreTarget: 750,
  scoreCurrent: 210,
  playedHandTypesThisRound: [],
  jokers: [],
  consumables: [],
  deck: [],
  drawPile: [],
  handCards: [],
  discardPile: []
}
```

## 计分顺序必须固定

普通 AI 很容易把计分写乱。必须强制它按下面的顺序结算：

1. 识别本次出牌形成的最佳牌型。
2. 识别哪些牌是“参与计分”的牌。
3. 计算 `基础牌型 Chips / Mult`。
4. 累加计分卡的单牌 Chips。
5. 应用卡牌修正。
6. 应用 Joker 的加法 Chips。
7. 应用 Joker 的加法 Mult。
8. 应用 Joker 的乘法 Mult。
9. 得到最终分数并累加到当前 Blind。

如果这套顺序不固定，后面新增 Joker 一定会出错。

## UI 设计要求

网页端不要做成普通后台页面。必须有明确桌游质感。

### 视觉方向

1. 墨绿、金黄、暗红为主色，不要用默认紫白风格。
2. 桌面像赌场毛毡桌面，不是普通卡片列表。
3. Joker 卡必须有夸张、怪诞、戏法感。
4. 出牌结算时要有明显数字跳动和倍率增长动画。

### 必备区域

1. 顶部：Ante、Blind 类型、目标分、当前分、金币
2. 中部：当前手牌区
3. 左侧或右侧：Joker 槽
4. 下部：操作按钮
   - 出牌
   - 弃牌
   - 排序
   - 商店继续
5. 弹层：
   - 商店
   - Blind 结算
   - 游戏结束

## 研发顺序

普通 AI 必须按这个顺序做，不允许乱序堆功能：

1. 先做牌堆、抽牌、弃牌、补牌
2. 再做牌型识别
3. 再做基础计分
4. 再做 Blind 过关流程
5. 再做商店
6. 再做 Joker
7. 再做 Boss Blind
8. 最后做动画、音效、存档和移动端适配

## 验收标准

做到下面这些，才算第一阶段完成：

1. 能完整从 Ante 1 玩到 Ante 8。
2. 每个 Blind 都能正常结算失败和成功。
3. Joker 可以购买、出售、触发、叠加。
4. Boss Blind 限制确实生效。
5. Planet 卡能永久升级牌型基础值。
6. 刷新页面后能恢复当前 Run。
7. 手机宽度下界面不炸。

## 第二阶段扩展方向

第一阶段完成后，再让普通 AI 继续做：

1. 更多 Joker
2. Tarot
3. Spectral
4. Voucher
5. Deck 差异
6. Tag
7. 更多 Boss Blind
8. 更多卡牌增强效果
9. 更接近原版的计分细节

## 监工要求

如果普通 AI 开始实现时出现以下问题，你要立即纠正：

1. 一上来想完整复刻全部内容
2. 把规则写死在按钮点击事件里
3. Joker 不是数据驱动，而是满文件 `if/else`
4. 计分顺序不固定
5. UI 先做很花，但核心流程还不能玩
6. 没有本地存档
7. 没有为 Boss Blind 预留统一规则接口

## 资料来源

1. 官方 FAQ：<https://www.playbalatro.com/faq>
2. Balatro Wiki - Poker Hands：<https://balatrogame.fandom.com/wiki/Poker_Hands>
3. Balatro Wiki - Blinds and Antes：<https://balatrogame.fandom.com/wiki/Blinds>
4. Balatro Wiki - The Shop：<https://balatrogame.fandom.com/wiki/The_Shop>
5. Balatro Wiki - Planet Cards：<https://balatrogame.fandom.com/wiki/Planet_Cards>

