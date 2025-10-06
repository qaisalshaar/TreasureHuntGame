"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ----------------------
// Game State
// ----------------------
let playerName = "";
let playerAge = 0;
let score = 0;
let hearts = 3;
let currentQuestionIndex = 0;
let currentAnswer = 0;
const TOTAL_QUESTIONS = 5;
const questions = [];
// ----------------------
// DOM Elements
// ----------------------
const playerNameInput = document.getElementById("player-name-input");
const playerAgeInput = document.getElementById("player-age-input");
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
const ageError = document.getElementById("age-error");
// ----------------------
// Helper Functions
// ----------------------
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getLevel(age) {
    if (age >= 5 && age < 10)
        return 1;
    if (age >= 10 && age < 15)
        return 2;
    if (age >= 15 && age <= 20)
        return 3;
    return 2;
}
function generateQuestion(level) {
    let a = 0;
    let b = 0;
    let op = "+";
    if (level === 1) {
        a = getRandomInt(1, 10);
        b = getRandomInt(1, 10);
        op = Math.random() < 0.5 ? "+" : "-";
    }
    else if (level === 2) {
        a = getRandomInt(-200, 300);
        b = getRandomInt(-150, 250);
        op = Math.random() < 0.5 ? "+" : "-";
    }
    else {
        const ops = ["+", "-", "*", "/"];
        const randomOp = ops[Math.floor(Math.random() * ops.length)];
        op = randomOp ?? "+"; // ✅ fallback
        if (op === "/") {
            b = getRandomInt(1, 20);
            const quotient = getRandomInt(-50, 50);
            a = b * quotient;
        }
        else {
            a = getRandomInt(-1000, 1000);
            b = getRandomInt(-500, 500);
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
    playerNameDisplay.textContent = playerName;
    playerNameDisplay.style.color = "red";
    scoreElement.innerHTML = `Score: <span style="color:red;">${score}</span>`;
    heartsElement.innerHTML = `Lives: ${"❤️".repeat(hearts)}`;
    progressBar.style.width = `${(currentQuestionIndex / TOTAL_QUESTIONS) * 100}%`;
}
// ----------------------
// Game Flow
// ----------------------
function initializeGame() {
    const name = playerNameInput.value.trim();
    const age = parseInt(playerAgeInput.value.trim());
    let valid = true;
    nameError.style.display = "none";
    ageError.style.display = "none";
    if (!name || name.length < 2) {
        nameError.textContent = "Please enter a valid name (at least 2 characters).";
        nameError.style.display = "block";
        valid = false;
    }
    if (isNaN(age) || age < 5 || age > 20) {
        ageError.textContent = "Age must be between 5 and 20.";
        ageError.style.display = "block";
        valid = false;
    }
    if (!valid)
        return;
    playerName = name;
    playerAge = age;
    score = 0;
    hearts = 3;
    currentQuestionIndex = 0;
    questions.length = 0;
    endScreen.classList.add("hidden");
    inputArea.classList.remove("hidden");
    startButton.classList.add("hidden");
    document.querySelectorAll(".player-input").forEach(el => el.classList.add("hidden"));
    const level = getLevel(age);
    for (let i = 0; i < TOTAL_QUESTIONS; i++)
        questions.push(generateQuestion(level));
    updateUI();
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
function checkAnswer() {
    const playerAnswer = parseFloat(answerInput.value.trim());
    const level = getLevel(playerAge);
    if (level === 1 && (isNaN(playerAnswer) || playerAnswer < 0)) {
        feedbackMessage.textContent = "Please enter a valid positive number!";
        feedbackMessage.className = "feedback-message wrong";
        return;
    }
    if ((level === 2 || level === 3) && isNaN(playerAnswer)) {
        feedbackMessage.textContent = "Please enter a valid number!";
        feedbackMessage.className = "feedback-message wrong";
        return;
    }
    if (playerAnswer === currentAnswer) {
        score += 20;
        feedbackMessage.textContent = "Great job! You found a clue! 🎉";
        feedbackMessage.className = "feedback-message correct";
    }
    else {
        hearts--;
        feedbackMessage.textContent = `Oops! The correct answer was ${currentAnswer}. 💔`;
        feedbackMessage.className = "feedback-message wrong";
    }
    currentQuestionIndex++;
    updateUI();
    if (hearts <= 0) {
        endGame();
        return;
    }
    setTimeout(loadNextQuestion, 1000);
}
// ----------------------
// Save Player to Database
// ----------------------
async function savePlayerToDb() {
    const playerData = {
        fullName: playerName,
        age: playerAge,
        finalScore: score
    };
    try {
        const response = await fetch("/api/player/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(playerData)
        });
        if (response.ok) {
            console.log("✅ Player saved successfully");
        }
        else {
            console.error("❌ Failed to save player:", response.statusText);
        }
    }
    catch (err) {
        console.error("⚠️ Error saving player:", err);
    }
}
// ----------------------
// End Game
// ----------------------
function endGame() {
    inputArea.classList.add("hidden");
    questionArea.innerHTML = "";
    feedbackMessage.textContent = "";
    endScreen.classList.remove("hidden");
    const nameRed = `<span style="color:red;">${playerName}</span>`;
    const scoreRed = `<span style="color:red;">${score}</span>`;
    if (hearts > 0) {
        endScreen.innerHTML = `
            <h2 class="treasure">TREASURE FOUND! 🏆</h2>
            <p>Congratulations, ${nameRed}! 🎉</p>
            <p>You solved all the problems and kept your energy!</p>
            <p>Final Score: ${scoreRed}</p>
            <button onclick="window.location.reload()">Play Again</button>
        `;
    }
    else {
        endScreen.innerHTML = `
            <h2 class="game-over">GAME OVER 💔</h2>
            <p>Brave adventurer, ${nameRed}...</p>
            <p>You ran out of energy. The treasure is still waiting!</p>
            <p>Final Score: ${scoreRed}</p>
            <button onclick="window.location.reload()">Try Again</button>
        `;
    }
    savePlayerToDb();
}
// ----------------------
// Event Listeners
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    startButton.addEventListener("click", initializeGame);
    checkButton.addEventListener("click", checkAnswer);
    answerInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !checkButton.disabled)
            checkAnswer();
    });
});
//# sourceMappingURL=game.js.map