# Still You — Project Review

This is the running design + code document for **Still You**, an interactive 2D pixel-art web experience for VIS 160A. It covers:

1. How the game works now (file by file)
2. The 4-hallway architecture and content
3. The bug fix for the end-of-hallway lock
4. The new visual treatment (more game-like, more nostalgic)
5. The storyboard and flowchart deliverables
6. Code review (applied + recommended)
7. VIS 160A connections
8. How to run, and what's where

All code edits are applied in `project/js/`. The storyboard and flowchart live in `project/docs/`.

---

## 1. How the game works

The project is a single Phaser 3 scene loaded from a small HTML page. No build step, no bundler. Each JS file owns one subsystem.

### Load order (`index.html`)

```
config -> state -> hallways -> visuals -> dialogue -> interactables -> ending -> player -> scene -> main
```

### File-by-file

- **`config.js`** — `gameWidth/Height`, `worldWidth/Height`, the hallway band coordinates, and the Phaser config. The world is `1800 × 480`; the viewport is `640 × 480` (4:3) for the boxed-memory feeling.
- **`state.js`** — shared globals. Includes the multi-hallway state (`currentHallwayIndex`, `currentHallwayObjects`), the doorway state (`doorwayActive`, `isTransitioning`), nested choice tracking (`playerChoices[hallwayId][memoryId] = choiceId`), and references to every UI piece.
- **`hallways.js`** *(new)* — all four years as data: palette, memory list, per-year doorway reflection variants, transition line. Also owns the lifecycle functions `loadHallway`, `transitionToNextHallway`, `restartGame`, and `destroyHallwayObjects`.
- **`visuals.js`** *(new)* — hallway atmosphere: sky/ceiling band, floor band, windows along the back wall (framed glass with a cross mullion + sill + soft light spill below), tile strips, overhead lamp pools, drifting dust particles. Plus one-time HUD effects: CRT scanlines and a vignette frame.
- **`dialogue.js`** — the three-state dialogue machine (`initial → prompt → response → closed`), with cursor restoration on re-open so the player can revise.
- **`interactables.js`** — builds each memory: base rectangle (physics body + highlight target) plus a small composite "icon" drawn on top so each memory reads as a recognizable object (box, key, paper, plate, phone, cup, envelope, lanyard, folder, photo, week-grid, page-stack, cap, doorway). Maintains the `?` → `·` hint swap and the brightening floor glow.
- **`ending.js`** — the doorway system at each hallway's right edge. Shows a year-end reflection built from that year's choices, with `[E]` to advance and `[Q]` to back out and revise. On the final year, the same overlay shows a cumulative reflection drawn from all four years, and `[E]` restarts the game.
- **`player.js`** — composite pixel-style sprite (hair, head, eyes, torso, collar, legs) with a tiny leg-bob walk cycle, and the global input keys including `Q` for back-out.
- **`scene.js`** — preload/create/update. Create builds the persistent HUD (help line, scanlines, vignette, dialogue box, camera follow) and then calls `loadHallway(this, 0)`. Update routes input based on which mode is active (doorway, transition, dialogue, normal).
- **`main.js`** — boots Phaser, wires the fullscreen button.

---

## 2. The 4-hallway architecture and content

### Per-hallway shape

Each entry in `hallwayDefinitions` looks like:

```javascript
{
  id: "year1",
  year: 1,
  label: "Year 1  —  Arrival",
  palette: {
    sky, floor, floorAccent, stroke,
    door, doorStroke, particle, ambient, labelColor
  },
  memories: [ /* 5 memory definitions */ ],
  doorwayReflections: {
    keep:    "...",   // dominant "keep" choice pattern
    leave:   "...",   // dominant "leave" choice pattern
    pass_on: "...",   // dominant "pass forward" pattern
    mixed:   "..."    // no dominant tendency
  },
  transitionLine: "Year 2 begins."
}
```

### Years and themes

| Year | Theme | Palette | Memories |
|---|---|---|---|
| 1 — Arrival | What you brought with you | Cool blue | packed box, dorm key, syllabus, lonely meal photo, first call |
| 2 — Settling | What you started keeping | Dim green | major form, unread message, notebook, club sticker, coffee cup |
| 3 — Reckoning | What you weighed yourself against | Amber | rejection email, lanyard, half-built portfolio, group photo, empty week |
| 4 — Becoming | What you carry out | Warm white | thesis draft, graduation cap, goodbye note, empty room, old photo |

### Choice taxonomy

Every memory across every year offers three thematically consistent options:

- **keep** — hold on, carry forward
- **leave** — let go, release
- **pass_on** — share, forward to someone else

This is what makes the per-year reflection and the final cumulative reflection coherent. The doorway picks the dominant tendency for that year (or "mixed" on a tie / zero) and shows the matching reflection line.

### Lifecycle

