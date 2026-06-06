const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class MockClassList {
  constructor(owner) {
    this.owner = owner;
    this.set = new Set();
  }

  sync() {
    this.owner._className = [...this.set].join(" ");
  }

  add(...classes) {
    for (const cls of classes) this.set.add(cls);
    this.sync();
  }

  remove(...classes) {
    for (const cls of classes) this.set.delete(cls);
    this.sync();
  }

  toggle(cls, force) {
    if (force === undefined) {
      if (this.set.has(cls)) {
        this.set.delete(cls);
        this.sync();
        return false;
      }
      this.set.add(cls);
      this.sync();
      return true;
    }
    if (force) this.set.add(cls);
    else this.set.delete(cls);
    this.sync();
    return Boolean(force);
  }

  contains(cls) {
    return this.set.has(cls);
  }
}

class MockElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.style = {};
    this.hidden = false;
    this.disabled = false;
    this.parentNode = null;
    this.value = "";
    this.title = "";
    this._innerHTML = "";
    this._textContent = "";
    this._className = "";
    this._queryCache = new Map();
    this.classList = new MockClassList(this);
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    if (value === "") {
      this.children = [];
      this._queryCache.clear();
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set textContent(value) {
    this._textContent = String(value);
  }

  get textContent() {
    return this._textContent;
  }

  set className(value) {
    this._className = String(value);
    this.classList.set = new Set(String(value).split(/\s+/).filter(Boolean));
  }

  get className() {
    return this._className;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  append(...nodes) {
    for (const node of nodes) this.appendChild(node);
  }

  addEventListener(type, handler) {
    (this.listeners[type] ||= []).push(handler);
  }

  querySelector(selector) {
    if (!this._queryCache.has(selector)) {
      this._queryCache.set(selector, createGenericNode(selector));
    }
    return this._queryCache.get(selector);
  }

  querySelectorAll(selector) {
    if (!this._queryCache.has(selector)) {
      if (selector === ".joker-corner-rank" || selector === ".joker-corner-suit") {
        this._queryCache.set(selector, [new MockElement("span"), new MockElement("span")]);
      } else {
        this._queryCache.set(selector, [this.querySelector(selector)]);
      }
    }
    return this._queryCache.get(selector);
  }

  cloneNode() {
    return createGenericNode(this.tagName.toLowerCase());
  }
}

function createGenericNode(tagName = "div") {
  const node = new MockElement(tagName);
  node.cloneNode = () => createGenericNode(tagName);
  return node;
}

function createRenderedNode(kind) {
  const node = new MockElement(kind === "card" ? "article" : "div");
  node.cloneNode = () => createRenderedNode(kind);
  node.querySelector = (selector) => {
    if (!node._queryCache.has(selector)) {
      node._queryCache.set(selector, createGenericNode("span"));
    }
    return node._queryCache.get(selector);
  };
  node.querySelectorAll = (selector) => {
    if (!node._queryCache.has(selector)) {
      if (selector === ".joker-corner-rank" || selector === ".joker-corner-suit") {
        node._queryCache.set(selector, [createGenericNode("span"), createGenericNode("span")]);
      } else {
        node._queryCache.set(selector, [node.querySelector(selector)]);
      }
    }
    return node._queryCache.get(selector);
  };
  return node;
}

function createTemplate(kind) {
  const template = new MockElement("template");
  template.content = { firstElementChild: createRenderedNode(kind) };
  return template;
}

function createDocument() {
  const elements = new Map();
  const templateKinds = {
    cardTemplate: "card",
    jokerTemplate: "joker",
    shopTemplate: "shop",
  };
  const document = {
    documentElement: new MockElement("html"),
    body: new MockElement("body"),
    createElement(tagName) {
      return createGenericNode(tagName);
    },
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, templateKinds[id] ? createTemplate(templateKinds[id]) : createGenericNode("div"));
      }
      return elements.get(id);
    },
  };
  return document;
}

function createLocalStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
  };
}

function setupRuntime() {
  globalThis.__WEB_BALATRO_SKIP_INIT__ = true;
  globalThis.window = globalThis;
  globalThis.document = createDocument();
  globalThis.localStorage = createLocalStorage();
  globalThis.window.addEventListener = () => {};
  globalThis.window.removeEventListener = () => {};
  globalThis.document.addEventListener = () => {};
  globalThis.navigator = { userAgent: "node-self-test" };

  const mainPath = path.join(__dirname, "main.js");
  const source = fs.readFileSync(mainPath, "utf8");
  vm.runInThisContext(source, { filename: mainPath });

  const api = globalThis.__WEB_BALATRO_API__;
  assert.ok(api, "main.js did not expose __WEB_BALATRO_API__");
  return api;
}

