const STORAGE_KEY = "web-balatro-save-v3";
const HAND_LIMIT = 8;
const SELECT_LIMIT = 5;
const MAX_JOKERS = 5;
const BASE_HANDS = 4;
const BASE_DISCARDS = 3;
const MAX_ANTE = 8;

const HAND_TYPES = {
  HIGH_CARD: "高牌",
  PAIR: "对子",
  TWO_PAIR: "两对",
  THREE_KIND: "三条",
  STRAIGHT: "顺子",
  FLUSH: "同花",
  FULL_HOUSE: "葫芦",
  FOUR_KIND: "四条",
  STRAIGHT_FLUSH: "同花顺",
};

const HAND_TYPE_ORDER = [
  HAND_TYPES.HIGH_CARD,
  HAND_TYPES.PAIR,
  HAND_TYPES.TWO_PAIR,
  HAND_TYPES.THREE_KIND,
  HAND_TYPES.STRAIGHT,
  HAND_TYPES.FLUSH,
  HAND_TYPES.FULL_HOUSE,
  HAND_TYPES.FOUR_KIND,
  HAND_TYPES.STRAIGHT_FLUSH,
];

const HAND_SCORES = {
  [HAND_TYPES.HIGH_CARD]: { chips: 5, mult: 1 },
  [HAND_TYPES.PAIR]: { chips: 10, mult: 2 },
  [HAND_TYPES.TWO_PAIR]: { chips: 20, mult: 2 },
  [HAND_TYPES.THREE_KIND]: { chips: 30, mult: 3 },
  [HAND_TYPES.STRAIGHT]: { chips: 30, mult: 4 },
  [HAND_TYPES.FLUSH]: { chips: 35, mult: 4 },
  [HAND_TYPES.FULL_HOUSE]: { chips: 40, mult: 4 },
  [HAND_TYPES.FOUR_KIND]: { chips: 60, mult: 7 },
  [HAND_TYPES.STRAIGHT_FLUSH]: { chips: 100, mult: 8 },
};

const ANTE_TARGETS = [
  { small: 300, big: 450, boss: 600 },
  { small: 500, big: 750, boss: 1000 },
  { small: 900, big: 1350, boss: 1800 },
  { small: 1500, big: 2200, boss: 3000 },
  { small: 2600, big: 3900, boss: 5200 },
  { small: 4200, big: 6300, boss: 8400 },
  { small: 7000, big: 10500, boss: 14000 },
  { small: 12000, big: 18000, boss: 24000 },
];

const BOSS_RULES = [
  { key: "singlePlay", name: "独针", text: "本盲注只允许出牌 1 次。" },
  { key: "noRepeatHandType", name: "天眼", text: "本盲注不能重复打出同一种牌型。" },
  { key: "highTarget", name: "高墙", text: "本盲注目标分额外提高 50%。" },
  { key: "noDiscard", name: "锁手", text: "本盲注不能弃牌。" },
  { key: "maxFourCards", name: "铁钳", text: "每次出牌最多选择 4 张牌。" },
  { key: "faceCardsDebuff", name: "静默", text: "J、Q、K、A 的牌面筹码在本盲注中失效。" },
  { key: "smallHandBonus", name: "偏锋", text: "本盲注鼓励小手牌，3 张及以下出牌额外 +20 倍率。" },
  { key: "finalBoss", name: "终幕", text: "目标分额外提高 80%，且不能弃牌。" },
];

const SUITS = [
  { key: "spades", label: "♠", red: false, name: "黑桃" },
  { key: "hearts", label: "♥", red: true, name: "红桃" },
  { key: "clubs", label: "♣", red: false, name: "梅花" },
  { key: "diamonds", label: "♦", red: true, name: "方块" },
];

const RANKS = [
  { key: "A", value: 14, chips: 11, face: true },
  { key: "K", value: 13, chips: 10, face: true },
  { key: "Q", value: 12, chips: 10, face: true },
  { key: "J", value: 11, chips: 10, face: true },
  { key: "10", value: 10, chips: 10, face: false },
  { key: "9", value: 9, chips: 9, face: false },
  { key: "8", value: 8, chips: 8, face: false },
  { key: "7", value: 7, chips: 7, face: false },
  { key: "6", value: 6, chips: 6, face: false },
  { key: "5", value: 5, chips: 5, face: false },
  { key: "4", value: 4, chips: 4, face: false },
  { key: "3", value: 3, chips: 3, face: false },
  { key: "2", value: 2, chips: 2, face: false },
];

const CARD_ENHANCEMENTS = ["bonus", "mult", "wild", "glass", "steel", "stone", "gold", "lucky"];
const CARD_EDITIONS = ["foil", "holo", "polychrome", "negative"];
const CARD_SEALS = ["gold", "red", "blue", "purple"];
const RANK_UPGRADE_ORDER = [...RANKS].map((rank) => rank.key);
const HELD_SCORE_MULTIPLIERS = {
  base: { chips: 0, mult: 0, multiplier: 1 },
  foil: { chips: 50, mult: 0, multiplier: 1 },
  holo: { chips: 0, mult: 10, multiplier: 1 },
  polychrome: { chips: 0, mult: 0, multiplier: 1.5 },
  negative: { chips: 0, mult: 0, multiplier: 1 },
};