- `loadHallway(scene, index)` tears down the previous hallway's objects (everything pushed to `currentHallwayObjects` gets `destroy()`'d), resets per-hallway state, builds the new atmosphere, year label, memories, and doorway, then resets the player to `x=200`.
- `transitionToNextHallway(scene)` camera-fades to black, loads the next hallway, camera-fades back in. Guarded by `isTransitioning` so input is ignored mid-swap.
- `restartGame(scene)` runs at the very end: fade out, clear `playerChoices`, load year 0, fade in.

### Why nested `playerChoices`

`playerChoices[hallwayId][memoryId] = choiceId`. Three reasons:

1. Memory ids collide across years intentionally (every year reuses `keep` / `leave` / `pass_on` for its choices). Nesting keeps them apart.
2. `dominantTendency(Object.values(playerChoices[hw.id]))` is a clean one-liner for the per-year reflection.
3. The final ending can flatten across all years (`for hw of hallwayDefinitions; for choice of bucket`) just as cleanly.

---

## 3. Bug fix — end-of-hallway lock

### What was broken

Once the player reached the right edge of the hallway and the reflective overlay appeared, the scene's `update()` did `if (endingTriggered) return;` which killed every input path — so the overlay could not be closed, the player could not move, and previously-visited memories were unreachable.

### What the fix does

- The single boolean `endingTriggered` is gone. Replaced by `doorwayActive` (overlay visible) and `isTransitioning` (in flight between hallways). The two are distinct, so dismissing the overlay never accidentally enables movement during a transition.
- The doorway overlay is **dismissible** with two keys:
  - `[E]` continue — fades out, advances to next hallway (or restarts on Year 4).
  - `[Q]` go back — fades out, nudges the player back from the threshold so they don't immediately re-trigger; movement resumes; previously-visited memories can be re-opened and **re-chosen** (the cursor on the prompt is restored to the player's previous choice so it feels like picking up where they left off).
- When `[Q]` is used on Year 4, the prompt still works as "stay a little longer" — the cumulative reflection closes and the player can wander Year 4 freely before pressing `[E]` again for the restart.

### Where the fix lives in code

- `state.js` — `doorwayActive`, `isTransitioning` globals; removed `endingTriggered`.
- `ending.js` — `dismissDoorway(scene, advance)` tweens the overlay out and either advances or nudges back; `updateDoorwayTrigger` checks `doorwayActive || isTransitioning || isDialogueOpen` before showing anything.
- `scene.js` — update routes `[E]` vs `[Q]` while `doorwayActive`; ignores all input while `isTransitioning`.
- `player.js` — movement blocked by `isDialogueOpen || doorwayActive || isTransitioning`.

---

## 4. New visual treatment — game-like + nostalgic

### What changed

The hallway was previously a single dark band with three colored squares. It is now:

- **Sky / ceiling band** above the hallway, tinted per year.
- **Hallway floor band** in the year's primary color.
- **Windows along the back wall** every `230px`, each a framed pane with a cross mullion and a sill, plus a faint wash of the year's ambient light over the glass and a soft pool of light spilling down the wall below. The hallway reads as somewhere — a place with architecture — instead of a blank corridor. Window x-centres are also remembered in `windowPositions` so the Year 4 "stay a while" sun-ray effect knows where to anchor the rays.
- **Floor tile lines** every `64px` along the front edge of the floor band, suggesting tile seams in perspective.
- **Wall baseline and floor edge** — thin horizontal strokes that anchor the band visually.
- **Overhead lamp pools** every `220px` — a soft elliptical light at the top of the band and a wider, dimmer pool below, suggesting ceiling lamps. The hallway is lit, not just colored.
- **Drifting dust particles** — 14 tiny tinted circles per hallway, slow yoyo tweens, opacity pulsing between `0.15` and `0.45`. Feels like late afternoon dust through old windows.
- **CRT scanlines** — `1px` lines at `3px` cadence over the whole viewport at `0.18` alpha. Old-cartridge feel.
- **Vignette frame** — multiple layered dark edges, darkest at the corners. Pulls the eye to the center.
- **Year label** in the year's accent color, top-center of the viewport.

### Per-year palette

| Year | Sky | Floor | Accent | Ambient | Particles |
|---|---|---|---|---|---|
| 1 | `#070a14` | `#0d111c` | `#1a2438` | `#4a6088` | `#6a88c0` |
| 2 | `#07120a` | `#0d1810` | `#182c1f` | `#4e7058` | `#7eb088` |
| 3 | `#140a05` | `#1c1208` | `#33240f` | `#8e6628` | `#ddb066` |
| 4 | `#12110d` | `#1c1a14` | `#36322a` | `#a49a78` | `#e6dfc6` |

