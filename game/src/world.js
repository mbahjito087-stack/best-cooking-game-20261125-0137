// The Copper Ladle's rush, as pure state: no canvas, no input, no sound here, so the
// same rules run in the browser, in a screenshot staging and in a Node smoke test.
import {
  BASE_PAY, COMBO_CAP, COMBO_PAY, COOK_SECONDS, EXTRAS, EXTRA_PAY, FIRST_ORDER_AT,
  GRILL_SLOTS, MAX_ORDERS, MAX_PLATE, MAX_STRIKES, PATIENCE_EARLY, PATIENCE_LATE,
  READY_SECONDS, SCREENS, SHIFT_SECONDS, SPAWN_EARLY, SPAWN_LATE, TIP_MAX, WIN_SCORE,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_WRONG = 4;
export const EVENT_BURNT = 8;
export const EVENT_OVER = 16;

function sameDish(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const item of a) count.set(item, (count.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = (count.get(item) ?? 0) - 1;
    if (left < 0) return false;
    count.set(item, left);
  }
  return true;
}

export function plateMatchesOrder(plate, order) {
  return sameDish(plate, order.items);
}

export function createWorld(random) {
  const state = {
    screen: SCREENS.TITLE,
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    score: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    strikes: 0,
    orders: [],
    grill: [],
    plate: [],
    spawnIn: FIRST_ORDER_AT,
    over: null,
    flash: 0,
    message: '',
    messageAt: 0,
  };
  let nextOrderId = 1;

  function progress() {
    return 1 - state.timeLeft / SHIFT_SECONDS;
  }

  function spawnOrder() {
    const roll = random.next();
    const extraCount = progress() < 0.33 ? (roll < 0.6 ? 0 : 1) : progress() < 0.66 ? (roll < 0.35 ? 1 : 2) : (roll < 0.4 ? 2 : 3);
    const pool = [...EXTRAS];
    const extras = [];
    for (let index = 0; index < extraCount && pool.length > 0; index += 1) {
      extras.push(pool.splice(Math.floor(random.next() * pool.length), 1)[0]);
    }
    const patience = PATIENCE_EARLY + (PATIENCE_LATE - PATIENCE_EARLY) * progress();
    state.orders.push({
      id: nextOrderId,
      label: `#${nextOrderId}`,
      items: ['bun', 'patty', ...extras],
      patience,
      maxPatience: patience,
    });
    nextOrderId += 1;
  }

  function finish(won) {
    state.screen = SCREENS.OVER;
    state.over = {
      won,
      score: state.score,
      served: state.served,
      bestCombo: state.bestCombo,
      strikes: state.strikes,
    };
    return EVENT_OVER;
  }

  function strike() {
    state.strikes += 1;
    state.combo = 0;
    if (state.strikes >= MAX_STRIKES) return finish(false);
    return 0;
  }

  function say(text) {
    state.message = text;
    state.messageAt = state.elapsed;
    state.flash = 1;
  }

  const world = {
    state,

    reset() {
      state.screen = SCREENS.TITLE;
      state.timeLeft = SHIFT_SECONDS;
      state.elapsed = 0;
      state.score = 0;
      state.served = 0;
      state.combo = 0;
      state.bestCombo = 0;
      state.strikes = 0;
      state.orders = [];
      state.grill = Array.from({ length: GRILL_SLOTS }, () => ({ state: 'empty', t: 0 }));
      state.plate = [];
      state.spawnIn = FIRST_ORDER_AT;
      state.over = null;
      state.flash = 0;
      state.message = '';
      state.messageAt = 0;
      nextOrderId = 1;
    },

    start() {
      world.reset();
      state.screen = SCREENS.PLAY;
      say('First order coming — grab a bun!');
    },

    togglePause() {
      if (state.screen === SCREENS.PLAY) state.screen = SCREENS.PAUSED;
      else if (state.screen === SCREENS.PAUSED) state.screen = SCREENS.PLAY;
    },

    // A bun, cheese, lettuce, tomato or onion goes straight on the plate; a patty
    // goes on the grill first and only joins the plate once cooked.
    addIngredient(id) {
      if (state.screen !== SCREENS.PLAY) return false;
      if (id === 'patty') return world.startPatty();
      if (state.plate.length >= MAX_PLATE) return false;
      state.plate.push(id);
      return true;
    },

    startPatty() {
      if (state.screen !== SCREENS.PLAY) return false;
      const slot = state.grill.find((item) => item.state === 'empty');
      if (!slot) return false;
      slot.state = 'cooking';
      slot.t = 0;
      return true;
    },

    takeGrill(slotIndex) {
      if (state.screen !== SCREENS.PLAY) return false;
      const slot = state.grill[slotIndex];
      if (!slot) return false;
      if (slot.state === 'ready') {
        if (state.plate.length >= MAX_PLATE) return false;
        state.plate.push('patty');
        slot.state = 'empty';
        slot.t = 0;
        return true;
      }
      if (slot.state === 'burnt') {
        slot.state = 'empty';
        slot.t = 0;
        say('Burnt patty binned.');
        return true;
      }
      return false;
    },

    trashPlate() {
      if (state.screen !== SCREENS.PLAY || state.plate.length === 0) return false;
      state.plate = [];
      say('Plate cleared.');
      return true;
    },

    firstMatchingOrder() {
      return state.orders.find((order) => plateMatchesOrder(state.plate, order)) ?? null;
    },

    // Serving the ticket you clicked: a match pays, a mismatch costs a strike.
    serveOrder(orderId) {
      if (state.screen !== SCREENS.PLAY) return 0;
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) return 0;
      if (!plateMatchesOrder(state.plate, order)) {
        say('Wrong dish! That is not what they ordered.');
        return EVENT_WRONG | strike();
      }
      const extras = order.items.length - 2;
      const tip = Math.round(TIP_MAX * (order.patience / order.maxPatience));
      const comboPay = Math.min(state.combo, COMBO_CAP) * COMBO_PAY;
      const coins = BASE_PAY + extras * EXTRA_PAY + tip + comboPay;
      state.score += coins;
      state.served += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.orders = state.orders.filter((item) => item.id !== orderId);
      state.plate = [];
      say(`Served ${order.label}! +${coins} coins${state.combo > 1 ? ` — combo x${state.combo}` : ''}`);
      return EVENT_SERVED;
    },

    // Space bar: serve the ticket the plate already matches, if there is one.
    serveMatching() {
      const order = world.firstMatchingOrder();
      if (!order) return 0;
      return world.serveOrder(order.id);
    },

    step(dt) {
      if (state.screen !== SCREENS.PLAY) return 0;
      let events = 0;
      state.elapsed += dt;
      state.timeLeft -= dt;
      state.flash = Math.max(0, state.flash - dt * 2);
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        return finish(state.score >= WIN_SCORE);
      }
      state.spawnIn -= dt;
      if (state.spawnIn <= 0 && state.orders.length < MAX_ORDERS) {
        spawnOrder();
        const span = SPAWN_EARLY + (SPAWN_LATE - SPAWN_EARLY) * progress();
        state.spawnIn = span;
      }
      for (const slot of state.grill) {
        if (slot.state === 'cooking') {
          slot.t += dt;
          if (slot.t >= COOK_SECONDS) {
            slot.state = 'ready';
            slot.t = 0;
            say('Patty ready — grab it before it burns!');
          }
        } else if (slot.state === 'ready') {
          slot.t += dt;
          if (slot.t >= READY_SECONDS) {
            slot.state = 'burnt';
            slot.t = 0;
            say('A patty burnt on the grill!');
            events |= EVENT_BURNT;
          }
        }
      }
      for (const order of [...state.orders]) {
        order.patience -= dt;
        if (order.patience <= 0) {
          state.orders = state.orders.filter((item) => item.id !== order.id);
          say(`${order.label} walked out — too slow!`);
          events |= EVENT_EXPIRED | strike();
          if (state.screen !== SCREENS.PLAY) return events | EVENT_OVER;
        }
      }
      return events;
    },
  };

  world.reset();
  return world;
}