function pickRandom(list) {
  if (!list || list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function createCardId() {
  return `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getRankDefinition(rankKey) {
  return RANKS.find((rank) => rank.key === rankKey) || RANKS[RANKS.length - 1];
}

function getSuitDefinition(suitKey) {
  return SUITS.find((suit) => suit.key === suitKey) || SUITS[0];
}

function getHandLimit() {
  return Math.max(1, HAND_LIMIT + (state.handLimitBonus || 0));
}

function getJokerLimit() {
  return Math.max(1, MAX_JOKERS + (state.extraJokerSlots || 0));
}

function getJokerEffectiveRarity(joker) {
  return joker.rarity || getJokerRarity(joker.id);
}

function createDefaultRankChipMultipliers() {
  return Object.fromEntries(RANKS.map((rank) => [rank.key, 1]));
}

function getRankChipMultiplier(rankKey) {
  return state.rankChipMultipliers?.[rankKey] ?? 1;
}

function getRankStartingChips(rankKey) {
  return getRankDefinition(rankKey).chips * getRankChipMultiplier(rankKey);
}

function refreshCardsForRank(rankKey) {
  const chips = getRankStartingChips(rankKey);
  for (const pile of [state.drawPile, state.discardPile, state.handCards]) {
    for (const card of pile) {
      if (card.rank === rankKey) {
        card.chips = chips;
      }
    }
  }
}

function createCard(rankKey, suitKey, overrides = {}) {
  const rank = getRankDefinition(rankKey);
  const suit = getSuitDefinition(suitKey);
  return {
    id: createCardId(),
    suit: suit.key,
    suitLabel: suit.label,
    suitName: suit.name,
    rank: rank.key,
    rankValue: rank.value,
    chips: getRankStartingChips(rank.key),
    face: rank.face,
    red: suit.red,
    enhancement: null,
    enhancementChips: 0,
    enhancementMult: 0,
    enhancementMultiplier: 1,
    edition: null,
    seal: null,
    ...overrides,
  };
}

function cloneCard(card, overrides = {}) {
  return createCard(card.rank, card.suit, {
    ...card,
    id: createCardId(),
    ...overrides,
  });
}

function clearCardEnhancement(card) {
  card.enhancement = null;
  card.enhancementChips = 0;
  card.enhancementMult = 0;
  card.enhancementMultiplier = 1;
}

function setCardEnhancement(card, enhancement) {
  clearCardEnhancement(card);
  card.enhancement = enhancement;
  if (enhancement === "bonus") {
    card.enhancementChips = 30;
  } else if (enhancement === "mult") {
    card.enhancementMult = 4;
  } else if (enhancement === "glass") {
    card.enhancementMultiplier = 2;
  } else if (enhancement === "stone") {
    card.enhancementChips = 50;
  }
}

function setCardEdition(card, edition) {
  card.edition = edition || null;
}

function setCardSeal(card, seal) {
  card.seal = seal || null;
}

function upgradeCardRank(card) {
  const index = RANK_UPGRADE_ORDER.indexOf(card.rank);
  if (index <= 0) return false;
  const nextRank = getRankDefinition(RANK_UPGRADE_ORDER[index - 1]);
  card.rank = nextRank.key;
  card.rankValue = nextRank.value;
  card.chips = getRankStartingChips(nextRank.key);
  card.face = nextRank.face;
  return true;
}

function setCardSuit(card, suitKey) {
  const suit = getSuitDefinition(suitKey);
  card.suit = suit.key;
  card.suitLabel = suit.label;
  card.suitName = suit.name;
  card.red = suit.red;
}

function getCardDisplayChips(card) {
  return card.chips + (card.enhancementChips || 0);
}

function getCardTooltip(card) {
  const parts = [`${card.rank} / ${card.suitName}`];
  if (card.enhancement) parts.push(`增强：${card.enhancement}`);
  if (card.edition) parts.push(`版本：${card.edition}`);
  if (card.seal) parts.push(`封蜡：${card.seal}`);
  return parts.join(" · ");
}

function getCardEffectBadges(card) {
  const badges = [];
  const enhancementBadges = {
    bonus: { label: "+30", className: "effect-bonus" },
    mult: { label: "x4", className: "effect-mult" },
    wild: { label: "万能", className: "effect-wild" },
    glass: { label: "x2", className: "effect-glass" },
    steel: { label: "x1.5", className: "effect-steel" },
    stone: { label: "+50", className: "effect-stone" },
    gold: { label: "3$", className: "effect-gold" },
    lucky: { label: "幸运", className: "effect-lucky" },
  };
  const editionBadges = {
    foil: { label: "+50", className: "effect-foil" },
    holo: { label: "+10", className: "effect-holo" },
    polychrome: { label: "x1.5", className: "effect-polychrome" },
    negative: { label: "负片", className: "effect-negative" },
  };
  const sealBadges = {
    gold: { label: "3$", className: "effect-seal-gold" },
    red: { label: "x2", className: "effect-seal-red" },
    blue: { label: "蓝封", className: "effect-seal-blue" },
    purple: { label: "紫封", className: "effect-seal-purple" },
  };
  if (card.enhancement && enhancementBadges[card.enhancement]) badges.push(enhancementBadges[card.enhancement]);
  if (card.edition && editionBadges[card.edition]) badges.push(editionBadges[card.edition]);
  if (card.seal && sealBadges[card.seal]) badges.push(sealBadges[card.seal]);
  return badges;
}

function countRarity(items, rarity) {
  return items.filter((item) => item.rarity === rarity);
}

function takeCardsFromHand(count, { random = false } = {}) {
  if (count <= 0 || state.handCards.length === 0) return [];
  if (random) {
    const pool = [...state.handCards];
    const chosen = [];
    while (pool.length > 0 && chosen.length < count) {
      const index = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(index, 1)[0]);
    }
    return chosen;
  }
  const selected = getSelectedCards();
  const chosen = [...selected];
  for (const card of state.handCards) {
    if (chosen.length >= count) break;
    if (!chosen.some((item) => item.id === card.id)) chosen.push(card);
  }
  return chosen.slice(0, count);
}

function removeCardsEverywhere(ids) {
  const removeSet = new Set(ids);
  state.handCards = state.handCards.filter((card) => !removeSet.has(card.id));
  state.drawPile = state.drawPile.filter((card) => !removeSet.has(card.id));
  state.discardPile = state.discardPile.filter((card) => !removeSet.has(card.id));
  state.selectedIds = new Set([...state.selectedIds].filter((id) => !removeSet.has(id)));
}

function removeRandomHandCards(count) {
  const removed = [];
  const pool = [...state.handCards];
  while (pool.length > 0 && removed.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    removed.push(pool.splice(index, 1)[0]);
  }
  removeCardsEverywhere(removed.map((card) => card.id));
  return removed;
}

function addCardsToHand(cards) {
  if (!cards || cards.length === 0) return;
  state.handCards.push(...cards);
  drawToLimit();
}

function createRandomCard({ rankPool, suitPool, enhancementPool } = {}) {
  const rank = pickRandom(rankPool || RANKS);
  const suit = pickRandom(suitPool || SUITS);
  const card = createCard(rank.key, suit.key);
  if (enhancementPool && enhancementPool.length > 0) {
    setCardEnhancement(card, pickRandom(enhancementPool));
  }
  return card;
}

function createRandomFaceCard() {
  return createRandomCard({ rankPool: RANKS.filter((rank) => rank.face) });
}

function createRandomAceCard() {
  return createRandomCard({ rankPool: [getRankDefinition("A")] });
}

function createRandomNumberCard() {
  return createRandomCard({ rankPool: RANKS.filter((rank) => !rank.face && rank.key !== "A") });
}

function createRandomEnhancedCard(rankPool) {
  return createRandomCard({
    rankPool,
    enhancementPool: ["bonus", "mult", "wild", "glass", "steel", "gold", "lucky"],
  });
}

function getScoreCardEffects(card) {
  const effects = {
    chips: 0,
    mult: 0,
    multiplier: 1,
    money: 0,
  };
  const repetitions = card.seal === "red" ? 2 : 1;
  for (let i = 0; i < repetitions; i += 1) {
    if (card.enhancement === "bonus") effects.chips += 30;
    if (card.enhancement === "mult") effects.mult += 4;
    if (card.enhancement === "glass") effects.multiplier *= 2;
    if (card.enhancement === "stone") effects.chips += 50;
    if (card.enhancement === "gold") effects.money += 3;
    if (card.edition === "foil") effects.chips += 50;
    if (card.edition === "holo") effects.mult += 10;
    if (card.edition === "polychrome") effects.multiplier *= 1.5;
    if (card.seal === "gold") effects.money += 3;
    if (card.enhancement === "lucky") {
      const roll = Math.random();
      if (roll < 0.2) {
        effects.mult += 20;
      } else if (roll < 0.26) {
        effects.money += 20;
      }
    }
  }
  return effects;
}

function getJokerEditionLabel(edition) {
  return {
    foil: "闪箔",
    holo: "镭射",
    polychrome: "多彩",
    negative: "负片",
  }[edition] || "普通";
}

const PLANET_LIBRARY = [
  { id: "pluto", name: "冥王星", rarity: "普通", targetHand: HAND_TYPES.HIGH_CARD, cost: 3, text: "强化 高牌 +10 筹码 / +1 倍率" },
  { id: "mercury", name: "水星", rarity: "普通", targetHand: HAND_TYPES.PAIR, cost: 3, text: "强化 对子 +10 筹码 / +1 倍率" },
  { id: "uranus", name: "天王星", rarity: "普通", targetHand: HAND_TYPES.TWO_PAIR, cost: 3, text: "强化 两对 +10 筹码 / +1 倍率" },
  { id: "venus", name: "金星", rarity: "普通", targetHand: HAND_TYPES.THREE_KIND, cost: 3, text: "强化 三条 +10 筹码 / +1 倍率" },
  { id: "saturn", name: "土星", rarity: "罕见", targetHand: HAND_TYPES.STRAIGHT, cost: 3, text: "强化 顺子 +10 筹码 / +1 倍率" },
  { id: "jupiter", name: "木星", rarity: "罕见", targetHand: HAND_TYPES.FLUSH, cost: 3, text: "强化 同花 +10 筹码 / +1 倍率" },
  { id: "earth", name: "地球", rarity: "稀有", targetHand: HAND_TYPES.FULL_HOUSE, cost: 4, text: "强化 葫芦 +10 筹码 / +1 倍率" },
  { id: "mars", name: "火星", rarity: "稀有", targetHand: HAND_TYPES.FOUR_KIND, cost: 4, text: "强化 四条 +10 筹码 / +1 倍率" },
  { id: "neptune", name: "海王星", rarity: "传奇", targetHand: HAND_TYPES.STRAIGHT_FLUSH, cost: 5, text: "强化 同花顺 +10 筹码 / +1 倍率" },
];

const TAROT_LIBRARY = [
  { id: "pope", name: "教皇", rarity: "普通", cost: 3, text: "将 2 张扑克牌变为 奖励牌（+30 筹码）" },
  { id: "empress", name: "皇后", rarity: "普通", cost: 3, text: "将 2 张扑克牌变为 倍率牌（+4 倍率）" },
  { id: "lovers", name: "恋人", rarity: "普通", cost: 3, text: "将 1 张扑克牌变为 万能牌（可视为任意花色）" },
  { id: "justice", name: "正义", rarity: "罕见", cost: 4, text: "将 1 张扑克牌变为 玻璃牌（x2 倍率，25% 概率摧毁）" },
  { id: "chariot", name: "战车", rarity: "罕见", cost: 4, text: "将 1 张扑克牌变为 钢铁牌（留在手牌时提供 x1.5 倍率）" },
  { id: "tower", name: "高塔", rarity: "罕见", cost: 4, text: "将 1 张扑克牌变为 石头牌（+50 筹码，无点数花色）" },
  { id: "devil", name: "魔鬼", rarity: "罕见", cost: 5, text: "将 1 张扑克牌变为 黄金牌（结算后留在手牌时获得 3$）" },
  { id: "magician", name: "魔术师", rarity: "罕见", cost: 5, text: "将 1 张扑克牌变为 幸运牌（20% 概率 +20 倍率 / 6% 概率 +20$）" },
  { id: "death", name: "死神", rarity: "稀有", cost: 3, text: "将左边 1 张牌完全复制为右边 1 张牌（点数、花色、增强效果）" },
  { id: "strength", name: "力量", rarity: "稀有", cost: 3, text: "提升最多 2 张牌的点数（例如 K→A，A 无法提升）" },
  { id: "hanged_man", name: "倒吊人", rarity: "稀有", cost: 4, text: "从牌堆中永久删除最多 2 张牌，用于精简牌组" },
  { id: "world", name: "世界", rarity: "普通", cost: 3, text: "将最多 3 张牌变为黑桃（♠）" },
  { id: "sun", name: "太阳", rarity: "普通", cost: 3, text: "将最多 3 张牌变为红桃（♥）" },
  { id: "moon", name: "月亮", rarity: "普通", cost: 3, text: "将最多 3 张牌变为梅花（♣）" },
  { id: "star", name: "星星", rarity: "普通", cost: 3, text: "将最多 3 张牌变为方块（♦）" },
  { id: "judgement", name: "审判", rarity: "罕见", cost: 5, text: "生成 1 张随机的核心牌（需空槽位）" },
  { id: "high_priestess", name: "女祭司", rarity: "稀有", cost: 5, text: "生成最多 2 张随机的星球牌（需空槽位）" },
  { id: "emperor", name: "皇帝", rarity: "稀有", cost: 5, text: "生成最多 2 张随机的塔罗牌" },
  { id: "temperance", name: "节制", rarity: "稀有", cost: 5, text: "获得相当于你所有核心牌售卖价格总和的金钱" },
  { id: "hermit", name: "隐士", rarity: "普通", cost: 4, text: "使你的当前金钱翻倍，但最多到 20$" },
  { id: "wheel_of_fortune", name: "命运之轮", rarity: "稀有", cost: 6, text: "25% 概率为一张随机核心牌添加增强效果" },
  { id: "fool", name: "愚者", rarity: "普通", cost: 6, text: "复制上一张使用的塔罗牌或星球牌（不能复制愚者本身）" },
];

const SPECTRAL_LIBRARY = [
  { id: "aura", name: "光环", rarity: "罕见", cost: 4, text: "为 1 张选定的卡牌添加随机效果（闪箔 +50 筹码 / 镭射 +10 倍率 / 多彩 x1.5 倍率）" },
  { id: "talisman", name: "护身符", rarity: "罕见", cost: 4, text: "为 1 张卡牌添加 金色封蜡（打出并得分时获得 3$）" },
  { id: "deja_vu", name: "既视感", rarity: "罕见", cost: 5, text: "为 1 张手牌添加 红色封蜡（打出时分数计算效果触发两次）" },
  { id: "trance", name: "入迷", rarity: "罕见", cost: 5, text: "为 1 张手牌添加 蓝色封蜡（留在手牌直到回合结束，获得一张随机星球牌）" },
  { id: "medium", name: "灵媒", rarity: "罕见", cost: 5, text: "为 1 张手牌添加 紫色封蜡（弃牌时获得一张随机塔罗牌）" },
  { id: "ectoplasm", name: "灵质", rarity: "稀有", cost: 6, text: "为一张随机核心牌添加负片效果（+1 核心牌槽位），代价是 -1 手牌上限" },
  { id: "familiar", name: "熟知", rarity: "罕见", cost: 4, text: "随机摧毁 1 张手牌，并添加 3 张随机增强版人头牌（J、Q、K）" },
  { id: "grim", name: "严峻", rarity: "罕见", cost: 4, text: "随机摧毁 1 张手牌，并添加 2 张随机增强版 A" },
  { id: "incantation", name: "咒语", rarity: "罕见", cost: 4, text: "随机摧毁 1 张手牌，并添加 4 张随机增强版数字牌" },
  { id: "sigil", name: "符印", rarity: "罕见", cost: 5, text: "将手牌中所有卡牌的花色转换为一种随机花色" },
  { id: "ouija", name: "占卜", rarity: "稀有", cost: 6, text: "将手中所有手持牌转换为一种随机点数，但会 -1 手牌上限" },
  { id: "immolate", name: "火祭", rarity: "稀有", cost: 6, text: "随机摧毁 5 张手牌，获得 20$" },
  { id: "wraith", name: "幽灵", rarity: "传奇", cost: 7, text: "产生一张随机的稀有核心牌，但会将你的金钱清零" },
  { id: "ankh", name: "生命十字章", rarity: "传奇", cost: 7, text: "随机复制一张核心牌，然后摧毁所有其他核心牌" },
  { id: "hex", name: "妖法", rarity: "稀有", cost: 7, text: "为一张随机核心牌添加多彩（x1.5 倍率）特效，然后摧毁其他所有核心牌" },
  { id: "cryptid", name: "神秘生物", rarity: "稀有", cost: 6, text: "选择一张卡牌，将其复制 2 张" },
  { id: "soul", name: "灵魂", rarity: "传奇", cost: 8, text: "生成一张随机的传奇核心牌" },
  { id: "black_hole", name: "黑洞", rarity: "传奇", cost: 8, text: "为所有扑克牌型提升 1 个等级" },
];

const JOKER_LIBRARY = [
  {
    id: "basic_joker",
    name: "基础小丑",
    tag: "倍率",
    cost: 3,
    sell: 1,
    text: "每次结算固定 +4 倍率。",
    apply(result) {
      result.mult += 4;
      result.breakdown.push("基础小丑：+4 倍率");
    },
  },
  {
    id: "pair_joker",
    name: "机灵小丑",
    tag: "牌型",
    cost: 4,
    sell: 2,
    text: "如果本次是对子，+60 筹码。",
    apply(result) {
      if (result.handType === HAND_TYPES.PAIR) {
        result.chips += 60;
        result.breakdown.push("机灵小丑：对子 +60 筹码");
      }
    },
  },
  {
    id: "double_joker",
    name: "双影小丑",
    tag: "牌型",
    cost: 4,
    sell: 2,
    text: "如果本次是两对，+8 倍率。",
    apply(result) {
      if (result.handType === HAND_TYPES.TWO_PAIR) {
        result.mult += 8;
        result.breakdown.push("双影小丑：两对 +8 倍率");
      }
    },
  },
  {
    id: "triple_joker",
    name: "狂笑小丑",
    tag: "牌型",
    cost: 5,
    sell: 2,
    text: "如果本次是三条，+100 筹码。",
    apply(result) {
      if (result.handType === HAND_TYPES.THREE_KIND) {
        result.chips += 100;
        result.breakdown.push("狂笑小丑：三条 +100 筹码");
      }
    },
  },
  {
    id: "straight_joker",
    name: "疯转小丑",
    tag: "牌型",
    cost: 5,
    sell: 2,
    text: "如果本次是顺子，+100 筹码。",
    apply(result) {
      if (result.handType === HAND_TYPES.STRAIGHT) {
        result.chips += 100;
        result.breakdown.push("疯转小丑：顺子 +100 筹码");
      }
    },
  },
  {
    id: "flush_joker",
    name: "华彩小丑",
    tag: "牌型",
    cost: 5,
    sell: 2,
    text: "如果本次是同花，+10 倍率。",
    apply(result) {
      if (result.handType === HAND_TYPES.FLUSH) {
        result.mult += 10;
        result.breakdown.push("华彩小丑：同花 +10 倍率");
      }
    },
  },
  {
    id: "full_house_joker",
    name: "盛宴小丑",
    tag: "牌型",
    cost: 6,
    sell: 3,
    text: "如果本次是葫芦，+14 倍率。",
    apply(result) {
      if (result.handType === HAND_TYPES.FULL_HOUSE) {
        result.mult += 14;
        result.breakdown.push("盛宴小丑：葫芦 +14 倍率");
      }
    },
  },
  {
    id: "four_kind_joker",
    name: "铁幕小丑",
    tag: "牌型",
    cost: 6,
    sell: 3,
    text: "如果本次是四条，+180 筹码。",
    apply(result) {
      if (result.handType === HAND_TYPES.FOUR_KIND) {
        result.chips += 180;
        result.breakdown.push("铁幕小丑：四条 +180 筹码");
      }
    },
  },
  {
    id: "small_hand_joker",
    name: "半身小丑",
    tag: "技巧",
    cost: 5,
    sell: 2,
    text: "如果本次出牌张数不超过 3，+10 倍率。",
    apply(result) {
      if (result.selectedCount <= 3) {
        result.mult += 10;
        result.breakdown.push("半身小丑：小手牌 +10 倍率");
      }
    },
  },
  {
    id: "money_joker",
    name: "金牛小丑",
    tag: "经济",
    cost: 6,
    sell: 3,
    text: "每 2 金币额外 +8 筹码。",
    apply(result, context) {
      const bonus = Math.floor(context.money / 2) * 8;
      if (bonus > 0) {
        result.chips += bonus;
        result.breakdown.push(`金牛小丑：按金币 +${bonus} 筹码`);
      }
    },
  },
  {
    id: "discard_joker",
    name: "旗手小丑",
    tag: "资源",
    cost: 5,
    sell: 2,
    text: "按剩余弃牌次数，每次 +35 筹码。",
    apply(result, context) {
      const bonus = context.discardsRemaining * 35;
      if (bonus > 0) {
        result.chips += bonus;
        result.breakdown.push(`旗手小丑：剩余弃牌 +${bonus} 筹码`);
      }
    },
  },
  {
    id: "empty_slot_joker",
    name: "空匣小丑",
    tag: "构筑",
    cost: 4,
    sell: 2,
    text: "每个空余小丑槽位 +3 倍率。",
    apply(result, context) {
      const bonus = (MAX_JOKERS - context.jokerCount) * 3;
      if (bonus > 0) {
        result.mult += bonus;
        result.breakdown.push(`空匣小丑：空槽位 +${bonus} 倍率`);
      }
    },
  },
];

const els = {
  handArea: document.getElementById("handArea"),
  jokerArea: document.getElementById("jokerArea"),
  shopArea: document.getElementById("shopArea"),
  shopMoneyValue: document.getElementById("shopMoneyValue"),
  levelArea: document.getElementById("levelArea"),
  anteValue: document.getElementById("anteValue"),
  blindValue: document.getElementById("blindValue"),
  targetValue: document.getElementById("targetValue"),
  scoreValue: document.getElementById("scoreValue"),
  moneyValue: document.getElementById("moneyValue"),
  handsValue: document.getElementById("handsValue"),
  discardsValue: document.getElementById("discardsValue"),
  deckValue: document.getElementById("deckValue"),
  handTypeValue: document.getElementById("handTypeValue"),
  calcValue: document.getElementById("calcValue"),
  roundGainValue: document.getElementById("roundGainValue"),
  scorePreview: document.getElementById("scorePreview"),
  blindTitle: document.getElementById("blindTitle"),
  bossRuleValue: document.getElementById("bossRuleValue"),
  jokerSlotValue: document.getElementById("jokerSlotValue"),
  resultTitle: document.getElementById("resultTitle"),
  resultText: document.getElementById("resultText"),
  victoryRewardPanel: document.getElementById("victoryRewardPanel"),
  rankRewardGrid: document.getElementById("rankRewardGrid"),
  rankRewardStatus: document.getElementById("rankRewardStatus"),
  resultStats: document.getElementById("resultStats"),
  resultModal: document.getElementById("resultModal"),
  resultRestartBtn: document.getElementById("resultRestartBtn"),
  helpModal: document.getElementById("helpModal"),
  closeResultBtn: document.getElementById("closeResultBtn"),
  helpTopBtn: document.getElementById("helpTopBtn"),
  helpBtn: document.getElementById("helpBtn"),
  closeHelpBtn: document.getElementById("closeHelpBtn"),
  logArea: document.getElementById("logArea"),
  newRunBtn: document.getElementById("newRunBtn"),
  clearSaveBtn: document.getElementById("clearSaveBtn"),
  sortRankBtn: document.getElementById("sortRankBtn"),
  sortSuitBtn: document.getElementById("sortSuitBtn"),
  discardBtn: document.getElementById("discardBtn"),
  playBtn: document.getElementById("playBtn"),
  refreshShopBtn: document.getElementById("refreshShopBtn"),
  closeShopBtn: document.getElementById("closeShopBtn"),
  shopModal: document.getElementById("shopModal"),
  consumableArea: document.getElementById("consumableArea"),
  cardTemplate: document.getElementById("cardTemplate"),
  jokerTemplate: document.getElementById("jokerTemplate"),
  shopTemplate: document.getElementById("shopTemplate"),
};

const state = {};

function resetStateForTest(overrides = {}) {
  for (const key of Object.keys(state)) {
    delete state[key];
  }
  Object.assign(state, {
    money: 0,
    blindIndex: 0,
    scoreCurrent: 0,
    handsRemaining: BASE_HANDS,
    discardsRemaining: BASE_DISCARDS,
    drawPile: [],
    discardPile: [],
    handCards: [],
    selectedIds: new Set(),
    logs: [],
    jokers: [],
    planetInventory: [],
    tarotInventory: [],
    spectralInventory: [],
    shopItems: [],
    phase: "playing",
    completedBlind: false,
    playedHandTypesThisBlind: [],
    handLevels: createDefaultHandLevels(),
    handLimitBonus: 0,
    extraJokerSlots: 0,
    rankChipMultipliers: createDefaultRankChipMultipliers(),
    victoryRewardClaimed: false,
    victoryRewardRank: null,
    lastConsumableUse: null,
    outcome: null,
    ...overrides,
  });
  if (!(state.selectedIds instanceof Set)) {
    state.selectedIds = new Set(state.selectedIds || []);
  }
  if (!state.rankChipMultipliers) {
    state.rankChipMultipliers = createDefaultRankChipMultipliers();
  }
  if (!state.handLevels) {
    state.handLevels = createDefaultHandLevels();
  }
}

function syncModalScrollLock() {
  const modalOpen = !els.shopModal.hidden || !els.resultModal.hidden || !els.helpModal.hidden;
  document.documentElement.classList.toggle("modal-open", modalOpen);
  document.body.classList.toggle("modal-open", modalOpen);
}

function getUnlockedRankKeys() {
  return RANKS.filter((rank) => getRankChipMultiplier(rank.key) < 2).map((rank) => rank.key);
}

function applyPermanentRankUpgrade(rankKey) {
  if (!state.rankChipMultipliers) {
    state.rankChipMultipliers = createDefaultRankChipMultipliers();
  }
  if (getRankChipMultiplier(rankKey) >= 2) return false;
  state.rankChipMultipliers[rankKey] = 2;
  refreshCardsForRank(rankKey);
  return true;
}

function claimVictoryRankReward(rankKey) {
  if (state.outcome !== "win" || state.victoryRewardClaimed) return;
  if (!applyPermanentRankUpgrade(rankKey)) return;
  state.victoryRewardClaimed = true;
  state.victoryRewardRank = rankKey;
  addLog(`通关奖励：${rankKey} 的初始筹码永久翻倍。`);
  render();
}

function renderVictoryRewardPanel() {
  if (!els.victoryRewardPanel || !els.rankRewardGrid || !els.rankRewardStatus) return;
  const isVictory = state.outcome === "win";
  els.victoryRewardPanel.hidden = !isVictory;
  els.rankRewardGrid.innerHTML = "";
  if (!isVictory) {
    if (els.resultRestartBtn) {
      els.resultRestartBtn.disabled = false;
    }
    if (els.closeResultBtn) {
      els.closeResultBtn.disabled = false;
    }
    return;
  }

  const availableRanks = getUnlockedRankKeys();
  const claimed = Boolean(state.victoryRewardClaimed);
  if (availableRanks.length === 0) {
    els.rankRewardStatus.textContent = "所有点数都已经永久翻倍。";
  } else if (claimed) {
    els.rankRewardStatus.textContent = state.victoryRewardRank
      ? `已选择 ${state.victoryRewardRank}，新的对局会永久生效。`
      : "本次通关奖励已领取。";
  } else {
    els.rankRewardStatus.textContent = "请选择一种点数，完成本次通关奖励。";
  }

  for (const rank of RANKS) {
    const multiplier = getRankChipMultiplier(rank.key);
    const button = document.createElement("button");
    button.className = "rank-reward-btn";
    button.type = "button";
    button.disabled = multiplier >= 2 || claimed;
    if (state.victoryRewardRank === rank.key) {
      button.classList.add("is-selected");
    }
    button.innerHTML = `
      <strong>${rank.key}</strong>
      <span>${multiplier >= 2 ? "已翻倍" : `x${multiplier} → x${multiplier * 2}`}</span>
      <small>${getRankDefinition(rank.key).chips} 基础筹码</small>
    `;
    if (!button.disabled) {
      button.addEventListener("click", () => claimVictoryRankReward(rank.key));
    }
    els.rankRewardGrid.appendChild(button);
  }

  if (els.resultRestartBtn) {
    els.resultRestartBtn.disabled = availableRanks.length > 0 && !claimed;
  }
  if (els.closeResultBtn) {
    els.closeResultBtn.disabled = availableRanks.length > 0 && !claimed;
  }
}

function getJokerRarity(id) {
  const rarityMap = {
    basic_joker: "普通",
    pair_joker: "普通",
    double_joker: "罕见",
    small_hand_joker: "罕见",
    triple_joker: "罕见",
    straight_joker: "罕见",
    flush_joker: "稀有",
    discard_joker: "稀有",
    money_joker: "稀有",
    full_house_joker: "稀有",
    four_kind_joker: "传奇",
    empty_slot_joker: "传奇",
  };
  return rarityMap[id] || "普通";
}

function getPlanetRarity(id) {
  const rarityMap = {
    pluto: "普通",
    mercury: "普通",
    uranus: "普通",
    venus: "普通",
    saturn: "罕见",
    jupiter: "罕见",
    earth: "稀有",
    mars: "稀有",
    neptune: "传奇",
  };
  return rarityMap[id] || "普通";
}

function getTarotRarity(id) {
  const rarityMap = Object.fromEntries(TAROT_LIBRARY.map((item) => [item.id, item.rarity]));
  return rarityMap[id] || "普通";
}

function getSpectralRarity(id) {
  const rarityMap = Object.fromEntries(SPECTRAL_LIBRARY.map((item) => [item.id, item.rarity]));
  return rarityMap[id] || "普通";
}

function getRarityClass(rarity) {
  return {
    "普通": "rarity-common",
    "罕见": "rarity-uncommon",
    "稀有": "rarity-rare",
    "传奇": "rarity-legendary",
  }[rarity] || "rarity-common";
}

function sampleTarots(count) {
  return shuffle(TAROT_LIBRARY).slice(0, count).map((item) => ({ ...item, ownedId: `${item.id}-${Math.random().toString(36).slice(2, 9)}` }));
}

function sampleSpectrals(count) {
  return shuffle(SPECTRAL_LIBRARY).slice(0, count).map((item) => ({ ...item, ownedId: `${item.id}-${Math.random().toString(36).slice(2, 9)}` }));
}

function createOwnedConsumable(item) {
  return { ...item, ownedId: `${item.id}-${Math.random().toString(36).slice(2, 9)}` };
}

function getInventoryForKind(kind) {
  if (kind === "planet") return state.planetInventory;
  if (kind === "tarot") return state.tarotInventory;
  if (kind === "spectral") return state.spectralInventory;
  return [];
}

function findInventoryItem(kind, ownedId) {
  return getInventoryForKind(kind).find((item) => item.ownedId === ownedId);
}

function removeInventoryItem(kind, ownedId) {
  const inventory = getInventoryForKind(kind);
  const index = inventory.findIndex((item) => item.ownedId === ownedId);
  if (index < 0) return null;
  return inventory.splice(index, 1)[0];
}

function addConsumableToInventory(item) {
  const owned = createOwnedConsumable(item);
  getInventoryForKind(item.kind).push(owned);
  return owned;
}

function getRandomJoker(filterFn = () => true) {
  const pool = state.jokers.filter((joker) => filterFn(joker));
  return pickRandom(pool);
}

function getRandomJokerByRarity(rarity) {
  return pickRandom(JOKER_LIBRARY.filter((joker) => getJokerEffectiveRarity(joker) === rarity));
}

function canAddJoker() {
  return state.jokers.length < getJokerLimit();
}

function addJokerToState(definition, { edition } = {}) {
  if (state.jokers.length >= getJokerLimit()) return null;
  const joker = cloneJoker(definition);
  if (edition) joker.edition = edition;
  state.jokers.push(joker);
  return joker;
}

function spawnRareJokerToState() {
  if (!canAddJoker()) return null;
  const rarePool = JOKER_LIBRARY.filter((joker) => getJokerEffectiveRarity(joker) === "稀有");
  const joker = pickRandom(rarePool.length > 0 ? rarePool : JOKER_LIBRARY);
  if (!joker) return null;
  return addJokerToState(joker);
}

function setJokerEdition(joker, edition) {
  joker.edition = edition || null;
}

function getJokerScoreBonus(joker) {
  const bonus = HELD_SCORE_MULTIPLIERS[joker.edition] || HELD_SCORE_MULTIPLIERS.base;
  return bonus;
}

function addRandomPlanetToInventory(count = 1) {
  const planets = shuffle(PLANET_LIBRARY).slice(0, count);
  for (const planet of planets) {
    addConsumableToInventory({ ...planet, kind: "planet" });
  }
  return planets.length;
}

function addRandomTarotToInventory(count = 1) {
  const tarots = shuffle(TAROT_LIBRARY).slice(0, count);
  for (const tarot of tarots) {
    addConsumableToInventory({ ...tarot, kind: "tarot" });
  }
  return tarots.length;
}

function addRandomSpectralToInventory(count = 1) {
  const spectrals = shuffle(SPECTRAL_LIBRARY).slice(0, count);
  for (const spectral of spectrals) {
    addConsumableToInventory({ ...spectral, kind: "spectral" });
  }
  return spectrals.length;
}

function applyPlanetEffect(planet, { recordLastUse = true } = {}) {
  const levelState = state.handLevels[planet.targetHand];
  if (!levelState) return false;
  levelState.level += 1;
  levelState.chipsBonus += 10;
  levelState.multBonus += 1;
  if (recordLastUse) {
    state.lastConsumableUse = { kind: "planet", id: planet.id };
  }
  addLog(`${planet.name} 生效，${planet.targetHand} 升到 ${levelState.level} 级。`);
  return true;
}

function applyPlanetById(planetId, options = {}) {
  const planet = PLANET_LIBRARY.find((item) => item.id === planetId);
  if (!planet) return false;
  return applyPlanetEffect(planet, options);
}

function getTargetsFromHand(count, { random = false } = {}) {
  if (state.handCards.length === 0 || count <= 0) return [];
  if (random) {
    const pool = [...state.handCards];
    const targets = [];
    while (pool.length > 0 && targets.length < count) {
      const index = Math.floor(Math.random() * pool.length);
      targets.push(pool.splice(index, 1)[0]);
    }
    return targets;
  }
  const selected = getSelectedCards();
  const targets = [];
  for (const card of selected) {
    if (targets.length >= count) break;
    targets.push(card);
  }
  for (const card of state.handCards) {
    if (targets.length >= count) break;
    if (!targets.some((item) => item.id === card.id)) targets.push(card);
  }
  return targets.slice(0, count);
}

function destroyHandCards(cards) {
  if (!cards || cards.length === 0) return [];
  const ids = cards.map((card) => card.id);
  removeCardsEverywhere(ids);
  return cards;
}

function addCardsToHandAndReport(cards, message) {
  if (!cards || cards.length === 0) return;
  addCardsToHand(cards);
  if (message) addLog(message);
}

function addRandomEnhancedCards({ count, rankPool }) {
  const cards = [];
  for (let i = 0; i < count; i += 1) {
    cards.push(createRandomEnhancedCard(rankPool));
  }
  addCardsToHand(cards);
  return cards;
}

function setAllHandCardsSuit(suitKey) {
  for (const card of state.handCards) {
    setCardSuit(card, suitKey);
  }
}

function setAllHandCardsRank(rankKey) {
  for (const card of state.handCards) {
    const rank = getRankDefinition(rankKey);
    card.rank = rank.key;
    card.rankValue = rank.value;
    card.chips = getRankStartingChips(rank.key);
    card.face = rank.face;
  }
}

function upgradeAllHandLevels() {
  for (const handType of HAND_TYPE_ORDER) {
    const levelState = state.handLevels[handType];
    levelState.level += 1;
    levelState.chipsBonus += 10;
    levelState.multBonus += 1;
  }
}

function copyHandCard(card) {
  return cloneCard(card);
}

const TAROT_EFFECTS = {
  pope(item) {
    const targets = getTargetsFromHand(2);
    if (targets.length === 0) return false;
    for (const card of targets) {
      setCardEnhancement(card, "bonus");
    }
    addLog(`${item.name}：${targets.length} 张手牌变为奖励牌。`);
    return true;
  },
  empress(item) {
    const targets = getTargetsFromHand(2);
    if (targets.length === 0) return false;
    for (const card of targets) {
      setCardEnhancement(card, "mult");
    }
    addLog(`${item.name}：${targets.length} 张手牌变为倍率牌。`);
    return true;
  },
  lovers(item) {
    const targets = getTargetsFromHand(1);
    if (targets.length === 0) return false;
    setCardEnhancement(targets[0], "wild");
    addLog(`${item.name}：${targets[0].rank} 变为万能牌。`);
    return true;
  },
  justice(item) {
    const targets = getTargetsFromHand(1);
    if (targets.length === 0) return false;
    setCardEnhancement(targets[0], "glass");
    addLog(`${item.name}：1 张手牌变为玻璃牌。`);
    return true;
  },
  chariot(item) {
    const targets = getTargetsFromHand(1);
    if (targets.length === 0) return false;
    setCardEnhancement(targets[0], "steel");
    addLog(`${item.name}：1 张手牌变为钢铁牌。`);
    return true;
  },
  tower(item) {
    const targets = getTargetsFromHand(1);
    if (targets.length === 0) return false;
    setCardEnhancement(targets[0], "stone");
    addLog(`${item.name}：1 张手牌变为石头牌。`);
    return true;
  },
  devil(item) {
    const targets = getTargetsFromHand(1);
    if (targets.length === 0) return false;
    setCardEnhancement(targets[0], "gold");
    addLog(`${item.name}：1 张手牌变为黄金牌。`);
    return true;
  },
  magician(item) {
    const targets = getTargetsFromHand(1);
    if (targets.length === 0) return false;
    setCardEnhancement(targets[0], "lucky");
    addLog(`${item.name}：1 张手牌变为幸运牌。`);
    return true;
  },
  death(item) {
    const targets = getTargetsFromHand(2);
    if (targets.length < 2) return false;
    const [leftCard, rightCard] = targets;
    const clone = copyHandCard(leftCard);
    Object.assign(rightCard, clone, { id: rightCard.id });
    addLog(`${item.name}：已复制左侧牌到右侧牌。`);
    return true;
  },
  strength(item) {
    const targets = getTargetsFromHand(2);
    const upgraded = [];
    for (const card of targets) {
      if (upgradeCardRank(card)) upgraded.push(card);
    }
    if (upgraded.length === 0) return false;
    addLog(`${item.name}：提升了 ${upgraded.length} 张牌的点数。`);
    return true;
  },
  hanged_man(item) {
    const targets = getTargetsFromHand(2);
    if (targets.length === 0) return false;
    destroyHandCards(targets);
    addLog(`${item.name}：摧毁了 ${targets.length} 张牌。`);
    return true;
  },
  world(item) {
    const targets = getTargetsFromHand(3);
    if (targets.length === 0) return false;
    for (const card of targets) setCardSuit(card, "spades");
    addLog(`${item.name}：${targets.length} 张牌变为黑桃。`);
    return true;
  },
  sun(item) {
    const targets = getTargetsFromHand(3);
    if (targets.length === 0) return false;
    for (const card of targets) setCardSuit(card, "hearts");
    addLog(`${item.name}：${targets.length} 张牌变为红桃。`);
    return true;
  },
  moon(item) {
    const targets = getTargetsFromHand(3);
    if (targets.length === 0) return false;
    for (const card of targets) setCardSuit(card, "clubs");
    addLog(`${item.name}：${targets.length} 张牌变为梅花。`);
    return true;
  },
  star(item) {
    const targets = getTargetsFromHand(3);
    if (targets.length === 0) return false;
    for (const card of targets) setCardSuit(card, "diamonds");
    addLog(`${item.name}：${targets.length} 张牌变为方块。`);
    return true;
  },
  judgement(item) {
    const joker = pickRandom(JOKER_LIBRARY);
    if (!joker) return false;
    if (state.jokers.length >= getJokerLimit()) {
      addLog("核心牌槽位已满，无法生成核心牌。");
      return false;
    }
    addJokerToState(joker);
    addLog(`${item.name}：生成了 ${joker.name}。`);
    return true;
  },
  high_priestess(item) {
    const generated = addRandomPlanetToInventory(2);
    if (generated === 0) return false;
    addLog(`${item.name}：生成了 ${generated} 张星球牌。`);
    return true;
  },
  emperor(item) {
    const generated = addRandomTarotToInventory(2);
    if (generated === 0) return false;
    addLog(`${item.name}：生成了 ${generated} 张塔罗牌。`);
    return true;
  },
  temperance(item) {
    const totalSell = state.jokers.reduce((sum, joker) => sum + (joker.sell || 0), 0);
    if (totalSell <= 0) return false;
    state.money += totalSell;
    addLog(`${item.name}：获得了 ${totalSell} 金币。`);
    return true;
  },
  hermit(item) {
    const before = state.money;
    state.money = Math.min(20, state.money * 2);
    if (state.money === before) return false;
    addLog(`${item.name}：金币翻倍至 ${state.money}。`);
    return true;
  },
  wheel_of_fortune(item) {
    if (Math.random() >= 0.25) return false;
    const joker = getRandomJoker();
    if (!joker) return false;
    const edition = pickRandom(["foil", "holo", "polychrome"]);
    setJokerEdition(joker, edition);
    addLog(`${item.name}：${joker.name} 获得了 ${getJokerEditionLabel(edition)}。`);
    return true;
  },
  fool(item) {
    const last = state.lastConsumableUse;
    if (!last || last.id === "fool") return false;
    if (last.kind === "planet") {
      const copied = applyPlanetById(last.id, { recordLastUse: false });
      if (!copied) return false;
      addLog(`${item.name}：复制了上一张星球牌。`);
      return true;
    }
    if (last.kind !== "tarot") return false;
    const definition = TAROT_LIBRARY.find((entry) => entry.id === last.id);
    if (!definition) return false;
    addConsumableToInventory({ ...definition, kind: "tarot" });
    addLog(`${item.name}：复制了上一张塔罗牌。`);
    return true;
  },
};

const SPECTRAL_EFFECTS = {
  aura(item) {
    const target = getTargetsFromHand(1)[0];
    if (!target) return false;
    setCardEdition(target, pickRandom(["foil", "holo", "polychrome"]));
    addLog(`${item.name}：为一张牌添加了随机效果。`);
    return true;
  },
  talisman(item) {
    const target = getTargetsFromHand(1)[0];
    if (!target) return false;
    setCardSeal(target, "gold");
    addLog(`${item.name}：为一张牌添加了金色封蜡。`);
    return true;
  },
  deja_vu(item) {
    const target = getTargetsFromHand(1)[0];
    if (!target) return false;
    setCardSeal(target, "red");
    addLog(`${item.name}：为一张牌添加了红色封蜡。`);
    return true;
  },
  trance(item) {
    const target = getTargetsFromHand(1)[0];
    if (!target) return false;
    setCardSeal(target, "blue");
    addLog(`${item.name}：为一张牌添加了蓝色封蜡。`);
    return true;
  },
  medium(item) {
    const target = getTargetsFromHand(1)[0];
    if (!target) return false;
    setCardSeal(target, "purple");
    addLog(`${item.name}：为一张牌添加了紫色封蜡。`);
    return true;
  },
  ectoplasm(item) {
    const joker = getRandomJoker();
    if (!joker) return false;
    setJokerEdition(joker, "negative");
    state.extraJokerSlots += 1;
    state.handLimitBonus -= 1;
    addLog(`${item.name}：${joker.name} 获得了负片效果。`);
    return true;
  },
  familiar(item) {
    const removed = removeRandomHandCards(1);
    if (removed.length === 0) return false;
    addRandomEnhancedCards({ count: 3, rankPool: RANKS.filter((rank) => rank.face) });
    addLog(`${item.name}：摧毁 1 张手牌并补充 3 张人头牌。`);
    return true;
  },
  grim(item) {
    const removed = removeRandomHandCards(1);
    if (removed.length === 0) return false;
    addRandomEnhancedCards({ count: 2, rankPool: [getRankDefinition("A")] });
    addLog(`${item.name}：摧毁 1 张手牌并补充 2 张 A。`);
    return true;
  },
  incantation(item) {
    const removed = removeRandomHandCards(1);
    if (removed.length === 0) return false;
    addRandomEnhancedCards({ count: 4, rankPool: RANKS.filter((rank) => !rank.face) });
    addLog(`${item.name}：摧毁 1 张手牌并补充 4 张数字牌。`);
    return true;
  },
  sigil(item) {
    const suit = pickRandom(SUITS);
    if (!suit) return false;
    setAllHandCardsSuit(suit.key);
    addLog(`${item.name}：全手牌花色变为${suit.name}。`);
    return true;
  },
  ouija(item) {
    const rank = pickRandom(RANKS);
    if (!rank) return false;
    setAllHandCardsRank(rank.key);
    state.handLimitBonus -= 1;
    addLog(`${item.name}：全手牌点数变为 ${rank.key}，手牌上限 -1。`);
    return true;
  },
  immolate(item) {
    const removed = removeRandomHandCards(5);
    if (removed.length === 0) return false;
    state.money += 20;
    addLog(`${item.name}：摧毁了 ${removed.length} 张手牌，获得 20 金币。`);
    return true;
  },
  wraith(item) {
    const spawned = spawnRareJokerToState();
    if (!spawned) {
      addLog("核心牌槽位已满，无法使用幽灵。");
      return false;
    }
    state.money = 0;
    addLog(`${item.name}：生成了一张稀有核心牌，金币清零。`);
    return true;
  },
  ankh(item) {
    const joker = getRandomJoker();
    if (!joker) return false;
    const clone = cloneJoker(joker);
    state.jokers = [joker, clone];
    addLog(`${item.name}：复制了一张核心牌，其余核心牌已摧毁。`);
    return true;
  },
  hex(item) {
    const joker = getRandomJoker();
    if (!joker) return false;
    setJokerEdition(joker, "polychrome");
    state.jokers = [joker];
    addLog(`${item.name}：为随机核心牌添加多彩效果，其余核心牌已摧毁。`);
    return true;
  },
  cryptid(item) {
    const target = getTargetsFromHand(1)[0];
    if (!target) return false;
    addCardsToHand([copyHandCard(target), copyHandCard(target)]);
    addLog(`${item.name}：复制了 2 张卡牌。`);
    return true;
  },
  soul(item) {
    const pool = JOKER_LIBRARY.filter((joker) => getJokerEffectiveRarity(joker) === "传奇");
    const joker = pickRandom(pool);
    if (!joker) return false;
    if (state.jokers.length >= getJokerLimit()) {
      addLog("核心牌槽位已满，无法生成传奇核心牌。");
      return false;
    }
    addJokerToState(joker);
    addLog(`${item.name}：生成了一张传奇核心牌。`);
    return true;
  },
  black_hole(item) {
    upgradeAllHandLevels();
    addLog(`${item.name}：所有扑克牌型等级 +1。`);
    return true;
  },
};

function buildBlinds() {
  const list = [];
  ANTE_TARGETS.forEach((target, index) => {
    const ante = index + 1;
    const bossRule = BOSS_RULES[index];
    list.push({ ante, type: "小盲注", target: target.small, reward: 3, bossRule: null, bossRuleText: "无特殊限制" });
    list.push({ ante, type: "大盲注", target: target.big, reward: 4, bossRule: null, bossRuleText: "无特殊限制" });
    let bossTarget = target.boss;
    if (bossRule.key === "highTarget") bossTarget = Math.floor(target.boss * 1.5);
    if (bossRule.key === "finalBoss") bossTarget = Math.floor(target.boss * 1.8);
    list.push({
      ante,
      type: "头目盲注",
      target: bossTarget,
      reward: 5,
      bossRule: bossRule.key,
      bossRuleName: bossRule.name,
      bossRuleText: `${bossRule.name}：${bossRule.text}`,
    });
  });
  return list;
}

const BLINDS = buildBlinds();

function createDefaultHandLevels() {
  return HAND_TYPE_ORDER.reduce((acc, handType) => {
    acc[handType] = { level: 1, chipsBonus: 0, multBonus: 0 };
    return acc;
  }, {});
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function cloneJoker(joker) {
  return { ...joker, ownedId: `${joker.id}-${Math.random().toString(36).slice(2, 9)}` };
}

function clonePlanet(planet) {
  return { ...planet, ownedId: `${planet.id}-${Math.random().toString(36).slice(2, 9)}` };
}

function sampleJokers(count) {
  return shuffle(JOKER_LIBRARY).slice(0, count).map(cloneJoker);
}

function samplePlanets(count) {
  return shuffle(PLANET_LIBRARY).slice(0, count).map(clonePlanet);
}

function makeDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(rank.key, suit.key));
    }
  }
  return shuffle(deck);
}

function addLog(text) {
  state.logs.unshift(text);
  state.logs = state.logs.slice(0, 10);
}

function serializeState() {
  const plain = {
    money: state.money,
    blindIndex: state.blindIndex,
    scoreCurrent: state.scoreCurrent,
    handsRemaining: state.handsRemaining,
    discardsRemaining: state.discardsRemaining,
    drawPile: state.drawPile,
    discardPile: state.discardPile,
    handCards: state.handCards,
    selectedIds: [...state.selectedIds],
    logs: state.logs,
    jokers: state.jokers,
    planetInventory: state.planetInventory,
    tarotInventory: state.tarotInventory,
    spectralInventory: state.spectralInventory,
    shopItems: state.shopItems,
    phase: state.phase,
    completedBlind: state.completedBlind,
    playedHandTypesThisBlind: state.playedHandTypesThisBlind,
    handLevels: state.handLevels,
    handLimitBonus: state.handLimitBonus,
    extraJokerSlots: state.extraJokerSlots,
    rankChipMultipliers: state.rankChipMultipliers,
    victoryRewardClaimed: state.victoryRewardClaimed,
    victoryRewardRank: state.victoryRewardRank,
    lastConsumableUse: state.lastConsumableUse,
    outcome: state.outcome,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
}

function hydrateState(saved) {
  state.money = saved.money ?? 4;
  state.blindIndex = saved.blindIndex ?? 0;
  state.scoreCurrent = saved.scoreCurrent ?? 0;
  state.handsRemaining = saved.handsRemaining ?? BASE_HANDS;
  state.discardsRemaining = saved.discardsRemaining ?? BASE_DISCARDS;
  state.drawPile = saved.drawPile || [];
  state.discardPile = saved.discardPile || [];
  state.handCards = saved.handCards || [];
  state.selectedIds = new Set(saved.selectedIds || []);
  state.logs = saved.logs || [];
  state.jokers = saved.jokers || [];
  state.planetInventory = saved.planetInventory || [];
  state.tarotInventory = saved.tarotInventory || [];
  state.spectralInventory = saved.spectralInventory || [];
  state.shopItems = saved.shopItems || [];
  state.phase = saved.phase || "playing";
  state.completedBlind = Boolean(saved.completedBlind);
  state.playedHandTypesThisBlind = saved.playedHandTypesThisBlind || [];
  state.handLevels = saved.handLevels || createDefaultHandLevels();
  state.handLimitBonus = saved.handLimitBonus || 0;
  state.extraJokerSlots = saved.extraJokerSlots || 0;
  state.rankChipMultipliers = { ...createDefaultRankChipMultipliers(), ...(saved.rankChipMultipliers || {}) };
  state.victoryRewardClaimed = Boolean(saved.victoryRewardClaimed);
  state.victoryRewardRank = saved.victoryRewardRank || null;
  state.lastConsumableUse = saved.lastConsumableUse || null;
  state.outcome = saved.outcome || null;
}

function getCurrentBlind() {
  return BLINDS[state.blindIndex] || BLINDS[BLINDS.length - 1];
}

function drawToLimit() {
  while (state.handCards.length < getHandLimit()) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) break;
      state.drawPile = shuffle(state.discardPile);
      state.discardPile = [];
      addLog("弃牌堆已洗回牌堆。");
    }
    state.handCards.push(state.drawPile.pop());
  }
}

function resetBlindState() {
  const blind = getCurrentBlind();
  state.scoreCurrent = 0;
  state.handsRemaining = blind.bossRule === "singlePlay" ? 1 : BASE_HANDS;
  state.discardsRemaining = blind.bossRule === "noDiscard" || blind.bossRule === "finalBoss" ? 0 : BASE_DISCARDS;
  state.drawPile = makeDeck();
  state.discardPile = [];
  state.handCards = [];
  state.selectedIds = new Set();
  state.completedBlind = false;
  state.playedHandTypesThisBlind = [];
  state.phase = "playing";
  state.outcome = null;
  drawToLimit();
}

function getBlindInterest() {
  return Math.min(5, Math.floor(state.money / 5));
}

function openShop() {
  state.phase = "shop";
  state.shopItems = [
    ...sampleJokers(2).map((item) => ({ ...item, kind: "joker" })),
    ...samplePlanets(1).map((item) => ({ ...item, kind: "planet" })),
    ...sampleTarots(1).map((item) => ({ ...item, kind: "tarot" })),
    ...sampleSpectrals(1).map((item) => ({ ...item, kind: "spectral" })),
  ];
}

function advanceToNextBlind() {
  if (state.blindIndex >= BLINDS.length - 1) {
    showOutcome("win");
    return;
  }
  state.blindIndex += 1;
  resetBlindState();
  const blind = getCurrentBlind();
  addLog(`进入第 ${blind.ante} 底注阶段的 ${blind.type}。`);
}

function leaveShop() {
  const interest = getBlindInterest();
  if (interest > 0) {
    state.money += interest;
    addLog(`获得利息 ${interest} 金币。`);
  }
  advanceToNextBlind();
  render();
}

function createShopEntry(entry) {
  if (entry.kind === "joker") return entry;
  return entry;
}

function startRun() {
  state.rankChipMultipliers = state.rankChipMultipliers || createDefaultRankChipMultipliers();
  state.money = 4;
  state.blindIndex = 0;
  state.logs = [];
  state.jokers = [];
  state.planetInventory = [];
  state.tarotInventory = [];
  state.spectralInventory = [];
  state.shopItems = [];
  state.handLevels = createDefaultHandLevels();
  state.handLimitBonus = 0;
  state.extraJokerSlots = 0;
  state.lastConsumableUse = null;
  state.victoryRewardClaimed = false;
  state.victoryRewardRank = null;
  resetBlindState();
  addLog("新的一局已开始。");
  render();
}

function initGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      hydrateState(JSON.parse(saved));
      addLog("已恢复上一次的对局。");
      render();
      return;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  startRun();
}

function sortHand(compareFn) {
  state.handCards.sort(compareFn);
  render();
}

function toggleSelect(cardId) {
  if (state.phase !== "playing" || state.outcome) return;
  if (state.selectedIds.has(cardId)) {
    state.selectedIds.delete(cardId);
  } else {
    const limit = getCurrentBlind().bossRule === "maxFourCards" ? 4 : SELECT_LIMIT;
    if (state.selectedIds.size >= limit) return;
    state.selectedIds.add(cardId);
  }
  render();
}

function getSelectedCards() {
  return state.handCards.filter((card) => state.selectedIds.has(card.id));
}

function countBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

function getStraightHigh(values) {
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length !== 5) return null;
  const wheel = [2, 3, 4, 5, 14];
  if (wheel.every((value, index) => unique[index] === value)) return 5;
  for (let i = 1; i < unique.length; i += 1) {
    if (unique[i] !== unique[0] + i) return null;
  }
  return unique[4];
}

function getFaceChips(scoreCards, blind) {
  if (blind.bossRule === "faceCardsDebuff") {
    return scoreCards.reduce((sum, card) => sum + (card.face ? 0 : card.chips), 0);
  }
  return scoreCards.reduce((sum, card) => sum + (card.enhancement === "stone" ? 0 : card.chips), 0);
}

function evaluateHand(cards) {
  if (cards.length === 0) {
    return {
      handType: "未选择",
      scoreCards: [],
      baseChips: 0,
      baseMult: 0,
      totalChips: 0,
      totalScore: 0,
      moneyGain: 0,
      breakdown: [],
      selectedCount: 0,
      chips: 0,
      mult: 0,
    };
  }

  const regularCards = cards.filter((card) => card.enhancement !== "stone");
  const values = regularCards.map((card) => card.rankValue).sort((a, b) => b - a);
  const rankCounts = [...countBy(regularCards, (card) => card.rankValue).entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });
  const wildCount = regularCards.filter((card) => card.enhancement === "wild").length;
  const suitCounts = countBy(regularCards.filter((card) => card.enhancement !== "wild"), (card) => card.suit);
  const suitTotals = [...suitCounts.values()];
  const maxSuitCount = suitTotals.length > 0 ? Math.max(...suitTotals) : 0;
  const isFlush = cards.length === 5 && regularCards.length === 5 && maxSuitCount + wildCount === 5;
  const straightHigh = getStraightHigh(values);
  const isStraight = cards.length === 5 && regularCards.length === 5 && straightHigh !== null;

  let handType = HAND_TYPES.HIGH_CARD;
  let scoreCards = [...cards].sort((a, b) => b.rankValue - a.rankValue).slice(0, 1);

  if (isStraight && isFlush) {
    handType = HAND_TYPES.STRAIGHT_FLUSH;
    scoreCards = [...cards];
  } else if (rankCounts[0]?.[1] === 4) {
    handType = HAND_TYPES.FOUR_KIND;
    scoreCards = cards.filter((card) => card.rankValue === rankCounts[0][0]);
  } else if (rankCounts[0]?.[1] === 3 && rankCounts[1]?.[1] === 2) {
    handType = HAND_TYPES.FULL_HOUSE;
    scoreCards = [...cards];
  } else if (isFlush) {
    handType = HAND_TYPES.FLUSH;
    scoreCards = [...cards];
  } else if (isStraight) {
    handType = HAND_TYPES.STRAIGHT;
    scoreCards = [...cards];
  } else if (rankCounts[0]?.[1] === 3) {
    handType = HAND_TYPES.THREE_KIND;
    scoreCards = cards.filter((card) => card.rankValue === rankCounts[0][0]);
  } else if (rankCounts[0]?.[1] === 2 && rankCounts[1]?.[1] === 2) {
    handType = HAND_TYPES.TWO_PAIR;
    const pairRanks = [rankCounts[0][0], rankCounts[1][0]];
    scoreCards = cards.filter((card) => pairRanks.includes(card.rankValue));
  } else if (rankCounts[0]?.[1] === 2) {
    handType = HAND_TYPES.PAIR;
    scoreCards = cards.filter((card) => card.rankValue === rankCounts[0][0]);
  }

  const handLevel = state.handLevels[handType] || { chipsBonus: 0, multBonus: 0, level: 1 };
  const scoreBase = HAND_SCORES[handType];
  const blind = getCurrentBlind();
  const faceChips = getFaceChips(scoreCards, blind);
  const scoreCardEffects = scoreCards.map((card) => getScoreCardEffects(card));
  const bonusChips = scoreCardEffects.reduce((sum, item) => sum + item.chips, 0);
  const bonusMult = scoreCardEffects.reduce((sum, item) => sum + item.mult, 0);
  const bonusMultiplier = scoreCardEffects.reduce((mult, item) => mult * item.multiplier, 1);
  const moneyGain = scoreCardEffects.reduce((sum, item) => sum + item.money, 0);
  const heldSteelCount = state.handCards.filter((card) => card.enhancement === "steel" && !state.selectedIds.has(card.id)).length;
  const steelMultiplier = heldSteelCount > 0 ? Math.pow(1.5, heldSteelCount) : 1;
  const result = {
    handType,
    scoreCards,
    baseChips: scoreBase.chips + handLevel.chipsBonus,
    baseMult: scoreBase.mult + handLevel.multBonus,
    chips: scoreBase.chips + handLevel.chipsBonus + faceChips + bonusChips,
    mult: (scoreBase.mult + handLevel.multBonus + bonusMult) * bonusMultiplier * steelMultiplier,
    moneyGain,
    breakdown: [
      '基础结算：' + (scoreBase.chips + handLevel.chipsBonus) + ' 筹码 × ' + (scoreBase.mult + handLevel.multBonus) + ' 倍率',
      '牌面筹码：' + faceChips + ' 筹码',
    ],
    selectedCount: cards.length,
  };

  if (bonusChips > 0) {
    result.breakdown.push('附加筹码：+' + bonusChips + ' 筹码');
  }
  if (bonusMult > 0) {
    result.breakdown.push('附加倍率：+' + bonusMult + ' 倍率');
  }
  if (bonusMultiplier > 1) {
    result.breakdown.push('多重倍率：x' + bonusMultiplier);
  }
  if (steelMultiplier > 1) {
    result.breakdown.push('钢铁牌：x' + steelMultiplier);
  }
  if (moneyGain > 0) {
    result.breakdown.push('金币收益：+' + moneyGain);
  }

  if (blind.bossRule === 'smallHandBonus' && cards.length <= 3) {
    result.mult += 20;
    result.breakdown.push('偏锋：+20 倍率');
  }

  const context = {
    money: state.money,
    blind,
    playedHandTypesThisBlind: state.playedHandTypesThisBlind,
    discardsRemaining: state.discardsRemaining,
    jokerCount: state.jokers.length,
  };

  for (const joker of state.jokers) {
    const editionBonus = getJokerScoreBonus(joker);
    result.chips += editionBonus.chips || 0;
    result.mult += editionBonus.mult || 0;
    result.mult *= editionBonus.multiplier || 1;
    const definition = JOKER_LIBRARY.find((item) => item.id === joker.id);
    if (definition) definition.apply(result, context);
  }

  result.totalChips = result.chips;
  result.totalScore = result.chips * result.mult;
  return result;
}

function removeCardsFromHand(cards) {
  const removeIds = new Set(cards.map((card) => card.id));
  state.handCards = state.handCards.filter((card) => !removeIds.has(card.id));
}

function validateBossRule(result, selected) {
  const blind = getCurrentBlind();
  if (blind.bossRule === "singlePlay" && state.playedHandTypesThisBlind.length >= 1) {
    return "独针限制：这一关只允许出牌 1 次。";
  }
  if (blind.bossRule === "noRepeatHandType" && state.playedHandTypesThisBlind.includes(result.handType)) {
    return `天眼限制：本关不能重复打出“${result.handType}”。`;
  }
  if (blind.bossRule === "maxFourCards" && selected.length > 4) {
    return "铁钳限制：每次最多选择 4 张牌。";
  }
  return null;
}

function finishBlindIfNeeded() {
  const blind = getCurrentBlind();
  if (state.scoreCurrent < blind.target || state.completedBlind) return;
  state.completedBlind = true;
  state.money += blind.reward;
  processEndOfRoundSealRewards();
  addLog(`通过 ${blind.type}，获得 ${blind.reward} 金币。`);
  openShop();
}

function showOutcome(type) {
  state.outcome = type;
  state.phase = "outcome";
  if (type === "win") {
    const unlockedRanks = getUnlockedRankKeys();
    state.victoryRewardClaimed = unlockedRanks.length === 0;
    state.victoryRewardRank = null;
    els.resultTitle.textContent = "\u901a\u5173\u6210\u529f";
    els.resultText.textContent = "\u4f60\u5df2\u7ecf\u6253\u7a7f\u7b2c 8 \u9636\u6bb5\u5934\u76ee\u76f2\u6ce8\uff0c\u8fd9\u4e00\u5c40\u6b63\u5f0f\u901a\u5173\u3002";
  } else {
    state.victoryRewardClaimed = false;
    state.victoryRewardRank = null;
    els.resultTitle.textContent = "\u672c\u5c40\u5931\u8d25";
    els.resultText.textContent = "\u5f53\u524d\u76f2\u6ce8\u6ca1\u6709\u8fbe\u6210\u76ee\u6807\u5206\uff0c\u8fd9\u4e00\u5c40\u5230\u6b64\u7ed3\u675f\u3002";
  }
  const blind = getCurrentBlind();
  els.resultStats.textContent = `\u505c\u5728\u7b2c ${blind.ante} \u9636\u6bb5\u7684 ${blind.type}\uff0c\u91d1\u5e01 ${state.money}\uff0c\u5c0f\u4e11\u724c ${state.jokers.length} \u5f20\u3002`;
  els.resultModal.hidden = false;
  serializeState();
}

function dismissOutcome() {
  if (state.outcome === "win" && getUnlockedRankKeys().length > 0 && !state.victoryRewardClaimed) {
    return;
  }
  els.resultModal.hidden = true;
  syncModalScrollLock();
}

function openHelp() {
  els.shopModal.hidden = true;
  els.resultModal.hidden = true;
  els.helpModal.hidden = false;
  syncModalScrollLock();
}

function closeHelp() {
  els.helpModal.hidden = true;
  syncModalScrollLock();
}

function processEndOfRoundSealRewards() {
  const blueSealCount = state.handCards.filter((card) => card.seal === "blue").length;
  if (blueSealCount > 0) {
    addRandomPlanetToInventory(blueSealCount);
    addLog(`蓝色封蜡触发，获得 ${blueSealCount} 张星球牌。`);
  }
}

function maybeFailBlind() {
  if (state.scoreCurrent >= getCurrentBlind().target) return;
  if (state.handsRemaining > 0) return;
  processEndOfRoundSealRewards();
  addLog("本盲注失败。");
  showOutcome("lose");
}

function playSelected() {
  if (state.phase !== "playing" || state.outcome) return;
  const selected = getSelectedCards();
  if (selected.length === 0 || state.handsRemaining <= 0 || state.completedBlind) return;
  const result = evaluateHand(selected);
  const bossError = validateBossRule(result, selected);
  if (bossError) {
    addLog(bossError);
    render();
    return;
  }

  state.scoreCurrent += result.totalScore;
  if (result.moneyGain > 0) {
    state.money += result.moneyGain;
  }
  state.handsRemaining -= 1;
  state.playedHandTypesThisBlind.push(result.handType);
  const shatteredIds = new Set(
    selected
      .filter((card) => card.enhancement === "glass" && Math.random() < 0.25)
      .map((card) => card.id),
  );
  removeCardsFromHand(selected);
  state.discardPile.push(...selected.filter((card) => !shatteredIds.has(card.id)));
  state.selectedIds.clear();
  drawToLimit();
  addLog(`打出 ${result.handType}，获得 ${result.totalScore} 分。`);
  finishBlindIfNeeded();
  if (!state.completedBlind) maybeFailBlind();
  render();
}

function discardSelected() {
  if (state.phase !== "playing" || state.outcome) return;
  const blind = getCurrentBlind();
  if (blind.bossRule === "noDiscard" || blind.bossRule === "finalBoss") {
    addLog("本盲注禁止弃牌。");
    render();
    return;
  }
  const selected = getSelectedCards();
  if (selected.length === 0 || state.discardsRemaining <= 0 || state.completedBlind) return;
  state.discardsRemaining -= 1;
  removeCardsFromHand(selected);
  state.discardPile.push(...selected);
  const purpleSealCount = selected.filter((card) => card.seal === "purple").length;
  if (purpleSealCount > 0) {
    addRandomTarotToInventory(purpleSealCount);
    addLog(`紫色封蜡触发，获得 ${purpleSealCount} 张塔罗牌。`);
  }
  state.selectedIds.clear();
  drawToLimit();
  addLog(`弃掉 ${selected.length} 张牌。`);
  render();
}

function buyJoker(ownedId) {
  const item = state.shopItems.find((entry) => entry.ownedId === ownedId && entry.kind === "joker");
  if (!item) return;
  if (state.money < item.cost) {
    addLog(`金币不足，无法购买 ${item.name}。`);
    render();
    return;
  }
  if (state.jokers.length >= getJokerLimit()) {
    addLog("核心牌槽位已满，先出售再购买。");
    render();
    return;
  }
  state.money -= item.cost;
  state.jokers.push({ id: item.id, ownedId: item.ownedId, name: item.name, text: item.text, sell: item.sell, tag: item.tag, rarity: item.rarity || getJokerRarity(item.id) });
  state.shopItems = state.shopItems.filter((entry) => entry.ownedId !== ownedId);
  const levelState = { level: 0 };
  addLog(`购买了 ${item.name}。`);
  render();
}

function buyPlanet(ownedId) {
  const item = state.shopItems.find((entry) => entry.ownedId === ownedId && entry.kind === "planet");
  if (!item) return;
  if (state.money < item.cost) {
    addLog(`金币不足，无法购买 ${item.name}。`);
    render();
    return;
  }
  state.money -= item.cost;
  addConsumableToInventory({ ...item, kind: "planet" });
  state.shopItems = state.shopItems.filter((entry) => entry.ownedId !== ownedId);
  addLog(`${item.name} 已收入行星牌库存。`);
  render();
}

function buyTarot(ownedId) {
  const item = state.shopItems.find((entry) => entry.ownedId === ownedId && entry.kind === "tarot");
  if (!item) return;
  if (state.money < item.cost) {
    addLog(`金币不足，无法购买 ${item.name}。`);
    render();
    return;
  }
  state.money -= item.cost;
  addConsumableToInventory({ ...item, kind: "tarot" });
  state.shopItems = state.shopItems.filter((entry) => entry.ownedId !== ownedId);
  addLog(`${item.name} 已收入塔罗牌库存。`);
  render();
}

function buySpectral(ownedId) {
  const item = state.shopItems.find((entry) => entry.ownedId === ownedId && entry.kind === "spectral");
  if (!item) return;
  if (state.money < item.cost) {
    addLog(`金币不足，无法购买 ${item.name}。`);
    render();
    return;
  }
  state.money -= item.cost;
  addConsumableToInventory({ ...item, kind: "spectral" });
  state.shopItems = state.shopItems.filter((entry) => entry.ownedId !== ownedId);
  addLog(`${item.name} 已收入幻灵牌库存。`);
  render();
}

function useConsumable(kind, ownedId) {
  const item = findInventoryItem(kind, ownedId);
  if (!item) return;
  const inventory = getInventoryForKind(kind);
  const index = inventory.findIndex((entry) => entry.ownedId === ownedId);
  if (index < 0) return;
  const [consumable] = inventory.splice(index, 1);
  let success = false;
  if (kind === "planet") {
    success = applyPlanetEffect(consumable);
  } else if (kind === "tarot") {
    const effect = TAROT_EFFECTS[consumable.id];
    success = effect ? effect(consumable) : false;
  } else if (kind === "spectral") {
    const effect = SPECTRAL_EFFECTS[consumable.id];
    success = effect ? effect(consumable) : false;
    if (!success && consumable.id === "wraith") {
      const spawned = spawnRareJokerToState();
      if (spawned) {
        state.money = 0;
        addLog(`${consumable.name}：生成了一张稀有核心牌，金币清零。`);
        success = true;
      }
    }
  }
  if (!success) {
    inventory.splice(index, 0, consumable);
    addLog(`${consumable.name} 暂时没有可用目标。`);
    render();
    return;
  }
  state.lastConsumableUse = { kind, id: consumable.id };
  render();
}

function sellJoker(ownedId) {
  const joker = state.jokers.find((item) => item.ownedId === ownedId);
  if (!joker) return;
  state.money += joker.sell;
  state.jokers = state.jokers.filter((item) => item.ownedId !== ownedId);
  addLog(`出售 ${joker.name}，获得 ${joker.sell} 金币。`);
  render();
}

function refreshShop() {
  if (state.phase !== "shop") return;
  if (state.money < 1) {
    addLog("金币不足，无法刷新商店。");
    render();
    return;
  }
  state.money -= 1;
  state.shopItems = [
    ...sampleJokers(2).map((item) => ({ ...item, kind: "joker" })),
    ...samplePlanets(1).map((item) => ({ ...item, kind: "planet" })),
    ...sampleTarots(1).map((item) => ({ ...item, kind: "tarot" })),
    ...sampleSpectrals(1).map((item) => ({ ...item, kind: "spectral" })),
  ];
  addLog("商店已刷新。");
  render();
}

function renderCards() {
  els.handArea.innerHTML = "";
  for (const card of state.handCards) {
    const node = els.cardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".card-rank").textContent = card.rank;
    node.querySelector(".card-suit").textContent = card.suitLabel;
    node.querySelector(".card-chip").textContent = String(getCardDisplayChips(card)) + " 筹码";
    const effectsEl = node.querySelector(".card-effects");
    const badges = getCardEffectBadges(card);
    if (effectsEl) {
      effectsEl.innerHTML = badges
        .map((badge) => `<span class=\"card-badge ${badge.className}\">${badge.label}</span>`)
        .join("");
      effectsEl.hidden = badges.length === 0;
    }
    node.classList.toggle("has-effects", badges.length > 0);
    node.title = getCardTooltip(card);
    node.classList.toggle("selected", state.selectedIds.has(card.id));
    node.classList.toggle("red", card.red);
    node.addEventListener("click", () => toggleSelect(card.id));
    els.handArea.appendChild(node);
  }
}
function renderJokers() {
  els.jokerArea.innerHTML = "";
  if (state.jokers.length === 0) {
    const empty = document.createElement("div");
    empty.className = "log-entry";
    empty.textContent = "还没有核心牌";
    els.jokerArea.appendChild(empty);
    return;
  }
  for (const joker of state.jokers) {
    const node = els.jokerTemplate.content.firstElementChild.cloneNode(true);
    node.classList.add("is-joker");
    node.dataset.cardKind = "joker";
    const rarity = joker.rarity || getJokerRarity(joker.id);
    const rarityEl = node.querySelector(".joker-rarity");
    rarityEl.textContent = rarity;
    rarityEl.className = `joker-rarity ${getRarityClass(rarity)}`;
    node.querySelector(".joker-tag").textContent = joker.edition ? `${joker.tag} · ${getJokerEditionLabel(joker.edition)}` : joker.tag;
    node.querySelector(".joker-name").textContent = joker.name;
    node.querySelector(".joker-text").textContent = joker.text;
    node.title = joker.edition ? `${joker.name} · ${getJokerEditionLabel(joker.edition)}` : joker.name;
    const actions = node.querySelector(".joker-actions");
    const sellBtn = document.createElement("button");
    sellBtn.className = "btn btn-ghost";
    sellBtn.textContent = `出售 ${joker.sell} 金币`;
    sellBtn.addEventListener("click", () => sellJoker(joker.ownedId));
    actions.appendChild(sellBtn);
    els.jokerArea.appendChild(node);
  }
}
function renderConsumables() {
  if (!els.consumableArea) return;
  els.consumableArea.innerHTML = "";
  const items = [
    ...state.planetInventory.map((item) => ({ ...item, kind: "planet" })),
    ...state.tarotInventory.map((item) => ({ ...item, kind: "tarot" })),
    ...state.spectralInventory.map((item) => ({ ...item, kind: "spectral" })),
  ];
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "consumable-empty";
    empty.textContent = "还没有消耗牌。先去商店买一点，或者用塔罗/幻灵效果生成。";
    els.consumableArea.appendChild(empty);
    return;
  }
  for (const item of items) {
    const entry = document.createElement("div");
    entry.className = "consumable-entry";
    const head = document.createElement("div");
    head.className = "consumable-entry-head";
    const kind = document.createElement("span");
    kind.className = `consumable-kind is-${item.kind}`;
    kind.textContent = item.kind === "planet" ? "行星牌" : item.kind === "tarot" ? "塔罗牌" : "幻灵牌";
    const rarity = document.createElement("span");
    rarity.className = "consumable-kind";
    rarity.textContent = item.rarity || "普通";
    const title = document.createElement("strong");
    title.textContent = item.name;
    head.append(kind, rarity, title);
    const text = document.createElement("p");
    text.textContent = item.text;
    const action = document.createElement("button");
    action.className = "btn btn-soft";
    action.textContent = "使用";
    action.addEventListener("click", () => useConsumable(item.kind, item.ownedId));
    entry.append(head, text, action);
    els.consumableArea.appendChild(entry);
  }
}

