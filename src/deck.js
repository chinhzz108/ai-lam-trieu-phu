// ==================================================== //
// ==== Quản lý bộ câu hỏi (Dealing Shoe / Anti-repetition) === //
// ==================================================== //

import { QUESTIONS, LEVEL_PLAN } from "./questionsData.js";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Xáo A/B/C/D mỗi lần đưa vào ván — nội dung đúng giữ nguyên, chỉ đổi vị trí.
 */
function shuffleQuestionOptions(question) {
  if (!question?.content?.length) return question;

  const n = question.content.length;
  const order = shuffle([...Array(n).keys()]);
  const content = order.map((i) => question.content[i]);
  const correctIndex = Number(question.correct);
  const correct = order.indexOf(
    Number.isFinite(correctIndex) ? correctIndex : 0
  );

  return {
    ...question,
    content,
    correct: correct >= 0 ? correct : 0,
  };
}

const STORAGE_PREFIX = "wwtbam_";
const PILE_KEY = (diff) => `${STORAGE_PREFIX}pile_${diff}`;
const RECENT_KEY = (diff) => `${STORAGE_PREFIX}recent_${diff}`;

function getStorage(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

/**
 * Dọn dẹp kho lưu trữ phiên bản cũ (chống lỗi do localStorage cũ để lại)
 */
function cleanupLegacyStorage() {
  try {
    if (localStorage.getItem("seenQuestionIds")) {
      localStorage.removeItem("seenQuestionIds");
    }
  } catch {}
}

/**
 * Xây dựng chu kỳ bốc mới:
 * - Các câu chưa nằm trong recent (hoặc đã chơi từ rất lâu) được đưa lên đầu.
 * - Các câu vừa mới chơi ở ván gần nhất tuyệt đối bị đẩy về cuối chu kỳ.
 */
function buildNewCyclePile(allInDiff, recent, excludeIds) {
  const excludeSet = new Set(excludeIds);
  const notRecent = allInDiff.filter(
    (id) => !recent.includes(id) && !excludeSet.has(id)
  );
  const recentOrdered = recent.filter(
    (id) => allInDiff.includes(id) && !excludeSet.has(id)
  );

  const part1 = shuffle(notRecent);
  const half = Math.floor(recentOrdered.length / 2);
  const oldestHalf = shuffle(recentOrdered.slice(0, half));
  const newestHalf = shuffle(recentOrdered.slice(half));
  const veryEnd = shuffle(excludeIds.filter((id) => allInDiff.includes(id)));

  return [...part1, ...oldestHalf, ...newestHalf, ...veryEnd];
}

/**
 * Bốc `count` câu hỏi cho độ khó `difficulty` bằng cơ chế Dealing Shoe:
 * - Đảm bảo mọi câu trong pool đều được chơi hết 1 lượt trước khi có câu lặp lại.
 * - Khi sang chu kỳ mới, câu vừa chơi ở các ván gần nhất tuyệt đối KHÔNG lặp lại ngay.
 */
function drawQuestionIds(difficulty, count) {
  cleanupLegacyStorage();

  const allInDiff = QUESTIONS.filter((q) => q.difficulty === difficulty).map(
    (q) => q.id
  );
  let pile = getStorage(PILE_KEY(difficulty), null);
  let recent = getStorage(RECENT_KEY(difficulty), []);

  // Kiểm tra tính hợp lệ của pile lưu trong localStorage
  if (
    !Array.isArray(pile) ||
    pile.some((id) => typeof id !== "number" || !allInDiff.includes(id))
  ) {
    pile = null;
  }

  if (!pile || pile.length === 0) {
    pile = buildNewCyclePile(allInDiff, recent, []);
  }

  let drawnIds = [];
  if (pile.length >= count) {
    drawnIds = pile.splice(0, count);
  } else {
    drawnIds = [...pile];
    const needed = count - drawnIds.length;
    const newPile = buildNewCyclePile(allInDiff, recent, drawnIds);
    const rest = newPile.splice(0, needed);
    drawnIds = [...drawnIds, ...rest];
    pile = newPile;
  }

  // Cập nhật recent: đẩy các câu vừa bốc về cuối danh sách (mới nhất)
  const drawnSet = new Set(drawnIds);
  recent = recent.filter((id) => !drawnSet.has(id));
  recent.push(...drawnIds);

  setStorage(PILE_KEY(difficulty), pile);
  setStorage(RECENT_KEY(difficulty), recent);

  return drawnIds;
}

/**
 * Tạo bộ 15 câu cho 1 ván chơi:
 * - 3 câu đầu: Khó (từ 25 câu slide kiến thức)
 * - 12 câu sau: Cực khó (từ 75 câu AI & phản biện)
 * Đảm bảo 100% không lặp lại giữa các ván và khi load lại trang.
 */
function buildGameDeck() {
  // Đếm số câu cần theo độ khó
  const countNeeded = {};
  for (const diff of LEVEL_PLAN) {
    countNeeded[diff] = (countNeeded[diff] || 0) + 1;
  }

  // Bốc danh sách ID theo độ khó
  const chosenIdsByDiff = {};
  for (const diff of Object.keys(countNeeded)) {
    chosenIdsByDiff[diff] = drawQuestionIds(diff, countNeeded[diff]);
  }

  // Tạo map ID -> Question object
  const questionMap = new Map();
  QUESTIONS.forEach((q) => questionMap.set(q.id, q));

  // Ghép deck theo đúng thứ tự LEVEL_PLAN
  const cursor = {};
  for (const diff of Object.keys(countNeeded)) cursor[diff] = 0;

  const deck = [];
  for (const diff of LEVEL_PLAN) {
    const id = chosenIdsByDiff[diff][cursor[diff]++];
    const rawQuestion = questionMap.get(id);
    deck.push(shuffleQuestionOptions(rawQuestion));
  }

  return deck;
}

function saveDeck(deck) {
  try {
    localStorage.setItem("gameDeck", JSON.stringify(deck));
  } catch {}
}

function loadDeck() {
  try {
    const raw = localStorage.getItem("gameDeck");
    if (!raw) return null;
    const deck = JSON.parse(raw);
    return Array.isArray(deck) && deck.length ? deck : null;
  } catch {
    return null;
  }
}

function getDeckQuestion(index) {
  const deck = loadDeck();
  if (!deck || index < 0 || index >= deck.length) return null;
  return deck[index];
}

function startNewDeck() {
  const deck = buildGameDeck();
  saveDeck(deck);
  return deck;
}

function resetQuestionHistory() {
  try {
    localStorage.removeItem(PILE_KEY("hard"));
    localStorage.removeItem(PILE_KEY("very_hard"));
    localStorage.removeItem(RECENT_KEY("hard"));
    localStorage.removeItem(RECENT_KEY("very_hard"));
    localStorage.removeItem("seenQuestionIds");
    localStorage.removeItem("gameDeck");
    localStorage.removeItem("currentQuestion");
    localStorage.removeItem("questionIndex");
  } catch {}
}

// Gắn hàm resetQuestionHistory vào window để tiện debug nếu cần
if (typeof window !== "undefined") {
  window.resetQuestionHistory = resetQuestionHistory;
}

export {
  buildGameDeck,
  startNewDeck,
  loadDeck,
  getDeckQuestion,
  saveDeck,
  resetQuestionHistory,
};