Each year shifts the whole hallway tone subtly but unmistakably. The palette transition mirrors the emotional arc — blue (uncertain), green (settling), amber (reckoning), warm white (becoming).

### Player sprite

The player is now a small composite: dark hair, head, two eye dots, torso with a collar line, two legs. The legs gently bob (sine wave) when the player is moving, giving a small walk cycle without sprite art.

### Memory icons

Every memory in `interactables.js` now has an `icon` field. `drawIcon` switches on it and adds small extra shapes on top of the base rectangle so each memory reads as a recognizable object: a box has a tape stripe, a key has a hole, paper has text lines, a plate has food, a phone has a screen, a notebook has spiral holes, a sticker has a star, a cup has a handle, an envelope has a flap, a lanyard has a badge, a folder has a tab, a photo has head dots, a "week" has 7 day-cells, a stack of pages is offset, a cap has a tassel, and the "empty room" memory has a doorway inside it. The base rect remains the highlight target.

---

## 5. Storyboard and flowchart deliverables

Two new docs in `project/docs/`:

- **`storyboard.html`** — a standalone visual storyboard. Cover, project arc table, common visual language, then four full year panels. Each year panel has its color palette swatches, an inline SVG mockup showing the hallway with that year's tint and memories in place, a 5-card grid of the memories (with small inline-SVG icons for Year 1, and titles + choice lists for years 2–4), the four doorway reflection variants (`keep` / `leave` / `pass_on` / `mixed`), and the transition line. At the bottom, the system flowchart is embedded inline.
- **`flowchart.svg`** — the same flowchart as a standalone file so you can drop it into a presentation slide or a project page without opening the storyboard. It has four sections: per-frame game loop (input → movement → proximity → dialogue → choice → doorway trigger), dialogue state machine (closed / initial / prompt / response with the W/S cursor loop), memory model (the data shape and where it writes), and multi-hallway flow (Year 1 → Year 2 → Year 3 → Year 4 → cumulative ending, with `[Q]` backtrack arrows under each year and the restart arc from the ending back to Year 1).

Both docs were designed for VIS 160A presentation use — same monospace font and dark palette as the game itself.

---

## 6. Code review

### What was already strong

- Single-source state in `state.js` so any module can read the world without import plumbing.
- File-per-subsystem layout that scales linearly: each new feature lives in its own file rather than bloating a single one.
- Anticipatory state machine: the dialogue states and `playerChoices` were declared before any code used them. The whole branching + ending feature dropped in cleanly because the names were already there.
- The 4:3 viewport over a wider world: exactly the right call for "framed memories."

### Improvements applied in this pass

- **Globals split by purpose.** Dialogue overlay refs, hallway lifecycle refs, doorway refs, and ambient refs are all grouped in `state.js` with comments — easier to see what's mutable from where.
- **Data-driven hallways.** Adding a new year is now one entry in the `hallwayDefinitions` array. Adding a new memory is one entry in that year's `memories` array.
- **Nested choice store.** `playerChoices[hallwayId][memoryId]` instead of a flat dict — survives year-id collisions and makes per-year aggregation trivial.
- **Cursor restoration on re-open.** Re-opening dialogue on a memory the player already chose for places the cursor on the previous choice, so backtracking feels continuous, not reset.
- **Doorway is reusable.** Same code drives every year's threshold; the only difference is whether `isFinalHallway()` is true, in which case the text builder pulls across years and the `[E]` action restarts instead of advancing.
- **Persistent UI vs. per-hallway UI.** Things that survive transitions (dialogue box, HUD, scanlines, vignette) are built in `scene.create`. Everything that should be rebuilt (atmosphere, memories, doorway) is built in `loadHallway` and tracked in `currentHallwayObjects` for cleanup.

### Recommendations not applied (intentionally)

- **Real pixel art.** Sprites and tilesheets would push the look further. The composite-rectangle approach is a strong placeholder and matches "starter" tone, but for the presentation you may want a 16×24 character sprite and a hand-drawn tile set.
- **Sound.** Even one quiet looped ambient drone per year would change the feeling dramatically. Your notes flag "sound / silence" as an output channel — currently the project has no audio.
- **`localStorage` persistence.** Right now refreshing the page resets all choices. Saving `playerChoices` would let the player return to a hallway that remembers them. Pick this one carefully — sometimes resetting *is* the artistically right move.
- **Typewriter text effect.** A per-character reveal on `renderDialogue` would slow the player further. Easy with a Phaser timer.
- **Wall art / posters.** The back wall currently has windows. A handful of small posters or framed prints *between* the windows would add texture per year (e.g., Year 1: orientation flyers; Year 4: graduation announcements).

---

## 7. VIS 160A connections

### Game design / mechanics

