function show(key, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('sec-' + key);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
}
window.show = show;

function buildLessonGrid() {
  const mount = document.getElementById('lessonGrid');
  if (!mount || !window.AYKA_CONFIG) return;
  const lessons = window.AYKA_CONFIG.availableLessons || [];
  mount.innerHTML = lessons.map(item => `
    <a class="lesson-card" href="${item.file}">
      <div class="lesson-day">📘 Apostila ${item.day}</div>
      <div class="lesson-date">${item.dateLabel}</div>
      <div class="lesson-desc">${item.title}</div>
      <span class="lesson-tag">${item.tag}</span>
    </a>
  `).join('');
}

function buildCalendarGrid() {
  const mount = document.getElementById('calendarGrid');
  if (!mount || !window.AYKA_CONFIG) return;
  const days = window.AYKA_CONFIG.calendarDays || [];
  mount.innerHTML = days.map(item => {
    const subjects = (item.subjects || []).map(s => `<span class="calendar-chip">${s}</span>`).join('');
    const inner = `
      <div class="calendar-top">
        <div>
          <div class="calendar-weekday">${item.weekday}</div>
          <div class="calendar-date">${item.dateLabel}</div>
        </div>
        <div class="calendar-badge ${item.status === 'pronta' ? 'ready' : 'planned'}">${item.status === 'pronta' ? 'pronta' : 'planejada'}</div>
      </div>
      <div class="calendar-day">Dia ${item.day}</div>
      <div class="calendar-title">${item.title}</div>
      <div class="calendar-chips">${subjects}</div>
    `;
    if (item.status === 'pronta') {
      return `<a class="calendar-card ready" href="${item.file}">${inner}</a>`;
    }
    return `<div class="calendar-card planned">${inner}</div>`;
  }).join('');
}

const levels = [
  {min:0,  label:'Exploradora 🌱', msg:'Começo certo: constância primeiro, velocidade depois.'},
  {min:3,  label:'Aprendiz ✨',    msg:'Boa. O importante é manter o ritmo da semana.'},
  {min:6,  label:'Estudante 📚',   msg:'A base está ficando firme e organizada.'},
  {min:10, label:'Campeã 🏆',      msg:'Ritmo forte. Já dá para sentir evolução real.'},
  {min:15, label:'Superestrela 🌟',msg:'Excelente constância. Agora é seguir sem quebrar a rotina.'},
];

let totalStars = parseInt(localStorage.getItem((window.AYKA_CONFIG && window.AYKA_CONFIG.starStorageKey) || 'aykaStars2') || '0');

function buildStarRow() {
  const row = document.getElementById('starRow');
  if (!row) return;
  row.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const btn = document.createElement('button');
    btn.className = 'star-btn' + (i < totalStars ? ' lit' : '');
    btn.textContent = '⭐';
    btn.onclick = () => {
      totalStars = (i < totalStars) ? i : i + 1;
      localStorage.setItem((window.AYKA_CONFIG && window.AYKA_CONFIG.starStorageKey) || 'aykaStars2', totalStars);
      buildStarRow();
      playStarSound(totalStars);
    };
    row.appendChild(btn);
  }
  const lvl = [...levels].reverse().find(l => totalStars >= l.min) || levels[0];
  const totalDisplay = document.getElementById('totalDisplay');
  const levelLabel = document.getElementById('levelLabel');
  const starMsg = document.getElementById('starMsg');
  if (totalDisplay) totalDisplay.textContent = 'Total: ' + totalStars + ' ⭐';
  if (levelLabel) levelLabel.textContent = 'Nível: ' + lvl.label;
  if (starMsg) starMsg.textContent = lvl.msg;
}

function playStarSound(n) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [523,587,659,784,880,1047,1175,1319];
    const f = freqs[Math.min(n-1, freqs.length-1)] || 523;
    [[f,0],[f*1.25,.08],[f*1.5,.16]].forEach(([fr,d]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'triangle'; o.frequency.value = fr;
      g.gain.setValueAtTime(0, ctx.currentTime+d);
      g.gain.linearRampToValueAtTime(.3, ctx.currentTime+d+.01);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+d+.25);
      o.start(ctx.currentTime+d); o.stop(ctx.currentTime+d+.3);
    });
  } catch(e) {}
}

function setupObserver() {
  const targets = document.querySelectorAll('.subj-card,.sci-card,.reward-card,.rt-item,.day-col,.lesson-card,.calendar-card');
  if (!targets.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, {threshold: .08});
  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .45s ease, transform .45s ease';
    io.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildLessonGrid();
  buildCalendarGrid();
  buildStarRow();
  setupObserver();
});
