// ============================================================================
// chair.js
// The "stay a while" epilogue. Choosing "stay a little longer" at the final
// doorway brings out a chair beside the windows. Sitting in it fills the
// hallway with warm light, sun rays, and visible dust — a quiet, changed
// room. The change persists after the player stands up.
// ============================================================================

const CHAIR_X = 1150; // clear of the Year 4 memories, near the back windows

function spawnChair(scene) {
  if (chair) return; // already brought out

  const cx = CHAIR_X;
  const cy = hallwayBottom - 35;
  const wood = 0x8a6a44;
  const dark = 0x5a4228;

  // A simple side-view chair: two legs, a backrest with slats, a seat.
  const backLeg  = scene.add.rectangle(-9, 20, 4, 24, dark);
  const frontLeg = scene.add.rectangle(12, 20, 4, 24, dark);
  const backrest = scene.add.rectangle(-9, -8, 4, 30, wood);
  const slatTop  = scene.add.rectangle(-9, -18, 12, 3, wood);
  const slatMid  = scene.add.rectangle(-9, -8, 12, 3, wood);
  const seat     = scene.add.rectangle(2, 6, 26, 5, wood);

  chair = scene.add.container(cx, cy, [
    backLeg, frontLeg, backrest, slatTop, slatMid, seat
  ]);
  chair.setDepth(4); // the player (depth 5) sits in front of it

  // A soft warm glow under the chair so the player notices it appear.
  const glow = scene.add.ellipse(cx, cy + 28, 74, 16, 0xffdca0, 0.12);
  glow.setDepth(-2);
  currentHallwayObjects.push(glow);

  chairHint = scene.add.text(cx, cy - 52, "[E] sit", {
    fontFamily: "monospace",
    fontSize: "11px",
    color: "#cbb58a"
  });
  chairHint.setOrigin(0.5, 0.5);
  chairHint.setDepth(7);

  chairZone = { x: cx, y: cy, radius: 54 };
  sitState = "available";

  // Gentle fade-in so the chair "arrives" rather than pops into existence.
  chair.setAlpha(0);
  chairHint.setAlpha(0);
  scene.tweens.add({
    targets: [chair, chairHint],
    alpha: 1,
    duration: 900,
    ease: "Sine.easeInOut"
  });
}

function isNearChair() {
  if (!chairZone || sitState === "none") return false;
  return (
    Phaser.Math.Distance.Between(player.x, player.y, chairZone.x, chairZone.y) <
    chairZone.radius
  );
}

function sitInChair() {
  sitState = "sitting";

  // Settle the player into the chair.
  player.x = chairZone.x + 2;
  player.y = chairZone.y - 8;
  player.setVelocity(0);
  if (player.body) {
    player.body.reset(player.x, player.y);
  }

  if (chairHint) chairHint.setText("[E] stand up");

  // The quiet, warm transformation of the room.
  illuminateRoom(gameScene);
}

function standFromChair() {
  sitState = "available";

  // Step the player just to the side of the chair.
  player.x = chairZone.x - 44;
  if (player.body) {
    player.body.reset(player.x, player.y);
  }

  if (chairHint) chairHint.setText("[E] sit");
  // The room stays changed — the warm light does not fade.
}

// Per-frame: brighten the chair hint when the player is close.
function updateChairHint() {
  if (!chairHint || sitState === "none") return;
  if (sitState === "sitting") {
    chairHint.setAlpha(1);
    return;
  }
  chairHint.setAlpha(isNearChair() ? 1 : 0.4);
}

// Linear-interpolate between two 0xRRGGBB colours. t in [0, 1].
function lerpColor(c1, c2, t) {
  const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
  const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return (r << 16) | (g << 8) | b;
}

