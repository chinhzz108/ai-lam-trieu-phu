// ====================================================== //
// ==== Prize ladder (VND) — edit values here freely  === //
// ====================================================== //
// Index 0 = câu 1 (dễ nhất), index 14 = câu 15 (đỉnh)
// Safe haven mặc định: câu 5, 10, 15 (index 4, 9, 14)

export const PRIZES = [
  200_000, // 1
  400_000, // 2
  600_000, // 3
  1_000_000, // 4
  2_000_000, // 5  — mốc an toàn
  3_000_000, // 6
  6_000_000, // 7
  10_000_000, // 8
  14_000_000, // 9
  22_000_000, // 10 — mốc an toàn
  30_000_000, // 11
  40_000_000, // 12
  60_000_000, // 13
  85_000_000, // 14
  150_000_000, // 15 — mốc an toàn / giải nhất
];

// Index các câu "mốc an toàn" (0-based)
export const SAFE_HAVENS = [4, 9, 14];

const PRIZE_LIST_ID = "prize-ladder";

function formatVND(amount) {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

// ====================================================== //
// ==== Render ladder (cao → thấp, giống show TV)     === //
// ====================================================== //
function renderPrizeLadder(currentIndex = 0) {
  const list = document.getElementById(PRIZE_LIST_ID);
  if (!list) return;

  // Hiển thị từ giải cao xuống thấp
  const items = [...PRIZES]
    .map((amount, index) => ({ amount, index }))
    .reverse()
    .map(({ amount, index }) => {
      const isSafe = SAFE_HAVENS.includes(index);
      const isActive = index === currentIndex;
      const classes = [
        isActive ? "money-active" : "",
        isSafe && !isActive ? "text-white font-bold" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return `<li class="${classes}" data-prize-index="${index}">${formatVND(
        amount
      )}</li>`;
    })
    .join("");

  list.innerHTML = items;
}

function highlightPrize(currentIndex) {
  renderPrizeLadder(currentIndex);
}

function getPrizeForQuestion(index) {
  if (index < 0 || index >= PRIZES.length) return 0;
  return PRIZES[index];
}

// Tiền nhận khi trả lời sai (theo mốc an toàn đã vượt qua)
function getGuaranteedPrize(wrongAnswerIndex) {
  let guaranteed = 0;
  for (const safeIndex of SAFE_HAVENS) {
    if (wrongAnswerIndex > safeIndex) {
      guaranteed = PRIZES[safeIndex];
    }
  }
  return guaranteed;
}

export {
  formatVND,
  renderPrizeLadder,
  highlightPrize,
  getPrizeForQuestion,
  getGuaranteedPrize,
};
