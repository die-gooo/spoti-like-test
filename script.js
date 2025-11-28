const openReaderBtn = document.getElementById("open-reader");
const readerOverlay = document.getElementById("reader-overlay");
const closeReaderBtn = document.getElementById("close-reader");
const readerContent = document.getElementById("reader-content");

const percentLabel = document.getElementById("percent-read");
const timeLabel = document.getElementById("time-remaining");
const progressFill = document.getElementById("reader-progress-fill");

// Stima tempo lettura (parole / 220 wpm)
const wordsPerMinute = 220;
let totalMinutes = null;

function estimateReadingTime() {
  const text = readerContent.innerText || "";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  totalMinutes = wordCount / wordsPerMinute;
}

function formatRemaining(minutes) {
  if (!minutes || minutes <= 0.1) return "< 1 min remaining";
  const rounded = Math.ceil(minutes);
  return `${rounded} min remaining`;
}

function updateProgress() {
  const scrollTop = readerContent.scrollTop;
  const scrollHeight = readerContent.scrollHeight;
  const clientHeight = readerContent.clientHeight;

  const maxScrollable = scrollHeight - clientHeight;
  const ratio = maxScrollable > 0 ? scrollTop / maxScrollable : 0;
  const percent = Math.min(100, Math.max(0, ratio * 100));

  percentLabel.textContent = `${Math.round(percent)}% Read`;

  // tempo rimanente stimato
  if (totalMinutes != null) {
    const remainingMinutes = totalMinutes * (1 - ratio);
    timeLabel.innerHTML = formatRemaining(remainingMinutes);
  }

  progressFill.style.width = `${percent}%`;
}

openReaderBtn.addEventListener("click", () => {
  readerOverlay.classList.add("active");
  readerOverlay.setAttribute("aria-hidden", "false");
  // reset scroll all'apertura
  readerContent.scrollTop = 0;
  estimateReadingTime();
  updateProgress();
});

closeReaderBtn.addEventListener("click", () => {
  readerOverlay.classList.remove("active");
  readerOverlay.setAttribute("aria-hidden", "true");
});

readerContent.addEventListener("scroll", () => {
  requestAnimationFrame(updateProgress);
});

// chiudi con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && readerOverlay.classList.contains("active")) {
    readerOverlay.classList.remove("active");
    readerOverlay.setAttribute("aria-hidden", "true");
  }
});