function renderHandLevels() {
  els.levelArea.innerHTML = "";
  for (const handType of HAND_TYPE_ORDER) {
    const levelState = state.handLevels[handType];
    const div = document.createElement("div");
    div.className = "level-entry";
    div.textContent = `${handType} Lv.${levelState.level}  +${levelState.chipsBonus} 筹码 / +${levelState.multBonus} 倍率`;
    els.levelArea.appendChild(div);
  }
}

function renderShop() {
  els.shopModal.hidden = state.phase !== "shop";
  els.shopArea.innerHTML = "";
  if (els.shopMoneyValue) {
    els.shopMoneyValue.textContent = String(state.money);
  }
  if (state.phase !== "shop") return;
  for (const entry of state.shopItems) {
    const node = els.shopTemplate.content.firstElementChild.cloneNode(true);
    node.classList.toggle("is-joker", entry.kind === "joker");
    node.classList.toggle("is-planet", entry.kind === "planet");
    node.classList.toggle("is-tarot", entry.kind === "tarot");
    node.classList.toggle("is-spectral", entry.kind === "spectral");
    node.dataset.cardKind = entry.kind;
    node.dataset.planetId = entry.kind === "planet" ? entry.id : "";
    node.dataset.tarotId = entry.kind === "tarot" ? entry.id : "";
    node.dataset.spectralId = entry.kind === "spectral" ? entry.id : "";
    const rarity =
      entry.rarity ||
      (entry.kind === "joker"
        ? getJokerRarity(entry.id)
        : entry.kind === "planet"
          ? getPlanetRarity(entry.id)
          : entry.kind === "tarot"
            ? getTarotRarity(entry.id)
            : getSpectralRarity(entry.id));
    const rarityEl = node.querySelector(".joker-rarity");
    rarityEl.textContent = rarity;
    rarityEl.className = `joker-rarity ${getRarityClass(rarity)}`;
    node.querySelectorAll(".joker-corner-rank").forEach((el) => {
      el.textContent = entry.kind === "joker" ? "JOKER" : entry.kind === "planet" ? "PLANET" : entry.kind === "tarot" ? "TAROT" : "SPECTRAL";
    });
    node.querySelectorAll(".joker-corner-suit").forEach((el) => {
      el.textContent = entry.kind === "joker" ? "🃏" : entry.kind === "planet" ? "☉" : entry.kind === "tarot" ? "✦" : "☾";
    });
    node.querySelector(".joker-tag").textContent =
      entry.kind === "joker"
        ? `${entry.tag} \u00b7 ${entry.cost} \u91d1\u5e01`
        : entry.kind === "planet"
          ? `\u884c\u661f\u724c \u00b7 ${entry.cost} \u91d1\u5e01`
          : entry.kind === "tarot"
            ? `\u5854\u7f57\u724c \u00b7 ${entry.cost} \u91d1\u5e01`
            : `\u5e7b\u7075\u724c \u00b7 ${entry.cost} \u91d1\u5e01`;
    node.querySelector(".joker-name").textContent = entry.name;
    node.querySelector(".joker-text").textContent = entry.text;
    const actions = node.querySelector(".joker-actions");
    const buyBtn = document.createElement("button");
    buyBtn.className = "btn btn-primary";
    buyBtn.textContent = entry.kind === "joker"
      ? "\u8d2d\u4e70\u5c0f\u4e11\u724c"
      : entry.kind === "planet"
        ? "\u8d2d\u4e70\u5e76\u6536\u85cf"
        : entry.kind === "tarot"
          ? "\u8d2d\u4e70\u5854\u7f57\u724c"
          : "\u8d2d\u4e70\u5e7b\u7075\u724c";
    buyBtn.addEventListener("click", () => {
      if (entry.kind === "joker") buyJoker(entry.ownedId);
      else if (entry.kind === "planet") buyPlanet(entry.ownedId);
      else if (entry.kind === "tarot") buyTarot(entry.ownedId);
      else buySpectral(entry.ownedId);
    });
    actions.appendChild(buyBtn);
    els.shopArea.appendChild(node);
  }
}

