// ======================================================== //
// =============== PSEUDOCODE FOR THE GAME =============== //

//1. First get json data from the URL using fetch API
//2. Combine all the question sets into one array
//3. Create function that randomly selects a question object from the array
//4. Create a function that will take the question object and create a question card
//5. Create a function that will take the question card and display it on the page

// ===================================================== //


// ==== Get Audios/Sounds ==== //
import {
  stopAllAudio,
  resumeBgMusic,
} from "./audio.js";

// ==== Get Buttons ===== //
import {
  letsPlayBtn,
  audioBtnControl
} from "./button.js";

// ==== Get Games State Functions ==== //
import {
  startGame,
} from "./gameState.js";

import {
  renderPrizeLadder
} from "./prizes.js";

import {
  setAnswerHandler,
} from "./question.js";

import {
  setQuestionIndex,
} from "./state.js";

import {
  handleAnswer,
} from "./answer.js";

import {
  initLifelines,
} from "./lifelines.js";


// ==== Initialize boolean for audio control ==== //
let playAudio = true;
localStorage.setItem('playAudio', JSON.stringify(playAudio));

// Đặt lại trạng thái câu về 0 khi vừa load / F5 lại trang
setQuestionIndex(0);
try {
  localStorage.removeItem("currentQuestion");
} catch {}

// Gắn handler chọn đáp án (tránh circular import)
setAnswerHandler(handleAnswer);

// 50:50 / Gọi điện / Hỏi khán giả
initLifelines();

// Vẽ thang tiền VND ngay khi load trang
renderPrizeLadder(0);

// ======================================================== //
// === Start game when user clicks [Let's Play] button === //
// ====================================================== //
letsPlayBtn.addEventListener("click", () => {
  startGame().catch((err) => {
    console.error(err);
    alert("Không start được game: " + err.message);
  });
});


// ======================== //
// ==== Control Audio ==== //
// ====================== //
let mute = document.querySelector(".mute");
let unmute = document.querySelector(".unmute");

audioBtnControl.addEventListener("click", () => {
  playAudio = JSON.parse(localStorage.getItem('playAudio'));
  playAudio = !playAudio;
  localStorage.setItem('playAudio', JSON.stringify(playAudio));

  if (playAudio) {
    unmute.classList.add("hidden");
    mute.classList.remove("hidden");
    resumeBgMusic();
  } else {
    unmute.classList.remove("hidden");
    mute.classList.add("hidden");
    stopAllAudio();
  }
});
