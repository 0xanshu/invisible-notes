(function () {
  const cfg = window.GHOST_NOTES_CONFIG;

  // ─── Wire links ────────────────────────────────────────────────
  const set = (id, href) => { const el = document.getElementById(id); if (el) el.href = href; };

  // GitHub links
  set('navGithubMain', cfg.REPO_URL);
  set('navGithubMob',  cfg.REPO_URL);
  set('heroGithub',    cfg.REPO_URL);
  set('privacyGithub', cfg.REPO_URL);
  set('footGithub',    cfg.REPO_URL);
  set('footGithub2',   cfg.REPO_URL);
  set('footGithub3',   cfg.REPO_URL);

  // Issues links
  set('footIssues',    cfg.ISSUES_URL);
  set('footIssues2',   cfg.ISSUES_URL);
  set('footIssues3',   cfg.ISSUES_URL);
  set('issuesLink',    cfg.ISSUES_URL);

  // Other links
  set('footTwitter',   cfg.TWITTER_URL);
  set('releasesLink',  cfg.RELEASES_URL);
  set('releasesLink2', cfg.RELEASES_URL);
  set('sourceLink',    cfg.REPO_URL);
  set('footDownload',  cfg.RELEASES_URL);
  set('navChangelog',  cfg.RELEASES_URL);

  // ─── OS-aware download buttons ─────────────────────────────────
  const ua    = navigator.userAgent;
  const isWin = /Windows/i.test(ua);

  const state = {
    mac: { label: 'Download for Mac',     url: cfg.RELEASES_URL },
    win: { label: 'Download for Windows', url: cfg.RELEASES_URL },
  };

  function pickAsset(assets, exts) {
    for (const a of assets) {
      if (exts.some((e) => a.name.toLowerCase().endsWith(e)))
        return a.browser_download_url;
    }
    return null;
  }

  function applyDownloads() {
    const primary = isWin ? state.win : state.mac;

    // All buttons that show the OS-specific label
    ['heroDownload', 'calloutDownload'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.href = primary.url;
      const lbl = el.querySelector('.dl-label');
      if (lbl) lbl.textContent = primary.label;
      else el.textContent = primary.label;
    });

    // Explicit platform buttons
    set('dlMac', state.mac.url);
    set('dlWin', state.win.url);
  }

  applyDownloads();

  // Fetch latest release assets from GitHub API
  fetch(`https://api.github.com/repos/${cfg.REPO}/releases/latest`)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      const assets = rel.assets || [];
      const dmg = pickAsset(assets, ['.dmg']);
      const exe = pickAsset(assets, ['.exe']);
      if (dmg) state.mac.url = dmg;
      if (exe) state.win.url = exe;
      applyDownloads();
    })
    .catch(() => { /* keep releases-page fallback */ });

  // ─── Mobile nav toggle ─────────────────────────────────────────
  const toggle    = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  // ─── FAQ accordion ─────────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;

    // Set initial height for pre-opened item
    if (item.classList.contains('open')) {
      a.style.maxHeight = a.scrollHeight + 'px';
      q.setAttribute('aria-expanded', 'true');
    }

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      document.querySelectorAll('.faq-item.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle this one
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = isOpen ? null : a.scrollHeight + 'px';
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ─── Motion animations ─────────────────────────────────────────
  (function initMotion() {
    const M = window.Motion;
    if (!M) return; // CDN failed — .no-motion CSS fallback handles visibility

    const { animate, inView, stagger } = M;

    // Easing curves
    const ease = [0.25, 0.46, 0.45, 0.94];   // ease-out quad
    const expo = [0.16, 1, 0.3, 1];            // expo-out — premium feel

    // ── Hero (fires immediately on load) ──────────────────────────
    animate('.hero-content',
      { opacity: [0, 1], y: [24, 0] },
      { duration: 0.7, delay: 0.08, ease: expo }
    );
    animate('.hero-visual',
      { opacity: [0, 1], y: [32, 0], scale: [0.97, 1] },
      { duration: 0.9, delay: 0.28, ease: expo }
    );

    // Floating badges staggered after hero
    const floats = document.querySelectorAll('.hero-float');
    floats.forEach((el, i) => {
      animate(el,
        { opacity: [0, 1], scale: [0.8, 1], y: [8, 0] },
        { duration: 0.4, delay: 0.6 + i * 0.08, ease }
      );
    });

    // ── Proof / How it works ──────────────────────────────────────
    inView('.proof-section', () => {
      animate([
        ['.proof-section .section-eyebrow', { opacity: [0, 1], y: [8, 0] },  { duration: 0.4, ease }],
        ['.proof-section h2',               { opacity: [0, 1], y: [22, 0] }, { duration: 0.55, at: '-0.2', ease: expo }],
        ['.proof-section .proof-sub',       { opacity: [0, 1], y: [12, 0] }, { duration: 0.45, at: '-0.2', ease }],
      ]);
      const panels = document.querySelectorAll('.split-panel');
      if (panels[0]) animate(panels[0], { opacity: [0, 1], x: [-36, 0] }, { duration: 0.7, delay: 0.42, ease: expo });
      if (panels[1]) animate(panels[1], { opacity: [0, 1], x: [36, 0]  }, { duration: 0.7, delay: 0.42, ease: expo });
      animate('.split-divider', { opacity: [0, 1] }, { duration: 0.3, delay: 0.7 });
    }, { amount: 0.12 });

    // ── Features header ───────────────────────────────────────────
    inView('.features-header', () => {
      animate([
        ['.features-header .section-eyebrow', { opacity: [0, 1], y: [8, 0] },  { duration: 0.4, ease }],
        ['.features-header h2',               { opacity: [0, 1], y: [20, 0] }, { duration: 0.55, at: '-0.2', ease: expo }],
        ['.features-header p',                { opacity: [0, 1], y: [12, 0] }, { duration: 0.45, at: '-0.2', ease }],
      ]);
    }, { amount: 0.2 });

    // ── Feature cards (staggered) ─────────────────────────────────
    inView('.features-grid', () => {
      animate('.feature-card',
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.5, delay: stagger(0.07), ease }
      );
    }, { amount: 0.05 });

    // ── Notes Manager ─────────────────────────────────────────────
    inView('.manager-section', () => {
      animate('.manager-text',
        { opacity: [0, 1], x: [-24, 0] },
        { duration: 0.65, ease: expo }
      );
      animate('.manager-visual',
        { opacity: [0, 1], x: [24, 0] },
        { duration: 0.65, ease: expo }
      );
    }, { amount: 0.12 });

    // ── Privacy ───────────────────────────────────────────────────
    inView('.privacy-section', () => {
      animate('.privacy-panel',
        { opacity: [0, 1], scale: [0.98, 1], y: [16, 0] },
        { duration: 0.6, ease: expo }
      );
    }, { amount: 0.12 });

    // ── Shortcuts ─────────────────────────────────────────────────
    inView('.shortcuts-section', () => {
      animate([
        ['.shortcuts-text', { opacity: [0, 1], x: [-20, 0] }, { duration: 0.55, ease: expo }],
        ['.shortcut-table', { opacity: [0, 1], x: [20, 0] },  { duration: 0.55, at: '<', ease: expo }],
      ]);
    }, { amount: 0.15 });

    // ── FAQ ───────────────────────────────────────────────────────
    inView('.faq-section', () => {
      animate([
        ['.faq-header .section-eyebrow', { opacity: [0, 1], y: [8, 0] },  { duration: 0.4, ease }],
        ['.faq-header h2',               { opacity: [0, 1], y: [20, 0] }, { duration: 0.5, at: '-0.2', ease: expo }],
        ['.faq-header p',                { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, at: '-0.2', ease }],
        ['.faq-container',               { opacity: [0, 1], y: [16, 0] }, { duration: 0.5, at: '-0.15', ease: expo }],
        ['.faq-contact',                 { opacity: [0, 1], y: [10, 0] }, { duration: 0.4, at: '-0.1', ease }],
      ]);
    }, { amount: 0.06 });

    // ── Bottom CTA ────────────────────────────────────────────────
    inView('.callout-section', () => {
      animate('.callout-panel',
        { opacity: [0, 1], y: [24, 0] },
        { duration: 0.65, ease: expo }
      );
    }, { amount: 0.15 });

    // ── Footer ────────────────────────────────────────────────────
    inView('.site-footer', () => {
      animate('.footer-panel',
        { opacity: [0, 1] },
        { duration: 0.5 }
      );
    }, { amount: 0.08 });

    // ── Generic .reveal elements ──────────────────────────────────
    inView('.reveal', (el) => {
      animate(el,
        { opacity: [0, 1], y: [12, 0] },
        { duration: 0.5, ease }
      );
    }, { amount: 0.25 });

  })();

})();
