// ==================================================== //
// ==== Quyền trợ giúp: 50:50 | Gọi điện | Khán giả === //
// ==== (UI dùng inline style — không phụ thuộc Tailwind purge)
// ==================================================== //

import {
  play5050,
  playHelpCall,
  playAudience,
  pauseBgMusic,
  resumeBgMusic,
} from "./audio.js";

const state = {
  used5050: false,
  usedCall: false,
  usedAudience: false,
  hiddenOptions: [],
};

let callTimerId = null;

function getCurrentQuestion() {
  try {
    return JSON.parse(localStorage.getItem("currentQuestion"));
  } catch {
    return null;
  }
}

function getOptionElements() {
  return Array.from(document.getElementsByClassName("options"));
}

function markUsed(btnId, usedImg) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const img = btn.querySelector("img");
  if (img) img.src = usedImg;
  btn.style.opacity = "0.45";
  btn.style.pointerEvents = "none";
  btn.style.cursor = "default";
  btn.dataset.used = "1";
}

function resetLifelineButtons() {
  const items = [
    { id: "fifty-fifty", src: "images/50-50.png" },
    { id: "phone-a-friend", src: "images/phone-a-friend.png" },
    { id: "ask-the-audience", src: "images/ask-the-audience.png" },
  ];
  items.forEach(({ id, src }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const img = btn.querySelector("img");
    if (img) img.src = src;
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
    btn.style.cursor = "pointer";
    delete btn.dataset.used;
  });
}

function clearCallTimer() {
  if (callTimerId) {
    clearInterval(callTimerId);
    callTimerId = null;
  }
}

function removeModal() {
  clearCallTimer();
  document.getElementById("lifeline-modal")?.remove();
  document.getElementById("call-hud")?.remove();
}

function resetLifelines() {
  state.used5050 = false;
  state.usedCall = false;
  state.usedAudience = false;
  state.hiddenOptions = [];
  clearHiddenForNewQuestion();
  resetLifelineButtons();
  removeModal();
}

function clearHiddenForNewQuestion() {
  state.hiddenOptions = [];
  const options = getOptionElements();
  options.forEach((el) => {
    if (!el) return;
    el.style.visibility = "visible";
    el.style.pointerEvents = "";
    delete el.dataset.hidden5050;
  });
}

// ---------- Modal / HUD với inline CSS ---------- //
function showOverlay(titleHtml, bodyHtml, { showClose = true } = {}) {
  removeModal();

  const overlay = document.createElement("div");
  overlay.id = "lifeline-modal";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.78)",
    padding: "16px",
    boxSizing: "border-box",
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(180deg, #03163B 0%, #012677 50%, #03163B 100%)",
    border: "4px solid #DB982D",
    borderRadius: "12px",
    padding: "20px",
    color: "#fff",
    fontFamily: "Roboto, system-ui, sans-serif",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  });

  card.innerHTML = `
    <h3 style="margin:0 0 12px;text-align:center;color:#DB982D;font-size:1.35rem;font-weight:700;">
      ${titleHtml}
    </h3>
    <div id="lifeline-modal-body">${bodyHtml}</div>
    ${
      showClose
        ? `<button id="lifeline-modal-close" type="button"
            style="margin-top:16px;width:100%;padding:10px;border:2px solid #DB982D;border-radius:8px;
                   background:transparent;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;">
            Đóng
          </button>`
        : ""
    }
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const closeBtn = card.querySelector("#lifeline-modal-close");
  if (closeBtn) {
    closeBtn.onclick = () => {
      removeModal();
      resumeBgMusic();
    };
  }

  return overlay;
}

// ---------- 50:50 ---------- //
async function use5050() {
  if (state.used5050) return;
  const q = getCurrentQuestion();
  if (!q) return;

  state.used5050 = true;
  markUsed("fifty-fifty", "images/50-50-used.png");

  pauseBgMusic();
  await play5050();

  const correct = Number(q.correct);
  const wrongs = [0, 1, 2, 3].filter((i) => i !== correct);
  for (let i = wrongs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrongs[i], wrongs[j]] = [wrongs[j], wrongs[i]];
  }
  const toHide = wrongs.slice(0, 2);
  state.hiddenOptions = toHide;

  const options = getOptionElements();
  toHide.forEach((idx) => {
    const el = options[idx];
    if (!el) return;
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
    el.dataset.hidden5050 = "1";
  });

  resumeBgMusic();
}

// ---------- Gọi điện: chỉ đếm 1 phút, không hiện đáp án ---------- //
const CALL_SECONDS = 60;

function formatCallTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function paintCallTimer(left) {
  const big = document.getElementById("call-timer-big");
  if (!big) return;
  big.textContent = formatCallTime(left);
  big.style.color = left <= 10 ? "#ff4d4f" : "#DB982D";
}

function startCallCountdown(seconds) {
  clearCallTimer();
  let left = seconds;
  paintCallTimer(left);

  callTimerId = setInterval(() => {
    left -= 1;
    paintCallTimer(left);
    if (left <= 0) {
      clearCallTimer();
      removeModal();
      resumeBgMusic();
    }
  }, 1000);
}

async function usePhoneAFriend() {
  if (state.usedCall) return;
  if (!getCurrentQuestion()) {
    alert("Chưa có câu hỏi — bấm Let's Play trước.");
    return;
  }

  state.usedCall = true;
  markUsed("phone-a-friend", "images/phone-a-friend-used.png");

  // Chỉ hiện số đếm 1:00 → 0:00, không đáp án / không text
  removeModal();
  const overlay = document.createElement("div");
  overlay.id = "lifeline-modal";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "99999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.55)",
    pointerEvents: "none", // vẫn bấm đáp án được phía dưới nếu cần
  });
  // cho phép click nút đóng
  overlay.style.pointerEvents = "auto";
  overlay.innerHTML = `
    <div style="
      text-align:center;
      background:rgba(3,22,59,0.95);
      border:4px solid #DB982D;
      border-radius:16px;
      padding:28px 40px;
      font-family:Roboto,system-ui,sans-serif;
      box-shadow:0 16px 40px rgba(0,0,0,0.5);
    ">
      <div id="call-timer-big" style="
        font-size:5.5rem;
        font-weight:800;
        color:#DB982D;
        line-height:1;
        font-variant-numeric:tabular-nums;
        min-width:3.5ch;
      ">1:00</div>
      <button id="lifeline-modal-close" type="button" style="
        margin-top:18px;
        padding:8px 28px;
        border:2px solid #DB982D;
        border-radius:8px;
        background:transparent;
        color:#fff;
        font-weight:700;
        cursor:pointer;
      ">Đóng</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#lifeline-modal-close").onclick = () => {
    removeModal();
    resumeBgMusic();
  };

  startCallCountdown(CALL_SECONDS);
  playHelpCall().catch(() => {});
}

