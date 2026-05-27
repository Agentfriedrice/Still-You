// ============================================================================
// ending.js
// Doorway + ending system. Each hallway has a doorway at its right edge.
// Walking into the doorway after engaging with every memory plays a year-end
// reflection. The reflection is dismissible:
//   [E] continue   -> advance to the next year (or restart, on the last year)
//   [Q] go back    -> close the overlay and return to the hallway, so the
//                     player can revisit memories and change their mind
// ============================================================================

function createDoorway(scene, hallway) {
  const zoneX = hallwayRight - 40;
  const zoneY = (hallwayTop + hallwayBottom) / 2;
  const p = hallway.palette;

  // Doorway visuals: a slim warm vertical line that reads as a threshold.
  const beam = scene.add.rectangle(zoneX, zoneY, 2, hallwayBottom - hallwayTop - 40, 0xffe8b0, 0.22);
  beam.setDepth(-4);
  currentHallwayObjects.push(beam);

  // Frame around the threshold so it reads as a doorway, not a stray line.
  const frame = scene.add.rectangle(zoneX, zoneY, 30, hallwayBottom - hallwayTop - 30, 0x000000, 0);
  frame.setStrokeStyle(2, p.doorStroke);
  frame.setDepth(-4);
  currentHallwayObjects.push(frame);

  // A small "next" hint floats over the doorway once unlocked, drawn in
  // updateDoorwayHint based on whether all memories have been handled.
  const hintText = scene.add.text(zoneX, zoneY - 70, "", {
    fontFamily: "monospace",
    fontSize: "11px",
    color: p.labelColor
  });
  hintText.setOrigin(0.5, 0.5);
  hintText.setDepth(-3);
  currentHallwayObjects.push(hintText);

  endingZone = { x: zoneX, y: zoneY, radius: 32, hintText };
}

// Called from the scene update. Decides whether to show the doorway overlay.
function updateDoorwayTrigger(scene) {
  if (doorwayActive || isTransitioning || isDialogueOpen) return;
  if (!endingZone) return;

  // Refresh the doorway hint based on current handled count.
  if (endingZone.hintText) {
    if (allMemoriesHandled()) {
      endingZone.hintText.setText("step through");
      endingZone.hintText.setAlpha(0.7);
    } else {
      const hw = hallwayDefinitions[currentHallwayIndex];
      const bucket = playerChoices[hw.id] || {};
      const done = Object.keys(bucket).length;
      endingZone.hintText.setText(`${done} / ${totalInteractables}`);
      endingZone.hintText.setAlpha(0.35);
    }
  }

  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    endingZone.x, endingZone.y
  );

  if (distance < endingZone.radius && allMemoriesHandled()) {
    showDoorway(scene);
  }
}

// ---------------------------------------------------------------------------
// Build and fade in the doorway overlay.
// ---------------------------------------------------------------------------
function showDoorway(scene) {
  doorwayActive = true;
  const final = isFinalHallway();
  const body = buildDoorwayText(final);
  const hintLine = final
    ? "[E] reflect again   [Q] stay a little longer"
    : "[E] continue        [Q] go back";

  endingOverlay = scene.add.rectangle(
    gameWidth / 2, gameHeight / 2,
    gameWidth, gameHeight,
    0x000000, 0
  );
  endingOverlay.setScrollFactor(0);
  endingOverlay.setDepth(2000);

  endingText = scene.add.text(gameWidth / 2, gameHeight / 2 - 24, body, {
    fontFamily: "monospace",
    fontSize: "14px",
    color: "#ffffff",
    align: "center",
    lineSpacing: 6,
    wordWrap: { width: gameWidth - 80 }
  });
  endingText.setOrigin(0.5, 0.5);
  endingText.setScrollFactor(0);
  endingText.setDepth(2001);
  endingText.setAlpha(0);

  endingPrompt = scene.add.text(gameWidth / 2, gameHeight - 36, hintLine, {
    fontFamily: "monospace",
    fontSize: "11px",
    color: "#888888"
  });
  endingPrompt.setOrigin(0.5, 0.5);
  endingPrompt.setScrollFactor(0);
  endingPrompt.setDepth(2001);
  endingPrompt.setAlpha(0);

  scene.tweens.add({
    targets: endingOverlay,
    fillAlpha: 0.93,
    duration: 1500,
    ease: "Sine.easeInOut"
  });
  scene.tweens.add({
    targets: endingText,
    alpha: 1,
    duration: 1800,
    delay: 1000,
    ease: "Sine.easeInOut"
  });
  scene.tweens.add({
    targets: endingPrompt,
    alpha: 1,
    duration: 1200,
    delay: 2400
  });
}

