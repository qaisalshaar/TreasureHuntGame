"use strict";
//Object.defineProperty(exports, "__esModule", { value: true });
// ----------------------
// Game State
// ----------------------
let playerName = "";
let playerGender = "";
let playerLevel = 1;
let score = 0;
let hearts = 3;
let currentQuestionIndex = 0;
let currentAnswer = 0;
const TOTAL_QUESTIONS = 5;
const questions = [];
const playerAnswers = [];
// For reviewing answers
let reviewIndex = 0;
// ----------------------
// DOM Elements
// ----------------------
const playerNameInput = document.getElementById("player-name-input");
const playerGenderSelect = document.getElementById("player-gender-select");
const playerLevelSelect = document.getElementById("player-level-select");
const playerNameDisplay = document.getElementById("player-name");
const scoreElement = document.getElementById("score");
const heartsElement = document.getElementById("hearts");
const progressBar = document.getElementById("progress-bar");
const startButton = document.getElementById("start-button");
const questionArea = document.getElementById("question-area");
const inputArea = document.getElementById("input-area");
const answerInput = document.getElementById("answer-input");
const checkButton = document.getElementById("check-button");
const feedbackMessage = document.getElementById("feedback-message");
const endScreen = document.getElementById("end-screen");
const nameError = document.getElementById("name-error");
const genderError = document.getElementById("gender-error");
const levelError = document.getElementById("level-error");
// ----------------------
// Helpers
// ----------------------
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function generateQuestion(level) {
    let a = 0, b = 0;
    let op = "+";
    if (level === 1) {
        const ops = ["+", "-"];
        op = ops[Math.floor(Math.random() * ops.length)];
        a = getRandomInt(0, 10);
        b = getRandomInt(0, 10);
        if (op === "-" && b > a)
            [a, b] = [b, a];
    }
    else if (level === 2) {
        const ops = ["+", "-", "*"];
        op = ops[Math.floor(Math.random() * ops.length)];
        if (op === "*") {
            a = getRandomInt(2, 10);
            b = getRandomInt(2, 10);
        }
        else {
            a = getRandomInt(10, 50);
            b = getRandomInt(10, 50);
            if (op === "-" && b > a)
                [a, b] = [b, a];
        }
    }
    else {
        const ops = ["+", "-", "*", "/"];
        op = ops[Math.floor(Math.random() * ops.length)];
        if (op === "*") {
            a = getRandomInt(10, 50);
            b = getRandomInt(2, 20);
        }
        else if (op === "/") {
            b = getRandomInt(2, 25);
            const quotient = getRandomInt(2, 20);
            a = b * quotient;
        }
        else {
            a = getRandomInt(50, 200);
            b = getRandomInt(50, 200);
            if (op === "-" && b > a)
                [a, b] = [b, a];
        }
    }
    let questionText = "";
    let answer = 0;
    switch (op) {
        case "+":
            questionText = `${a} + ${b} = ?`;
            answer = a + b;
            break;
        case "-":
            questionText = `${a} - ${b} = ?`;
            answer = a - b;
            break;
        case "*":
            questionText = `${a} * ${b} = ?`;
            answer = a * b;
            break;
        case "/":
            questionText = `${a} / ${b} = ?`;
            answer = a / b;
            break;
    }
    return { text: questionText, answer };
}
// ----------------------
// UI Updates
// ----------------------
function updateUI() {
    const levelName = ["Easy", "Medium", "Hard"][playerLevel - 1];
    playerNameDisplay.textContent = `${playerName} (Level: ${levelName})`;
    playerNameDisplay.style.color = "red";
    scoreElement.innerHTML = `Score: <span style="color:red;">${score}</span>`;
    let heartIcons = "❤️".repeat(Math.max(0, Math.floor(hearts)));
    heartsElement.innerHTML = `Lives: ${heartIcons}`;
    progressBar.style.width = `${(currentQuestionIndex / TOTAL_QUESTIONS) * 100}%`;
}
// ----------------------
// Game Flow
// ----------------------
function initializeGame() {
    const name = playerNameInput?.value?.trim() ?? '';
    const gender = playerGenderSelect?.value ?? '';
    const level = parseInt(playerLevelSelect?.value ?? '0');
    let valid = true;
    nameError.style.display = "none";
    genderError.style.display = "none";
    levelError.style.display = "none";
    if (!name || name.length < 2) {
        nameError.textContent = "Enter a valid name";
        nameError.style.display = "block";
        valid = false;
    }
    if (!gender) {
        genderError.textContent = "Select your gender";
        genderError.style.display = "block";
        valid = false;
    }
    if (isNaN(level) || level < 1 || level > 3) {
        levelError.textContent = "Select a difficulty level";
        levelError.style.display = "block";
        valid = false;
    }
    if (!valid)
        return;
    playerName = name;
    playerGender = gender;
    playerLevel = level;
    score = 0;
    hearts = 3;
    currentQuestionIndex = 0;
    questions.length = 0;
    playerAnswers.length = 0;
    updateLayoutBackground();
    endScreen.classList.add("hidden");
    inputArea.classList.remove("hidden");
    startButton.classList.add("hidden");
    document.querySelectorAll(".player-input").forEach(el => el.classList.add("hidden"));
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        questions.push(generateQuestion(playerLevel));
    }
    updateUI();
    savePlayerToDb(); // Save player immediately
    loadNextQuestion();
}
function loadNextQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) {
        endGame();
        return;
    }
    questionArea.innerHTML = `<p>${question.text}</p>`;
    currentAnswer = question.answer;
    answerInput.value = "";
    feedbackMessage.textContent = "";
    checkButton.disabled = false;
}
// ----------------------
// Database Operations
// ----------------------
async function savePlayerToDb() {
    const playerData = {
        fullName: playerName,
        gender: playerGender,
        level: playerLevel,
        finalScore: score
    };
    try {
        const res = await fetch("/api/player/Save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(playerData)
        });
        if (res.ok) {
            const data = await res.json();
            window.playerId = data.playerId;
            console.log("✅ Player saved:", data);
        }
        else {
            console.error("❌ Failed to save player:", await res.text());
        }
    }
    catch (err) {
        console.error("⚠️ Network error while saving player:", err);
    }
}
// Decode question before sending to backend
function cleanQuestionText(q) {
    return q.replace(/\\u002B/g, "+")
        .replace(/\\u002D/g, "-")
        .replace(/\\u002A/g, "*")
        .replace(/\\u002F/g, "/");
}
async function saveWrongAnswerToDb(questionText, playerAnswer, correctAnswer) {
    const cleanText = cleanQuestionText(questionText);
    const wrongAnswerPayload = [
        {
            playerId: window.playerId || 0,
            questionText: cleanText,
            playerAnswer: playerAnswer.toString(),
            correctAnswer: correctAnswer.toString(),
            level: playerLevel
        }
    ];
    try {
        const res = await fetch("/api/player/SaveAnswers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(wrongAnswerPayload)
        });
        if (res.ok)
            console.log("✅ Wrong answer saved successfully!");
        else
            console.error("❌ Failed to save wrong answer:", await res.text());
    }
    catch (err) {
        console.error("⚠️ Network error while saving wrong answer:", err);
    }
}
// ----------------------
// Check Answer
// ----------------------
async function checkAnswer() {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion)
        return;
    const playerAnswerValue = parseFloat(answerInput?.value?.trim() ?? '');
    if (isNaN(playerAnswerValue)) {
        feedbackMessage.textContent = "Enter a valid number!";
        feedbackMessage.className = "feedback-message wrong";
        return;
    }
    playerAnswers.push({
        question: currentQuestion.text,
        playerAnswer: playerAnswerValue,
        correctAnswer: currentQuestion.answer
    });
    if (Math.abs(playerAnswerValue - currentQuestion.answer) < 0.0001) {
        score += 20;
        feedbackMessage.textContent = "Great job! 🎉";
        feedbackMessage.className = "feedback-message correct";
    }
    else {
        hearts--;
        feedbackMessage.textContent = `Oops! Correct answer was ${currentQuestion.answer}. 💔`;
        feedbackMessage.className = "feedback-message wrong";
        await saveWrongAnswerToDb(currentQuestion.text, playerAnswerValue, currentQuestion.answer);
    }
    currentQuestionIndex++;
    updateUI();
    if (hearts <= 0 || currentQuestionIndex >= TOTAL_QUESTIONS) {
        setTimeout(endGame, 1000);
        return;
    }
    setTimeout(loadNextQuestion, 1000);
}
// ----------------------
// End Game
// ----------------------
function endGame() {
    inputArea.classList.add("hidden");
    questionArea.innerHTML = "";
    feedbackMessage.textContent = "";
    endScreen.classList.remove("hidden");
    const layoutBody = document.getElementById("layout-body");
    if (layoutBody)
        layoutBody.style.backgroundColor = "";
    const nameRed = `<span style="color:red;">${playerName}</span>`;
    const scoreRed = `<span style="color:red;">${score}</span>`;
    let html = "";
    if (hearts > 0) {
        html = `<h2 class="treasure">TREASURE FOUND! 🏆</h2>
                <p>Congratulations, ${nameRed}! 🎉</p>
                <p>Final Score: ${scoreRed}</p>`;
    }
    else {
        html = `<h2 class="game-over">GAME OVER 💔</h2>
                <p>${nameRed}, you ran out of energy!</p>
                <p>Final Score: ${scoreRed}</p>`;
    }
    html += `<button id="play-again-btn">Play Again</button>`;
    const wrongAnswers = playerAnswers.filter(a => a.playerAnswer !== a.correctAnswer);
    if (wrongAnswers.length > 0) {
        html += `<button id="review-answers-btn" style="margin-left: 10px;">Review Your Answers</button>`;
    }
    endScreen.innerHTML = html;
    document.getElementById("play-again-btn")?.addEventListener("click", () => window.location.reload());
    document.getElementById("review-answers-btn")?.addEventListener("click", () => reviewAnswers());
}
// ----------------------
// Review Answers
// ----------------------
function reviewAnswers() {
    const wrongAnswers = playerAnswers.filter(a => a.playerAnswer !== a.correctAnswer);
    if (wrongAnswers.length === 0)
        return; // no wrong answers
    // reset reviewIndex if out of bounds
    if (reviewIndex >= wrongAnswers.length) {
        reviewIndex = 0;
        endScreen.innerHTML = `<h2>Review Finished ✅</h2>
                               <button onclick="window.location.reload()">Play Again</button>`;
        return;
    }
    const item = wrongAnswers[reviewIndex];
    if (!item)
        return; // safety check
    endScreen.innerHTML = `
        <h2>Question ${reviewIndex + 1} of ${wrongAnswers.length}</h2>
        <p>Q: ${item.question}</p>
        <p>Your Answer: <span style="color:red">${item.playerAnswer}</span></p>
        <p>Correct Answer: <span style="color:green">${item.correctAnswer}</span></p>
        <button id="next-review-btn">Next</button>
    `;
    document.getElementById("next-review-btn")?.addEventListener("click", () => {
        reviewIndex++;
        reviewAnswers();
    });
}
// ----------------------
// Layout Colors
// ----------------------
function updateLayoutBackground() {
    const layoutBody = document.getElementById("layout-body");
    if (!layoutBody)
        return;
    layoutBody.style.backgroundColor = playerGender === "Male" ? "#cce6ff"
        : playerGender === "Female" ? "#ffcce6" : "";
}
// ----------------------
// Event Listeners
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    startButton?.addEventListener("click", initializeGame);
    checkButton?.addEventListener("click", checkAnswer);
    answerInput?.addEventListener("keydown", e => {
        if (e.key === "Enter" && !checkButton.disabled)
            checkAnswer();
    });
});
//# sourceMappingURL=games.js.map