function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getConfigDays() {
  return (window.AYKA_CONFIG && Array.isArray(window.AYKA_CONFIG.days)) ? window.AYKA_CONFIG.days : [];
}

function getReadyCount(days) {
  return days.filter(day => day.status === "pronta" && day.file).length;
}

function buildCalendarSummary(days) {
  const badge = document.getElementById("calendarSummary");
  const title = document.getElementById("calendarTitle");
  const subtitle = document.getElementById("calendarSubtitle");
  if (!badge && !title && !subtitle) return;

  const total = days.length;
  const ready = getReadyCount(days);

  if (badge) badge.textContent = `${ready} apostilas prontas · ${total} dias mapeados`;
  if (title && window.AYKA_CONFIG) title.textContent = `${window.AYKA_CONFIG.siteName} · calendário`;
  if (subtitle && window.AYKA_CONFIG) {
    subtitle.textContent = `${window.AYKA_CONFIG.trackName} · calendário único do cronograma`;
  }
}

function buildCalendarGrid() {
  const mount = document.getElementById("calendarGrid");
  if (!mount) return;

  const days = getConfigDays();

  mount.innerHTML = days.map(item => {
    const subjects = (item.subjects || [])
      .map(subject => `<span class="calendar-chip">${escapeHtml(subject)}</span>`)
      .join("");

    const ready = item.status === "pronta" && !!item.file;
    const badgeClass = ready ? "ready" : "planned";
    const badgeLabel = ready ? "pronta" : "planejada";

    const inner = `
      <div class="calendar-top">
        <div>
          <div class="calendar-weekday">${escapeHtml(item.weekday)}</div>
          <div class="calendar-date">${escapeHtml(item.dateLabel)}</div>
        </div>
        <div class="calendar-badge ${badgeClass}">${badgeLabel}</div>
      </div>
      <div class="calendar-day">Dia ${escapeHtml(item.day)}</div>
      <div class="calendar-title">${escapeHtml(item.title)}</div>
      <div class="calendar-chips">${subjects}</div>
    `;

    if (ready) {
      return `<a class="calendar-card ready" href="${escapeHtml(item.file)}" aria-label="Abrir apostila do dia ${escapeHtml(item.day)}">${inner}</a>`;
    }

    return `<div class="calendar-card planned" aria-label="Dia ${escapeHtml(item.day)} planejado">${inner}</div>`;
  }).join("");

  setupObserver();
}

function setupObserver() {
  const targets = document.querySelectorAll(".calendar-card");
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

document.addEventListener("DOMContentLoaded", () => {
  const days = getConfigDays();
  buildCalendarSummary(days);
  buildCalendarGrid();
});
