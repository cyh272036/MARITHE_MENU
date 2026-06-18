const header = document.getElementById('header');

let activeMenu = null;

// ── GNB 호버 → 메가 메뉴 오픈 ────────────────────────────
document.querySelectorAll('.gnb-item').forEach(gnbItem => {
  const key = gnbItem.dataset.menu;
  const mega = header.querySelector(`.mega[data-mega="${key}"]`);
  if (!mega) return;

  gnbItem.addEventListener('mouseenter', () => {
    openMega(gnbItem, mega);
  });
});

// ── header 벗어나면 닫기 ──────────────────────────────────
header.addEventListener('mouseleave', () => {
  closeMega();
});

function openMega(gnbItem, mega) {
  if (activeMenu && activeMenu.mega !== mega) {
    activeMenu.gnbItem.classList.remove('is-open');
    activeMenu.mega.classList.remove('is-open');
  }
  gnbItem.classList.add('is-open');
  mega.classList.add('is-open');
  activeMenu = { gnbItem, mega };
}

function closeMega() {
  if (!activeMenu) return;
  activeMenu.gnbItem.classList.remove('is-open');
  activeMenu.mega.classList.remove('is-open');
  activeMenu = null;
}

// ── 좌측 메뉴 호버 → 우측 패널 전환 + 첫 번째 sub-trigger 활성화 ──
document.querySelectorAll('.mega').forEach(mega => {
  const leftItems = mega.querySelectorAll('.left-item');
  const panels = mega.querySelectorAll('.mega-panel');

  leftItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const targetPanel = item.dataset.panel;

      // 좌측 active
      leftItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // 패널 전환
      panels.forEach(p => p.classList.remove('active'));
      const panel = mega.querySelector(`.mega-panel[data-panel="${targetPanel}"]`);
      if (!panel) return;
      panel.classList.add('active');

      // 패널 전환 시 첫 번째 sub-trigger 자동 활성화
      const triggers = panel.querySelectorAll('.sub-trigger');
      const subPanels = panel.querySelectorAll('.sub-panel');
      if (triggers.length) {
        triggers.forEach(t => t.classList.remove('active'));
        subPanels.forEach(sp => sp.classList.remove('active'));
        triggers[0].classList.add('active');
        const firstSub = panel.querySelector(`.sub-panel[data-sub="${triggers[0].dataset.sub}"]`);
        if (firstSub) firstSub.classList.add('active');
      }
    });
  });
});

// ── 2depth 카테고리 호버 → 3depth 전환 ──────────────────
document.querySelectorAll('.mega-panel').forEach(panel => {
  const triggers = panel.querySelectorAll('.sub-trigger');
  const subPanels = panel.querySelectorAll('.sub-panel');

  triggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
      const key = trigger.dataset.sub;

      triggers.forEach(t => t.classList.remove('active'));
      trigger.classList.add('active');

      subPanels.forEach(sp => sp.classList.remove('active'));
      const target = panel.querySelector(`.sub-panel[data-sub="${key}"]`);
      if (target) target.classList.add('active');
    });
  });
});

// ── ESC 닫기 ─────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMega();
});

// ── Mobile Drawer ─────────────────────────────────────────
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileOverlay = document.getElementById('mobileOverlay');
const mDrawerClose = document.getElementById('mDrawerClose');

function openDrawer() {
  mobileDrawer.classList.add('is-open');
  mobileOverlay.classList.add('is-visible');
  hamburgerBtn.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  mobileDrawer.setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  mobileDrawer.classList.remove('is-open');
  mobileOverlay.classList.remove('is-visible');
  hamburgerBtn.classList.remove('is-open');
  document.body.style.overflow = '';
  mobileDrawer.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    document.querySelectorAll('.m-acc-item, .m-sub-item, .m-explore-item').forEach(i => i.classList.remove('is-open'));
  }, 320);
}

