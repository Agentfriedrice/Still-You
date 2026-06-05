// ============================================================================
// scene.js
// Phaser scene callbacks: preload, create, update.
// One-time scaffolding happens in create. Per-hallway content is loaded by
// loadHallway, which is called once initially and again on every transition.
// ============================================================================

function preload() {
  // No external assets needed; everything is procedural geometry.
}

function create() {
  // Stash the scene so non-scene helpers (e.g. the graduation-cap logic in
  // player.js) can reach scene.tweens without a scene argument threaded
  // through every call.
  gameScene = this;

  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
  this.cameras.main.setBackgroundColor(0x000000);

  createPlayer(this);
  createControls(this);

  this.cameras.main.startFollow(player, true, 0.08, 0.08);
  this.cameras.main.setZoom(1.0);

  createDialogueBox(this);

  // HUD: help line + scanlines + vignette. These persist across hallways.
  this.add
    .text(20, 20, "WASD move   E interact   Q back", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#aaaaaa"
    })
    .setScrollFactor(0)
    .setDepth(900);

  createScanlines(this);
  createVignette(this);

  // Build the first hallway. Subsequent ones are loaded by the doorway
  // transition handler.
  loadHallway(this, 0);
}

function update() {
  updatePlayerMovement();
  updatePlayerVisuals();
  updateCurrentInteractable();
  updateChairHint();
  updateDoorwayTrigger(this);
  updateBackDoorwayTrigger(this);
  updateFirstYearSelfHint();

  // Doorway overlay: dismiss with [E] (advance) or [Q] (go back).
  if (doorwayActive) {
    if (Phaser.Input.Keyboard.JustDown(interactKey)) {
      dismissDoorway(this, /*advance*/ true);
    } else if (Phaser.Input.Keyboard.JustDown(dismissKey)) {
      dismissDoorway(this, /*advance*/ false);
    }
    return;
  }

  // Transition in flight: ignore input.
  if (isTransitioning) return;

  // Dialogue cursor navigation.
  if (isDialogueOpen && dialogueState === "prompt") {
    if (Phaser.Input.Keyboard.JustDown(keys.up)) {
      moveDialogueCursor(-1);
    } else if (Phaser.Input.Keyboard.JustDown(keys.down)) {
      moveDialogueCursor(1);
    }
  }

  // [Q] steps back through the dialogue (response -> prompt -> initial),
  // and closes it from the opening screen.
  if (isDialogueOpen && Phaser.Input.Keyboard.JustDown(dismissKey)) {
    backDialogue();
  }

  // [E] is the universal advance/interact key.
  if (Phaser.Input.Keyboard.JustDown(interactKey)) {
    if (isDialogueOpen) {
      // The epilogue "It's you!" conversation runs through its own advance
      // function (it doesn't use the memory-dialogue state machine). Detect
      // that path by checking the epilogue stage; otherwise fall back to
      // the regular memory dialogue advance.
      if (typeof firstYearSelfDialogueStage !== "undefined" &&
          firstYearSelfDialogueStage !== "closed") {
        advanceEpilogueDialogue(this);
      } else {
        advanceDialogue(this);
      }
    } else if (hugInProgress) {
      // No input during the hug animation — it's a moment, not a menu.
    } else if (sitState === "sitting") {
      standFromChair();
    } else if (isNearChair()) {
      sitInChair();
    } else if (typeof isNearFirstYearSelf === "function" && isNearFirstYearSelf()) {
      // Epilogue: meeting your first-year self. Opens the "It's you!"
      // single-choice dialogue with the "hug" affordance.
      openFirstYearSelfDialogue(this);
    } else if (currentObject && !epilogueMode) {
      // Memory dialogues are sealed in epilogue mode — the past is past.
      // The glows are still visible; pressing E next to them does nothing.
      openDialogue(currentObject);
    }
  }
}
