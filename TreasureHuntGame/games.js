"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ----------------------
// Game State
// ----------------------
let playerName = "";
let playerAge = 0;
let playerLevel = 0; // Initialize dynamically based on age
let score = 0;
let hearts = 3;
let currentQuestionIndex = 0;
let currentAnswer = 0;
const TOTAL_QUESTIONS = 5;
const questions = [];
// ----------------------
// DOM Elements
// ----------------------
// Using explicit type casting for strict mode and correct property access
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
const playersRankBtn = document.getElementById("players-rank-btn");
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
    return 2; // Default level for out-of-range age if validation is bypassed
}
function generateQuestion(level) {
    let a = 0;
    let b = 0;
    let op = "+";
    if (level === 1) {
        // Level 1: simple addition or subtraction with positive answers only
        op = Math.random() < 0.5 ? "+" : "-";
        if (op === "+") {
            a = getRandomInt(1, 10);
            b = getRandomInt(1, 10);
        }
        else {
            a = getRandomInt(1, 10);
            b = getRandomInt(1, a); // ensure result is non-negative
        }
    }
    else if (level === 2) {
        // Level 2: mixed operations, larger integers, potential negative answers
        a = getRandomInt(-200, 300);
        b = getRandomInt(-150, 250);
        op = Math.random() < 0.5 ? "+" : "-";
    }
    else {
        // Level 3: full range of operations, larger and more complex numbers
        const ops = ["+", "-", "*", "/"];
        op = ops[Math.floor(Math.random() * ops.length)] ?? "+";
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
    playerNameDisplay.textContent = `${playerName} (Level: ${playerLevel})`;
    playerNameDisplay.style.color = "red";
    scoreElement.innerHTML = `Score: <span style="color:red;">${score}</span>`;
    // Using loop/concatenation instead of .repeat() for broader compatibility
    let heartIcons = "";
    let remainingHearts = Math.max(0, Math.floor(hearts));
    while (remainingHearts > 0) {
        heartIcons += "❤️";
        remainingHearts--;
    }
    heartsElement.innerHTML = `Lives: ${heartIcons}`;
    progressBar.style.width = `${(currentQuestionIndex / TOTAL_QUESTIONS) * 100}%`;
}
// ----------------------
// Game Flow
// ----------------------
function initializeGame() {
    // CRITICAL FIX: Use safe access and provide defaults in case of missing HTML elements
    const name = playerNameInput?.value?.trim() ?? '';
    const ageString = playerAgeInput?.value?.trim() ?? '';
    const age = parseInt(ageString);
    let valid = true;
    nameError.style.display = "none";
    ageError.style.display = "none";
    // Ensure all elements exist before proceeding with validation
    if (!playerNameInput || !playerAgeInput) {
        console.error("Fatal Error: Missing required DOM elements (player-name-input or player-age-input). Check your HTML.");
        questionArea.innerHTML = "<p class='error-message'>Configuration Error: Missing inputs in HTML.</p>";
        return;
    }
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
    playerLevel = getLevel(age); // Set level based on validated age
    score = 0;
    hearts = 3;
    currentQuestionIndex = 0;
    questions.length = 0;
    endScreen.classList.add("hidden");
    inputArea.classList.remove("hidden");
    startButton.classList.add("hidden");
    // Hide the input fields (Name and Age)
    document.querySelectorAll(".player-input").forEach(el => el.classList.add("hidden"));
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        questions.push(generateQuestion(playerLevel));
    }
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
    // For division problems, we use a small tolerance for floating point errors
    const isCloseEnough = Math.abs(playerAnswer - currentAnswer) < 0.0001;
    if (playerAnswer === currentAnswer || isCloseEnough) {
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
// Save Player to Database (ASP.NET Core API)
// ----------------------
// CONVERTED TO STANDARD PROMISE CHAIN to prevent ES5/Promise constructor errors
function savePlayerToDb() {
    const playerData = {
        fullName: playerName,
        age: playerAge,
        level: playerLevel, // Ensure level is saved
        finalScore: score
    };
    fetch("/api/player/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playerData)
    })
        .then(response => {
        if (response.ok) {
            console.log("✅ Player saved successfully");
            return;
        }
        // Handle error by reading response text
        response.text().then(errorText => {
            console.error("❌ Failed to save player:", response.status, errorText);
        }).catch(() => {
            console.error("❌ Failed to save player:", response.status, response.statusText);
        });
    })
        .catch(err => {
        console.error("⚠️ Network Error saving player:", err);
    });
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
    // The start button logic is guaranteed to run here
    startButton.addEventListener("click", initializeGame);
    checkButton.addEventListener("click", checkAnswer);
    answerInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !checkButton.disabled)
            checkAnswer();
    });
});
playersRankBtn?.addEventListener("click", () => {
    window.location.href = "/Player/Playersrank";
});
//# sourceMappingURL=games.js.map