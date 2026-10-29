// ==================================================== //
// ==== Hiển thị câu hỏi (dữ liệu local, không fetch) === //
// ==================================================== //

import {
  playQuestionIntro,
  pauseBgMusic,
  resumeBgMusic,
} from "./audio.js";

import { getQuestionIndex } from "./state.js";
import { getDeckQuestion } from "./deck.js";
import { clearHiddenForNewQuestion } from "./lifelines.js";

// Callback chọn đáp án — gắn từ index.js (tránh circular import)
let onAnswerClick = null;

function setAnswerHandler(handler) {
  onAnswerClick = handler;
}

function resetOptionStyles() {
  const options = document.getElementsByClassName("options");
  for (let i = 0; i < options.length; i++) {
    options[i].classList.remove(
      "selected-answer",
      "correct-answer",
      "wrong-answer"
    );
    options[i].style.pointerEvents = "";
    options[i].style.visibility = "visible";
    delete options[i].dataset.hidden5050;
  }
}

function getCurrentQuestion() {
  const index = getQuestionIndex();
  // Lấy từ bộ 15 câu đã bốc random cho ván này
  return getDeckQuestion(index);
}

function displayQuestion(questionObject) {
  if (!questionObject) {
    console.error("displayQuestion: không có dữ liệu câu hỏi");
    return;
  }

  const questionCard = document.getElementById("question-card");
  if (!questionCard) {
    console.error("Không tìm thấy #question-card");
    return;
  }

  questionCard.innerHTML = `<h2 class="question-text text-center">${questionObject.question}</h2>`;

  const optionIds = ["option-one", "option-two", "option-three", "option-four"];
  const labels = ["A", "B", "C", "D"];

  optionIds.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;

    const fresh = el.cloneNode(false);
    fresh.dataset.id = String(i);
    fresh.id = id;
    fresh.className =
      "options rounded border-4 border-border p-3 sm:p-4 w-full hover:cursor-pointer";
    fresh.style.pointerEvents = "";
    fresh.style.visibility = "visible";
    delete fresh.dataset.hidden5050;
    fresh.innerHTML = `
      <span class="option-label text-orange font-bold mr-2">${labels[i]}:</span>
      <span class="option-text">${questionObject.content[i]}</span>`;
    if (onAnswerClick) {
      fresh.addEventListener("click", onAnswerClick);
    }
    el.replaceWith(fresh);
  });
}

/**
 * Hiện câu hỏi trên màn hình + intro LVS "Câu hỏi số N" (không TTS đọc đề).
 * @param {boolean} skipVoice - nếu true thì chỉ render UI câu hỏi, không phát âm thanh intro
 */
async function displayNextQuestion(skipVoice = false) {
  resetOptionStyles();
  clearHiddenForNewQuestion();

  const question = getCurrentQuestion();
  if (!question) {
    console.error("Không tìm thấy câu hỏi index=", getQuestionIndex());
    const card = document.getElementById("question-card");
    if (card) {
      card.innerHTML =
        '<h2 class="text-center text-red-400">Lỗi: không tải được câu hỏi. F5 lại trang.</h2>';
    }
    return;
  }

  localStorage.setItem("currentQuestion", JSON.stringify(question));
  displayQuestion(question);

  if (skipVoice) return;

  const level = getQuestionIndex() + 1;

  try {
    // Chỉ intro "Câu hỏi số N..." — không đọc nội dung đề
    pauseBgMusic();
    await playQuestionIntro(level);
    resumeBgMusic();
  } catch (err) {
    console.warn("Audio lỗi (vẫn chơi được):", err);
    resumeBgMusic();
  }
}

export {
  displayNextQuestion,
  displayQuestion,
  getCurrentQuestion,
  setAnswerHandler,
};
