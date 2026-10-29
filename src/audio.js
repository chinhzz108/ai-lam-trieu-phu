// ==================================================== //
// ==== Âm thanh MC Lại Văn Sâm (từ ngdathd/AiLaTrieuPhu)
// ==== + TTS đọc nội dung câu hỏi tiếng Việt
// ==================================================== //

const BASE = "./audio/lvs/";

// --- Nhóm clip theo tình huống (chọn ngẫu nhiên 1 file) ---
const CLIPS = {
  gofind: ["gofind.mp3", "gofind_b.mp3"],
  ready: ["ready.mp3", "ready_b.mp3", "ready_c.mp3"],
  luatchoi: ["luatchoi_b.mp3", "luatchoi_c.mp3"],
  ansNow: ["ans_now1.mp3", "ans_now2.mp3", "ans_now3.mp3"],
  lose: ["lose.mp3", "lose2.mp3"],
  ans: [
    ["ans_a.mp3", "ans_a2.mp3"],
    ["ans_b.mp3", "ans_b2.mp3"],
    ["ans_c.mp3", "ans_c2.mp3"],
    ["ans_d.mp3", "ans_d2.mp3"],
  ],
  true: [
    ["true_a.mp3", "true_a2.mp3", "true_a3.mp3"],
    ["true_b.mp3", "true_b2.mp3", "true_b3.mp3"],
    ["true_c.mp3", "true_c2.mp3", "true_c3.mp3"],
    ["true_d2.mp3", "true_d3.mp3"],
  ],
  wrong: [
    ["lose_a.mp3", "lose_a2.mp3"],
    ["lose_b.mp3", "lose_b2.mp3"],
    ["lose_c.mp3", "lose_c2.mp3"],
    ["lose_d.mp3", "lose_d2.mp3"],
  ],
  // Intro "Câu hỏi số N" — level 1..15
  quest: [
    ["ques1.mp3", "ques1_b.mp3"],
    ["ques2.mp3", "ques2_b.mp3"],
    ["ques3.mp3", "ques3_b.mp3"],
    ["ques4.mp3", "ques4_b.mp3"],
    ["ques5.mp3", "ques5_b.mp3"],
    ["ques6.mp3"],
    ["ques7.mp3", "ques7_b.mp3"],
    ["ques8.mp3", "ques8_b.mp3"],
    ["ques9.mp3", "ques9_b.mp3"],
    ["ques10.mp3"],
    ["ques11.mp3"],
    ["ques12.mp3"],
    ["ques13.mp3"],
    ["ques14.mp3"],
    ["ques15.mp3"],
  ],
  vuotMoc: ["chuc_mung_vuot_moc_01_0.mp3", "chuc_mung_vuot_moc_01_1.mp3"],
  win: ["chuc_mung_vuot_moc_02_0.mp3"],
  important: ["important.mp3"],
  bestPlayer: ["best_player.mp3"],
  sound5050: ["sound5050.mp3", "sound5050_2.mp3"],
  helpCall: ["help_call.mp3"],
  helpCallB: ["help_callb.mp3"],
  audience: ["khan_gia.mp3"],
  audienceB: ["hoi_y_kien_chuyen_gia_01b.mp3"],
  bg: "background_music.mp3",
  bgB: "background_music_b.mp3",
};

let sfx = null;
let bg = null;