// ---------------------------------------------------------------------------
// Tear down the overlay. If `advance` is true, the player moves on (next
// hallway, or restart on the final year). If false, they return to the
// hallway and can revisit memories.
// ---------------------------------------------------------------------------
function dismissDoorway(scene, advance) {
  if (!doorwayActive) return;

  const targets = [endingOverlay, endingText, endingPrompt].filter(Boolean);
  scene.tweens.add({
    targets,
    alpha: 0,
    duration: 600,
    onComplete: () => {
      if (endingOverlay) endingOverlay.destroy();
      if (endingText)    endingText.destroy();
      if (endingPrompt)  endingPrompt.destroy();
      endingOverlay = null;
      endingText = null;
      endingPrompt = null;
      doorwayActive = false;

      if (advance) {
        if (isFinalHallway()) {
          restartGame(scene);
        } else {
          transitionToNextHallway(scene);
        }
      } else {
        // Step the player back from the threshold so they aren't immediately
        // re-triggering the doorway.
        if (player && endingZone) {
          player.x = endingZone.x - 120;
          if (player.body) {
            player.body.reset(player.x, player.y);
          }
        }
        // On the final hallway, "stay a little longer" brings out a chair
        // by the windows for the player to sit and rest in.
        if (isFinalHallway()) {
          spawnChair(scene);
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Year-end reflection text.
// For non-final years: pulls from the current year's choices and prints the
//   matching doorwayReflections line + the transition line.
// For the final year: pulls from all four years and prints a cumulative
//   closing line.
// ---------------------------------------------------------------------------
function buildDoorwayText(final) {
  if (final) {
    return buildFinalReflection();
  }

  const hw = hallwayDefinitions[currentHallwayIndex];
  const bucket = playerChoices[hw.id] || {};
  const dominant = dominantTendency(Object.values(bucket));
  const reflection = hw.doorwayReflections[dominant] || hw.doorwayReflections.mixed;

  return `${hw.label} ends.\n\n${reflection}\n\n${hw.transitionLine}`;
}

function buildFinalReflection() {
  // Aggregate every choice across every year for the closing line.
  const all = [];
  for (const hw of hallwayDefinitions) {
    const bucket = playerChoices[hw.id] || {};
    for (const choice of Object.values(bucket)) all.push(choice);
  }

  const dominant = dominantTendency(all);
  const hw4 = hallwayDefinitions[hallwayDefinitions.length - 1];
  // Closing line pulls from hw4.finalReflections, NOT doorwayReflections.
  // doorwayReflections supplies the per-year recap line below; finalReflections
  // is a separate, cumulative bucket so the two can never print the same copy.
  const closingBucket = hw4.finalReflections || hw4.doorwayReflections;
  const closing = closingBucket[dominant] || closingBucket.mixed;

  // One-line summary per year, so the ending feels woven.
  const yearLines = hallwayDefinitions.map((hw) => {
    const bucket = playerChoices[hw.id] || {};
    const d = dominantTendency(Object.values(bucket));
    return hw.doorwayReflections[d] || hw.doorwayReflections.mixed;
  });

  return [
    "You walked four hallways.",
    "",
    ...yearLines,
    "",
    closing,
    "",
    hw4.transitionLine // "Still you."
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Look at a list of choice ids ("keep" / "leave" / "pass_on") and pick the
// dominant tendency. Falls back to "mixed" on a tie.
// ---------------------------------------------------------------------------
function dominantTendency(choiceIds) {
  if (!choiceIds || choiceIds.length === 0) return "mixed";

  const counts = { keep: 0, leave: 0, pass_on: 0 };
  for (const id of choiceIds) {
    if (id in counts) counts[id]++;
  }

  let winner = "mixed";
  let best = -1;
  let tied = false;
  for (const k of Object.keys(counts)) {
    if (counts[k] > best) {
      best = counts[k];
      winner = k;
      tied = false;
    } else if (counts[k] === best && best > 0) {
      tied = true;
    }
  }

  if (tied || best === 0) return "mixed";
  return winner;
}