hamburgerBtn.addEventListener('click', () => {
  mobileDrawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
});
mDrawerClose.addEventListener('click', closeDrawer);
mobileOverlay.addEventListener('click', closeDrawer);

// ── Accordion ─────────────────────────────────────────────
document.querySelectorAll('.m-acc-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    trigger.parentElement.classList.toggle('is-open');
  });
});

document.querySelectorAll('.m-sub-trigger').forEach(btn => {
  btn.addEventListener('click', () => btn.parentElement.classList.toggle('is-open'));
});

// ── EXPLORE accordion ──────────────────────────────────────
const exploreItem = document.querySelector('.m-explore-item');
if (exploreItem) {
  exploreItem.querySelector('.m-explore-trigger').addEventListener('click', () => {
    exploreItem.classList.toggle('is-open');
  });
}

// ── Slider (infinite loop) ────────────────────────────────
const sliderTrack = document.getElementById('mSliderTrack');
if (sliderTrack) {
  const pairs = Array.from(sliderTrack.querySelectorAll('.m-slide-pair'));
  const total = pairs.length;
  const dotsContainer = document.getElementById('mSliderDots');
  let current = 0;
  let timer;
  let jumping = false;

  // 첫 슬라이드 복제본을 끝에 추가 → 마지막→첫 전환 시 앞으로 부드럽게
  sliderTrack.appendChild(pairs[0].cloneNode(true));

  pairs.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'm-slider-dot';
    dot.setAttribute('aria-label', `슬라이드 ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    dotsContainer.querySelectorAll('.m-slider-dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === current % total);
    });
  }

  function goTo(n) {
    if (jumping) return;
    current = n;
    sliderTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    sliderTrack.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  // 복제본(index=total)에서 실제 첫 슬라이드로 순간이동
  sliderTrack.addEventListener('transitionend', () => {
    if (current === total) {
      jumping = true;
      sliderTrack.style.transition = 'none';
      current = 0;
      sliderTrack.style.transform = `translateX(0)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; }));
    }
  });

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 3200);
  }

  goTo(0);
  resetTimer();

  let startX = 0;
  sliderTrack.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    clearInterval(timer);
  }, { passive: true });
  sliderTrack.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const next = diff > 0 ? current + 1 : Math.max(0, current - 1);
      goTo(next);
    }
    resetTimer();
  }, { passive: true });
}

// ── 공통 패널 템플릿 주입 (GYJ / NYF) ────────────────────
const GYJ_COLS = `<div class="panel-cols"><div class="pcol"><a href="#">착장 아이템</a><a href="#">컬렉션 전체</a></div></div>`;
const GYJ_IMGS = `<div class="panel-imgs"><div class="panel-img" style="background:#111;"><span class="panel-img-label" style="color:#fff;">GO YOUN-JUNG</span></div><div class="panel-img" style="background:#1A1A1A;"><span class="panel-img-label" style="color:#fff;">LOOK BOOK</span></div></div>`;
const NYF_COLS = `<div class="panel-cols"><div class="pcol"><a href="#">패밀리 룩</a><a href="#">아이템 전체</a></div></div>`;
const NYF_IMGS = `<div class="panel-imgs"><div class="panel-img" style="background:#1E1E1E;"><span class="panel-img-label" style="color:#fff;">NA YOUNG FAMILY</span></div><div class="panel-img" style="background:#282828;"><span class="panel-img-label" style="color:#fff;">FAMILY LOOK</span></div></div>`;

document.querySelectorAll('[data-panel$="-gyj"]').forEach(panel => {
  const isShared = panel.closest('.mega-right--shared') !== null;
  panel.innerHTML = GYJ_COLS + (isShared ? '' : GYJ_IMGS);
});

document.querySelectorAll('[data-panel$="-nyf"]').forEach(panel => {
  const isShared = panel.closest('.mega-right--shared') !== null;
  panel.innerHTML = NYF_COLS + (isShared ? '' : NYF_IMGS);
});
