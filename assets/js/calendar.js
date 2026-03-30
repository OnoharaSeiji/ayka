function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getConfigDays() {
  return (window.AYKA_DATA && Array.isArray(window.AYKA_DATA.days)) ? window.AYKA_DATA.days : [];
}

function parseDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
}

function getReadyCount(days) {
  return days.filter(day => day.status === 'pronta' && day.file).length;
}

function buildMonthMap(days) {
  const map = new Map();
  days.forEach(day => {
    const date = parseDate(day.date);
    const key = formatMonthKey(date);
    if (!map.has(key)) {
      map.set(key, { key, date, items: [] });
    }
    map.get(key).items.push({ ...day, dateObject: date });
  });
  return [...map.values()].sort((a, b) => a.date - b.date);
}

function getInitialMonthIndex(months) {
  if (!months.length) return 0;
  const now = new Date();
  const currentKey = formatMonthKey(now);
  const currentIndex = months.findIndex(month => month.key === currentKey);
  if (currentIndex >= 0) return currentIndex;
  const firstReadyMonth = months.findIndex(month => month.items.some(item => item.status === 'pronta'));
  return firstReadyMonth >= 0 ? firstReadyMonth : 0;
}

function buildCalendarSummary(days) {
  const badge = document.getElementById('calendarSummary');
  const title = document.getElementById('calendarTitle');
  const subtitle = document.getElementById('calendarSubtitle');
  const total = days.length;
  const ready = getReadyCount(days);
  if (badge) badge.textContent = `${ready} apostilas prontas · ${total} dias mapeados`;
  if (title && window.AYKA_DATA) title.textContent = `${window.AYKA_DATA.siteName} · calendário`;
  if (subtitle && window.AYKA_DATA) subtitle.textContent = `${window.AYKA_DATA.trackName} · calendário mensal do cronograma`;
}

function buildWeekdays() {
  const mount = document.getElementById('monthWeekdays');
  if (!mount) return;
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  mount.innerHTML = weekdays.map(day => `<div class="month-weekday">${day}</div>`).join('');
}

function buildMonthGrid(month, monthIndex, months) {
  const mount = document.getElementById('monthGrid');
  const monthLabel = document.getElementById('monthLabel');
  const monthSubtitle = document.getElementById('monthSubtitle');
  const monthSummary = document.getElementById('calendarMonthSummary');
  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');
  if (!mount || !month) return;

  const firstDay = new Date(month.date.getFullYear(), month.date.getMonth(), 1);
  const lastDay = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 0);
  const leadingBlanks = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const dayMap = new Map(month.items.map(item => [item.dateObject.getDate(), item]));
  const readyCount = month.items.filter(item => item.status === 'pronta').length;

  if (monthLabel) monthLabel.textContent = formatMonthLabel(month.date);
  if (monthSubtitle) monthSubtitle.textContent = `${readyCount} prontas · ${month.items.length} dias mapeados neste mês`;
  if (monthSummary) monthSummary.textContent = `Mês exibido: ${formatMonthLabel(month.date)}.`;
  if (prevBtn) prevBtn.disabled = monthIndex === 0;
  if (nextBtn) nextBtn.disabled = monthIndex === months.length - 1;

  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) {
    cells.push(`<div class="month-cell empty" aria-hidden="true"><div class="month-empty-text">Sem estudo mapeado</div></div>`);
  }

  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
    const item = dayMap.get(dayNumber);
    if (!item) {
      cells.push(`
        <div class="month-cell empty">
          <div class="month-day-number">${dayNumber}</div>
          <div class="month-empty-text">Sem dia de cronograma neste espaço.</div>
        </div>
      `);
      continue;
    }

    const ready = item.status === 'pronta' && !!item.file;
    const statusClass = ready ? 'ready' : 'planned';
    const statusLabel = ready ? 'pronta' : 'planejada';
    const chips = (item.subjects || []).slice(0, 4).map(subject => `<span class="month-card-chip">${escapeHtml(subject)}</span>`).join('');
    const inner = `
      <div class="month-day-number">${dayNumber}</div>
      <div class="month-status ${statusClass}">${statusLabel}</div>
      <div class="month-card-date">${escapeHtml(item.weekday)} · ${escapeHtml(formatShortDate(item.dateObject))}</div>
      <div class="month-card-day">Dia ${escapeHtml(item.day)}</div>
      <div class="month-card-title">${escapeHtml(item.title)}</div>
      <div class="month-card-chips">${chips}</div>
    `;

    if (ready) {
      cells.push(`<a class="month-cell ready" href="${escapeHtml(item.file)}" aria-label="Abrir apostila do dia ${escapeHtml(item.day)}">${inner}</a>`);
    } else {
      cells.push(`<div class="month-cell planned" aria-label="Dia ${escapeHtml(item.day)} planejado">${inner}</div>`);
    }
  }

  mount.innerHTML = cells.join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const days = getConfigDays();
  const months = buildMonthMap(days);
  let monthIndex = getInitialMonthIndex(months);

  buildCalendarSummary(days);
  buildWeekdays();

  function render() {
    buildMonthGrid(months[monthIndex], monthIndex, months);
  }

  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (monthIndex === 0) return;
      monthIndex -= 1;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (monthIndex >= months.length - 1) return;
      monthIndex += 1;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  render();
});