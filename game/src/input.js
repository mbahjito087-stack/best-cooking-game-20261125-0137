// Keyboard and mouse: clicks on bins, grill slots, tickets and buttons, and keys
// 1-6 for ingredients, Space to serve, T to clear the plate, P to pause, M to mute.
import { INGREDIENTS, LAYOUT, TICKET, GRILL_SLOT, BIN, SCREENS, VIEW } from './config.js';
import { ticketRect, grillSlotRect, binRect } from './render.js';

function inside(x, y, rect) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

export function createInput(canvas, world, audio) {
  const state = world.state;

  function toStage(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW.width,
      y: ((event.clientY - rect.top) / rect.height) * VIEW.height,
    };
  }

  function zoneAt(x, y) {
    if (state.screen !== SCREENS.PLAY) return null;
    if (inside(x, y, LAYOUT.serve)) return { kind: 'serve' };
    if (inside(x, y, LAYOUT.trash)) return { kind: 'trash' };
    for (let index = 0; index < INGREDIENTS.length; index += 1) {
      if (inside(x, y, binRect(index))) return { kind: 'bin', id: INGREDIENTS[index].id };
    }
    for (let index = 0; index < state.grill.length; index += 1) {
      if (inside(x, y, grillSlotRect(index))) return { kind: 'grill', slot: index };
    }
    for (let index = 0; index < state.orders.length; index += 1) {
      if (inside(x, y, ticketRect(index))) return { kind: 'ticket', id: state.orders[index].id };
    }
    return null;
  }

  function act(zone) {
    if (!zone) return;
    audio.unlock();
    if (zone.kind === 'bin') {
      if (world.addIngredient(zone.id)) audio.place();
    } else if (zone.kind === 'grill') {
      if (world.takeGrill(zone.slot)) audio.place();
    } else if (zone.kind === 'trash') {
      if (world.trashPlate()) audio.click();
    } else if (zone.kind === 'serve') {
      const events = world.serveMatching();
      if (events) audio.ding();
    } else if (zone.kind === 'ticket') {
      const events = world.serveOrder(zone.id);
      if (events) audio.ding();
      else audio.buzz();
    }
  }

  function onClick(event) {
    audio.unlock();
    if (state.screen === SCREENS.TITLE || state.screen === SCREENS.OVER) {
      world.start();
      audio.click();
      return;
    }
    if (state.screen === SCREENS.PAUSED) {
      world.togglePause();
      return;
    }
    const point = toStage(event);
    act(zoneAt(point.x, point.y));
  }

  function onMove(event) {
    const point = toStage(event);
    canvas.style.cursor = zoneAt(point.x, point.y) ? 'pointer' : 'default';
  }

  function onKey(event) {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'enter') {
      audio.unlock();
      if (state.screen !== SCREENS.PLAY) world.start();
      return;
    }
    if (key === 'm') {
      audio.toggleMute();
      return;
    }
    if (state.screen !== SCREENS.PLAY) return;
    if (key === 'p' || key === 'escape') {
      world.togglePause();
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      const events = world.serveMatching();
      if (events) audio.ding();
      return;
    }
    if (key === 't') {
      if (world.trashPlate()) audio.click();
      return;
    }
    const ingredient = INGREDIENTS.find((item) => item.key === key);
    if (ingredient && world.addIngredient(ingredient.id)) audio.place();
  }

  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousemove', onMove);
  window.addEventListener('keydown', onKey);

  return {
    destroy() {
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKey);
    },
  };
}
