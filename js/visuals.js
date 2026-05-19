// ============================================================================
// visuals.js
// Hallway atmosphere: walls, windows, floor tiles, CRT scanlines, vignette,
// ambient dust particles.  Per-hallway visuals are rebuilt on transition.
// One-time HUD effects (scanlines, vignette) are added in scene.create.
// ============================================================================

// ---------------------------------------------------------------------------
// Per-hallway environment.  Pushed onto currentHallwayObjects so the loader
// can tear it all down when the year changes.
// ---------------------------------------------------------------------------
function createAtmosphere(scene, hallway) {
  const p = hallway.palette;

  // Upper area (sky / ceiling).
  const sky = scene.add.rectangle(
    worldWidth / 2, hallwayTop / 2,
    worldWidth, hallwayTop,
    p.sky
  );
  sky.setDepth(-10);
  currentHallwayObjects.push(sky);

  // Hallway interior — the dark band the player walks in.
  const floor = scene.add.rectangle(
    worldWidth / 2,
    (hallwayTop + hallwayBottom) / 2,
    worldWidth,
    hallwayBottom - hallwayTop,
    p.floor
  );
  floor.setDepth(-9);
  currentHallwayObjects.push(floor);

  // Windows along the back wall — repeated at a steady cadence so the
  // hallway reads as somewhere instead of an empty band. A framed pane with
  // a cross mullion + sill makes them unmistakably windows (testers were
  // reading the old plain rectangles as doors, or as nothing at all).
  const windowY = hallwayTop + 42;
  const winW = 46;
  const winH = 40;
  windowPositions = []; // refreshed each hallway; read by the sun-ray effect
  // Stop well before the doorway at the hallway's right edge so a window
  // never overlaps the "step through" threshold.
  for (let x = 150; x < worldWidth - 170; x += 230) {
    windowPositions.push(x);

    // Glass: the dark "outside", with a faint wash of the year's ambient
    // light over it so it glows slightly rather than reading as a panel.
    const glass = scene.add.rectangle(x, windowY, winW, winH, p.door);
    glass.setDepth(-8);
    currentHallwayObjects.push(glass);

    const light = scene.add.rectangle(x, windowY, winW, winH, p.ambient, 0.16);
    light.setDepth(-8);
    currentHallwayObjects.push(light);

    // Outer frame.
    const frame = scene.add.rectangle(x, windowY, winW, winH);
    frame.setStrokeStyle(3, p.doorStroke);
    frame.setDepth(-7);
    currentHallwayObjects.push(frame);

    // Cross mullion — splits the glass into four panes. This is the cue
    // that makes it unmistakably a window.
    const mullionV = scene.add.rectangle(x, windowY, 3, winH, p.doorStroke);
    mullionV.setDepth(-7);
    currentHallwayObjects.push(mullionV);

    const mullionH = scene.add.rectangle(x, windowY, winW, 3, p.doorStroke);
    mullionH.setDepth(-7);
    currentHallwayObjects.push(mullionH);

    // Sill — a slightly wider ledge beneath the window.
    const sill = scene.add.rectangle(x, windowY + winH / 2 + 3, winW + 10, 5, p.doorStroke);
    sill.setDepth(-7);
    currentHallwayObjects.push(sill);

    // A soft pool of light spilling down the wall below the window.
    const spill = scene.add.ellipse(x, windowY + winH / 2 + 26, winW + 18, 24, p.ambient, 0.07);
    spill.setDepth(-7);
    currentHallwayObjects.push(spill);
  }

  // Floor tile lines — short horizontal stripes that read as perspective.
  for (let x = 0; x < worldWidth; x += 64) {
    const tile = scene.add.rectangle(
      x + 32, hallwayBottom - 4,
      48, 2,
      p.floorAccent,
      0.55
    );
    tile.setDepth(-7);
    currentHallwayObjects.push(tile);
  }

  // Back-wall baseline — a thin horizontal line where wall meets floor.
  const wallBase = scene.add.rectangle(
    worldWidth / 2, hallwayTop + 1,
    worldWidth, 2,
    p.stroke
  );
  wallBase.setDepth(-7);
  currentHallwayObjects.push(wallBase);

  // Front floor edge — a slightly brighter line at the bottom of the band.
  const floorEdge = scene.add.rectangle(
    worldWidth / 2, hallwayBottom,
    worldWidth, 3,
    p.stroke
  );
  floorEdge.setDepth(-6);
  currentHallwayObjects.push(floorEdge);

  // Ambient overhead glow strips — soft pools of light every so often, like
  // ceiling lamps. Anchors the player to the architecture.
  for (let x = 90; x < worldWidth; x += 220) {
    const lamp = scene.add.ellipse(x, hallwayTop + 6, 70, 12, p.ambient, 0.18);
    lamp.setDepth(-6);
    currentHallwayObjects.push(lamp);

    const pool = scene.add.ellipse(x, hallwayBottom - 26, 90, 26, p.ambient, 0.05);
    pool.setDepth(-5);
    currentHallwayObjects.push(pool);
  }

  // Drifting dust motes — slow, slightly tinted by the year's palette.
  createAmbientParticles(scene, hallway);
}

