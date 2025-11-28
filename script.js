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
let maxReadIndex = -1; // indice massimo raggiunto (per tenere evidenziato ciò che è già letto)

/**
 * Calcola il tempo totale di lettura in minuti
 */
function estimateReadingTime() {
  const text = readerContent.innerText || "";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  totalMinutes = wordCount / wordsPerMinute;
}

/**
 * Format tempo rimanente in stringa leggibile
 */
function formatRemaining(minutes) {
  if (!minutes || minutes <= 0.1) return "< 1 min remaining";
  const rounded = Math.ceil(minutes);
  return `${rounded} min remaining`;
}

/**
 * Aggiorna progress bar e indicatori di lettura
 */
function updateProgress() {
  const scrollTop = readerContent.scrollTop;
  const scrollHeight = readerContent.scrollHeight;
  const clientHeight = readerContent.clientHeight;

  const maxScrollable = scrollHeight - clientHeight;
  const ratio = maxScrollable > 0 ? scrollTop / maxScrollable : 0;
  const percent = Math.min(100, Math.max(0, ratio * 100));

  percentLabel.textContent = `${Math.round(percent)}% Read`;

  if (totalMinutes != null) {
    const remainingMinutes = totalMinutes * (1 - ratio);
    timeLabel.textContent = formatRemaining(remainingMinutes);
  }

  progressFill.style.width = `${percent}%`;
}

/**
 * Trova il paragrafo "attivo" e tiene marcati quelli già letti
 */
function highlightActiveParagraph() {
  const paragraphs = Array.from(readerContent.querySelectorAll("p"));
  if (!paragraphs.length) return;

  const readerRect = readerContent.getBoundingClientRect();
  const focusY = readerRect.top + 140; // altezza alla quale consideriamo il testo "in focus"

  let activeIndex = -1;
  let smallestDistance = Infinity;

  paragraphs.forEach((p, index) => {
    const rect = p.getBoundingClientRect();
    const distance = Math.abs(rect.top - focusY);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      activeIndex = index;
    }
  });

  // aggiorna il massimo indice raggiunto (paragrafi già letti)
  if (activeIndex > maxReadIndex) {
    maxReadIndex = activeIndex;
  }

  paragraphs.forEach((p, index) => {
    p.classList.remove("active");

    if (index <= maxReadIndex) {
      p.classList.add("read");
    } else {
      p.classList.remove("read");
    }
  });

  if (activeIndex >= 0) {
    paragraphs[activeIndex].classList.add("active");
  }
}

/**
 * Apre il reader
 */
openReaderBtn.addEventListener("click", () => {
  readerOverlay.classList.add("active");
  readerOverlay.setAttribute("aria-hidden", "false");
  readerContent.scrollTop = 0;
  maxReadIndex = -1; // reset lettura
  estimateReadingTime();
  highlightActiveParagraph(); // evidenzia subito il primo
  updateProgress();
});

/**
 * Chiude il reader
 */
closeReaderBtn.addEventListener("click", () => {
  readerOverlay.classList.remove("active");
  readerOverlay.setAttribute("aria-hidden", "true");
});

/**
 * Chiudi con tasto ESC
 */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && readerOverlay.classList.contains("active")) {
    readerOverlay.classList.remove("active");
    readerOverlay.setAttribute("aria-hidden", "true");
  }
});

/**
 * On scroll: aggiorna progress + highlight
 */
readerContent.addEventListener("scroll", () => {
  requestAnimationFrame(() => {
    updateProgress();
    highlightActiveParagraph();
  });
});
