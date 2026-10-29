// Trạng thái game dùng chung — không import module khác (tránh circular)

function getQuestionIndex() {
  return Number(localStorage.getItem("questionIndex") || 0);
}

function setQuestionIndex(index) {
  localStorage.setItem("questionIndex", String(index));
}

export { getQuestionIndex, setQuestionIndex };
