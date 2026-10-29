// ====================================================== //
// ==== Game state: start / end / prize progress       === //
// ====================================================== //

import {
  playGoFind,
  playLuatChoi,
  playReady,
  playQuestionIntro,
  playLose,
  playWin,
  playVuotMoc,
  startBgMusic,
  stopAllAudio,
  pauseBgMusic,
} from "./audio.js";

import { welcomeSection, questionSection } from "./page.js";
import { letsPlayBtn } from "./button.js";
import { displayNextQuestion } from "./question.js";
import { getQuestionIndex, setQuestionIndex } from "./state.js";
import {
  PRIZES,
  SAFE_HAVENS,
  formatVND,
  renderPrizeLadder,
  highlightPrize,
  getGuaranteedPrize,
} from "./prizes.js";

import { resetLifelines } from "./lifelines.js";
import { startNewDeck } from "./deck.js";

let currentSessionId = 0;

function setQuestionIndexAndHighlight(index) {
  setQuestionIndex(index);
  highlightPrize(index);
}

async function startGame() {
  try {
    const sessionId = ++currentSessionId;

    // Mở màn chơi + bỏ class hidden của Tailwind
    welcomeSection.classList.replace("h-screen", "h-0");
    welcomeSection.style.display = "none";
    letsPlayBtn.style.display = "none";

    questionSection.classList.remove("hidden");
    questionSection.style.display = "flex";

    setQuestionIndexAndHighlight(0);
    renderPrizeLadder(0);
    resetLifelines();

    // Mỗi ván bốc 15 câu mới theo cơ chế chống lặp Dealing Shoe
    const deck = startNewDeck();
    console.log(
      "Ván mới — 15 câu:",
      deck.map((q, i) => `#${i + 1}[ID:${q.id}:${q.difficulty}]`).join(", ")
    );

    // Hiển thị câu hỏi 1 lên màn hình (chưa phát voice để phát chuỗi intro mở đầu trước)
    await displayNextQuestion(true);

    // Chuỗi voice MC Lại Văn Sâm mở đầu trò chơi chuẩn TV show:
    pauseBgMusic();

    // 1. "Chúng ta cùng bắt đầu đi tìm Ai là triệu phú!"
    await playGoFind();
    if (sessionId !== currentSessionId || getQuestionIndex() !== 0) return;

    // 2. MC đọc luật chơi & giới thiệu các quyền trợ giúp:
    await playLuatChoi();
    if (sessionId !== currentSessionId || getQuestionIndex() !== 0) return;

    // 3. "Bạn đã sẵn sàng chưa?"
    await playReady();
    if (sessionId !== currentSessionId || getQuestionIndex() !== 0) return;

    // 4. "Câu hỏi số 1"
    await playQuestionIntro(1);
    if (sessionId !== currentSessionId || getQuestionIndex() !== 0) return;

    // 5. Nhạc nền suy nghĩ bắt đầu
    startBgMusic(false);
  } catch (err) {
    console.error("startGame lỗi:", err);
    alert("Lỗi khi bắt đầu game. Mở F12 xem Console. Chi tiết: " + err.message);
  }
}

/** Về màn hình Let's Play để chơi ván mới */
function returnToLetsPlay() {
  currentSessionId++; // Hủy chuỗi intro nếu đang chạy dở
  stopAllAudio();
  resetLifelines(); // tắt timer/modal gọi điện + reset 50:50, call, audience

  // Ẩn màn chơi
  questionSection.classList.add("hidden");
  questionSection.style.display = "none";

  // Hiện welcome + nút Let's Play
  welcomeSection.style.display = "flex";
  welcomeSection.classList.remove("h-0");
  welcomeSection.classList.add("h-screen");
  letsPlayBtn.style.display = "";

  setQuestionIndex(0);
  localStorage.removeItem("currentQuestion");
  localStorage.removeItem("gameDeck");
}

async function endGame(won = false, options = {}) {
  const { skipLoseVoice = false } = options;
  const index = getQuestionIndex();
  let amount = 0;
  let message = "";

  pauseBgMusic();

  if (won) {
    amount = PRIZES[PRIZES.length - 1];
    message = `Chúc mừng! Bạn đã chiến thắng ${formatVND(amount)}!`;
    await playWin();
  } else {
    amount = getGuaranteedPrize(index);
    message =
      amount > 0
        ? `Sai rồi! Bạn ra về với ${formatVND(amount)}.`
        : "Sai rồi! Bạn ra về tay trắng.";
    if (!skipLoseVoice) {
      await playLose();
    }
  }

  alert(message);
  returnToLetsPlay();
}

async function advancePrize() {
  const current = getQuestionIndex();
  const next = current + 1;

  if (SAFE_HAVENS.includes(current) && current < PRIZES.length - 1) {
    await playVuotMoc();
  }

  if (next >= 5) {
    startBgMusic(true);
  }

  if (next >= PRIZES.length) {
    await endGame(true);
    return false;
  }

  setQuestionIndexAndHighlight(next);
  return true;
}

function resetState() {
  const options = document.getElementsByClassName("options");
  for (let i = 0; i < options.length; i++) {
    options[i].classList.remove("selected-answer", "correct-answer", "wrong-answer");
    options[i].style.pointerEvents = "";
    options[i].style.visibility = "visible";
    delete options[i].dataset.hidden5050;
  }
}

export {
  startGame,
  endGame,
  resetState,
  advancePrize,
  getQuestionIndex,
  setQuestionIndexAndHighlight as setQuestionIndex,
};