function createAmbientParticles(scene, hallway) {
  const p = hallway.palette;
  for (let i = 0; i < 14; i++) {
    const startX = Phaser.Math.Between(0, gameWidth);
    const startY = Phaser.Math.Between(0, gameHeight - 40);

    const dust = scene.add.circle(startX, startY, 1, p.particle, 0.35);
    dust.setScrollFactor(0);
    dust.setDepth(820);

    scene.tweens.add({
      targets: dust,
      x: startX + Phaser.Math.Between(-40, 40),
      y: startY + Phaser.Math.Between(-25, 25),
      alpha: { from: 0.15, to: 0.45 },
      duration: Phaser.Math.Between(4500, 8500),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    currentHallwayObjects.push(dust);
  }
}

// ---------------------------------------------------------------------------
// One-time effects added in scene.create. These live for the whole game.
// ---------------------------------------------------------------------------

// CRT-style scanlines drawn over the viewport.
function createScanlines(scene) {
  const g = scene.add.graphics();
  g.setScrollFactor(0);
  g.setDepth(1450);
  g.fillStyle(0x000000, 0.18);
  for (let y = 0; y < gameHeight; y += 3) {
    g.fillRect(0, y, gameWidth, 1);
  }
}

// Vignette frame — softens the viewport edges. Implemented as 4 dark strips
// at the edges with a softer inner shadow, since Phaser geometry has no
// built-in radial gradients.
function createVignette(scene) {
  const g = scene.add.graphics();
  g.setScrollFactor(0);
  g.setDepth(1460);

  // Outer dark frame.
  g.fillStyle(0x000000, 1);
  g.fillRect(0, 0, gameWidth, 4);
  g.fillRect(0, gameHeight - 4, gameWidth, 4);
  g.fillRect(0, 0, 4, gameHeight);
  g.fillRect(gameWidth - 4, 0, 4, gameHeight);

  // A softer inner shadow ring.
  g.fillStyle(0x000000, 0.35);
  g.fillRect(0, 0, gameWidth, 10);
  g.fillRect(0, gameHeight - 10, gameWidth, 10);
  g.fillRect(0, 0, 10, gameHeight);
  g.fillRect(gameWidth - 10, 0, 10, gameHeight);

  // Even softer outer corners.
  g.fillStyle(0x000000, 0.55);
  g.fillRect(0, 0, 40, 18);
  g.fillRect(gameWidth - 40, 0, 40, 18);
  g.fillRect(0, gameHeight - 18, 40, 18);
  g.fillRect(gameWidth - 40, gameHeight - 18, 40, 18);
}