function renderPreview() {
  const result = evaluateHand(getSelectedCards());
  els.handTypeValue.textContent = result.handType;
  els.calcValue.textContent = `${result.totalChips} 筹码 × ${result.mult} 倍率`;
  els.roundGainValue.textContent = String(result.totalScore);
  els.scorePreview.textContent = result.totalScore > 0 ? `预计 +${result.totalScore}` : "待出牌";
}

function renderLogs() {
  els.logArea.innerHTML = "";
  for (const text of state.logs) {
    const div = document.createElement("div");
    div.className = "log-entry";
    div.textContent = text;
    els.logArea.appendChild(div);
  }
}

function renderHud() {
  const blind = getCurrentBlind();
  els.anteValue.textContent = `第 ${blind.ante} 阶段`;
  els.blindValue.textContent = blind.type;
  els.targetValue.textContent = String(blind.target);
  els.scoreValue.textContent = String(state.scoreCurrent);
  els.moneyValue.textContent = String(state.money);
  els.handsValue.textContent = String(state.handsRemaining);
  els.discardsValue.textContent = String(state.discardsRemaining);
  els.deckValue.textContent = String(state.drawPile.length);
  els.blindTitle.textContent = blind.type;
  els.bossRuleValue.textContent = blind.bossRuleText;
  els.jokerSlotValue.textContent = `${state.jokers.length} / ${getJokerLimit()}`;
}