// ---------- Hỏi khán giả ---------- //
function buildAudiencePercents(correct, hidden) {
  const available = [0, 1, 2, 3].filter((i) => !hidden.includes(i));
  const percents = [0, 0, 0, 0];
  let remaining = 100;
  const weights = available.map((i) => {
    if (i === correct) return 45 + Math.random() * 30;
    return 5 + Math.random() * 20;
  });
  const sumW = weights.reduce((a, b) => a + b, 0);

  available.forEach((idx, k) => {
    if (k === available.length - 1) {
      percents[idx] = remaining;
    } else {
      const p = Math.max(1, Math.round((weights[k] / sumW) * 100));
      percents[idx] = Math.min(p, remaining - (available.length - k - 1));
      remaining -= percents[idx];
    }
  });
  return percents;
}

async function useAskAudience() {
  if (state.usedAudience) return;
  const q = getCurrentQuestion();
  if (!q) return;

  state.usedAudience = true;
  markUsed("ask-the-audience", "images/ask-the-audience-used.png");

  pauseBgMusic();
  await playAudience();

  const labels = ["A", "B", "C", "D"];
  const correct = Number(q.correct);
  const percents = buildAudiencePercents(correct, state.hiddenOptions);
  const maxP = Math.max(...percents);
  const leader = percents.indexOf(maxP);

  const bars = labels
    .map((lab, i) => {
      const hidden = state.hiddenOptions.includes(i);
      const p = percents[i];
      if (hidden) {
        return `<div style="margin-bottom:8px;opacity:0.4;">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span>${lab}</span><span>—</span>
          </div>
          <div style="height:10px;background:#333;border-radius:4px;"></div>
        </div>`;
      }
      return `<div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
          <span style="font-weight:700;">${lab}</span>
          <span style="color:#DB982D;font-weight:700;">${p}%</span>
        </div>
        <div style="height:10px;background:#333;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${p}%;background:#DB982D;border-radius:4px;"></div>
        </div>
      </div>`;
    })
    .join("");

  showOverlay(
    "👥 Hỏi ý kiến khán giả",
    `<p style="text-align:center;margin:0 0 12px;">
       Khán giả nghiêng về
       <span style="color:#DB982D;font-weight:800;font-size:1.4rem;">${labels[leader]}</span>
       (${maxP}%).
     </p>
     ${bars}
     <p style="margin:10px 0 0;font-size:12px;color:#888;font-style:italic;text-align:center;">
       Thống kê mô phỏng — chỉ mang tính tham khảo.
     </p>`
  );
  resumeBgMusic();
}

function bindLifeline(id, handler) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn("Không tìm thấy nút lifeline:", id);
    return;
  }
  el.style.cursor = "pointer";
  el.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (el.dataset.used === "1") return;
    handler().catch((err) => {
      console.error(id, err);
      alert("Lỗi quyền trợ giúp: " + err.message);
    });
  };
}

function initLifelines() {
  bindLifeline("fifty-fifty", use5050);
  bindLifeline("phone-a-friend", usePhoneAFriend);
  bindLifeline("ask-the-audience", useAskAudience);
  console.log("[lifelines] sẵn sàng — 50:50 / gọi điện 30s / khán giả");
}

export {
  initLifelines,
  resetLifelines,
  clearHiddenForNewQuestion,
};
