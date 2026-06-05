// ============================================================================
// epilogue.js
// The encounter at the start of Year 1 during the post-chair walk-back.
//
// After sitting in the chair and walking back through all four illuminated
// hallways, the player meets their first-year self standing at the original
// spawn point — drawn in the original blue/gray outfit they arrived in. A
// single-choice dialogue ("It's you!" -> "hug") plays a small embrace
// animation, fades in a final whisper, then returns to the title.
//
// This file owns:
//   - spawnFirstYearSelf      — drops the past-you sprite into Year 1
//   - isNearFirstYearSelf     — proximity check used by scene.update
//   - updateFirstYearSelfHint — per-frame brighten on approach
//   - openFirstYearSelfDialogue / advanceFirstYearSelfDialogue
//   - performHug              — the convergence + glow + whisper + fade
// ============================================================================

const FIRST_YEAR_SELF_X = 200; // matches the player's original spawn position
const FIRST_YEAR_SELF_Y = 300;

// ---------------------------------------------------------------------------
// Sprite — built the same way as the player's composite body, but locked to
// the Year 1 outfit (the blue/gray they arrived in). Lives in a Phaser
// container so it can be tweened/translated as a single object during the
// hug.
// ---------------------------------------------------------------------------
function spawnFirstYearSelf(scene) {
  if (firstYearSelf) return;

  // Coordinates inside the container are relative to (0, 0) at the body's
  // pivot, matching the player's per-part offsets in player.js.
  const glow  = scene.add.ellipse(0, 18, 56, 14, 0xffffff, 0.16);
  const hair  = scene.add.rectangle(0, -24, 14, 4, 0x2a1a10);
  const head  = scene.add.rectangle(0, -18, 14, 12, 0xf2d2bd);
  const eye_l = scene.add.rectangle(-3, -18, 2, 2, 0x1a1a1a);
  const eye_r = scene.add.rectangle(3, -18, 2, 2, 0x1a1a1a);
  const torso = scene.add.rectangle(0, -6, 16, 14, 0x6e7e90);   // Year 1 torso
  const collar= scene.add.rectangle(0, -12, 14, 2, 0x445566);   // Year 1 collar
  const leg_l = scene.add.rectangle(-4, 6, 6, 10, 0x2a3848);    // Year 1 legs
  const leg_r = scene.add.rectangle(4, 6, 6, 10, 0x2a3848);

  firstYearSelf = scene.add.container(FIRST_YEAR_SELF_X, FIRST_YEAR_SELF_Y, [
    glow, leg_l, leg_r, torso, collar, head, hair, eye_l, eye_r
  ]);
  firstYearSelf.setDepth(5);
  firstYearSelf.setAlpha(0);
  currentHallwayObjects.push(firstYearSelf);

  // No radiating halo — just the soft footprint glow inside the container,
  // matching the way the player's own sprite reads. The "?" hint above is
  // enough to mark them as interactable; a glowing aura competes with the
  // quiet of the moment.

  // Quiet floating "?" hint above the past-self, same visual grammar as the
  // memory hints — except this one never swaps to a dot. There is only one
  // thing to do here.
  firstYearSelfHint = scene.add.text(FIRST_YEAR_SELF_X, FIRST_YEAR_SELF_Y - 46, "?", {
    fontFamily: "monospace",
    fontSize: "18px",
    color: "#ffe8b0"
  });
  firstYearSelfHint.setOrigin(0.5, 0.5);
  firstYearSelfHint.setDepth(6);
  firstYearSelfHint.setAlpha(0);
  currentHallwayObjects.push(firstYearSelfHint);

  firstYearSelfZone = {
    x: FIRST_YEAR_SELF_X,
    y: FIRST_YEAR_SELF_Y,
    radius: 60
  };

  // Both fade in gently, slightly after the hallway settles, so the past-self
  // feels like it arrives rather than pops in.
  scene.tweens.add({
    targets: firstYearSelf,
    alpha: 1,
    duration: 1400,
    delay: 400,
    ease: "Sine.easeInOut"
  });
  scene.tweens.add({
    targets: firstYearSelfHint,
    alpha: 0.85,
    duration: 1200,
    delay: 1100,
    ease: "Sine.easeInOut"
  });
}