function renderButtons() {
  const playing = state.phase === "playing" && !state.completedBlind && !state.outcome;
  els.playBtn.disabled = !playing;
  els.discardBtn.disabled = !playing;
  els.sortRankBtn.disabled = state.phase !== "playing";
  els.sortSuitBtn.disabled = state.phase !== "playing";
  const floatingHelpVisible = !els.resultModal.hidden || !els.shopModal.hidden || !els.helpModal.hidden;
  els.helpBtn.hidden = !floatingHelpVisible;
}

function render() {
  renderHud();
  renderCards();
  renderJokers();
  renderConsumables();
  renderHandLevels();
  renderShop();
  renderPreview();
  renderLogs();
  renderButtons();
  els.resultModal.hidden = !state.outcome;
  if (state.outcome) {
    const blind = getCurrentBlind();
    if (state.outcome === "win") {
      els.resultTitle.textContent = "\u901a\u5173\u6210\u529f";
      els.resultText.textContent = "\u4f60\u5df2\u7ecf\u6253\u7a7f\u7b2c 8 \u9636\u6bb5\u5934\u76ee\u76f2\u6ce8\uff0c\u8fd9\u4e00\u5c40\u6b63\u5f0f\u901a\u5173\u3002";
    } else {
      els.resultTitle.textContent = "\u672c\u5c40\u5931\u8d25";
      els.resultText.textContent = "\u5f53\u524d\u76f2\u6ce8\u6ca1\u6709\u8fbe\u6210\u76ee\u6807\u5206\uff0c\u8fd9\u4e00\u5c40\u5230\u6b64\u7ed3\u675f\u3002";
    }
    els.resultStats.textContent = `\u505c\u5728\u7b2c ${blind.ante} \u9636\u6bb5\u7684 ${blind.type}\uff0c\u91d1\u5e01 ${state.money}\uff0c\u6838\u5fc3\u724c ${state.jokers.length} \u5f20\u3002`;
  }
  renderVictoryRewardPanel();
  syncModalScrollLock();
  serializeState();
}

