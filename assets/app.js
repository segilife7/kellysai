/* Kelly's AI — 공용 스크립트
   data/ 폴더의 JSON을 읽어서 화면을 그립니다.
   HTML은 뼈대만 갖고 있고, 내용은 전부 JSON에서 옵니다.
   관리자 페이지(3단계)는 이 JSON 파일들만 수정하면 됩니다. */

const LOGO = `
<svg viewBox="0 0 64 64" aria-hidden="true">
  <g fill="none" stroke="#171A2E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <g>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none"/>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none" transform="rotate(45 26 30)"/>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none" transform="rotate(90 26 30)"/>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none" transform="rotate(135 26 30)"/>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none" transform="rotate(180 26 30)"/>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none" transform="rotate(225 26 30)"/>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none" transform="rotate(270 26 30)"/>
      <rect x="23" y="7" width="6" height="7" rx="2" fill="#171A2E" stroke="none" transform="rotate(315 26 30)"/>
    </g>
    <circle cx="26" cy="30" r="17"/>
    <circle cx="26" cy="26" r="10.5" fill="#F5B93A" stroke="#171A2E"/>
    <path d="M21.5 36.5h9M23 40.5h6"/>
    <path d="M52 16h-6.5M52 30h-9.5M52 44h-6.5"/>
    <circle cx="55" cy="16" r="2.6" fill="#4960C3" stroke="#171A2E" stroke-width="2.4"/>
    <circle cx="55" cy="30" r="2.6" fill="#4960C3" stroke="#171A2E" stroke-width="2.4"/>
    <circle cx="55" cy="44" r="2.6" fill="#4960C3" stroke="#171A2E" stroke-width="2.4"/>
  </g>
  <text x="26" y="29.5" text-anchor="middle" font-family="Pretendard, sans-serif" font-size="9.5" font-weight="800" fill="#171A2E">AI</text>
</svg>`;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* HTML 삽입 전 이스케이프. 관리자 페이지에서 넣은 문자열이 태그로 해석되지 않게 막습니다. */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* 외부 링크는 https/http 만 허용합니다. */
const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';

const DATA = {};

async function loadData() {
  const files = ['menu', 'profile', 'prompts', 'programs'];
  const res = await Promise.all(
    files.map(f => fetch(`data/${f}.json`, { cache: 'no-cache' }).then(r => {
      if (!r.ok) throw new Error(`${f}.json (${r.status})`);
      return r.json();
    }))
  );
  files.forEach((f, i) => DATA[f] = res[i]);
}

function showLoadError(err) {
  const box = `
    <div class="wrap">
      <div class="error-box">
        <h2>데이터를 불러오지 못했습니다</h2>
        <p>${esc(err.message)}</p>
        <p>파일을 더블클릭해서 열면 브라우저가 보안 정책 때문에 JSON을 읽지 못합니다.
           폴더에서 <code>python3 -m http.server 8000</code> 을 실행한 뒤
           <code>http://localhost:8000</code> 으로 접속하세요.
           GitHub Pages에 올린 뒤에는 이 문제가 생기지 않습니다.</p>
      </div>
    </div>`;
  $('main').innerHTML = box;
}

/* ---------- 공통 영역 ---------- */

function renderHeader() {
  const page = document.body.dataset.page;
  const items = DATA.menu
    .filter(m => m.visible)
    .sort((a, b) => a.order - b.order)
    .map(m => `<a href="${esc(m.href)}"${m.id === page ? ' aria-current="page"' : ''}>${esc(m.label)}</a>`)
    .join('');

  $('#siteHeader').innerHTML = `
    <div class="wrap top-in">
      <a class="brand" href="index.html">${LOGO}<span>${esc(DATA.profile.brand)}</span></a>
      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="nav">메뉴</button>
      <nav class="nav" id="nav">${items}</nav>
    </div>`;

  const nav = $('#nav'), btn = $('#navToggle');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
  });
}

function renderFooter() {
  const p = DATA.profile;
  $('#siteFooter').innerHTML = `
    <div class="wrap foot-in">
      <span>${esc(p.brand)} — ${esc(p.tagline)}</span>
      <span>${esc(p.contactNote)}</span>
    </div>`;
}

/* ---------- 복사 ---------- */

async function copyText(text, btn, doneLabel = '복사됨') {
  const back = btn.dataset.label || btn.textContent;
  btn.dataset.label = back;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  btn.textContent = doneLabel;
  btn.classList.add('done');
  setTimeout(() => { btn.textContent = back; btn.classList.remove('done'); }, 1800);
}

/* ---------- 프롬프트 카드 / 모달 ---------- */

const cardHTML = p => `
  <button class="p-card" data-id="${esc(p.id)}">
    <span class="p-cat">${esc(p.category)}</span>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.summary)}</p>
    <span class="p-tags">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>
  </button>`;

