// Every pixel of the kitchen, drawn with canvas shapes — no image files, no network.
// Geometry helpers (ticketRect, grillSlotRect, binRect) are shared with input.js so a
// click lands exactly where the picture shows it.
import {
  BIN, GRILL_SLOT, INGREDIENTS, INGREDIENT_BY_ID, LAYOUT, SCREENS, SHIFT_SECONDS,
  TICKET, VIEW, WIN_SCORE,
} from './config.js';
import { plateMatchesOrder } from './world.js';

export function ticketRect(index) {
  return {
    x: LAYOUT.board.x + 12,
    y: LAYOUT.board.y + 44 + index * (TICKET.h + TICKET.gap),
    w: TICKET.w,
    h: TICKET.h,
  };
}

export function grillSlotRect(index) {
  return {
    x: LAYOUT.grill.x + 18 + index * (GRILL_SLOT.w + GRILL_SLOT.gap),
    y: LAYOUT.grill.y + 92,
    w: GRILL_SLOT.w,
    h: GRILL_SLOT.h,
  };
}

export function binRect(index) {
  return {
    x: LAYOUT.bins.x + index * (BIN.w + BIN.gap),
    y: LAYOUT.bins.y,
    w: BIN.w,
    h: BIN.h,
  };
}

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.35);
  ctx.bezierCurveTo(x - size, y - size * 0.55, x - size * 0.35, y - size, x, y - size * 0.35);
  ctx.bezierCurveTo(x + size * 0.35, y - size, x + size, y - size * 0.55, x, y + size * 0.35);
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = '#e63946';
    ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// One ingredient, drawn at centre (cx, cy) inside a box of size s.