// ---------------------------------------------------------------------------
// The warm transformation. Sun pours straight down through the windows, a
// yellow-to-orange gradient settles over the whole room, light pools on the
// floor beneath each window, and the dust thickens and catches the light.
// Everything fades in slowly over ~5 seconds for a gentle reveal, and stays
// — the room is changed for the rest of this Year 4 visit.
// ---------------------------------------------------------------------------
function illuminateRoom(scene) {
  if (roomIlluminated) return;
  roomIlluminated = true;

  const FADE = 15000; // ~15-second gentle reveal
  const lit = [];

  // --- Yellow -> orange gradient over the whole hallway interior. ---
  // Phaser fills are solid, so a stack of overlapping horizontal bands fakes
  // a gradient: warm yellow up near the windows, deepening to orange by the
  // floor.
  const BANDS = 8;
  const span = hallwayBottom - hallwayTop;
  const bandH = span / BANDS;
  for (let i = 0; i < BANDS; i++) {
    const t = i / (BANDS - 1); // 0 at the top, 1 at the floor
    const color = lerpColor(0xffcf3d, 0xff6a1f, t);
    const band = scene.add.rectangle(
      worldWidth / 2,
      hallwayTop + bandH * (i + 0.5),
      worldWidth,
      bandH * 1.9, // taller than its slot so neighbours overlap and blend
      color, 0
    );
    band.setDepth(-6);
    lit.push(band);
    scene.tweens.add({
      targets: band,
      fillAlpha: 0.14,
      duration: FADE,
      ease: "Sine.easeInOut"
    });
  }

  // --- Diagonal sun shafts angling in through the windows and fading out
  //     around the middle of the hallway. Keeping them short and slanted
  //     reads as light (not pillars) and leaves the hallway's perspective
  //     intact — the whole-room gradient above carries the warmth the rest
  //     of the way down. ---
  const winGlassY = hallwayTop + 42;            // matches createAtmosphere
  const rayRot = -0.5;                          // diagonal, down-and-right
  const rayEndY = (hallwayTop + hallwayBottom) / 2 + 20; // ~mid-hallway
  const rayLen = (rayEndY - winGlassY) / Math.cos(rayRot);
  const sinR = Math.sin(rayRot);
  const cosR = Math.cos(rayRot);

  for (const wx of windowPositions) {
    // Two parallel shafts, roughly under the window's two panes. Each shaft
    // is positioned so its TOP end sits at the window and it ends mid-hall.
    for (const offset of [-10, 12]) {
      const cx = (wx + offset) - (rayLen / 2) * sinR;
      const cy = winGlassY + (rayLen / 2) * cosR;
      const beam = scene.add.rectangle(cx, cy, 16, rayLen, 0xffe27a, 0);
      beam.setRotation(rayRot);
      beam.setDepth(-5);
      lit.push(beam);
      scene.tweens.add({
        targets: beam,
        fillAlpha: 0.13,
        duration: FADE,
        delay: 600,
        ease: "Sine.easeInOut"
      });
    }

    // A soft pool of light where the shafts land, mid-hallway.
    const landX = (wx + 1) - rayLen * sinR;
    const pool = scene.add.ellipse(landX, rayEndY, 150, 40, 0xffa84a, 0);
    pool.setDepth(-5);
    lit.push(pool);
    scene.tweens.add({
      targets: pool,
      fillAlpha: 0.13,
      duration: FADE,
      ease: "Sine.easeInOut"
    });
  }

  // --- Thicker, brighter dust drifting in the light. ---
  for (let i = 0; i < 32; i++) {
    const dx = Phaser.Math.Between(0, gameWidth);
    const dy = Phaser.Math.Between(40, gameHeight - 70);
    const mote = scene.add.circle(dx, dy, Phaser.Math.Between(1, 2), 0xffd87e, 0);
    mote.setScrollFactor(0);
    mote.setDepth(845);
    lit.push(mote);
    scene.tweens.add({
      targets: mote,
      fillAlpha: Phaser.Math.FloatBetween(0.4, 0.85),
      duration: 7000,
      delay: i * 90,
      ease: "Sine.easeInOut"
    });
    scene.tweens.add({
      targets: mote,
      x: dx + Phaser.Math.Between(-55, 55),
      y: dy + Phaser.Math.Between(-35, 35),
      duration: Phaser.Math.Between(4500, 9000),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  // Track it all so a hallway change / restart tears it down cleanly.
  for (const obj of lit) {
    currentHallwayObjects.push(obj);
  }
}