function isAudioOn() {
  try {
    return JSON.parse(localStorage.getItem("playAudio")) !== false;
  } catch {
    return true;
  }
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function stopSfx() {
  if (sfx) {
    sfx.pause();
    sfx.onended = null;
    sfx = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function stopBg() {
  if (bg) {
    bg.pause();
    bg = null;
  }
}

function stopAllAudio() {
  stopSfx();
  stopBg();
}

/**
 * Phát 1 file mp3, resolve khi xong (hoặc lỗi / mute).
 */
function playFile(fileName) {
  return new Promise((resolve) => {
    if (!isAudioOn()) {
      resolve();
      return;
    }
    stopSfx();
    const audio = new Audio(BASE + fileName);
    sfx = audio;
    const done = () => {
      if (sfx === audio) sfx = null;
      resolve();
    };
    audio.addEventListener("ended", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    audio.play().catch(done);
  });
}

function playRandom(list) {
  return playFile(pick(list));
}

// ========== Public API ========== //

async function playGoFind() {
  await playRandom(CLIPS.gofind);
}

async function playReady() {
  await playRandom(CLIPS.ready);
}

/** MC Lại Văn Sâm đọc luật chơi & giới thiệu các quyền trợ giúp */
async function playLuatChoi() {
  await playRandom(CLIPS.luatchoi);
}

/** Intro Lại Văn Sâm: "Câu hỏi số N" (level 1..15) */
async function playQuestionIntro(level) {
  const idx = Math.min(Math.max(level, 1), 15) - 1;
  await playRandom(CLIPS.quest[idx]);
}

/** Chọn đáp án A/B/C/D — index 0..3 */
async function playSelectAnswer(optionIndex) {
  await playRandom(CLIPS.ans[optionIndex] || CLIPS.ans[0]);
}

async function playAnsNow() {
  await playRandom(CLIPS.ansNow);
}

/** Đáp án đúng theo chữ cái đã chọn */
async function playCorrectAnswer(optionIndex) {
  await playRandom(CLIPS.true[optionIndex] || CLIPS.true[0]);
}

/**
 * LVS lose_a/b/c/d = "Đáp án đúng là A/B/C/D"
 * Truyền index ĐÁP ÁN ĐÚNG (0=A … 3=D), không phải chữ người chơi chọn.
 */
async function playWrongAnswer(correctOptionIndex) {
  await playRandom(CLIPS.wrong[correctOptionIndex] || CLIPS.wrong[0]);
}

async function playLose() {
  await playRandom(CLIPS.lose);
}

async function playWin() {
  await playRandom(CLIPS.win);
}

async function playVuotMoc() {
  await playRandom(CLIPS.vuotMoc);
}

async function playImportant() {
  await playFile(CLIPS.important[0]);
}

async function play5050() {
  await playRandom(CLIPS.sound5050);
}

async function playHelpCall() {
  await playRandom(CLIPS.helpCall);
  // Chuông / chờ máy — không chặn quá lâu
  playRandom(CLIPS.helpCallB).catch(() => {});
}

async function playAudience() {
  await playRandom(CLIPS.audience);
  playRandom(CLIPS.audienceB).catch(() => {});
}

function startBgMusic(hard = false) {
  if (!isAudioOn()) return;
  stopBg();
  bg = new Audio(BASE + (hard ? CLIPS.bgB : CLIPS.bg));
  bg.loop = true;
  bg.volume = 0.35;
  bg.play().catch(() => {});
}

function pauseBgMusic() {
  if (bg) bg.pause();
}

function resumeBgMusic() {
  if (bg && isAudioOn()) bg.play().catch(() => {});
}

/**
 * Đọc nội dung câu hỏi bằng TTS tiếng Việt
 * (không phải giọng LVS thật — chỉ đọc text; clip LVS dùng cho intro/đáp án)
 */
function speakQuestion(questionObject) {
  return new Promise((resolve) => {
    if (!isAudioOn() || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const labels = ["A", "B", "C", "D"];
    const parts = [
      questionObject.question,
      ...questionObject.content.map(
        (text, i) => `${labels[i]}. ${text}`
      ),
    ];
    const fullText = parts.join(". ");

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.lang = "vi-VN";
    utter.rate = 0.95;
    utter.pitch = 1;

    // Ưu tiên giọng Việt nếu máy có
    const voices = window.speechSynthesis.getVoices();
    const vi =
      voices.find((v) => v.lang === "vi-VN") ||
      voices.find((v) => v.lang.startsWith("vi"));
    if (vi) utter.voice = vi;

    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

// Preload voices (Chrome load async)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ---- Tương thích code cũ (một số chỗ còn gọi .play/.pause) ----
const noopAudio = {
  play() {},
  pause() {},
};
const letsPlayAudio = noopAudio;
const selectedAnswerAudio = noopAudio;
const correctAnswerAudio = noopAudio;
const wrongAnswerAudio = noopAudio;

export {
  playGoFind,
  playLuatChoi,
  playReady,
  playQuestionIntro,
  playSelectAnswer,
  playAnsNow,
  playCorrectAnswer,
  playWrongAnswer,
  playLose,
  playWin,
  playVuotMoc,
  playImportant,
  play5050,
  playHelpCall,
  playAudience,
  startBgMusic,
  pauseBgMusic,
  resumeBgMusic,
  stopAllAudio,
  stopSfx,
  speakQuestion,
  isAudioOn,
  // legacy
  letsPlayAudio,
  selectedAnswerAudio,
  correctAnswerAudio,
  wrongAnswerAudio,
};
