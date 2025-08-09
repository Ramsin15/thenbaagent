async function inject(id){
  const el = document.getElementById(id);
  if(!el) return;
  const src = el.getAttribute('data-src');
  const res = await fetch(src, { cache: 'no-cache' });
  el.innerHTML = await res.text();
}

(async () => {
  await Promise.all([inject('site-header'), inject('site-footer')]);

  // Active link highlight
  const path = location.pathname.replace(/\/+$/,'');
  document.querySelectorAll('.links a').forEach(a=>{
    const href = (a.getAttribute('href')||'').replace(/\/+$/,'');
    if (href && (href===path || (href!=='/' && path.startsWith(href)))) a.classList.add('active');
  });

  // Dropdown click/tap + outside close
  document.querySelectorAll('.has-sub > .caret').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.preventDefault();
      const item = e.currentTarget.closest('.has-sub');
      const willOpen = !item.classList.contains('open');
      document.querySelectorAll('.has-sub.open').forEach(el=>el.classList.remove('open'));
      if (willOpen) item.classList.add('open');
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', e=>{
    if(!e.target.closest('.has-sub')){
      document.querySelectorAll('.has-sub.open').forEach(el=>el.classList.remove('open'));
      document.querySelectorAll('.has-sub .caret').forEach(c=>c.setAttribute('aria-expanded','false'));
    }
  });

  // Mobile hamburger
  const burger = document.querySelector('.hamburger');
  const navlist = document.querySelector('[data-navlist]');
  if (burger && navlist){
    burger.addEventListener('click', ()=>{
      const open = navlist.classList.toggle('show');
      burger.setAttribute('aria-expanded', String(open));
      document.querySelectorAll('.has-sub.open').forEach(el=>el.classList.remove('open'));
    });
  }
})();