- **"DO GAMEMAKER STUFF" → "Small, long hallway" → "Focus on narrative."** Four small, long hallways. Movement and pacing are the only "skills." The mechanic is reading.
- **"Mementos that influence character choices."** Every memory writes to `playerChoices`. The doorway reads from it. The ending reads across all four hallways.
- **"Optional interaction vs forced. Do users stop? Rush? Read?"** The proximity radius is 55px and the doorway is gated on engagement. A player can sprint right to the threshold and get held there until they walk back and engage. The cost of rushing is absence of resolution, not punishment.
- **"Consequences without actual punishment besides missing out."** Skipping a memory means the doorway hint shows `n/5` instead of `step through`; the year cannot resolve. There is no failure state.
- **"Skipping dialogue = missing emotional context. Exploring leads to deeper meanings unlocked."** The dominant-tendency-per-year mapping means the reflection a player gets is shaped by what they actually did. Two playthroughs will produce different doorway texts.

### Narrative & dialogue

- **"Dialogue pacing creating feeling."** The three-state machine forces three deliberate `[E]` presses per memory: read → prompt → response. Backtracking restores the cursor so revising feels continuous.
- **"Branching narratives → flowchart."** The flowchart in `docs/flowchart.svg` literally is the one your notes sketched: keyboard input → player movement → collision with object → dialogue appears → choice selected → ending changes. Now extended for four hallways and the doorway lifecycle.
- **"The ending should not judge the user, but gently reflect back a theme."** All twelve possible per-year reflections and all four final-ending lines are descriptive, not evaluative. There is no "right" pattern. The taxonomy (`keep` / `leave` / `pass_on` / `mixed`) is balanced across all four years so that no axis is rewarded.
- **"Fragmented storytelling, nonlinear memories, contradictory dialogue."** Within a hallway, memories can be approached in any order. Across hallways, the player's pattern can shift — a Year 1 keeper can become a Year 3 letter-go-er and the ending reflects that movement.

### Visual / interaction design

- **"Aspect ratio: 4:3 used for this game in order to invoke a feeling of nostalgia, compared to a more cinematic approach of the 16:9 aspect ratio."** Preserved. Reinforced now by CRT scanlines and a vignette frame.
- **"8 bit (to fit an RPG like game, mainly aesthetic)."** Composite-rectangle pixel sprites + monospace text + scanlines + repeated back-wall windows + tile lines. Stops short of full pixel art but reads as the same genre.
- **"Color and lighting to set a tone."** Per-year palette + overhead lamp pools per hallway. Each year reads as the same hallway in different light.
- **"Spotlights on objects?"** The colored floor glow under each memory acts as a spotlight, and brightens after a choice.
- **"Empty space affecting reflection."** Memories are spread `320px` apart in a `1800px` hallway. Long, deliberate stretches of empty space between encounters. The doorway opens into a black overlay — empty space that holds the reflection.
- **"Where should the dialogue box appear?"** Anchored to the bottom of the viewport, with a separate hint line beneath the body so UI never crowds the writing.
- **"Text style differences."** Three text registers: white 13px body, dim 11px hint, year-tinted 13px label. Each is visually distinct.

### Practice-based research

- **"Memory system (hardest?)."** Built and reusable: every memory writes to a nested dict, every doorway reads from it, every year is data not code.
- **"Each project and experience and hobby will have their own personality, banter."** The data shape allows it — every memory has its own initial, prompt, choices, responses. Adding more characters means adding more entries to a year's `memories` array.
- **"A living memory."** The hallway visibly tracks the player: glows brighten after choices, `?` becomes `·`, the doorway hint counts up from `0/5` to `step through`. Walking back into a previous part of a hallway still shows your past choice. The hallway remembers, even if your code refreshes it on transitions.

---

## 8. How to run, and what's where

```
project/
  index.html                   — entry point
  REVIEW.md                    — this document
  css/
    base.css
    game.css
  js/
    config.js                  — width/height, Phaser config
    state.js                   — shared globals
    hallways.js                — all 4 years + lifecycle
    visuals.js                 — atmosphere, scanlines, vignette
    dialogue.js                — 3-state dialogue machine
    interactables.js           — memory objects + icon overlays
    ending.js                  — doorway + final ending
    player.js                  — sprite + controls (E, Q, WASD)
    scene.js                   — preload / create / update
    main.js                    — boots Phaser, fullscreen button
  docs/
    storyboard.html            — visual storyboard for the 4-year arc
    flowchart.svg              — system flowchart, standalone
```

### Controls

- `WASD` — move
- `E` — interact / advance dialogue / confirm choice / continue at doorway / restart at final ending
- `Q` — back out of doorway (return to current hallway and revise choices)
- `W` / `S` while a prompt is open — move the choice cursor

### To play

Open `project/index.html` in a browser. There is no build step. Phaser is loaded from CDN.

### To preview the storyboard

Open `project/docs/storyboard.html`. It's self-contained (no external assets); the flowchart is inline SVG.