export function drawIngredientIcon(ctx, id, cx, cy, s) {
  const ing = INGREDIENT_BY_ID[id];
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, s * 0.08, s * 0.42, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.fillRect(-s * 0.42, s * 0.06, s * 0.84, s * 0.12);
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.2, -0.18], [0.05, -0.28], [0.22, -0.12]]) {
      ctx.beginPath();
      ctx.ellipse(dx * s, dy * s, s * 0.045, s * 0.03, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = ing.color;
    roundRect(ctx, -s * 0.44, -s * 0.2, s * 0.88, s * 0.4, s * 0.12);
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = s * 0.045;
    for (const dx of [-0.22, 0, 0.22]) {
      ctx.beginPath();
      ctx.moveTo(dx * s, -s * 0.16);
      ctx.lineTo(dx * s, s * 0.16);
      ctx.stroke();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, s * 0.28);
    ctx.lineTo(s * 0.42, s * 0.28);
    ctx.lineTo(0, -s * 0.32);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-0.12, 0.08], [0.14, 0.14], [0, -0.1]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = ing.color;
    for (const [dx, dy, r] of [[-0.22, 0.05, 0.24], [0, -0.08, 0.26], [0.22, 0.05, 0.24]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, r * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, 0);
    ctx.quadraticCurveTo(0, s * 0.16, s * 0.3, 0);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(0, s * 0.04, s * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, -s * 0.1, s * 0.1, s * 0.07, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4d9a44';
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.lineTo(0, -s * 0.42);
    ctx.stroke();
  } else if (id === 'onion') {
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = s * 0.07;
    for (const r of [0.36, 0.24, 0.12]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = s * 0.05;
    for (const r of [0.26, 0.13]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * s, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawFlame(ctx, x, y, size, t, seed) {
  const flicker = 1 + 0.18 * Math.sin(t * 9 + seed * 2.4);
  const height = size * flicker;
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y);
  ctx.quadraticCurveTo(x - size * 0.55, y - height * 0.6, x, y - height);
  ctx.quadraticCurveTo(x + size * 0.55, y - height * 0.6, x + size * 0.5, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y);
  ctx.quadraticCurveTo(x - size * 0.3, y - height * 0.4, x, y - height * 0.62);
  ctx.quadraticCurveTo(x + size * 0.3, y - height * 0.4, x + size * 0.28, y);
  ctx.closePath();
  ctx.fill();
}

function drawWallAndFloor(ctx) {
  ctx.fillStyle = '#f3dfba';
  ctx.fillRect(0, 0, VIEW.width, 470);
  ctx.fillStyle = '#e9cda0';
  for (let x = 0; x < VIEW.width; x += 96) {
    ctx.fillRect(x, 452, 96, 6);
  }
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(0, 458, VIEW.width, 12);
  ctx.fillStyle = '#c98f5f';
  ctx.fillRect(0, 470, VIEW.width, VIEW.height - 470);
  ctx.fillStyle = '#b87a4e';
  for (let x = 0; x < VIEW.width; x += 128) {
    for (let y = 470; y < VIEW.height; y += 110) {
      ctx.fillRect(x + ((y / 110) % 2 === 0 ? 0 : 64), y, 2, 110);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 470, VIEW.width, 10);
}

function drawHud(ctx, state, best) {
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(0, 0, VIEW.width, 72);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SIZZLE STATION', 24, 38);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText('The Copper Ladle Rush', 268, 40);

  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = Math.floor(state.timeLeft % 60);
  const timeText = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const urgent = state.timeLeft <= 30;
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillStyle = urgent && Math.floor(state.elapsed * 2) % 2 === 0 ? '#ff6b6b' : '#ffffff';
  ctx.fillText(`TIME ${timeText}`, 640, 30);
  const barW = 320;
  const frac = state.timeLeft / SHIFT_SECONDS;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, 640 - barW / 2, 50, barW, 10, 5);
  ctx.fill();
  ctx.fillStyle = urgent ? '#ff6b6b' : '#7bc96f';
  roundRect(ctx, 640 - barW / 2, 50, barW * frac, 10, 5);
  ctx.fill();

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(908, 30, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b97f3a';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('C', 908, 31);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(`${state.score} coins`, 1060, 30);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(`served ${state.served} · best ${best}`, 1060, 56);
  for (let index = 0; index < 3; index += 1) {
    drawHeart(ctx, 1120 + index * 44, 36, 15, index < 3 - state.strikes);
  }
  if (state.combo >= 2) {
    ctx.fillStyle = '#ff9f1c';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`COMBO x${state.combo}`, 1120, 62);
  }
}

function drawBoard(ctx, state) {
  const board = LAYOUT.board;
  ctx.fillStyle = '#2e3a46';
  roundRect(ctx, board.x, board.y, board.w, board.h, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ORDER BOARD', board.x + 16, board.y + 22);
  ctx.fillStyle = '#9fb3c8';
  ctx.font = '15px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(state.orders.length === 0 ? 'no orders yet' : 'click a ticket to serve it', board.x + board.w - 14, board.y + 22);
  ctx.textAlign = 'left';
  state.orders.forEach((order, index) => {
    const rect = ticketRect(index);
    const matched = state.plate.length > 0 && plateMatchesOrder(state.plate, order);
    const frac = Math.max(0, order.patience / order.maxPatience);
    ctx.fillStyle = matched ? '#e8f9e2' : '#fff8e7';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    if (matched) {
      ctx.strokeStyle = '#4d9a44';
      ctx.lineWidth = 3;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
      ctx.stroke();
    } else if (order.patience < 10) {
      ctx.strokeStyle = Math.floor(state.elapsed * 3) % 2 === 0 ? '#e63946' : '#ffb3b3';
      ctx.lineWidth = 3;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
      ctx.stroke();
    }
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(order.label, rect.x + 12, rect.y + 20);
    order.items.forEach((id, itemIndex) => {
      drawIngredientIcon(ctx, id, rect.x + 74 + itemIndex * 44, rect.y + 26, 34);
    });
    ctx.fillStyle = '#c9ced6';
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 16, rect.w - 24, 8, 4);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#7bc96f' : frac > 0.25 ? '#f7c948' : '#e63946';
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 16, (rect.w - 24) * frac, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(matched ? 'READY — SERVE!' : `${Math.ceil(order.patience)}s`, rect.x + rect.w - 12, rect.y + 20);
    ctx.textAlign = 'left';
  });
}

function drawGrill(ctx, state) {
  const grill = LAYOUT.grill;
  ctx.fillStyle = '#4a4e57';
  roundRect(ctx, grill.x, grill.y, grill.w, grill.h, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('GRILL', grill.x + 16, grill.y + 22);
  ctx.fillStyle = '#c9ced6';
  ctx.font = '15px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('patties cook 7s — grab them in time', grill.x + grill.w - 14, grill.y + 22);
  ctx.textAlign = 'left';
  state.grill.forEach((slot, index) => {
    const rect = grillSlotRect(index);
    ctx.fillStyle = '#23262b';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 3;
    for (let line = 1; line <= 3; line += 1) {
      const y = rect.y + (rect.h / 4) * line;
      ctx.beginPath();
      ctx.moveTo(rect.x + 10, y);
      ctx.lineTo(rect.x + rect.w - 10, y);
      ctx.stroke();
    }
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2 - 8;
    if (slot.state === 'cooking') {
      drawFlame(ctx, cx - 46, rect.y + rect.h - 16, 22, state.elapsed, index);
      drawFlame(ctx, cx + 46, rect.y + rect.h - 16, 18, state.elapsed, index + 3);
      drawIngredientIcon(ctx, 'patty', cx, cy, 92);
      const frac = slot.t / 7;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      roundRect(ctx, rect.x + 14, rect.y + rect.h - 22, rect.w - 28, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      roundRect(ctx, rect.x + 14, rect.y + rect.h - 22, (rect.w - 28) * frac, 10, 5);
      ctx.fill();
    } else if (slot.state === 'ready') {
      ctx.save();
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 22;
      drawIngredientIcon(ctx, 'patty', cx, cy, 96);
      ctx.restore();
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY!', cx, rect.y + rect.h - 12);
      ctx.textAlign = 'left';
    } else if (slot.state === 'burnt') {
      drawIngredientIcon(ctx, 'patty', cx, cy, 92);
      ctx.fillStyle = 'rgba(20,20,20,0.55)';
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9aa0a6';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BURNT — click to bin it', cx, rect.y + rect.h - 12);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = '#7c828d';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('empty', cx, cy);
      ctx.textAlign = 'left';
    }
  });
}

function drawPlateStation(ctx, state) {
  const area = LAYOUT.plate;
  ctx.fillStyle = '#e8dcc3';
  roundRect(ctx, area.x, area.y, area.w, area.h, 14);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('YOUR PLATE', area.x + 16, area.y + 22);
  ctx.fillStyle = '#8a7a5f';
  ctx.font = '15px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('build the dish here', area.x + area.w - 14, area.y + 22);
  ctx.textAlign = 'left';
  const cx = area.x + area.w / 2;
  const plateY = area.y + 196;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, plateY, 158, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9b892';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, plateY, 158, 46, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, plateY, 118, 32, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (state.plate.length === 0) {
    ctx.fillStyle = '#a89a7c';
    ctx.font = 'italic 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('empty plate — add ingredients below', cx, plateY - 8);
    ctx.textAlign = 'left';
  } else {
    // The bun always reads as the base of the stack, whatever order it was added in.
    const display = [...state.plate].sort((a, b) => (a === 'bun' ? 0 : 1) - (b === 'bun' ? 0 : 1));
    display.forEach((id, index) => {
      const y = plateY - 14 - index * 16;
      const width = 150 - index * 4;
      drawIngredientIcon(ctx, id, cx, y, width);
    });
  }
  const matched = state.plate.length > 0 && state.orders.some((order) => plateMatchesOrder(state.plate, order));
  const serve = LAYOUT.serve;
  ctx.fillStyle = matched ? '#4d9a44' : '#7c828d';
  roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
  ctx.fill();
  if (matched) {
    ctx.save();
    ctx.shadowColor = '#7bc96f';
    ctx.shadowBlur = 16;
    roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(matched ? 'SERVE!  [Space]' : 'SERVE  [Space]', serve.x + serve.w / 2, serve.y + serve.h / 2 + 1);
  const trash = LAYOUT.trash;
  ctx.fillStyle = state.plate.length > 0 ? '#b3543f' : '#7c828d';
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('CLEAR  [T]', trash.x + trash.w / 2, trash.y + trash.h / 2 + 1);
  ctx.textAlign = 'left';
}

function drawBins(ctx, state) {
  ctx.fillStyle = '#3a2a1a';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('INGREDIENTS — click a bin or press its key', LAYOUT.bins.x + 4, LAYOUT.bins.y - 16);
  INGREDIENTS.forEach((ing, index) => {
    const rect = binRect(index);
    const onGrill = ing.id === 'patty' && state.grill.every((slot) => slot.state !== 'empty');
    ctx.fillStyle = onGrill ? '#6b6257' : '#fff8e7';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.fill();
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = 2;
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
    ctx.stroke();
    drawIngredientIcon(ctx, ing.id, rect.x + rect.w / 2, rect.y + 74, 104);
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ing.name, rect.x + rect.w / 2, rect.y + 142);
    ctx.fillStyle = '#8a7a5f';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(ing.id === 'patty' ? 'goes on the grill' : 'straight on the plate', rect.x + rect.w / 2, rect.y + 166);
    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`[${ing.key}]`, rect.x + rect.w / 2, rect.y + 24);
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = '#fff3d6';
  ctx.font = '15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Keys 1–6 add ingredients · Space serves · T clears the plate · P pauses · M mutes', VIEW.width / 2, 782);
  ctx.textAlign = 'left';
}

function drawMessage(ctx, state) {
  if (!state.message || state.flash <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, state.flash);
  ctx.font = 'bold 22px system-ui, sans-serif';
  const width = ctx.measureText(state.message).width + 36;
  ctx.fillStyle = 'rgba(58,42,26,0.92)';
  roundRect(ctx, VIEW.width / 2 - width / 2, 436, width, 44, 22);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.message, VIEW.width / 2, 459);
  ctx.restore();
  ctx.textAlign = 'left';
}

function drawOverlay(ctx) {
  ctx.fillStyle = 'rgba(30,20,10,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function drawTitle(ctx, best) {
  drawOverlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 84px system-ui, sans-serif';
  ctx.fillText('SIZZLE STATION', VIEW.width / 2, 250);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText('The Copper Ladle Rush', VIEW.width / 2, 308);
  ctx.fillStyle = '#fff3d6';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('You are the line cook. Tickets land on the board — build each dish', VIEW.width / 2, 380);
  ctx.fillText('on your plate and serve it before the customer walks out.', VIEW.width / 2, 412);
  ctx.fillText('Patties need the grill: 7 seconds to cook, then grab them fast.', VIEW.width / 2, 444);
  ctx.fillText('Three strikes, or the end of the 3-minute shift, ends your run.', VIEW.width / 2, 476);
  ctx.fillStyle = '#7bc96f';
  ctx.font = `bold 26px system-ui, sans-serif`;
  ctx.fillText(`Serve ${WIN_SCORE} coins' worth before the clock runs out to win the Golden Ladle.`, VIEW.width / 2, 528);
  if (best > 0) {
    ctx.fillStyle = '#ffd166';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(`Your best shift: ${best} coins`, VIEW.width / 2, 566);
  }
  const pulse = 0.65 + 0.35 * Math.sin(Date.now() / 350);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText('Click or press Enter to start cooking', VIEW.width / 2, 640);
  ctx.restore();
  ctx.textAlign = 'left';
}

function drawPaused(ctx) {
  drawOverlay(ctx);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px system-ui, sans-serif';
  ctx.fillText('PAUSED', VIEW.width / 2, 380);
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillStyle = '#fff3d6';
  ctx.fillText('Press P or click to get back to the pass.', VIEW.width / 2, 432);
  ctx.textAlign = 'left';
}

function drawOver(ctx, state, best) {
  drawOverlay(ctx);
  const over = state.over;
  ctx.textAlign = 'center';
  if (over.won) {
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 72px system-ui, sans-serif';
    ctx.fillText('GOLDEN LADLE!', VIEW.width / 2, 260);
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px system-ui, sans-serif';
    ctx.fillText('The rush is yours. The Copper Ladle shines tonight.', VIEW.width / 2, 318);
  } else {
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 72px system-ui, sans-serif';
    ctx.fillText('SHIFT OVER', VIEW.width / 2, 260);
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px system-ui, sans-serif';
    ctx.fillText(
      state.strikes >= 3 ? 'Three strikes — the pass closed on you.' : 'The clock beat you to the pass.',
      VIEW.width / 2,
      318,
    );
  }
  ctx.fillStyle = '#fff3d6';
  ctx.font = '26px system-ui, sans-serif';
  ctx.fillText(`Score: ${over.score} coins  ·  Dishes served: ${over.served}  ·  Best combo: x${over.bestCombo}`, VIEW.width / 2, 400);
  ctx.fillText(`Target was ${WIN_SCORE} coins. Your best shift: ${Math.max(best, over.score)} coins.`, VIEW.width / 2, 440);
  const pulse = 0.65 + 0.35 * Math.sin(Date.now() / 350);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText('Click or press Enter to cook again', VIEW.width / 2, 520);
  ctx.restore();
  ctx.textAlign = 'left';
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return {
    draw(state, screen, best) {
      ctx.clearRect(0, 0, VIEW.width, VIEW.height);
      drawWallAndFloor(ctx);
      drawHud(ctx, state, best);
      drawBoard(ctx, state);
      drawGrill(ctx, state);
      drawPlateStation(ctx, state);
      drawBins(ctx, state);
      drawMessage(ctx, state);
      if (screen === SCREENS.TITLE) drawTitle(ctx, best);
      else if (screen === SCREENS.PAUSED) drawPaused(ctx);
      else if (screen === SCREENS.OVER) drawOver(ctx, state, best);
    },
  };
}
