/**
 * TTS BAHASA INDONESIA - CORE GAME ENGINE & INTEGRATION
 * Features:
 * - Interactive Crossword Navigation (Mobile & Desktop)
 * - Web Audio API Siren Alarm & Anti-Cheat Proctoring
 * - Realtime Scoring & Validation
 * - Google Spreadsheet Webhook Export
 */

// Application State
const state = {
  student: {
    name: "",
    absen: "",
    school: "SMA Negeri 1 Batam",
    classGrade: "XI HJ 5"
  },
  timer: {
    seconds: 0,
    intervalId: null
  },
  antiCheat: {
    active: false,
    cheatCount: 0,
    penaltyPerCheat: 5,
    logs: [],
    audioContext: null,
    sirenInterval: null
  },
  grid: {
    rows: 21,
    cols: 23,
    cellMap: {}, // "r_c" -> { letter, acrossWord, downWord, number, element, input }
    activeWord: null, // word object
    activeDirection: "across", // 'across' | 'down'
    activeCell: { r: 12, c: 6 },
    zoom: 1.0,
    userAnswers: {} // "r_c" -> "A"
  },
  spreadsheetUrl: localStorage.getItem("tts_spreadsheet_url") || "https://script.google.com/macros/s/AKfycbz_SMbfZ4nt5EULetWOTOJYdnAgC-FTY-w8vcbfJsN1euiVnMsxkxKjahNCn9TcqlnX1g/exec"
};

/* ==========================================================
   WEB AUDIO API - SIREN & ALARM SYNTHESIZER
   ========================================================== */
function getAudioContext() {
  if (!state.antiCheat.audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      state.antiCheat.audioContext = new AudioContext();
    }
  }
  if (state.antiCheat.audioContext && state.antiCheat.audioContext.state === "suspended") {
    state.antiCheat.audioContext.resume();
  }
  return state.antiCheat.audioContext;
}

// Shocking Emergency Alert & Klaxon Synthesizer
function playAlarmBurst() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Shock Impact (Sub-bass thump to startle the user)
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.type = "sine";
    kickOsc.frequency.setValueAtTime(180, now);
    kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.3);
    kickGain.gain.setValueAtTime(0.7, now);
    kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);
    kickOsc.start(now);
    kickOsc.stop(now + 0.32);

    // 2. High-urgency piercing klaxon tones (Dual square + sawtooth)
    const playBeep = (timeOffset, duration, f1 = 980, f2 = 1470) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc1.type = "square";
      osc2.type = "sawtooth";
      osc1.frequency.setValueAtTime(f1, now + timeOffset);
      osc2.frequency.setValueAtTime(f2, now + timeOffset);

      // Fast, piercing attack & release
      toneGain.gain.setValueAtTime(0.55, now + timeOffset);
      toneGain.gain.setValueAtTime(0.55, now + timeOffset + duration - 0.02);
      toneGain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + duration);

      osc1.connect(toneGain);
      osc2.connect(toneGain);
      toneGain.connect(ctx.destination);

      osc1.start(now + timeOffset);
      osc2.start(now + timeOffset);
      osc1.stop(now + timeOffset + duration);
      osc2.stop(now + timeOffset + duration);
    };

    // Staccato alarm pattern: BEEP - BEEP - BEEEEEP (Urgent Alert)
    playBeep(0, 0.12, 1050, 1575);
    playBeep(0.16, 0.12, 1050, 1575);
    playBeep(0.32, 0.28, 1200, 1800);
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

function startAlarmSound() {
  stopAlarmSound();
  playAlarmBurst();
  // Repeat emergency alert burst every 750ms while alarm is active
  state.antiCheat.sirenInterval = setInterval(() => {
    playAlarmBurst();
  }, 750);
}

function stopAlarmSound() {
  if (state.antiCheat.sirenInterval) {
    clearInterval(state.antiCheat.sirenInterval);
    state.antiCheat.sirenInterval = null;
  }
}

