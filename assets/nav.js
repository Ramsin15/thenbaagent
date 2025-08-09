// /assets/nav.js
(function () {
  // Inject CSS so we don’t rely on <link> placement
  const css = `
    html,body{overflow-x:hidden}
    @media (min-width:901px){
      .mobile-overlay{display:none!important}
    }
    @media (max-width:900px){
      body.nav-open{overflow:hidden}
      .nav .links{display:none} /* hide desktop list on mobile */
      .hamburger{
        display:inline-flex; -webkit-tap-highlight-color:transparent;
        width:44px;height:44px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:#fff;
        align-items:center;justify-content:center
      }
      .hamburger span{display:block;width:20px;height:2px;background:#0b0b0b;margin:2.5px 0;transition:transform .25s,opacity .25s}
      .hamburger[aria-expanded="true"] span:nth-child(1){transform:translateY(4.5px) rotate(45deg)}
      .hamburger[aria-expanded="true"] span:nth-child(2){opacity:0}
      .hamburger[aria-expanded="true"] span:nth-child(3){transform:translateY(-4.5px) rotate(-45deg)}
      .mobile-overlay[hidden]{display:none!important}
      .mobile-overlay{position:fixed;inset:0;z-index:9999}
      .overlay-backdrop{position:absolute;inset:0;background:rgba(128,128,128,.8);border:0;padding:0;margin:0}
      .overlay-inner{position:absolute;inset:0;display:grid;grid-template-rows:var(--topbar,64px) 1fr;color:#fff;pointer-events:none}
      .overlay-inner::before{content:"";display:block;height:var(--topbar,64px)}
      .overlay-nav{pointer-events:auto}
      .overlay-links{list-style:none;margin:0;padding:18px;display:grid;gap:6px}
      .overlay-links>li>a{display:block;padding:14px 4px;font-size:22px;color:#fff;text-decoration:none}
      .overlay-accordion{-webkit-tap-highlight-color:transparent;width:100%;display:flex;align-items:center;justify-content:space-between;padding:14px 4px;font-size:22px;color:#fff;background:transparent;border:0;text-align:left;cursor:pointer}
      .overlay-accordion .car{width:14px;height:14px;border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg);transition:transform .2s}
      .overlay-accordion[aria-expanded="true"] .car{transform:rotate(135deg)}
      .overlay-sub{list-style:none;margin:0;padding:0 0 8px 10px;display:none}
      .overlay-sub.open{display:block}
      .overlay-sub a{display:block;padding:10px 4px;font-size:18px;color:#fff;text-decoration:none;opacity:.95}
    }
  `;
  const style = document.createElement('style'); style.id = 'nav-overlay-style'; style.textContent = css;
  document.head.appendChild(style);

  // Setup function (safe to call multiple times)
  function setupHeader(navWrap) {
    if (!navWrap || navWrap.__navReady) return;
    const hamb = navWrap.querySelector('[data-nav-toggle]');
    const desktopList = navWrap.querySelector('[data-navlist]');
    if (!hamb || !desktopList) return;

    // Build overlay once
    let overlay = navWrap.querySelector('.mobile-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'mobile-overlay';
      overlay.setAttribute('aria-hidden','true');
      overlay.hidden = true;
      overlay.innerHTML = `
        <div class="overlay-inner" role="dialog" aria-modal="true" aria-label="Site Menu">
          <nav class="overlay-nav">
            <ul class="overlay-links"></ul>
          </nav>
        </div>
        <button class="overlay-backdrop" aria-label="Close menu"></button>
      `;
      navWrap.appendChild(overlay);
    }
    const overlayLinks = overlay.querySelector('.overlay-links');
    overlayLinks.innerHTML = '';

    // Clone desktop list into overlay
    desktopList.querySelectorAll(':scope > li').forEach((li) => {
      const mobileLi = document.createElement('li');
      if (li.classList.contains('has-sub')) {
        const labelA = li.querySelector(':scope > a');
        const btn = document.createElement('button');
        btn.className = 'overlay-accordion'; btn.setAttribute('aria-expanded','false');
        btn.innerHTML = `<span>${labelA ? labelA.textContent : 'Players'}</span><i class="car"></i>`;
        mobileLi.appendChild(btn);
        const sub = document.createElement('ul'); sub.className = 'overlay-sub';
        li.querySelectorAll(':scope > .sub > li > a').forEach(a => {
          const sLi = document.createElement('li');
          const sA = document.createElement('a'); sA.href = a.href; sA.textContent = a.textContent;
          sLi.appendChild(sA); sub.appendChild(sLi);
        });
        mobileLi.appendChild(sub);
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', open ? 'false' : 'true');
          sub.classList.toggle('open', !open);
        });
      } else {
        const a = li.querySelector('a');
        if (a) {
          const aM = document.createElement('a'); aM.href = a.href; aM.textContent = a.textContent;
          mobileLi.appendChild(aM);
        }
      }
      overlayLinks.appendChild(mobileLi);
    });

    const backdrop = overlay.querySelector('.overlay-backdrop');
    const overlayNav = overlay.querySelector('.overlay-nav');

    function syncTopbarHeight(){
      const rect = navWrap.getBoundingClientRect();
      overlay.style.setProperty('--topbar', Math.round(rect.height) + 'px');
    }
    function openMenu(){
      syncTopbarHeight();
      overlay.hidden = false;
      overlay.setAttribute('aria-hidden','false');
      document.body.classList.add('nav-open');
      hamb.setAttribute('aria-expanded','true');
    }
    function closeMenu(){
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden','true');
      document.body.classList.remove('nav-open');
      hamb.setAttribute('aria-expanded','false');
      overlay.querySelectorAll('.overlay-accordion').forEach(b=>{
        b.setAttribute('aria-expanded','false');
      });
      overlay.querySelectorAll('.overlay-sub').forEach(s=>s.classList.remove('open'));
    }

    hamb.addEventListener('click', () => {
      const expanded = hamb.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    overlayNav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    window.addEventListener('resize', () => { if (!overlay.hidden) syncTopbarHeight(); });

    navWrap.__navReady = true; // mark initialized
  }

  // Initialize now if header already on page
  document.querySelectorAll('.nav-wrap').forEach(setupHeader);

  // Also observe DOM for dynamically injected headers
  const mo = new MutationObserver(() => {
    document.querySelectorAll('.nav-wrap').forEach(setupHeader);
  });
  mo.observe(document.documentElement, {childList:true, subtree:true});
})();