function makeHand(api, specs) {
  return specs.map(({ rank, suit, overrides = {} }) => api.createCard(rank, suit, overrides));
}

function defaultHand(api, count) {
  const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
  const suits = ["spades", "hearts", "clubs", "diamonds"];
  return Array.from({ length: count }, (_, index) => api.createCard(ranks[index % ranks.length], suits[index % suits.length]));
}

function getInventoryField(kind) {
  return {
    planet: "planetInventory",
    tarot: "tarotInventory",
    spectral: "spectralInventory",
  }[kind];
}

function getLibrary(api, kind) {
  return {
    planet: api.PLANET_LIBRARY,
    tarot: api.TAROT_LIBRARY,
    spectral: api.SPECTRAL_LIBRARY,
  }[kind];
}

function addConsumable(api, kind, id) {
  const definition = getLibrary(api, kind).find((item) => item.id === id);
  assert.ok(definition, `${kind}:${id} missing from library`);
  return api.addConsumableToInventory({ ...definition, kind });
}

function addJoker(api, id) {
  const definition = api.JOKER_LIBRARY.find((item) => item.id === id);
  assert.ok(definition, `joker:${id} missing from library`);
  return api.addJokerToState(definition);
}

function reset(api, overrides = {}) {
  api.resetStateForTest(overrides);
}

function useConsumable(api, kind, id) {
  const owned = addConsumable(api, kind, id);
  api.useConsumable(kind, owned.ownedId);
  return owned;
}

function withRandom(sequence, fn) {
  const original = Math.random;
  let index = 0;
  Math.random = () => {
    const value = sequence[Math.min(index, sequence.length - 1)];
    index += 1;
    return value;
  };
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

function assertInventoryRestored(api, kind, ownedId) {
  const inventory = api.state[getInventoryField(kind)];
  assert.equal(inventory.length, 1, `${kind} inventory should still contain the card`);
  assert.equal(inventory[0].ownedId, ownedId, `${kind} inventory should restore the same ownedId`);
}

function runCase(name, fn, failures) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message || String(error));
  }
}