function isNearFirstYearSelf() {
  if (!firstYearSelfZone || hugInProgress) return false;
  return (
    Phaser.Math.Distance.Between(player.x, player.y, firstYearSelfZone.x, firstYearSelfZone.y) <
    firstYearSelfZone.radius
  );
}

// Per-frame: brighten the hint when the player is close, dim it when not.
function updateFirstYearSelfHint() {
  if (!firstYearSelfHint || hugInProgress) return;
  firstYearSelfHint.setAlpha(isNearFirstYearSelf() ? 1 : 0.45);
}

// ---------------------------------------------------------------------------
// Dialogue — uses the existing dialogue box / text fields but with bespoke
// content and a custom advance handler, so we don't have to mint a fake
// memory definition for it. State is kept in module-local variables instead
// of dialogueState because this conversation runs outside the regular
// memory-dialogue state machine.
// ---------------------------------------------------------------------------
let firstYearSelfDialogueStage = "closed"; // 'closed' | 'opening' | 'prompt'

function openFirstYearSelfDialogue(scene) {
  if (hugInProgress) return;
  isDialogueOpen = true;
  firstYearSelfDialogueStage = "opening";

  dialogueBox.setVisible(true);
  dialogueText.setVisible(true);
  dialogueHintText.setVisible(true);

  dialogueText.setText(
    "It's you!\n" +
    "Smaller than you remembered.\n" +
    "But it's definitely you."
  );
  dialogueHintText.setText("[E] continue");

  // Override the default advance/back handlers for this conversation. We
  // restore the normal flow when the dialogue closes.
  installEpilogueDialogueHooks(scene);
}

// Install temporary hooks so [E] advances the epilogue dialogue and [Q] is
// disabled (you don't get to back out of meeting yourself).
function installEpilogueDialogueHooks(scene) {
  // No backing out — clear any [Q] handler by routing dismissKey through a
  // no-op while this dialogue is active. We restore by checking the stage
  // in scene.update's existing dismissKey handler via the dialogueState
  // check; since dialogueState stays "closed" here, the normal backDialogue
  // path is naturally skipped.
}

// Called from scene.update's [E] branch when isDialogueOpen is true. Routes
// to the regular advanceDialogue OR the epilogue advance, depending on
// whether the past-self conversation is what's open.
function advanceEpilogueDialogue(scene) {
  if (firstYearSelfDialogueStage === "opening") {
    firstYearSelfDialogueStage = "prompt";
    dialogueText.setText("What do you do?\n\n> hug");
    dialogueHintText.setText("[E] hug");
    return;
  }

  if (firstYearSelfDialogueStage === "prompt") {
    // Close the dialogue overlay and run the hug.
    firstYearSelfDialogueStage = "closed";
    isDialogueOpen = false;
    dialogueBox.setVisible(false);
    dialogueText.setVisible(false);
    dialogueHintText.setVisible(false);
    performHug(scene);
    return;
  }
}

