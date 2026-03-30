function go(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.go = go;

function toggleAnswer(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show');
}
window.toggleAnswer = toggleAnswer;

function buildVideos() {
  const mount = document.getElementById('videosGrid');
  const data = window.APOSTILA_PAGE || {};
  if (!mount) return;
  const videos = Array.isArray(data.videos) ? data.videos : [];
  if (!videos.length) {
    mount.innerHTML = '<div class="video-card"><h4>Nenhum vídeo cadastrado</h4><p>Este espaço fica pronto para receber vídeos de reforço sem precisar alterar a engine das apostilas.</p></div>';
    return;
  }
  mount.innerHTML = videos.map(video => `
    <div class="video-card">
      <h4>${escapeHtml(video.title)}</h4>
      <p>${escapeHtml(video.description)}</p>
      <a class="video-link" href="${escapeHtml(video.url)}" target="_blank" rel="noopener noreferrer">Abrir busca</a>
    </div>
  `).join('');
}

function buildNavigation() {
  const data = window.APOSTILA_PAGE || {};
  const prev = document.getElementById('prevLesson');
  const next = document.getElementById('nextLesson');
  const footer = document.getElementById('footerInfo');

  if (prev) {
    if (data.prevFile) {
      prev.href = data.prevFile;
      prev.className = 'btn-secondary';
      prev.textContent = '← Apostila anterior';
    } else {
      prev.removeAttribute('href');
      prev.className = 'btn-secondary btn-disabled';
      prev.textContent = '← Apostila anterior';
    }
  }

  if (next) {
    if (data.nextFile) {
      next.href = data.nextFile;
      next.className = 'btn-primary';
      next.textContent = 'Próxima apostila →';
    } else {
      next.removeAttribute('href');
      next.className = 'btn-primary btn-disabled';
      next.textContent = 'Próxima apostila →';
    }
  }

  if (footer) {
    footer.textContent = `${data.footer || ''}`;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function initQuiz() {
  const quizData = (window.APOSTILA_PAGE && window.APOSTILA_PAGE.quizData) || [];
  if (!quizData.length) return;
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
}

function renderQuiz() {
  const quizData = (window.APOSTILA_PAGE && window.APOSTILA_PAGE.quizData) || [];
  if (!quizData.length) return;
  quizAnswered = false;
  const item = quizData[quizIndex];
  document.getElementById('quizQuestion').textContent = item.q;
  document.getElementById('quizScore').textContent = `Questão ${quizIndex + 1} de ${quizData.length}`;
  document.getElementById('quizBar').style.width = `${(quizIndex / quizData.length) * 100}%`;
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('quizFeedback').style.color = '#ffffff';
  document.getElementById('quizNext').disabled = true;

  const options = document.getElementById('quizOptions');
  options.innerHTML = '';
  item.opts.forEach((opt, index) => {
    const button = document.createElement('button');
    button.className = 'quiz-option';
    button.textContent = opt;
    button.onclick = () => answerQuiz(index);
    options.appendChild(button);
  });
}

function answerQuiz(selected) {
  if (quizAnswered) return;
  quizAnswered = true;
  const quizData = (window.APOSTILA_PAGE && window.APOSTILA_PAGE.quizData) || [];
  const item = quizData[quizIndex];
  const buttons = document.querySelectorAll('.quiz-option');
  buttons.forEach(button => button.disabled = true);
  buttons[item.a].classList.add('correct');

  const feedback = document.getElementById('quizFeedback');
  if (selected === item.a) {
    quizScore++;
    feedback.textContent = '🎉 Correto!';
    feedback.style.color = '#4ade80';
  } else {
    buttons[selected].classList.add('wrong');
    feedback.textContent = '❌ A correta está em verde.';
    feedback.style.color = '#f87171';
  }

  document.getElementById('quizNext').disabled = false;
}
window.answerQuiz = answerQuiz;

function nextQuiz() {
  const quizData = (window.APOSTILA_PAGE && window.APOSTILA_PAGE.quizData) || [];
  quizIndex++;
  if (quizIndex >= quizData.length) {
    finishQuiz();
    return;
  }
  renderQuiz();
}
window.nextQuiz = nextQuiz;

function finishQuiz() {
  const quizData = (window.APOSTILA_PAGE && window.APOSTILA_PAGE.quizData) || [];
  const percent = Math.round((quizScore / quizData.length) * 100);
  document.getElementById('quizBar').style.width = '100%';
  document.getElementById('quizQuestion').textContent = '🏁 Quiz concluído!';
  document.getElementById('quizOptions').innerHTML = '';
  document.getElementById('quizScore').textContent = `Acertos: ${quizScore} de ${quizData.length} (${percent}%)`;

  const feedback = document.getElementById('quizFeedback');
  if (percent >= 80) {
    feedback.textContent = 'Excelente. A base do dia ficou firme.';
  } else if (percent >= 60) {
    feedback.textContent = 'Muito bom. Uma revisão curta amanhã consolida ainda mais.';
  } else {
    feedback.textContent = 'Bom começo. Vale revisar com calma e tentar novamente.';
  }
  feedback.style.color = '#fde68a';

  const next = document.getElementById('quizNext');
  next.textContent = '🔄 Tentar novamente';
  next.disabled = false;
  next.onclick = () => {
    next.textContent = 'Próxima ➡️';
    next.onclick = nextQuiz;
    initQuiz();
  };
}

document.addEventListener('DOMContentLoaded', () => {
  buildVideos();
  buildNavigation();
  initQuiz();
});