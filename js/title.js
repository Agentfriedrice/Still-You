// ============================================================================
// title.js
// Title screen shown before the first hallway loads. Sets the mood with the
// same visual language as the in-game hallways: dark backdrop, drifting dust,
// CRT scanlines + vignette, plus a single softly-glowing window that
// foreshadows the hallway architecture. Player presses E (or clicks/taps) to
// step into Year 1.
//
// Lives as its own Phaser scene so the main game scene doesn't have to know
// the title exists. Phaser starts the first scene in config.scene[], which is
// this one — TitleScene fades to black and hands off to GameScene on input.
// ============================================================================

function createTitleScene() {
  const cx = gameWidth / 2;

  // Black backdrop. setBackgroundColor on the camera also works, but an
  // explicit rect gives us a depth-anchored bottom layer to build over.
  const bg = this.add.rectangle(cx, gameHeight / 2, gameWidth, gameHeight, 0x070708);
  bg.setDepth(-20);

  // ---- Single softly-glowing window (same geometry as visuals.js) --------
  // A taste of the architecture the player is about to walk through. Tinted
  // with the Year 4 "becoming" palette — warm cream, the color the journey
  // ends in — because that's the mood the title screen is selling.
  const winX = cx;
  const winY = 120;
  const winW = 64;
  const winH = 52;

  const glass = this.add.rectangle(winX, winY, winW, winH, 0x18160f);
  const lightWash = this.add.rectangle(winX, winY, winW, winH, 0xa49a78, 0.22);
  const winFrame = this.add.rectangle(winX, winY, winW, winH);
  winFrame.setStrokeStyle(2, 0x6a604a);
  const mullionV = this.add.rectangle(winX, winY, 2, winH, 0x6a604a);
  const mullionH = this.add.rectangle(winX, winY, winW, 2, 0x6a604a);
  const sill = this.add.rectangle(winX, winY + winH / 2 + 4, winW + 12, 4, 0x6a604a);

  // Pool of light spilling down the wall below the window. Anchors the
  // window to the surface and gives the title screen a subtle focal point.
  const spill = this.add.ellipse(winX, winY + winH / 2 + 36, winW + 26, 36, 0xa49a78, 0.12);

  // Very gentle "breathing" on the light wash, so the window doesn't read
  // as a static decal.
  this.tweens.add({
    targets: lightWash,
    alpha: { from: 0.18, to: 0.30 },
    duration: 4200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });

  // ---- Drifting dust ------------------------------------------------------
  // Same yoyo pattern as createAmbientParticles, kept inline so the title
  // screen has no dependency on the in-game atmosphere builder being loaded
  // first. Cream tint to match the Year 4 vibe of the title.
  for (let i = 0; i < 18; i++) {
    const dx = Phaser.Math.Between(0, gameWidth);
    const dy = Phaser.Math.Between(0, gameHeight - 40);
    const dust = this.add.circle(dx, dy, 1, 0xe6dfc6, 0.35);
    dust.setDepth(820);

    this.tweens.add({
      targets: dust,
      x: dx + Phaser.Math.Between(-40, 40),
      y: dy + Phaser.Math.Between(-25, 25),
      alpha: { from: 0.15, to: 0.45 },
      duration: Phaser.Math.Between(4500, 8500),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  // ---- Title --------------------------------------------------------------
  // Phaser Text doesn't expose letter-spacing as a style, so the spaced
  // glyphs are baked into the string. Cream/khaki — the Year 4 accent —
  // because the title and the ending should rhyme.
  const title = this.add.text(cx, 240, "S T I L L   Y O U", {
    fontFamily: "monospace",
    fontSize: "38px",
    color: "#dccfb0",
    fontStyle: "bold"
  });
  title.setOrigin(0.5, 0.5);
  title.setAlpha(0);

  // ---- Mood line ----------------------------------------------------------
  // Minimal & evocative: one short line, no exposition, no instructions.
  const subtitle = this.add.text(cx, 290, "a memory in four hallways", {
    fontFamily: "monospace",
    fontSize: "13px",
    color: "#9a9384",
    fontStyle: "italic"
  });
  subtitle.setOrigin(0.5, 0.5);
  subtitle.setAlpha(0);

  // ---- Controls (dim, low-priority) ---------------------------------------
  const controls = this.add.text(cx, 410, "WASD move     E interact     Q back", {
    fontFamily: "monospace",
    fontSize: "11px",
    color: "#777067"
  });
  controls.setOrigin(0.5, 0.5);
  controls.setAlpha(0);

  // ---- Begin prompt -------------------------------------------------------
  const beginPrompt = this.add.text(cx, 442, "press  E  to begin", {
    fontFamily: "monospace",
    fontSize: "12px",
    color: "#bdb39c"
  });
  beginPrompt.setOrigin(0.5, 0.5);
  beginPrompt.setAlpha(0);

  // ---- Staged fade-in -----------------------------------------------------
  // Each element settles in turn so the mood lands before the prompt arrives
  // to ask the player to act. Total wait before "press E" is visible: ~3.8s.
  // The player can still press E before then — input is live immediately, the
  // delay is purely cosmetic.
  this.tweens.add({
    targets: title,
    alpha: 1,
    duration: 1800,
    delay: 500,
    ease: "Sine.easeInOut"
  });
  this.tweens.add({
    targets: subtitle,
    alpha: 1,
    duration: 1500,
    delay: 2000,
    ease: "Sine.easeInOut"
  });
  this.tweens.add({
    targets: controls,
    alpha: 0.75,
    duration: 1200,
    delay: 3300,
    ease: "Sine.easeInOut"
  });
  this.tweens.add({
    targets: beginPrompt,
    alpha: 0.85,
    duration: 1800,
    delay: 3800,
    ease: "Sine.easeInOut",
    onComplete: () => {
      // Quiet pulsing on the prompt once it's fully arrived. Sine yoyo so
      // the rhythm reads as a breath, not a UI blink.
      this.tweens.add({
        targets: beginPrompt,
        alpha: 0.35,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  });

  // ---- CRT scanlines + vignette ------------------------------------------
  // Reuse the same effects the game uses so the title screen looks like the
  // same hardware the rest of the experience is "rendered on."
  createScanlines(this);
  createVignette(this);

  // ---- Camera fade-in -----------------------------------------------------
  this.cameras.main.setBackgroundColor(0x000000);
  this.cameras.main.fadeIn(800, 0, 0, 0);

  // ---- Begin handler ------------------------------------------------------
  // Pressing E (or clicking/tapping) fades to black and hands off to the
  // game scene. The `started` latch prevents a double-tap from re-triggering
  // mid-fade.
  let started = false;
  const begin = () => {
    if (started) return;
    started = true;

    this.cameras.main.fadeOut(1100, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("GameScene");
    });
  };

  this.input.keyboard.on("keydown-E", begin);
  this.input.on("pointerdown", begin);
}