// ---------------------------------------------------------------------------
// Hug — both sprites walk toward each other, lean in, a warm glow blooms,
// then a final whisper fades in. The screen deep-fades and hands off to the
// title scene. Player input is disabled for the duration via hugInProgress
// (checked in player.js movement block).
// ---------------------------------------------------------------------------
function performHug(scene) {
  hugInProgress = true;

  // Tidy up the floating "?" — the conversation is past words now.
  if (firstYearSelfHint) {
    scene.tweens.add({ targets: firstYearSelfHint, alpha: 0, duration: 400 });
  }

  // Meet in the middle. Past-self comes a few px to the right; player walks
  // to a position just to the past-self's right, so they end up shoulder to
  // shoulder rather than overlapping.
  //
  // The player is also tweened ~6px UPWARD during the walk-in so the older
  // self stands visibly taller than the first-year self in the embrace —
  // the dialogue's "smaller than you remembered" needs the silhouettes to
  // back it up, otherwise the two identical-size sprites read as twins.
  const meetX = (player.x + firstYearSelf.x) / 2;
  const playerTargetX = meetX + 6;
  const playerTargetY = FIRST_YEAR_SELF_Y - 6;
  const selfTargetX   = meetX - 6;

  // ---- Walk-in: both move toward each other over ~1.4s. Player also rises
  // slightly so their head sits above the first-year self's head.
  scene.tweens.add({
    targets: player,
    x: playerTargetX,
    y: playerTargetY,
    duration: 1400,
    ease: "Sine.easeInOut"
  });
  scene.tweens.add({
    targets: firstYearSelf,
    x: selfTargetX,
    duration: 1400,
    ease: "Sine.easeInOut"
  });

  // Soften the player's footprint glow as they lift, so there isn't an
  // obvious "second floor mark" hovering above the first-year self's glow.
  if (player.visuals && player.visuals.glow) {
    scene.tweens.add({
      targets: player.visuals.glow,
      alpha: 0,
      duration: 1400,
      ease: "Sine.easeInOut"
    });
  }

  // ---- Lean in and HOLD. Past-self bows toward the older self and stays
  // leaning for a long beat — the embrace is the still moment, not an
  // animated one. Phaser's `hold` keeps the tween at its target value
  // before yoyoing back, which is exactly what we want.
  //   700ms lean in  →  hold 4000ms at lean  →  700ms back upright
  // Total: 5.4s of "leaned together," starting at t=1.4s, ending at t=6.8s.
  scene.tweens.add({
    targets: firstYearSelf,
    rotation: 0.12,
    duration: 700,
    delay: 1400,
    yoyo: true,
    hold: 4000,
    ease: "Sine.easeInOut"
  });

  // ---- No radiating glow. The moment lives in the lean + the stillness
  // alone — the previous expanding sun effect was visually loud and pulled
  // attention away from the figures.

  // ---- Final whisper. Fades in during the embrace (well into the hold),
  // sits visible for a few seconds, then is taken out with everything else
  // by the camera fade.
  scene.time.delayedCall(4500, () => {
    showFinalWhisper(scene, "you were always going to make it.");
  });

  // ---- Long slow fade to black, then back to the title scene. The 3.5s
  // fade gives the whisper time to be read and quietly leave with the light.
  scene.time.delayedCall(9000, () => {
    scene.cameras.main.fadeOut(3500, 0, 0, 0);
    scene.cameras.main.once("camerafadeoutcomplete", () => {
      // Reset all the run-specific state so a fresh playthrough starts clean.
      resetForFreshPlaythrough();
      scene.scene.start("TitleScene");
    });
  });
}

function showFinalWhisper(scene, text) {
  const whisper = scene.add.text(gameWidth / 2, gameHeight / 2, text, {
    fontFamily: "monospace",
    fontSize: "16px",
    color: "#ffefcf",
    fontStyle: "italic",
    align: "center"
  });
  whisper.setOrigin(0.5, 0.5);
  whisper.setScrollFactor(0);
  whisper.setDepth(2002);
  whisper.setAlpha(0);

  scene.tweens.add({
    targets: whisper,
    alpha: 1,
    duration: 1800,
    ease: "Sine.easeInOut"
  });
}

// Wipe the per-playthrough state so the next run starts from a clean slate.
// Called right before scene.start("TitleScene") so the title screen and the
// fresh GameScene that follows don't inherit stale flags.
function resetForFreshPlaythrough() {
  playerChoices = {};
  currentHallwayIndex = 0;
  epilogueMode = false;
  epilogueReady = false;
  sitHintShown = false;
  hugInProgress = false;
  firstYearSelf = null;
  firstYearSelfZone = null;
  firstYearSelfHint = null;
  firstYearSelfDialogueStage = "closed";
  backDoorwayZone = null;
  backDoorwayHint = null;
  capState = "none";
  playerCap = null;
  chair = null;
  chairHint = null;
  chairZone = null;
  sitState = "none";
  roomIlluminated = false;
  // The previous scene's display list was cleaned up by Phaser when the
  // scene stopped, but the tracking array still holds dangling references.
  // Empty it so the next loadHallway's destroyHallwayObjects loop has no
  // ghost objects to iterate.
  currentHallwayObjects = [];
}