/* ==========================================================
   INITIALIZATION & REGISTRATION
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initGridSystem();
  renderClueLists();
  setupAntiCheatListeners();
});

function startExam() {
  const nameInput = document.getElementById("studentName");
  const absenInput = document.getElementById("studentAbsen");

  if (!nameInput.value.trim() || !absenInput.value.trim()) {
    alert("Harap masukkan nama lengkap dan nomor absen Anda terlebih dahulu!");
    return;
  }

  state.student.name = nameInput.value.trim();
  state.student.absen = absenInput.value.trim();

  // Update displays
  document.getElementById("displayStudentName").textContent = state.student.name;
  document.getElementById("displayStudentMeta").textContent = `Absen: ${state.student.absen} • XI HJ 5`;

  // Unlock audio
  getAudioContext();

  // Switch screen
  document.getElementById("registrationScreen").classList.remove("active");
  document.getElementById("gameScreen").classList.add("active");

  // Start timer & Anti-cheat
  startTimer();
  state.antiCheat.active = true;

  // Auto focus first across word (Word #1)
  const firstWord = TTS_DATA.across[0];
  selectWord(firstWord, "across");
}

/* ==========================================================
   TIMER
   ========================================================== */
function startTimer() {
  state.timer.seconds = 0;
  const timerText = document.getElementById("timerText");

  state.timer.intervalId = setInterval(() => {
    state.timer.seconds++;
    const mins = String(Math.floor(state.timer.seconds / 60)).padStart(2, "0");
    const secs = String(state.timer.seconds % 60).padStart(2, "0");
    if (timerText) {
      timerText.textContent = `${mins}:${secs}`;
    }
  }, 1000);
}

