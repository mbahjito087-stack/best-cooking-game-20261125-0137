// Boot and the one loop: input is read as it happens, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer paints
// what is there. The game moves between four screens: title, play, paused and shift over.
//
// ?seed=N fixes the order the tickets arrive in. ?shot=start|play|serve|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_BURNT, EVENT_EXPIRED, EVENT_SERVED, EVENT_WRONG } from './world.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';
import { SCREENS } from './config.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  createInput(canvas, world, audio);
  let screen = SCREENS.TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function endGame() {
    screen = SCREENS.OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    const over = world.state.over;
    announce(
      over.won
        ? `Golden Ladle! You served ${over.score} coins. Best ${best}.`
        : `Shift over. You served ${over.score} coins. Best ${best}.`,
    );
    audio.stopSizzle();
  }

  function frame(now) {
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    const events = world.step(elapsed);
    if (events & EVENT_SERVED) audio.ding();
    if (events & (EVENT_WRONG | EVENT_EXPIRED | EVENT_BURNT)) audio.buzz();
    const cooking = world.state.grill.some((slot) => slot.state === 'cooking');
    if (cooking && world.state.screen === SCREENS.PLAY) audio.startSizzle();
    else audio.stopSizzle();
    if (world.state.screen === SCREENS.OVER && screen !== SCREENS.OVER) endGame();
    screen = world.state.screen;
    if (world.state.message && world.state.flash > 0.9) announce(world.state.message);
    renderer.draw(world.state, screen, best);
    requestAnimationFrame(frame);
  }

  // The world steps in fixed slices so a slow frame cannot skip a burn.
  const originalStep = world.step.bind(world);
  world.step = (dt) => {
    let events = 0;
    accumulator += dt;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      events |= originalStep(STEP);
    }
    return events;
  };

  announce('Sizzle Station. Click or press Enter to start cooking.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
