# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/mbahjito087-stack/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/mbahjito087-stack/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Sizzle Station — The Copper Ladle Rush: a fast-paced cooking game. Tickets land on the order board, you grill patties, stack burgers on your plate and serve them before the customer walks out. Three strikes, or the end of the 3-minute shift, ends your run — serve 300 coins' worth to win the Golden Ladle.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=2behakk4&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>

## How to play

- **Order board** (top left): each ticket shows the dish a customer wants, with a patience bar. Click a ticket — or press Space when your plate matches it — to serve.
- **Grill** (top middle): patties cook for 7 seconds, stay good for 6 more, then burn. Click a ready patty to move it to your plate; click a burnt one to bin it.
- **Your plate** (top right): build the dish here. Bun, cheese, lettuce, tomato and onion go straight on; only the patty needs the grill.
- **Ingredients** (bottom): click a bin or press keys 1–6. T clears the plate, P pauses, M mutes.
- **Scoring**: a served dish pays its base plus a tip for patience left, plus a combo bonus for serving dish after dish without a mistake. A wrong dish or a walked-out customer costs one of three strikes.

No build step, no network request: `game/index.html` and its modules are plain static files, and the game is fully playable offline in a desktop browser. Sounds are synthesised with WebAudio — no audio files.
