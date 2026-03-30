function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getConfig() {
  return window.AYKA_CONFIG || {};
}

function getConfigDays() {
  const config = getConfig();
  return Array.isArray(config.days) ? config.days : [];
}

function getMonths(days) {
  const seen = new Set();
  return days
    .filter(day => day && day.monthKey && day.monthLabel)
    .filter(day => {
      if (seen.has(day.monthKey)) return false;
      seen.add(day.monthKey);
      return true;
    })
    .map(day => ({ key: day.monthKey, label: day.monthLabel }));
}

function getReadyCount(days) {
  return days.filter(day => day.status === "pronta" && day.file).length;
}

function parseMonthKey(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  return { year, month };
}

function getDaysInMonth(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(year, month, 0).getDate();
}

function getMonthStartColumn(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const nativeDay = new Date(year, month - 1, 1).getDay();
  return (nativeDay + 6) % 7;
}

function buildCalendarSummary(days, month) {
  const badge = document.getElementById("calendarSummary");
  const title = document.getElementById("calendarTitle");
  const subtitle = document.getElementById("calendarSubtitle");
  const monthTitle = document.getElementById("currentMonthLabel");
  const monthSubtitle = document.getElementById("currentMonthSubtitle");

  const total = days.length;
  const ready = getReadyCount(days);
  const visibleDays = days.filter(day => day.monthKey === month.key);
  const visibleReady = getReadyCount(visibleDays);

  if (badge) {
    badge.textContent = `${visibleReady} prontas neste mês · ${ready} prontas no total · ${total} dias mapeados`;
  }

  if (title) {
    title.textContent = `${escapeHtml(getConfig().siteName || "Ayka")} · calendário mensal`;
  }

  if (subtitle) {
    subtitle.textContent = `${escapeHtml(getConfig().trackName || "Cronograma")} · navegação por mês`;
  }

  if (monthTitle) {
    monthTitle.textContent = month.label;
  }

  if (monthSubtitle) {
    monthSubtitle.textContent = `${visibleDays.length} dias do cronograma neste mês`;
  }
}

function renderWeekdays() {
  const mount = document.getElementById("calendarWeekdays");
  if (!mount) return;
  const days = Array.isArray(getConfig().weekDays) && getConfig().weekDays.length
    ? getConfig().weekDays
    : ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  mount.innerHTML = days
    .map(label => `<div class="calendar-weekday-head">${escapeHtml(label)}</div>`)
    .join("");
}

function renderEntryCard(item) {
  const subjects = (item.subjects || [])
    .map(subject => `<span class="calendar-entry-chip">${escapeHtml(subject)}</span>`)
    .join("");

  const ready = item.status === "pronta" && !!item.file;
  const badgeClass = ready ? "ready" : "planned";
  const badgeLabel = ready ? "pronta" : "planejada";

  const inner = `
    <div class="calendar-entry-top">
      <div>
        <div class="calendar-entry-weekday">${escapeHtml(item.weekday)}</div>
        <div class="calendar-day-number">${escapeHtml(item.calendarDay)}</div>
      </div>
      <div class="calendar-entry-badge ${badgeClass}">${badgeLabel}</div>
    </div>
    <div class="calendar-entry-day">Dia ${escapeHtml(item.day)}</div>
    <div class="calendar-entry-title">${escapeHtml(item.title)}</div>
    <div class="calendar-entry-chips">${subjects}</div>
  `;

  if (ready) {
    return `<a class="calendar-day-card ready" href="${escapeHtml(item.file)}" aria-label="Abrir apostila do dia ${escapeHtml(item.day)}">${inner}</a>`;
  }

  return `<div class="calendar-day-card planned" aria-label="Dia ${escapeHtml(item.day)} planejado">${inner}</div>`;
}

function renderEmptyCell(dayNumber, outOfRange = false) {
  const extraClass = outOfRange ? " off-range" : "";
  return `
    <div class="calendar-day-card empty${extraClass}" aria-hidden="true">
      <div class="calendar-day-number empty">${dayNumber ? escapeHtml(dayNumber) : ""}</div>
      <div class="calendar-empty-note">${outOfRange ? "" : "Sem estudo mapeado neste dia"}</div>
    </div>
  `;
}

const calendarState = {
  months: [],
  currentMonthIndex: 0
};

function updateMonthButtons() {
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  if (prevBtn) prevBtn.disabled = calendarState.currentMonthIndex <= 0;
  if (nextBtn) nextBtn.disabled = calendarState.currentMonthIndex >= calendarState.months.length - 1;
}

function buildCalendarGrid() {
  const mount = document.getElementById("calendarGrid");
  const allDays = getConfigDays();
  if (!mount || !calendarState.months.length) return;

  const currentMonth = calendarState.months[calendarState.currentMonthIndex];
  const monthDays = allDays.filter(day => day.monthKey === currentMonth.key);
  const entryByDay = new Map(monthDays.map(day => [Number(day.calendarDay), day]));
  const daysInMonth = getDaysInMonth(currentMonth.key);
  const startColumn = getMonthStartColumn(currentMonth.key);

  const cells = [];

  for (let i = 0; i < startColumn; i += 1) {
    cells.push(renderEmptyCell("", true));
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const entry = entryByDay.get(dayNumber);
    cells.push(entry ? renderEntryCard(entry) : renderEmptyCell(dayNumber, false));
  }

  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const missing = 7 - remainder;
    for (let i = 0; i < missing; i += 1) {
      cells.push(renderEmptyCell("", true));
    }
  }

  mount.innerHTML = cells.join("");
  buildCalendarSummary(allDays, currentMonth);
  updateMonthButtons();
  setupObserver();
}

function setupObserver() {
  const targets = document.querySelectorAll(".calendar-day-card");
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  targets.forEach(target => {
    target.style.opacity = "0";
    target.style.transform = "translateY(18px)";
    target.style.transition = "opacity .45s ease, transform .45s ease";
    observer.observe(target);
  });
}

function goToPreviousMonth() {
  if (calendarState.currentMonthIndex <= 0) return;
  calendarState.currentMonthIndex -= 1;
  buildCalendarGrid();
}

function goToNextMonth() {
  if (calendarState.currentMonthIndex >= calendarState.months.length - 1) return;
  calendarState.currentMonthIndex += 1;
  buildCalendarGrid();
}

document.addEventListener("DOMContentLoaded", () => {
  const days = getConfigDays();
  calendarState.months = getMonths(days);

  renderWeekdays();

  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");

  if (prevBtn) prevBtn.addEventListener("click", goToPreviousMonth);
  if (nextBtn) nextBtn.addEventListener("click", goToNextMonth);

  if (!calendarState.months.length) {
    const mount = document.getElementById("calendarGrid");
    if (mount) {
      mount.innerHTML = `<div class="calendar-day-card empty"><div class="calendar-empty-note">Nenhum mês do cronograma foi configurado ainda.</div></div>`;
    }
    return;
  }

  buildCalendarGrid();
});
