// ==================================================== //
// ==== Xử lý chọn đáp án                            === //
// ==================================================== //

import {
  playSelectAnswer,
  playAnsNow,
  playCorrectAnswer,
  playWrongAnswer,
  pauseBgMusic,
  resumeBgMusic,
} from "./audio.js";

import { displayNextQuestion } from "./question.js";
import { endGame, advancePrize } from "./gameState.js";

let answering = false;

async function handleAnswer(e) {
  if (answering) return;
  answering = true;

  try {
    const selectedAnswer = Number(e.currentTarget.dataset.id);
    const options = Array.from(document.getElementsByClassName("options"));
    const currentQuestion = JSON.parse(localStorage.getItem("currentQuestion"));

    if (!currentQuestion) {
      alert("Chưa có câu hỏi. Bấm Let's Play lại.");
      answering = false;
      return;
    }

    const currentAnswer = Number(currentQuestion.correct);

    options.forEach((opt) => {
      opt.style.pointerEvents = "none";
    });

    pauseBgMusic();
    options[selectedAnswer]?.classList.add("selected-answer");

    // LVS: "Bạn chọn đáp án A/B/C/D" (chữ bạn chọn)
    await playSelectAnswer(selectedAnswer);

    if (selectedAnswer !== currentAnswer) {
      options[selectedAnswer]?.classList.replace(
        "selected-answer",
        "wrong-answer"
      );
      // Highlight đáp án đúng trên UI
      if (options[currentAnswer]) {
        options[currentAnswer].classList.add("correct-answer");
      }
      // LVS lose_a/b/c/d = "Đáp án đúng là A/B/C/D"
      // → phải theo CHỮ ĐÚNG (currentAnswer), không phải chữ bạn chọn
      await playWrongAnswer(currentAnswer);
      answering = false;
      // endGame(false, { skipLoseVoice: true }) vì vừa phát lose_X rồi
      await endGame(false, { skipLoseVoice: true });
      return;
    }

    // Đúng: nhịp hồi hộp rồi LVS chúc mừng đúng chữ đã chọn
    await playAnsNow();
    options[selectedAnswer]?.classList.remove("selected-answer");
    options[selectedAnswer]?.classList.add("correct-answer");
    await playCorrectAnswer(selectedAnswer);

    const hasNext = await advancePrize();
    answering = false;

    if (hasNext) {
      resumeBgMusic();
      options.forEach((opt) => {
        opt.style.pointerEvents = "";
        opt.style.visibility = "visible";
        delete opt.dataset.hidden5050;
      });
      await displayNextQuestion();
    }
  } catch (err) {
    console.error("handleAnswer lỗi:", err);
    answering = false;
  }
}

export { handleAnswer };
