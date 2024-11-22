let focusedPair = null;

function expandAll(e) {
    const cardTexts = document.querySelectorAll(".card-text");
    for (const text of cardTexts) {
        text.style.display = "block";
    }
}

function collapseAll(e) {
    const cardTexts = document.querySelectorAll(".card-text");
    for (const text of cardTexts) {
        text.style.display = "none";
    }
}

function toggleAll(e) {
    const cardTexts = document.querySelectorAll(".card-text");
    for (const text of cardTexts) {
        text.style.display = text.style.display === "none" ? "block" : "none";
    }
}

function moveToNext(e) {
    const pairs = Array.from(document.querySelectorAll('my-pair'));
    const currentIndex = focusedPair ? pairs.indexOf(focusedPair) : -1;
    if (currentIndex < pairs.length - 1) {
        setFocus(pairs[currentIndex + 1]);
    }
}

function moveToPrevious(e) {
    const pairs = Array.from(document.querySelectorAll('my-pair'));
    const currentIndex = focusedPair ? pairs.indexOf(focusedPair) : 1;
    if (currentIndex > 0) {
        setFocus(pairs[currentIndex - 1]);
    }
}

function expandCurrent(e) {
    if (!focusedPair) {
        const pairs = Array.from(document.querySelectorAll('my-pair'));
        setFocus(pairs[0]);
    }
    focusedPair.querySelector("my-answer").style.display = "block";
}

function collapseCurrent(e) {
    if (!focusedPair) {
        const pairs = Array.from(document.querySelectorAll('my-pair'));
        setFocus(pairs[0]);
    }
    focusedPair.querySelector("my-answer").style.display = "none";
}

function setFocus(pair) {
    if (focusedPair) {
        focusedPair.classList.remove('focused');
    }
    focusedPair = pair;
    if (focusedPair) {
        focusedPair.classList.add('focused');
        focusedPair.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Insert instructions at the top of the my-quiz element.
    const quiz = document.querySelector("my-quiz");
    const instructions = document.createElement("div");
    instructions.className = "alert alert-info";
    instructions.innerHTML = "Click on a question to toggle its answer. Press ? to show the keyboard shortcuts.";
    quiz.insertBefore(instructions, quiz.firstChild);

    // Enrich each my-pair and its my-question and my-answer with Bootstrap classes to turn it into a card.
    for (const pair of document.querySelectorAll("my-pair")) {
        pair.className = "card mb-4";

        const question = pair.querySelector("my-question");
        question.className = "card-body";

        const answer = pair.querySelector("my-answer");
        answer.className = "card-text";

        // Toggle the answer when the question is clicked.
        question.addEventListener("click", function () {
            answer.style.display = answer.style.display === "none" ? "block" : "none";
        });
    }

    // Prefix each question with a number.
    let questionNumber = 1;
    for (const question of document.querySelectorAll("my-question")) {
        question.innerHTML = `<strong>Q${questionNumber++}:</strong> ${question.innerHTML}`;
    }

    // Bind the keyboard shortcuts.
    bindKey("KeyT", toggleAll, "Toggle All Questions");
    bindKey("KeyE", expandAll, "Expand All Questions");
    bindKey("KeyC", collapseAll, "Collapse All Questions");
    bindKey("ArrowUp", moveToPrevious, "Move to Previous Question");
    bindKey("ArrowDown", moveToNext, "Move to Next Question");
    bindKey("ArrowLeft", collapseCurrent, "Collapse Current Question");
    bindKey("ArrowRight", expandCurrent, "Expand Current Question");
    // bindKey("Escape", (e) => setFocus(null), "Clear Current Focus");
    bindKey("Slash", showKeyboardShortcutsDialog, "Show Keyboard Shortcuts");

    collapseAll();
});
