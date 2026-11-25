// Sizzle Station — tuning, layout and content.
// The kitchen is one fixed 1280x800 stage; the canvas scales it to the window.
export const VIEW = { width: 1280, height: 800 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 180;
export const WIN_SCORE = 300;
export const MAX_STRIKES = 3;
export const BEST_KEY = 'sizzle-station-best';

// A patty cooks in COOK_SECONDS, stays good for READY_SECONDS more, then burns.
export const COOK_SECONDS = 7;
export const READY_SECONDS = 6;
export const GRILL_SLOTS = 2;
export const MAX_ORDERS = 3;
export const MAX_PLATE = 6;

// Orders: the first arrives fast so the first 30 seconds already play; later ones
// come quicker and their patience shrinks as the rush builds.
export const FIRST_ORDER_AT = 2;
export const SPAWN_EARLY = 17;
export const SPAWN_LATE = 10;
export const PATIENCE_EARLY = 52;
export const PATIENCE_LATE = 34;

// Coins: a served dish pays its base plus a tip for the patience still left,
// plus two coins per combo step (capped at five steps).
export const BASE_PAY = 12;
export const EXTRA_PAY = 4;
export const TIP_MAX = 8;
export const COMBO_PAY = 2;
export const COMBO_CAP = 5;

// Ingredients, in bin order. A patty is the only one that needs the grill.
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', color: '#e8b06a', dark: '#b97f3a' },
  { id: 'patty', name: 'Patty', key: '2', color: '#7a4a26', dark: '#54301a' },
  { id: 'cheese', name: 'Cheese', key: '3', color: '#f7c948', dark: '#d9a41f' },
  { id: 'lettuce', name: 'Lettuce', key: '4', color: '#7bc96f', dark: '#4d9a44' },
  { id: 'tomato', name: 'Tomato', key: '5', color: '#e4572e', dark: '#b23418' },
  { id: 'onion', name: 'Onion', key: '6', color: '#f2e6ff', dark: '#b9a3d9' },
];
export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

// Extras a ticket may ask for on top of bun + patty.
export const EXTRAS = ['cheese', 'lettuce', 'tomato', 'onion'];

// Fixed stage rectangles, shared by the renderer and the click handling.
export const LAYOUT = {
  board: { x: 24, y: 84, w: 396, h: 268 },
  grill: { x: 452, y: 84, w: 372, h: 268 },
  plate: { x: 856, y: 84, w: 400, h: 268 },
  serve: { x: 856, y: 368, w: 196, h: 64 },
  trash: { x: 1060, y: 368, w: 196, h: 64 },
  bins: { x: 24, y: 520, w: 1232, h: 208 },
};
export const TICKET = { w: 372, h: 72, gap: 12 };
export const GRILL_SLOT = { w: 164, h: 150, gap: 20 };
export const BIN = { w: 192, h: 192, gap: 16 };

export const SCREENS = {
  TITLE: 'title',
  PLAY: 'play',
  PAUSED: 'paused',
  OVER: 'over',
};
