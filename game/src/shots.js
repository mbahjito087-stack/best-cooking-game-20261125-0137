// The screenshot scenes behind ?shot=start|play|serve|end. Each one plays the real
// rules forward from a fresh world for a fixed script, so the frame is what a short
// game really looks like and the same seed always gives the same frame.
import { SCREENS, STEP } from './config.js';
import { EVENT_OVER, plateMatchesOrder } from './world.js';

function countIn(list, id) {
  return list.filter((item) => item === id).length;
}

function isSubDish(plate, items) {
  for (const id of new Set(plate)) {
    if (countIn(plate, id) > countIn(items, id)) return false;
  }
  return true;
}

// The cook's own instincts, as a function: keep the grill busy, build the first
// ticket on the board, bin anything burnt, serve the moment a plate matches.
export function autopilot(world) {
  const state = world.state;
  if (state.screen !== SCREENS.PLAY) return;
  state.grill.forEach((slot, index) => {
    if (slot.state === 'burnt') world.takeGrill(index);
  });
  const target = state.orders[0];
  if (!target) return;
  if (!isSubDish(state.plate, target.items)) {
    world.trashPlate();
    return;
  }
  if (plateMatchesOrder(state.plate, target)) {
    world.serveOrder(target.id);
    return;
  }
  if (countIn(state.plate, 'patty') < countIn(target.items, 'patty')) {
    const ready = state.grill.findIndex((slot) => slot.state === 'ready');
    if (ready >= 0) {
      world.takeGrill(ready);
      return;
    }
    if (!state.grill.some((slot) => slot.state === 'cooking')) {
      world.startPatty();
    }
    return;
  }
  for (const item of target.items) {
    if (item === 'patty') continue;
    if (countIn(state.plate, item) < countIn(target.items, item)) {
      world.addIngredient(item);
      return;
    }
  }
}

function stepFor(world, seconds, decide) {
  const steps = Math.round(seconds / STEP);
  for (let index = 0; index < steps; index += 1) {
    if (decide) decide(world);
    if (world.step(STEP) & EVENT_OVER) break;
    if (world.state.screen !== SCREENS.PLAY) break;
  }
}

/**
 * Set `world` to the named scene (start, play, serve or end; any other name is
 * start) and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    // Title over a kitchen that is already alive: a few orders on the board.
    world.start();
    stepFor(world, 4);
    world.state.screen = SCREENS.TITLE;
    return { screen: SCREENS.TITLE, best: 0 };
  }
  if (name === 'play') {
    // A dish mid-assembly: bun on the plate, a patty coming off the grill,
    // lettuce added, the second ticket just landed on the board.
    world.start();
    world.addIngredient('bun');
    stepFor(world, 1);
    world.startPatty();
    stepFor(world, 7.5);
    const ready = world.state.grill.findIndex((slot) => slot.state === 'ready');
    if (ready >= 0) world.takeGrill(ready);
    world.addIngredient('lettuce');
    // A second patty goes on the grill, so the frame shows one cooking too.
    world.startPatty();
    stepFor(world, 11);
    return { screen: SCREENS.PLAY, best: 0 };
  }
  if (name === 'serve') {
    // The autopilot cooks until a plate is complete and its ticket lights up.
    world.start();
    const limit = Math.round(120 / STEP);
    for (let index = 0; index < limit; index += 1) {
      autopilot(world);
      if (world.step(STEP) & EVENT_OVER) break;
      if (world.firstMatchingOrder()) break;
    }
    return { screen: SCREENS.PLAY, best: 0 };
  }
  // End: the autopilot works the whole 3-minute shift, then the results screen.
  world.start();
  const limit = Math.round(200 / STEP);
  for (let index = 0; index < limit; index += 1) {
    autopilot(world);
    if (world.step(STEP) & EVENT_OVER) break;
    if (world.state.screen !== SCREENS.PLAY) break;
  }
  return { screen: SCREENS.OVER, best: world.state.score };
}