els.newRunBtn.addEventListener("click", () => {
  els.resultModal.hidden = true;
  els.shopModal.hidden = true;
  els.helpModal.hidden = true;
  startRun();
});
els.clearSaveBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state.rankChipMultipliers = createDefaultRankChipMultipliers();
  state.victoryRewardClaimed = false;
  state.victoryRewardRank = null;
  els.resultModal.hidden = true;
  els.shopModal.hidden = true;
  els.helpModal.hidden = true;
  startRun();
  addLog("本地存档已清除，并已重开新局。");
  render();
});
els.sortRankBtn.addEventListener("click", () => sortHand((a, b) => b.rankValue - a.rankValue || a.suit.localeCompare(b.suit)));
els.sortSuitBtn.addEventListener("click", () => sortHand((a, b) => a.suit.localeCompare(b.suit) || b.rankValue - a.rankValue));
els.playBtn.addEventListener("click", playSelected);
els.discardBtn.addEventListener("click", discardSelected);
els.refreshShopBtn.addEventListener("click", refreshShop);
els.closeShopBtn.addEventListener("click", leaveShop);
els.closeResultBtn.addEventListener("click", () => {
  dismissOutcome();
});
els.helpTopBtn.addEventListener("click", openHelp);
els.helpBtn.addEventListener("click", openHelp);
els.closeHelpBtn.addEventListener("click", closeHelp);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.outcome) {
    dismissOutcome();
    return;
  }
  if (event.key === "Escape" && !els.helpModal.hidden) {
    closeHelp();
  }
});