function mountModal() {
  if ($('#modal')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-bg" data-close></div>
      <div class="modal-box">
        <button class="x" data-close aria-label="닫기">×</button>
        <div class="modal-top">
          <span class="p-cat" id="modalCat"></span>
          <h3 id="modalTitle"></h3>
          <p id="modalSummary"></p>
        </div>
        <div class="modal-mid">
          <pre class="prompt-text" id="modalBody"></pre>
          <p class="hint" id="modalTip"></p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-line" data-close>닫기</button>
          <button class="copy" id="modalCopy">프롬프트 복사</button>
        </div>
      </div>
    </div>`);

  const modal = $('#modal');
  modal.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
  $('#modalCopy').addEventListener('click', e => copyText(modal._current.body, e.currentTarget));
}

let lastFocus = null;

function openModal(p) {
  const modal = $('#modal');
  modal._current = p;
  lastFocus = document.activeElement;
  $('#modalCat').textContent = p.category;
  $('#modalTitle').textContent = p.title;
  $('#modalSummary').textContent = p.summary;
  $('#modalBody').textContent = p.body;
  const tip = $('#modalTip');
  tip.textContent = p.tip || '';
  tip.style.display = p.tip ? '' : 'none';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  $('#modalCopy').focus();
}

function closeModal() {
  $('#modal').classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

function bindCards(container) {
  container.addEventListener('click', e => {
    const c = e.target.closest('.p-card');
    if (!c) return;
    const p = DATA.prompts.find(x => x.id === c.dataset.id);
    if (p) openModal(p);
  });
}

/* ---------- 프로그램 행 ---------- */

const progHTML = g => {
  const url = safeUrl(g.url);
  return `
  <div class="prog-row ${url ? '' : 'soon'}">
    <div class="prog-mark">${esc(g.mark)}</div>
    <div class="prog-info">
      <h3>${esc(g.title)}</h3>
      <p>${esc(g.summary)}</p>
      <span class="p-tags">${(g.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>
    </div>
    ${url
      ? `<a class="prog-go" href="${esc(url)}" target="_blank" rel="noopener">바로가기</a>`
      : `<span class="prog-soon">준비 중</span>`}
  </div>`;
};

/* ---------- 페이지별 렌더 ---------- */

const pages = {

  home() {
    const p = DATA.profile;
    const feat = DATA.prompts.find(x => x.featured) || DATA.prompts[0];

    $('#heroTitle').textContent = p.heroTitle;
    $('#heroLead').textContent = p.heroLead;

    $('#feature').innerHTML = `
      <div class="feature-head">
        <span class="dot"></span>
        <span>바로 써보기</span>
        <strong>${esc(feat.title)}</strong>
      </div>
      <div class="feature-body">
        <pre class="prompt-text">${esc(feat.body)}</pre>
        <div class="feature-foot">
          <small>${esc(feat.category)} · 대괄호만 채우면 됩니다</small>
          <button class="copy" id="featCopy">복사</button>
        </div>
      </div>`;
    $('#featCopy').addEventListener('click', e => copyText(feat.body, e.currentTarget));

    const preview = $('#promptPreview');
    preview.innerHTML = DATA.prompts.slice(0, 3).map(cardHTML).join('');
    bindCards(preview);

    $('#programPreview').innerHTML = DATA.programs.slice(0, 2).map(progHTML).join('');
  },

  prompts() {
    const cats = ['전체', ...new Set(DATA.prompts.map(p => p.category))];
    let active = '전체';
    const grid = $('#pGrid'), chips = $('#chips');

    const drawChips = () => chips.innerHTML = cats.map(c =>
      `<button class="chip" aria-pressed="${c === active}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

    const drawGrid = () => {
      const list = active === '전체' ? DATA.prompts : DATA.prompts.filter(p => p.category === active);
      grid.innerHTML = list.length
        ? list.map(cardHTML).join('')
        : `<p class="empty">이 분류에 등록된 프롬프트가 아직 없습니다.</p>`;
    };

    chips.addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      active = b.dataset.cat;
      drawChips(); drawGrid();
    });

    bindCards(grid);
    drawChips(); drawGrid();

    // prompts.html#p3 형태로 링크를 공유하면 해당 프롬프트가 바로 열립니다.
    const id = location.hash.slice(1);
    if (id) {
      const p = DATA.prompts.find(x => x.id === id);
      if (p) openModal(p);
    }
  },

  programs() {
    $('#progList').innerHTML = DATA.programs.length
      ? DATA.programs.map(progHTML).join('')
      : `<p class="empty">등록된 프로그램이 아직 없습니다.</p>`;
  },

  about() {
    const p = DATA.profile;
    $('#aboutTitle').textContent = p.aboutTitle;
    $('#aboutBody').innerHTML = p.aboutBody.map(t => `<p>${esc(t)}</p>`).join('');
    $('#fieldList').innerHTML = p.fields.map(f =>
      `<div><b>${esc(f.label)}</b>${esc(f.text)}</div>`).join('');
    $('#contactText').textContent = p.contactText;
    const btn = $('#contactBtn');
    if (p.contactHref) {
      btn.href = p.contactHref;
      btn.textContent = p.contactLabel;
    } else {
      btn.remove();
    }
  },

  notfound() {}
};

/* ---------- 시작 ---------- */

(async function start() {
  try {
    await loadData();
  } catch (err) {
    document.title = '불러오기 실패 — Kelly\'s AI';
    showLoadError(err);
    return;
  }
  renderHeader();
  renderFooter();
  mountModal();
  const page = document.body.dataset.page;
  if (pages[page]) pages[page]();
})();