function runSelfTest(api) {
  const failures = [];
  const targetTarotIds = ["pope", "empress", "lovers", "justice", "chariot", "tower", "devil", "magician", "death", "strength", "hanged_man", "world", "sun", "moon", "star"];
  const targetSpectralIds = ["aura", "talisman", "deja_vu", "trance", "medium", "familiar", "grim", "incantation", "immolate", "cryptid"];

  for (const planet of api.PLANET_LIBRARY) {
    runCase(`行星 ${planet.name}`, () => {
      reset(api);
      const owned = addConsumable(api, "planet", planet.id);
      api.useConsumable("planet", owned.ownedId);
      const levelState = api.state.handLevels[planet.targetHand];
      assert.equal(levelState.level, 2);
      assert.equal(levelState.chipsBonus, 10);
      assert.equal(levelState.multBonus, 1);
      assert.equal(api.state.lastConsumableUse.kind, "planet");
      assert.equal(api.state.lastConsumableUse.id, planet.id);
      assert.equal(api.state[getInventoryField("planet")].length, 0);
    }, failures);
  }

  const tarotSuccessCases = [
    {
      id: "pope",
      setup: () => ({ handCards: defaultHand(api, 2) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "bonus");
        assert.equal(api.state.handCards[1].enhancement, "bonus");
      },
    },
    {
      id: "empress",
      setup: () => ({ handCards: defaultHand(api, 2) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "mult");
        assert.equal(api.state.handCards[1].enhancement, "mult");
      },
    },
    {
      id: "lovers",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "wild");
      },
    },
    {
      id: "justice",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "glass");
      },
    },
    {
      id: "chariot",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "steel");
      },
    },
    {
      id: "tower",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "stone");
      },
    },
    {
      id: "devil",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "gold");
      },
    },
    {
      id: "magician",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].enhancement, "lucky");
      },
    },
    {
      id: "death",
      setup: () => ({
        handCards: makeHand(api, [
          { rank: "K", suit: "spades", overrides: { enhancement: "bonus", edition: "foil", seal: "gold" } },
          { rank: "3", suit: "hearts", overrides: { enhancement: "mult", edition: "holo", seal: "red" } },
        ]),
      }),
      verify: () => {
        const [left, right] = api.state.handCards;
        assert.equal(right.rank, left.rank);
        assert.equal(right.suit, left.suit);
        assert.equal(right.enhancement, left.enhancement);
        assert.equal(right.edition, left.edition);
        assert.equal(right.seal, left.seal);
      },
    },
    {
      id: "strength",
      setup: () => ({ handCards: makeHand(api, [{ rank: "K", suit: "spades" }, { rank: "Q", suit: "hearts" }]) }),
      verify: () => {
        assert.equal(api.state.handCards[0].rank, "A");
        assert.equal(api.state.handCards[1].rank, "K");
      },
    },
    {
      id: "hanged_man",
      setup: () => ({ handCards: defaultHand(api, 2) }),
      verify: () => {
        assert.equal(api.state.handCards.length, 0);
      },
    },
    {
      id: "world",
      setup: () => ({ handCards: defaultHand(api, 3) }),
      verify: () => {
        assert.ok(api.state.handCards.every((card) => card.suit === "spades"));
      },
    },
    {
      id: "sun",
      setup: () => ({ handCards: defaultHand(api, 3) }),
      verify: () => {
        assert.ok(api.state.handCards.every((card) => card.suit === "hearts"));
      },
    },
    {
      id: "moon",
      setup: () => ({ handCards: defaultHand(api, 3) }),
      verify: () => {
        assert.ok(api.state.handCards.every((card) => card.suit === "clubs"));
      },
    },
    {
      id: "star",
      setup: () => ({ handCards: defaultHand(api, 3) }),
      verify: () => {
        assert.ok(api.state.handCards.every((card) => card.suit === "diamonds"));
      },
    },
    {
      id: "judgement",
      setup: () => ({}),
      verify: () => {
        assert.equal(api.state.jokers.length, 1);
      },
    },
    {
      id: "high_priestess",
      setup: () => ({}),
      verify: () => {
        assert.equal(api.state.planetInventory.length, 2);
      },
    },
    {
      id: "emperor",
      setup: () => ({}),
      verify: () => {
        assert.equal(api.state.tarotInventory.length, 2);
      },
    },
    {
      id: "temperance",
      setup: () => ({ jokers: [{ sell: 3 }, { sell: 2 }] }),
      verify: () => {
        assert.equal(api.state.money, 5);
      },
    },
    {
      id: "hermit",
      setup: () => ({ money: 12 }),
      verify: () => {
        assert.equal(api.state.money, 20);
      },
    },
    {
      id: "wheel_of_fortune",
      setup: () => ({ jokers: [api.JOKER_LIBRARY.find((item) => item.id === "basic_joker")] }),
      verify: () => {
        assert.ok(["foil", "holo", "polychrome"].includes(api.state.jokers[0].edition));
      },
    },
    {
      id: "fool",
      setup: () => ({ lastConsumableUse: { kind: "tarot", id: "pope" } }),
      verify: () => {
        assert.equal(api.state.tarotInventory.length, 1);
        assert.equal(api.state.tarotInventory[0].id, "pope");
      },
    },
    {
      id: "fool",
      setup: () => ({ lastConsumableUse: { kind: "planet", id: "pluto" } }),
      verify: () => {
        assert.equal(api.state.handLevels[api.HAND_TYPES.HIGH_CARD].level, 2);
      },
    },
  ];

  for (const testCase of tarotSuccessCases) {
    runCase(`塔罗 ${testCase.id}`, () => {
      const setup = testCase.setup();
      reset(api, setup);
      const owned = addConsumable(api, "tarot", testCase.id);
      if (testCase.id === "wheel_of_fortune") {
        withRandom([0.1, 0.2, 0.4], () => api.useConsumable("tarot", owned.ownedId));
      } else {
        api.useConsumable("tarot", owned.ownedId);
      }
      testCase.verify();
      assert.equal(api.state.tarotInventory.some((item) => item.ownedId === owned.ownedId), false);
      assert.equal(api.state.lastConsumableUse.id, testCase.id);
    }, failures);
  }

  const spectralSuccessCases = [
    {
      id: "aura",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.ok(["foil", "holo", "polychrome"].includes(api.state.handCards[0].edition));
      },
    },
    {
      id: "talisman",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].seal, "gold");
      },
    },
    {
      id: "deja_vu",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].seal, "red");
      },
    },
    {
      id: "trance",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].seal, "blue");
      },
    },
    {
      id: "medium",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards[0].seal, "purple");
      },
    },
    {
      id: "ectoplasm",
      setup: () => ({ jokers: [api.JOKER_LIBRARY.find((item) => item.id === "basic_joker")] }),
      verify: () => {
        assert.equal(api.state.extraJokerSlots, 1);
        assert.equal(api.state.handLimitBonus, -1);
        assert.equal(api.state.jokers[0].edition, "negative");
      },
    },
    {
      id: "familiar",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards.length, 3);
        assert.ok(api.state.handCards.every((card) => ["J", "Q", "K"].includes(card.rank)));
      },
    },
    {
      id: "grim",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards.length, 2);
        assert.ok(api.state.handCards.every((card) => card.rank === "A"));
      },
    },
    {
      id: "incantation",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards.length, 4);
        assert.ok(api.state.handCards.every((card) => !card.face));
      },
    },
    {
      id: "sigil",
      setup: () => ({ handCards: defaultHand(api, 3) }),
      verify: () => {
        const [first] = api.state.handCards;
        assert.ok(api.state.handCards.every((card) => card.suit === first.suit));
      },
    },
    {
      id: "ouija",
      setup: () => ({ handCards: defaultHand(api, 3) }),
      verify: () => {
        const [first] = api.state.handCards;
        assert.ok(api.state.handCards.every((card) => card.rank === first.rank));
        assert.equal(api.state.handLimitBonus, -1);
      },
    },
    {
      id: "immolate",
      setup: () => ({ handCards: defaultHand(api, 5), money: 0 }),
      verify: () => {
        assert.equal(api.state.handCards.length, 0);
        assert.equal(api.state.money, 20);
      },
    },
    {
      id: "wraith",
      setup: () => ({
        money: 47,
        jokers: [
          api.JOKER_LIBRARY.find((item) => item.id === "basic_joker"),
          api.JOKER_LIBRARY.find((item) => item.id === "pair_joker"),
          api.JOKER_LIBRARY.find((item) => item.id === "double_joker"),
          api.JOKER_LIBRARY.find((item) => item.id === "small_hand_joker"),
        ],
      }),
      verify: () => {
        assert.equal(api.state.money, 0);
        assert.equal(api.state.jokers.length, 5);
        assert.equal(api.getJokerRarity(api.state.jokers.at(-1).id), "稀有");
      },
    },
    {
      id: "ankh",
      setup: () => ({ jokers: [api.JOKER_LIBRARY.find((item) => item.id === "basic_joker")] }),
      verify: () => {
        assert.equal(api.state.jokers.length, 2);
        assert.notEqual(api.state.jokers[0].ownedId, api.state.jokers[1].ownedId);
      },
    },
    {
      id: "hex",
      setup: () => ({ jokers: [api.JOKER_LIBRARY.find((item) => item.id === "basic_joker")] }),
      verify: () => {
        assert.equal(api.state.jokers.length, 1);
        assert.equal(api.state.jokers[0].edition, "polychrome");
      },
    },
    {
      id: "cryptid",
      setup: () => ({ handCards: defaultHand(api, 1) }),
      verify: () => {
        assert.equal(api.state.handCards.length, 3);
        const [original] = api.state.handCards;
        assert.ok(api.state.handCards.every((card) => card.rank === original.rank && card.suit === original.suit));
      },
    },
    {
      id: "soul",
      setup: () => ({}),
      verify: () => {
        assert.equal(api.state.jokers.length, 1);
        assert.equal(api.getJokerRarity(api.state.jokers[0].id), "传奇");
      },
    },
    {
      id: "black_hole",
      setup: () => ({}),
      verify: () => {
        for (const handType of Object.values(api.HAND_TYPES)) {
          assert.equal(api.state.handLevels[handType].level, 2);
          assert.equal(api.state.handLevels[handType].chipsBonus, 10);
          assert.equal(api.state.handLevels[handType].multBonus, 1);
        }
      },
    },
  ];

  for (const testCase of spectralSuccessCases) {
    runCase(`幻灵 ${testCase.id}`, () => {
      const setup = testCase.setup();
      reset(api, setup);
      const owned = addConsumable(api, "spectral", testCase.id);
      api.useConsumable("spectral", owned.ownedId);
      testCase.verify();
      assert.equal(api.state.spectralInventory.some((item) => item.ownedId === owned.ownedId), false);
      assert.equal(api.state.lastConsumableUse.id, testCase.id);
    }, failures);
  }

  for (const id of targetTarotIds) {
    runCase(`塔罗 ${id} 空手失败`, () => {
      reset(api);
      const owned = addConsumable(api, "tarot", id);
      api.useConsumable("tarot", owned.ownedId);
      assertInventoryRestored(api, "tarot", owned.ownedId);
    }, failures);
  }

  for (const id of targetSpectralIds) {
    runCase(`幻灵 ${id} 空手失败`, () => {
      reset(api);
      const owned = addConsumable(api, "spectral", id);
      api.useConsumable("spectral", owned.ownedId);
      assertInventoryRestored(api, "spectral", owned.ownedId);
    }, failures);
  }

  runCase("幽灵 满槽失败", () => {
    reset(api, {
      money: 99,
      jokers: [
        api.JOKER_LIBRARY.find((item) => item.id === "basic_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "pair_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "double_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "small_hand_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "triple_joker"),
      ],
    });
    const owned = addConsumable(api, "spectral", "wraith");
    api.useConsumable("spectral", owned.ownedId);
    assertInventoryRestored(api, "spectral", owned.ownedId);
    assert.equal(api.state.money, 99);
    assert.equal(api.state.jokers.length, 5);
  }, failures);

  runCase("审判 满槽失败", () => {
    reset(api, {
      jokers: [
        api.JOKER_LIBRARY.find((item) => item.id === "basic_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "pair_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "double_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "small_hand_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "triple_joker"),
      ],
    });
    const owned = addConsumable(api, "tarot", "judgement");
    api.useConsumable("tarot", owned.ownedId);
    assertInventoryRestored(api, "tarot", owned.ownedId);
  }, failures);

  runCase("灵魂 满槽失败", () => {
    reset(api, {
      jokers: [
        api.JOKER_LIBRARY.find((item) => item.id === "basic_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "pair_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "double_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "small_hand_joker"),
        api.JOKER_LIBRARY.find((item) => item.id === "triple_joker"),
      ],
    });
    const owned = addConsumable(api, "spectral", "soul");
    api.useConsumable("spectral", owned.ownedId);
    assertInventoryRestored(api, "spectral", owned.ownedId);
  }, failures);

  runCase("赫米特 低金钱失败", () => {
    reset(api, { money: 0 });
    const owned = addConsumable(api, "tarot", "hermit");
    api.useConsumable("tarot", owned.ownedId);
    assertInventoryRestored(api, "tarot", owned.ownedId);
    assert.equal(api.state.money, 0);
  }, failures);

  runCase("节制 无核心牌失败", () => {
    reset(api);
    const owned = addConsumable(api, "tarot", "temperance");
    api.useConsumable("tarot", owned.ownedId);
    assertInventoryRestored(api, "tarot", owned.ownedId);
    assert.equal(api.state.money, 0);
  }, failures);

  runCase("魔术师 无核心牌失败", () => {
    reset(api);
    const owned = addConsumable(api, "tarot", "wheel_of_fortune");
    api.useConsumable("tarot", owned.ownedId);
    assertInventoryRestored(api, "tarot", owned.ownedId);
  }, failures);

  runCase("妖法 无核心牌失败", () => {
    reset(api);
    const owned = addConsumable(api, "spectral", "hex");
    api.useConsumable("spectral", owned.ownedId);
    assertInventoryRestored(api, "spectral", owned.ownedId);
  }, failures);

  runCase("生命十字章 无核心牌失败", () => {
    reset(api);
    const owned = addConsumable(api, "spectral", "ankh");
    api.useConsumable("spectral", owned.ownedId);
    assertInventoryRestored(api, "spectral", owned.ownedId);
  }, failures);

  runCase("灵质 无核心牌失败", () => {
    reset(api);
    const owned = addConsumable(api, "spectral", "ectoplasm");
    api.useConsumable("spectral", owned.ownedId);
    assertInventoryRestored(api, "spectral", owned.ownedId);
  }, failures);

  runCase("愚者 无历史记录失败", () => {
    reset(api);
    const owned = addConsumable(api, "tarot", "fool");
    api.useConsumable("tarot", owned.ownedId);
    assertInventoryRestored(api, "tarot", owned.ownedId);
  }, failures);

  runCase("愚者 自身禁止复制", () => {
    reset(api, { lastConsumableUse: { kind: "tarot", id: "fool" } });
    const owned = addConsumable(api, "tarot", "fool");
    api.useConsumable("tarot", owned.ownedId);
    assertInventoryRestored(api, "tarot", owned.ownedId);
  }, failures);

  return failures;
}

function main() {
  const api = setupRuntime();
  const failures = runSelfTest(api);
  console.log("");
  if (failures.length === 0) {
    console.log("All consumable self-tests passed.");
    process.exitCode = 0;
    return;
  }
  console.error(`\n${failures.length} test(s) failed.`);
  process.exitCode = 1;
}

main();