globalThis.__WEB_BALATRO_API__ = {
  state,
  resetStateForTest,
  HAND_TYPES,
  RANKS,
  SUITS,
  PLANET_LIBRARY,
  TAROT_LIBRARY,
  SPECTRAL_LIBRARY,
  JOKER_LIBRARY,
  TAROT_EFFECTS,
  SPECTRAL_EFFECTS,
  createCard,
  cloneCard,
  createOwnedConsumable,
  addConsumableToInventory,
  sampleJokers,
  samplePlanets,
  sampleTarots,
  sampleSpectrals,
  addRandomPlanetToInventory,
  addRandomTarotToInventory,
  addRandomSpectralToInventory,
  addRandomEnhancedCards,
  createDefaultHandLevels,
  createDefaultRankChipMultipliers,
  getRankDefinition,
  getSuitDefinition,
  getRankStartingChips,
  getHandLimit,
  getJokerLimit,
  getJokerRarity,
  getPlanetRarity,
  getTarotRarity,
  getSpectralRarity,
  countRarity,
  getTargetsFromHand,
  getSelectedCards,
  removeRandomHandCards,
  addCardsToHand,
  applyPlanetEffect,
  applyPlanetById,
  setCardEnhancement,
  setCardEdition,
  setCardSeal,
  setCardSuit,
  setAllHandCardsSuit,
  setAllHandCardsRank,
  destroyHandCards,
  copyHandCard,
  upgradeCardRank,
  getRandomJoker,
  getRandomJokerByRarity,
  canAddJoker,
  addJokerToState,
  spawnRareJokerToState,
  useConsumable,
  startRun,
  render,
  openShop,
  leaveShop,
  playSelected,
  discardSelected,
};

if (!globalThis.__WEB_BALATRO_SKIP_INIT__) {
  initGame();
}
