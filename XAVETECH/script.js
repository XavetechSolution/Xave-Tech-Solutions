(() => {
  'use strict';

 
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const on = (el, evt, fn) => el && el.addEventListener(evt, fn);

 



  ['#year','#year2','#year3','#year4'].forEach(id => {
    const el = document.querySelector(id);
    if (el) el.textContent = new Date().getFullYear();
  });

 


//TOGGLE THEME
  const THEME_KEY = 'xave_theme';
  function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
 
    $$('#themeToggle, #themeToggle2, #themeToggle3, #themeToggle4').forEach(btn => {
      if (!btn) return;
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
    try { localStorage.setItem(THEME_KEY, theme); } catch(e) {}
  }

  function toggleTheme() {
    const current = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }
 
  $$('#themeToggle, #themeToggle2, #themeToggle3, #themeToggle4').forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', toggleTheme);
  });
 
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) applyTheme(stored);
  else applyTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

 


//HAMBURGER MOBILE
  function setupHamburger(hamburgerId, navListId) {
    const hb = document.getElementById(hamburgerId);
    const nav = document.getElementById(navListId);
    if (!hb || !nav) return;
    hb.addEventListener('click', () => {
      const expanded = hb.getAttribute('aria-expanded') === 'true';
      hb.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('show');
    });
 
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('show')) return;
      if (nav.contains(e.target) || hb.contains(e.target)) return;
      nav.classList.remove('show');
      hb.setAttribute('aria-expanded', 'false');
    });
  }
  setupHamburger('hamburger','navList');
  setupHamburger('hamburger2','navList2');
  setupHamburger('hamburger3','navList3');
  setupHamburger('hamburger4','navList4');

 
  //HEADLINE TYPEWRITER
  (function typed() {
    const el = document.getElementById('typedHeadline');
    if (!el) return;
    const text = el.textContent.trim();
    el.textContent = '';
    let i = 0;
    const speed = 26;
    function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed + Math.random() * 18);
      }
    }
    setTimeout(step, 240);
  })();

     

  (function portfolioFilter(){
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;
    document.querySelectorAll('.portfolio-controls button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.portfolio-controls button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.portfolio-item').forEach(item => {
          const cat = item.dataset.category;
          item.style.display = (filter === 'all' || filter === cat) ? '' : 'none';
        });
      });
    });
  })();

  
  const REVIEWS_KEY = 'xave_reviews_v1';
  const seedReviews = [
    {name:'MR BADEJO', category:'web', text:'XAVE delivered a beautiful site and met our deadlines.'},
    {name:'BORIOLA', category:'social', text:'Their social strategy improved MY reach and conversions.'},
    {name:'SANTAN.', category:'graphics', text:'THEY DID A GREAT JOB.'}
  ];
  function getReviews() {
    try {
      const raw = localStorage.getItem(REVIEWS_KEY);
      if (!raw) {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(seedReviews));
        return seedReviews.slice();
      }
      return JSON.parse(raw);
    } catch (e) { return seedReviews.slice(); }
  }
  function saveReview(review) {
    const list = getReviews();
    list.unshift(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list.slice(0,200)));
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
  function capitalize(s){ return s && s[0].toUpperCase() + s.slice(1); }

  function makeReviewCard(r) {
    const card = document.createElement('div');
    card.className = 'review hint-float';
    card.innerHTML = `<strong>${escapeHtml(r.name)}</strong>
      <div class="muted" style="font-size:.85rem">${escapeHtml(capitalize(r.category))}</div>
      <p>${escapeHtml(r.text)}</p>`;
    return card;
  }
  function renderLandingReviews() {
    const container = document.getElementById('floatingReviews');
    if (!container) return;
    container.innerHTML = '';
    getReviews().slice(0,6).forEach(r => container.appendChild(makeReviewCard(r)));
  }
  function renderAllReviewsOnPage() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    container.innerHTML = '';
    const items = getReviews();
    if (!items.length) {
      container.innerHTML = '<p class="muted">No reviews yet.</p>';
      return;
    }
    items.forEach(r => container.appendChild(makeReviewCard(r)));
  }
  renderLandingReviews();
  renderAllReviewsOnPage(); 

 

  
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = (document.getElementById('reviewName') || {}).value || '';
      const category = (document.getElementById('reviewCategory') || {}).value || '';
      const text = (document.getElementById('reviewText') || {}).value || '';
      const msg = document.getElementById('reviewFormMessage');
      if (!name.trim() || !category || !text.trim()) {
        if (msg) msg.textContent = 'Please fill all fields.';
        return;
      }
      const review = { name: name.trim().slice(0,60), category, text: text.trim().slice(0,800) };
      saveReview(review);
      if (msg) msg.textContent = 'Thank you, your review has been saved.';
      reviewForm.reset();
      renderLandingReviews();
      renderAllReviewsOnPage();
    });
  }

   
  (function keyboardOutline() {
    function handleFirstTab(e) {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('show-focus');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }
    window.addEventListener('keydown', handleFirstTab);
  })();

})();