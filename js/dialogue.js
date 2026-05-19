// ============================================================================
// dialogue.js
// Three-state dialogue machine: initial -> prompt -> response -> closed.
//
//   initial : show the memory's opening lines.            [E] -> prompt
//   prompt  : show the question + choice list, with a     [W/S] move cursor
//             ">" cursor on the highlighted choice.        [E]  confirm
//   response: show the response paired with the chosen    [E] -> closed
//             option, then close.
//
// Re-opening dialogue on a memory the player already chose for places the
// cursor on the previous choice — they can read again, leave it, or pick
// something different. The last confirmed choice wins.
// ============================================================================

function createDialogueBox(scene) {
  dialogueBox = scene.add.rectangle(
    gameWidth / 2,
    gameHeight - 95,
    gameWidth - 80,
    140,
    0x000000,
    0.95
  );
  dialogueBox.setStrokeStyle(3, 0xffffff);
  dialogueBox.setScrollFactor(0);
  dialogueBox.setDepth(1000);
  dialogueBox.setVisible(false);

  dialogueText = scene.add.text(65, gameHeight - 155, "", {
    fontFamily: "monospace",
    fontSize: "13px",
    color: "#ffffff",
    wordWrap: { width: gameWidth - 130 },
    lineSpacing: 4
  });
  dialogueText.setScrollFactor(0);
  dialogueText.setDepth(1001);
  dialogueText.setVisible(false);

  dialogueHintText = scene.add.text(65, gameHeight - 50, "", {
    fontFamily: "monospace",
    fontSize: "11px",
    color: "#888888"
  });
  dialogueHintText.setScrollFactor(0);
  dialogueHintText.setDepth(1001);
  dialogueHintText.setVisible(false);
}

function openDialogue(interactable) {
  activeInteractable = interactable;

  // If the player already chose for this memory, restore the cursor to that
  // choice so re-opening feels like picking up where they left off.
  const def = interactable.dialogue;
  const prev = currentChoiceFor(def.id);
  if (prev) {
    const idx = def.choices.findIndex((c) => c.id === prev);
    selectedChoiceIndex = idx >= 0 ? idx : 0;
  } else {
    selectedChoiceIndex = 0;
  }

  isDialogueOpen = true;
  dialogueState = "initial";

  dialogueBox.setVisible(true);
  dialogueText.setVisible(true);
  dialogueHintText.setVisible(true);

  renderDialogue();
}

function advanceDialogue(scene) {
  if (dialogueState === "initial") {
    dialogueState = "prompt";
    renderDialogue();
    return;
  }

  if (dialogueState === "prompt") {
    const def = activeInteractable.dialogue;
    const chosen = def.choices[selectedChoiceIndex];

    const hw = hallwayDefinitions[currentHallwayIndex];
    if (!playerChoices[hw.id]) playerChoices[hw.id] = {};
    const firstTime = !(def.id in playerChoices[hw.id]);
    playerChoices[hw.id][def.id] = chosen.id;
    if (firstTime) {
      markMemoryHandled(def.id);
    }

    // Special case: the Year 4 graduation cap reacts physically to the
    // player's choice (worn / thrown / worn-then-dropped).
    if (def.id === "cap") {
      handleCapChoice(scene || gameScene, chosen.id);
    }

    dialogueState = "response";
    renderDialogue();
    return;
  }

  if (dialogueState === "response") {
    closeDialogue();
    return;
  }
}

function moveDialogueCursor(direction) {
  if (dialogueState !== "prompt" || !activeInteractable) return;
  const total = activeInteractable.dialogue.choices.length;
  selectedChoiceIndex = (selectedChoiceIndex + direction + total) % total;
  renderDialogue();
}

// [Q] steps back through the dialogue so the player can re-read the prompt
// or the opening lines:  response -> prompt -> initial -> (closed).
function backDialogue() {
  if (dialogueState === "response") {
    dialogueState = "prompt";
    renderDialogue();
  } else if (dialogueState === "prompt") {
    dialogueState = "initial";
    renderDialogue();
  } else if (dialogueState === "initial") {
    closeDialogue();
  }
}

function renderDialogue() {
  if (!activeInteractable) return;
  const def = activeInteractable.dialogue;

  if (dialogueState === "initial") {
    dialogueText.setText(def.initial);
    dialogueHintText.setText("[E] continue   [Q] back");
    return;
  }

  if (dialogueState === "prompt") {
    let body = def.prompt + "\n";
    def.choices.forEach((choice, i) => {
      const cursor = i === selectedChoiceIndex ? "> " : "  ";
      body += "\n" + cursor + choice.label;
    });
    dialogueText.setText(body);
    dialogueHintText.setText("[W/S] choose   [E] confirm   [Q] back");
    return;
  }

  if (dialogueState === "response") {
    const chosen = def.choices[selectedChoiceIndex];
    dialogueText.setText(chosen.response);
    dialogueHintText.setText("[E] close   [Q] back to prompt");
    return;
  }
}

function closeDialogue() {
  isDialogueOpen = false;
  dialogueState = "closed";
  activeInteractable = null;
  selectedChoiceIndex = 0;

  dialogueBox.setVisible(false);
  dialogueText.setVisible(false);
  dialogueHintText.setVisible(false);
  dialogueText.setText("");
  dialogueHintText.setText("");
}