function getFormattedDuration() {
  const mins = String(Math.floor(state.timer.seconds / 60)).padStart(2, "0");
  const secs = String(state.timer.seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

/* ==========================================================
   ANTI-CHEAT PROCTORING SYSTEM
   ========================================================== */
function setupAntiCheatListeners() {
  // Page Visibility API
  document.addEventListener("visibilitychange", () => {
    if (state.antiCheat.active && document.hidden) {
      triggerCheatViolation("Membuka tab lain atau meminimize jendela ujian");
    }
  });

  // Window blur
  window.addEventListener("blur", () => {
    if (state.antiCheat.active) {
      // Small timeout to avoid false positive when clicking inside iframe/select
      setTimeout(() => {
        if (!document.hasFocus() && state.antiCheat.active) {
          triggerCheatViolation("Beralih ke aplikasi lain / jendela kehilangan fokus");
        }
      }, 250);
    }
  });

  // Anti Inspect & Copy Protection
  document.addEventListener("contextmenu", (e) => {
    if (state.antiCheat.active) {
      e.preventDefault();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (state.antiCheat.active) {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+U, F12
      if (
        (e.ctrlKey && ["c", "v", "u", "s", "p"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
      }
    }
  });
}

function triggerCheatViolation(reason) {
  state.antiCheat.cheatCount++;
  const timestamp = getFormattedDuration();
  const penalty = state.antiCheat.cheatCount * state.antiCheat.penaltyPerCheat;

  const logMessage = `[${timestamp}] ${reason} (-5 Poin)`;
  state.antiCheat.logs.push(logMessage);

  // Update UI badge
  const cheatText = document.getElementById("cheatText");
  const cheatBadge = document.getElementById("cheatBadge");
  if (cheatText) {
    cheatText.textContent = `${state.antiCheat.cheatCount} Pelanggaran (-${penalty} Poin)`;
  }
  if (cheatBadge) {
    cheatBadge.classList.add("alert-pulse");
  }

  // Update overlay
  document.getElementById("overlayCheatCount").textContent = state.antiCheat.cheatCount;
  document.getElementById("overlayPenalty").textContent = `-${penalty} Poin`;
  document.getElementById("alarmOverlay").classList.add("active");

  // Play continuous siren
  startAlarmSound();

  // Render log item in sidebar
  renderLogEntries();
}

function dismissAlarm() {
  stopAlarmSound();
  document.getElementById("alarmOverlay").classList.remove("active");
  const cheatBadge = document.getElementById("cheatBadge");
  if (cheatBadge) {
    cheatBadge.classList.remove("alert-pulse");
  }
}

function renderLogEntries() {
  const container = document.getElementById("logItemsContainer");
  const countBadge = document.getElementById("logsCountBadge");
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = state.antiCheat.cheatCount;
  }

  if (state.antiCheat.logs.length === 0) {
    container.innerHTML = `<div class="empty-log-state">Belum ada pelanggaran yang tercatat. Pertahankan kejujuran! 🌟</div>`;
    return;
  }

  container.innerHTML = state.antiCheat.logs
    .map(
      (log) => `
    <div class="log-entry">
      <span class="log-text">🚨 ${log}</span>
    </div>
  `
    )
    .join("");
}

/* ==========================================================
   CROSSWORD GRID LOGIC
   ========================================================== */
function initGridSystem() {
  const gridEl = document.getElementById("ttsGrid");
  if (!gridEl) return;

  gridEl.style.gridTemplateRows = `repeat(${state.grid.rows}, var(--cell-size))`;
  gridEl.style.gridTemplateColumns = `repeat(${state.grid.cols}, var(--cell-size))`;
  gridEl.innerHTML = "";

  // Index words by coordinates
  const activeCells = {}; // "r_c" -> { letter, acrossWord, downWord, startNums: [] }

  TTS_DATA.across.forEach((w) => {
    for (let i = 0; i < w.length; i++) {
      const key = `${w.row}_${w.col + i}`;
      if (!activeCells[key]) {
        activeCells[key] = { letter: w.answer[i], acrossWord: null, downWord: null, startNums: [] };
      }
      activeCells[key].acrossWord = w;
      if (i === 0) activeCells[key].startNums.push(w.num);
    }
  });

  TTS_DATA.down.forEach((w) => {
    for (let i = 0; i < w.length; i++) {
      const key = `${w.row + i}_${w.col}`;
      if (!activeCells[key]) {
        activeCells[key] = { letter: w.answer[i], acrossWord: null, downWord: null, startNums: [] };
      }
      activeCells[key].downWord = w;
      if (i === 0) activeCells[key].startNums.push(w.num);
    }
  });

  // Create DOM cells
  for (let r = 0; r < state.grid.rows; r++) {
    for (let c = 0; c < state.grid.cols; c++) {
      const key = `${r}_${c}`;
      const cellData = activeCells[key];

      const cellEl = document.createElement("div");
      cellEl.className = "tts-cell";
      cellEl.dataset.row = r;
      cellEl.dataset.col = c;

      if (!cellData) {
        cellEl.classList.add("blank");
      } else {
        // Cell Number Label
        if (cellData.startNums.length > 0) {
          const numLabel = document.createElement("span");
          numLabel.className = "cell-number";
          numLabel.textContent = cellData.startNums.join("/");
          cellEl.appendChild(numLabel);
        }

        // Cell Input Element
        const input = document.createElement("input");
        input.type = "text";
        input.className = "cell-input";
        input.maxLength = 1;
        input.autocomplete = "off";
        input.autocapitalize = "characters";
        input.spellcheck = false;

        // Input and key event listeners
        input.addEventListener("focus", () => onCellFocus(r, c));
        input.addEventListener("click", (e) => {
          e.stopPropagation();
          onCellClick(r, c);
        });
        input.addEventListener("input", (e) => onCellInput(e, r, c));
        input.addEventListener("keydown", (e) => onCellKeyDown(e, r, c));

        cellEl.appendChild(input);

        // Store cell in state
        state.grid.cellMap[key] = {
          row: r,
          col: c,
          expectedLetter: cellData.letter,
          acrossWord: cellData.acrossWord,
          downWord: cellData.downWord,
          startNums: cellData.startNums,
          element: cellEl,
          input: input
        };
      }

      gridEl.appendChild(cellEl);
    }
  }
}

/* ==========================================================
   NAVIGATION & FOCUS CONTROLS
   ========================================================== */
function onCellClick(r, c) {
  const cell = state.grid.cellMap[`${r}_${c}`];
  if (!cell) return;

  // If clicked on current active cell and it's an intersection, toggle direction!
  if (state.grid.activeCell.r === r && state.grid.activeCell.c === c) {
    if (cell.acrossWord && cell.downWord) {
      toggleCurrentDirection();
      return;
    }
  }

  // Choose appropriate word for this cell
  let targetWord = null;
  if (state.grid.activeDirection === "across") {
    targetWord = cell.acrossWord || cell.downWord;
  } else {
    targetWord = cell.downWord || cell.acrossWord;
  }

  if (targetWord) {
    const dir = targetWord === cell.acrossWord ? "across" : "down";
    selectWord(targetWord, dir, r, c);
  }
}

function onCellFocus(r, c) {
  onCellClick(r, c);
}

function selectWord(word, direction, targetR = null, targetC = null) {
  if (!word) return;

  state.grid.activeWord = word;
  state.grid.activeDirection = direction;

  // Clear previous word highlights
  document.querySelectorAll(".tts-cell.active-word").forEach((el) => {
    el.classList.remove("active-word");
  });
  document.querySelectorAll(".tts-cell.active-cell").forEach((el) => {
    el.classList.remove("active-cell");
  });

  // Highlight all cells in the word
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? word.row : word.row + i;
    const c = direction === "across" ? word.col + i : word.col;
    const cellObj = state.grid.cellMap[`${r}_${c}`];
    if (cellObj) {
      cellObj.element.classList.add("active-word");
    }
  }

  // Determine which cell to focus
  let focusR = targetR !== null ? targetR : word.row;
  let focusC = targetC !== null ? targetC : word.col;

  // If target wasn't specified, focus first empty cell of the word (or first cell)
  if (targetR === null) {
    for (let i = 0; i < word.length; i++) {
      const r = direction === "across" ? word.row : word.row + i;
      const c = direction === "across" ? word.col + i : word.col;
      const key = `${r}_${c}`;
      if (!state.grid.userAnswers[key]) {
        focusR = r;
        focusC = c;
        break;
      }
    }
  }

  focusCell(focusR, focusC);
  updateActiveClueBar();
  highlightSidebarClue(word.num);
}

function focusCell(r, c) {
  const cell = state.grid.cellMap[`${r}_${c}`];
  if (!cell) return;

  state.grid.activeCell = { r, c };

  document.querySelectorAll(".tts-cell.active-cell").forEach((el) => {
    el.classList.remove("active-cell");
  });
  cell.element.classList.add("active-cell");

  if (document.activeElement !== cell.input) {
    cell.input.focus();
    cell.input.select();
  }

  // Smoothly ensure cell is visible within the viewport (never clipped)
  if (cell.element) {
    cell.element.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
  }
}

function toggleCurrentDirection() {
  const currentCell = state.grid.cellMap[`${state.grid.activeCell.r}_${state.grid.activeCell.c}`];
  if (!currentCell) return;

  if (state.grid.activeDirection === "across") {
    if (currentCell.downWord) {
      selectWord(currentCell.downWord, "down", currentCell.row, currentCell.col);
    }
  } else {
    if (currentCell.acrossWord) {
      selectWord(currentCell.acrossWord, "across", currentCell.row, currentCell.col);
    }
  }
}

/* ==========================================================
   KEYBOARD & TYPING EVENTS
   ========================================================== */
function onCellInput(e, r, c) {
  const char = e.target.value.slice(-1).toUpperCase();
  const key = `${r}_${c}`;

  if (/^[A-Z]$/.test(char)) {
    e.target.value = char;
    state.grid.userAnswers[key] = char;

    // Advance to next cell in current word
    moveToNextCell(r, c);
    updateProgressStats();
  } else {
    e.target.value = "";
    delete state.grid.userAnswers[key];
  }
}

function onCellKeyDown(e, r, c) {
  const key = `${r}_${c}`;

  if (e.key === "Backspace") {
    e.preventDefault();
    const cell = state.grid.cellMap[key];
    if (cell.input.value !== "") {
      cell.input.value = "";
      delete state.grid.userAnswers[key];
      updateProgressStats();
    } else {
      moveToPrevCell(r, c);
    }
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    moveCellByOffset(0, 1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    moveCellByOffset(0, -1);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    moveCellByOffset(1, 0);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    moveCellByOffset(-1, 0);
  } else if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    toggleCurrentDirection();
  } else if (e.key === "Tab") {
    e.preventDefault();
    if (e.shiftKey) prevWord();
    else nextWord();
  }
}

function moveToNextCell(r, c) {
  const word = state.grid.activeWord;
  const dir = state.grid.activeDirection;
  if (!word) return;

  const wordCells = [];
  for (let i = 0; i < word.length; i++) {
    const cr = dir === "across" ? word.row : word.row + i;
    const cc = dir === "across" ? word.col + i : word.col;
    wordCells.push({ r: cr, c: cc });
  }

  const currentIndex = wordCells.findIndex((cell) => cell.r === r && cell.c === c);
  if (currentIndex >= 0 && currentIndex < wordCells.length - 1) {
    const next = wordCells[currentIndex + 1];
    focusCell(next.r, next.c);
  } else {
    // End of word -> auto switch to next word
    nextWord();
  }
}

function moveToPrevCell(r, c) {
  const word = state.grid.activeWord;
  const dir = state.grid.activeDirection;
  if (!word) return;

  const wordCells = [];
  for (let i = 0; i < word.length; i++) {
    const cr = dir === "across" ? word.row : word.row + i;
    const cc = dir === "across" ? word.col + i : word.col;
    wordCells.push({ r: cr, c: cc });
  }

  const currentIndex = wordCells.findIndex((cell) => cell.r === r && cell.c === c);
  if (currentIndex > 0) {
    const prev = wordCells[currentIndex - 1];
    const prevCell = state.grid.cellMap[`${prev.r}_${prev.c}`];
    if (prevCell) {
      prevCell.input.value = "";
      delete state.grid.userAnswers[`${prev.r}_${prev.c}`];
      focusCell(prev.r, prev.c);
      updateProgressStats();
    }
  }
}

function moveCellByOffset(dr, dc) {
  let targetR = state.grid.activeCell.r + dr;
  let targetC = state.grid.activeCell.c + dc;

  while (
    targetR >= 0 &&
    targetR < state.grid.rows &&
    targetC >= 0 &&
    targetC < state.grid.cols
  ) {
    const key = `${targetR}_${targetC}`;
    if (state.grid.cellMap[key]) {
      onCellClick(targetR, targetC);
      return;
    }
    targetR += dr;
    targetC += dc;
  }
}

function clearCurrentCell() {
  const { r, c } = state.grid.activeCell;
  const key = `${r}_${c}`;
  const cell = state.grid.cellMap[key];
  if (cell) {
    cell.input.value = "";
    delete state.grid.userAnswers[key];
    updateProgressStats();
  }
}

/* ==========================================================
   WORD NAVIGATION (PREV / NEXT)
   ========================================================== */
function nextWord() {
  const allWords = [...TTS_DATA.across.map((w) => ({ w, dir: "across" })), ...TTS_DATA.down.map((w) => ({ w, dir: "down" }))];
  const currentIndex = allWords.findIndex(
    (item) => item.w.num === state.grid.activeWord.num && item.dir === state.grid.activeDirection
  );

  const nextIndex = (currentIndex + 1) % allWords.length;
  const nextItem = allWords[nextIndex];
  selectWord(nextItem.w, nextItem.dir);
}

function prevWord() {
  const allWords = [...TTS_DATA.across.map((w) => ({ w, dir: "across" })), ...TTS_DATA.down.map((w) => ({ w, dir: "down" }))];
  const currentIndex = allWords.findIndex(
    (item) => item.w.num === state.grid.activeWord.num && item.dir === state.grid.activeDirection
  );

  const prevIndex = (currentIndex - 1 + allWords.length) % allWords.length;
  const prevItem = allWords[prevIndex];
  selectWord(prevItem.w, prevItem.dir);
}

/* ==========================================================
   UI CLUE BARS & SIDEBAR PANELS
   ========================================================== */
function updateActiveClueBar() {
  const word = state.grid.activeWord;
  const dir = state.grid.activeDirection;
  if (!word) return;

  document.getElementById("activeWordNumTag").textContent = word.num;
  document.getElementById("activeDirectionTag").textContent = dir.toUpperCase();
  document.getElementById("activeLettersTag").textContent = `${word.length} Huruf`;

  const levelTag = document.getElementById("activeLevelTag");
  levelTag.textContent = word.level;
  levelTag.className = `badge-level level-${word.level.toLowerCase()}`;

  document.getElementById("activeClueText").textContent = word.clue;
}

function renderClueLists() {
  const acrossEl = document.getElementById("acrossList");
  const downEl = document.getElementById("downList");

  if (acrossEl) {
    acrossEl.innerHTML = TTS_DATA.across
      .map(
        (w) => `
      <div class="clue-card-item" id="clueCard_${w.num}" onclick="selectWordByNum(${w.num}, 'across')">
        <div class="clue-item-header">
          <div class="clue-item-left">
            <span class="badge-num">${w.num}</span>
            <span class="clue-item-num">${w.answer.length} Huruf</span>
          </div>
          <span class="badge-level level-${w.level.toLowerCase()}">${w.level}</span>
        </div>
        <div class="clue-item-text">${w.clue}</div>
      </div>
    `
      )
      .join("");
  }

  if (downEl) {
    downEl.innerHTML = TTS_DATA.down
      .map(
        (w) => `
      <div class="clue-card-item" id="clueCard_${w.num}" onclick="selectWordByNum(${w.num}, 'down')">
        <div class="clue-item-header">
          <div class="clue-item-left">
            <span class="badge-num">${w.num}</span>
            <span class="clue-item-num">${w.answer.length} Huruf</span>
          </div>
          <span class="badge-level level-${w.level.toLowerCase()}">${w.level}</span>
        </div>
        <div class="clue-item-text">${w.clue}</div>
      </div>
    `
      )
      .join("");
  }
}

function selectWordByNum(num, direction) {
  const word =
    direction === "across"
      ? TTS_DATA.across.find((w) => w.num === num)
      : TTS_DATA.down.find((w) => w.num === num);

  if (word) {
    selectWord(word, direction);
  }
}

function highlightSidebarClue(num) {
  document.querySelectorAll(".clue-card-item.active").forEach((el) => {
    el.classList.remove("active");
  });

  const card = document.getElementById(`clueCard_${num}`);
  if (card) {
    card.classList.add("active");
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Auto switch sidebar tab if needed
  if (num <= 10) {
    switchClueTab("across");
  } else {
    switchClueTab("down");
  }
}

function switchClueTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".clue-list").forEach((list) => list.classList.remove("active"));

  if (tab === "across") {
    document.getElementById("tabAcrossBtn").classList.add("active");
    document.getElementById("acrossList").classList.add("active");
  } else if (tab === "down") {
    document.getElementById("tabDownBtn").classList.add("active");
    document.getElementById("downList").classList.add("active");
  } else if (tab === "logs") {
    document.getElementById("tabLogsBtn").classList.add("active");
    document.getElementById("logsList").classList.add("active");
  }
}

function updateProgressStats() {
  let filledAcross = 0;
  let filledDown = 0;

  TTS_DATA.across.forEach((w) => {
    let complete = true;
    for (let i = 0; i < w.length; i++) {
      if (!state.grid.userAnswers[`${w.row}_${w.col + i}`]) {
        complete = false;
        break;
      }
    }
    const card = document.getElementById(`clueCard_${w.num}`);
    if (complete) {
      filledAcross++;
      if (card) card.classList.add("completed");
    } else {
      if (card) card.classList.remove("completed");
    }
  });

  TTS_DATA.down.forEach((w) => {
    let complete = true;
    for (let i = 0; i < w.length; i++) {
      if (!state.grid.userAnswers[`${w.row + i}_${w.col}`]) {
        complete = false;
        break;
      }
    }
    const card = document.getElementById(`clueCard_${w.num}`);
    if (complete) {
      filledDown++;
      if (card) card.classList.add("completed");
    } else {
      if (card) card.classList.remove("completed");
    }
  });

  const totalFilled = filledAcross + filledDown;
  const pct = Math.round((totalFilled / 20) * 100);

  document.getElementById("acrossFilledBadge").textContent = `${filledAcross}/10`;
  document.getElementById("downFilledBadge").textContent = `${filledDown}/10`;
  document.getElementById("progressText").textContent = `${totalFilled} / 20 Soal (${pct}%)`;
  document.getElementById("progressBarFill").style.width = `${pct}%`;
}

/* ==========================================================
   ZOOM & FULLSCREEN
   ========================================================== */
function adjustZoom(delta) {
  state.grid.zoom = Math.min(1.5, Math.max(0.6, state.grid.zoom + delta));
  applyZoom();
}

function resetZoom() {
  state.grid.zoom = 1.0;
  applyZoom();
}

function applyZoom() {
  const baseSize = window.innerWidth <= 480 ? 28 : window.innerWidth <= 900 ? 32 : 36;
  const currentSize = Math.max(22, Math.min(52, Math.round(baseSize * state.grid.zoom)));
  document.documentElement.style.setProperty("--cell-size", `${currentSize}px`);

  const gridEl = document.getElementById("ttsGrid");
  if (gridEl) {
    gridEl.style.transform = "none";
  }

  const zoomText = document.getElementById("zoomLevelText");
  if (zoomText) {
    zoomText.textContent = `${Math.round(state.grid.zoom * 100)}%`;
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/* ==========================================================
   SUBMIT & SCORING EVALUATION
   ========================================================== */
function confirmSubmit() {
  let filledCount = 0;
  const allWords = [...TTS_DATA.across, ...TTS_DATA.down];

  allWords.forEach((w) => {
    const isAcross = TTS_DATA.across.includes(w);
    let complete = true;
    for (let i = 0; i < w.length; i++) {
      const r = isAcross ? w.row : w.row + i;
      const c = isAcross ? w.col + i : w.col;
      if (!state.grid.userAnswers[`${r}_${c}`]) {
        complete = false;
        break;
      }
    }
    if (complete) filledCount++;
  });

  const msg =
    filledCount < 20
      ? `Anda baru mengisi ${filledCount} dari 20 soal. Yakin ingin mengakhiri dan mengumpulkan jawaban sekarang?`
      : `Seluruh 20 soal telah terisi. Yakin ingin mengumpulkan ujian?`;

  if (confirm(msg)) {
    finishExam();
  }
}

function finishExam() {
  clearInterval(state.timer.intervalId);
  state.antiCheat.active = false;
  stopAlarmSound();

  // Evaluate All Questions (20 questions x 5 pts each = 100 max raw)
  let correctCount = 0;
  const reviewData = [];
  const detailedAnswers = {};

  const evaluateWord = (w, isAcross) => {
    let userWord = "";
    for (let i = 0; i < w.length; i++) {
      const r = isAcross ? w.row : w.row + i;
      const c = isAcross ? w.col + i : w.col;
      userWord += state.grid.userAnswers[`${r}_${c}`] || "_";
    }

    const isCorrect = userWord.toUpperCase() === w.answer.toUpperCase();
    if (isCorrect) correctCount++;

    reviewData.push({
      num: w.num,
      dir: isAcross ? "Mendatar" : "Menurun",
      clue: w.clue,
      userAnswer: userWord,
      correctAnswer: w.answer,
      isCorrect: isCorrect
    });

    detailedAnswers[`Soal_${w.num}`] = {
      jawaban_siswa: userWord,
      kunci: w.answer,
      benar: isCorrect
    };
  };

  TTS_DATA.across.forEach((w) => evaluateWord(w, true));
  TTS_DATA.down.forEach((w) => evaluateWord(w, false));

  // Points calculation
  const rawScore = correctCount * 5;
  const penalty = state.antiCheat.cheatCount * state.antiCheat.penaltyPerCheat;
  const finalScore = Math.max(0, rawScore - penalty);
  const isTuntas = finalScore >= 75;

  // Render Result Scorecard
  document.getElementById("finalScoreVal").textContent = finalScore;
  document.getElementById("rawScoreVal").textContent = rawScore;
  document.getElementById("penaltyVal").textContent = `-${penalty}`;
  document.getElementById("cheatCountResult").textContent = `${state.antiCheat.cheatCount}x Pelanggaran`;
  document.getElementById("durationResult").textContent = getFormattedDuration();
  document.getElementById("resultStudentInfo").textContent = `${state.student.name} • Absen: ${state.student.absen} • SMAN 1 Batam (XI HJ 5)`;

  const kkmBadge = document.getElementById("kkmBadge");
  if (isTuntas) {
    kkmBadge.textContent = "TUNTAS (LULUS KKM 75) 🎉";
    kkmBadge.className = "result-badge-kkm";
  } else {
    kkmBadge.textContent = "BELUM TUNTAS (PERLU REMEDIAL) ⚠️";
    kkmBadge.className = "result-badge-kkm remedial";
  }

  // Populate Review List
  renderReviewList(reviewData);

  // Show Modal
  document.getElementById("resultModal").classList.add("active");

  // Send to Google Spreadsheet
  exportToGoogleSpreadsheet({
    nama: state.student.name,
    absen: state.student.absen,
    kelompok: "XI HJ 5 (SMAN 1 Batam)",
    skor_murni: rawScore,
    penalti: penalty,
    skor_akhir: finalScore,
    durasi: getFormattedDuration(),
    jumlah_pelanggaran: state.antiCheat.cheatCount,
    log_pelanggaran: state.antiCheat.logs.join(" | ") || "Tidak ada pelanggaran",
    ringkasan_jawaban: `${correctCount} dari 20 Benar (${Math.round((correctCount / 20) * 100)}%)`,
    detail_jawaban: detailedAnswers
  });
}

function renderReviewList(reviews) {
  const container = document.getElementById("reviewList");
  if (!container) return;

  container.innerHTML = reviews
    .map(
      (rev) => `
    <div class="review-item ${rev.isCorrect ? "correct" : "wrong"}">
      <div>
        <span class="review-q">${rev.num}. [${rev.dir}]</span> ${rev.clue.slice(0, 50)}...
      </div>
      <div class="review-ans-wrap">
        <span class="user-ans ${rev.isCorrect ? "match" : ""}">${rev.userAnswer}</span>
        ${!rev.isCorrect ? `<span class="key-ans">(Kunci: ${rev.correctAnswer})</span>` : ""}
      </div>
    </div>
  `
    )
    .join("");
}



/* ==========================================================
   GOOGLE SPREADSHEET EXPORT INTEGRATION
   ========================================================== */
function exportToGoogleSpreadsheet(payload) {
  const syncStatus = document.getElementById("sheetSyncStatus");
  const spinner = document.getElementById("syncSpinner");
  const infoText = document.getElementById("syncInfoText");

  if (!state.spreadsheetUrl) {
    if (spinner) spinner.style.display = "none";
    if (infoText) {
      infoText.innerHTML = `⚠️ <em>URL Google Apps Script belum disetel.</em> Anda tetap dapat menyalin hasil nilai di bawah untuk dikirim ke guru.`;
    }
    return;
  }

  if (spinner) spinner.style.display = "block";
  if (infoText) infoText.textContent = "Mengirim rekaman ujian ke Google Spreadsheet...";

  // Send via fetch (handling standard or no-cors)
  fetch(state.spreadsheetUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then(() => {
      if (spinner) spinner.style.display = "none";
      if (infoText) {
        infoText.innerHTML = `✅ <strong>Berhasil tersimpan ke Google Spreadsheet!</strong> Data nilai & integritas telah direkap.`;
      }
    })
    .catch((err) => {
      console.error("Spreadsheet export error:", err);
      if (spinner) spinner.style.display = "none";
      if (infoText) {
        infoText.innerHTML = `⚠️ Gagal menghubungi Spreadsheet otomatis. Silakan klik tombol <strong>Salin Rapor Nilai</strong> untuk mengirimkan hasil via chat.`;
      }
    });
}

function copyResultSummary() {
  const finalScore = document.getElementById("finalScoreVal").textContent;
  const rawScore = document.getElementById("rawScoreVal").textContent;
  const duration = getFormattedDuration();
  const summary = `
📊 LAPORAN HASIL UJIAN TTS BAHASA INDONESIA
SMA NEGERI 1 BATAM • KELAS XI HJ 5
━━━━━━━━━━━━━━━━━━━━━
Nama: ${state.student.name}
No. Absen: ${state.student.absen}
Kelas: XI HJ 5
Waktu Pengerjaan: ${duration}
━━━━━━━━━━━━━━━━━━━━━
Skor Murni: ${rawScore} / 100
Pelanggaran Contek: ${state.antiCheat.cheatCount}x (Penalti -${state.antiCheat.cheatCount * 5} Poin)
NILAI AKHIR: ${finalScore} / 100
Status: ${Number(finalScore) >= 75 ? "TUNTAS (LULUS KKM)" : "BELUM TUNTAS"}
━━━━━━━━━━━━━━━━━━━━━
Log Pelanggaran: ${state.antiCheat.logs.join("; ") || "Tidak ada pelanggaran (Jujur)"}
  `.trim();

  navigator.clipboard.writeText(summary).then(() => {
    alert("Ringkasan rapor nilai berhasil disalin ke clipboard! Silakan paste ke WhatsApp guru/kelompok.");
  }).catch(() => {
    alert(summary);
  });
}

function downloadResultText() {
  const finalScore = document.getElementById("finalScoreVal").textContent;
  const rawScore = document.getElementById("rawScoreVal").textContent;
  const duration = getFormattedDuration();
  const text = `LAPORAN HASIL UJIAN TTS BAHASA INDONESIA\n` +
               `SMA NEGERI 1 BATAM - KELAS XI HJ 5\n` +
               `Nama: ${state.student.name}\n` +
               `No. Absen: ${state.student.absen}\n` +
               `Kelas: XI HJ 5\n` +
               `Waktu Pengerjaan: ${duration}\n` +
               `Skor Murni: ${rawScore}/100\n` +
               `Penalti Pelanggaran: -${state.antiCheat.cheatCount * 5} Poin (${state.antiCheat.cheatCount}x Pelanggaran)\n` +
               `NILAI AKHIR: ${finalScore}/100\n` +
               `Status: ${Number(finalScore) >= 75 ? "TUNTAS" : "BELUM TUNTAS"}\n` +
               `Tanggal: ${new Date().toLocaleString()}\n\n` +
               `Log Pelanggaran:\n${state.antiCheat.logs.join("\n") || "Bersih (Tidak ada pelanggaran)"}\n`;

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Nilai_TTS_${state.student.name.replace(/\s+/g, "_")}.txt`;
  a.click();
}

