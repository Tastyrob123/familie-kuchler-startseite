/* Familie Kuchler · Familienseite, Fassung 2
   1 Lader · 2 Schlitz-Zeilen · 3 Auftritte am Rand · 4 Jahreszahlen · 5 Zeitleiste der zwei Ufer · 6 Auftakt · 7 Leiste · 8 Reservieren */
(() => {
  const ruhig = document.documentElement.classList.contains('ruhig');
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];

  /* 1 Lader: drei Bildschirme voraus, nach dem Laden der Seite alle übrigen der Reihe nach, damit sie dastehen, bevor man hinkommt */
  const lade = img => { if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.src = img.dataset.src; delete img.dataset.srcset; } };
  const vorIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { lade(e.target); vorIO.unobserve(e.target); } }), { rootMargin: '300% 0px 300% 0px' });
  $$('img[data-srcset]').forEach(i => vorIO.observe(i));
  addEventListener('load', () => {
    const rest = $$('img[data-srcset]'); let n = 0;
    const weiter = () => {
      const los = rest.slice(n, n + 4); n += 4; if (!los.length) return;
      let offen = los.length; const eins = () => { if (--offen === 0) setTimeout(weiter, 80); };
      los.forEach(i => { if (!i.dataset.srcset) { eins(); return; } i.addEventListener('load', eins, { once: true }); i.addEventListener('error', eins, { once: true }); lade(i); });
    };
    setTimeout(weiter, 600);
  });

  /* 2 Schlitz: Zeilen nach dem echten Umbruch */
  const schlitz = el => {
    const teile = [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(w => w && teile.push({ w, em: false }));
      else if (n.nodeType === 1) n.textContent.split(/(\s+)/).forEach(w => w && teile.push({ w, em: true }));
    });
    el.innerHTML = teile.map(t => /^\s+$/.test(t.w) ? ' ' : `<span class="w${t.em ? ' e' : ''}">${t.w}</span>`).join('');
    const zeilen = []; let top = null;
    $$('.w', el).forEach(w => { const o = w.offsetTop; if (top === null || Math.abs(o - top) > 4) { zeilen.push([]); top = o; } zeilen[zeilen.length - 1].push(w); });
    el.innerHTML = zeilen.map((z, i) => `<span class="z" style="--zi:${i}"><span>${z.map(w => w.classList.contains('e') ? `<em>${w.textContent}</em>` : w.textContent).join(' ').replace(/<\/em> <em>/g, ' ')}</span></span>`).join('');
  };
  const titel = $$('[data-schlitz]');
  const rohe = new Map(titel.map(t => [t, t.innerHTML]));
  const setze = () => titel.forEach(t => { t.innerHTML = rohe.get(t); schlitz(t); });

  /* 4 Jahreszahlen: nur die letzten Schritte */
  const zahl = el => {
    const ziel = +el.dataset.z, start = ziel - 9, t0 = performance.now(), d = 1200;
    const schritt = t => { const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(start + (ziel - start) * e); if (p < 1) requestAnimationFrame(schritt); };
    requestAnimationFrame(schritt);
  };

  /* 3 Auftritte: sobald ein Stück den unteren Rand erreicht */
  const auftritt = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; auftritt.unobserve(el);
    el.classList.add('da');
    if (el.dataset.z && !ruhig) zahl(el);
  }), { rootMargin: '0px 0px -3% 0px', threshold: 0 });
  const fensterIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.querySelector('[data-fenster]').classList.add('da'); fensterIO.unobserve(e.target); }
  }), { rootMargin: '0px 0px -30% 0px', threshold: 0 });
  const beobachte = () => {
    $$('[data-m="t"]').forEach(el => { const g = $$(':scope > [data-m="t"]', el.parentElement); el.style.setProperty('--i', Math.max(0, g.indexOf(el))); });
    $$('main section:not(#auftakt) [data-m], main section:not(#auftakt) [data-schlitz]:not(.bruch__s), .faden, .zeit__achse i, .fuss [data-m]').forEach(el => auftritt.observe(el));
    $$('.bruch').forEach(b => fensterIO.observe(b));
    if (ruhig) $$('[data-m], [data-schlitz], .faden, .zeit__achse i, [data-fenster]').forEach(el => el.classList.add('da'));
  };

  /* 5 Zeitleiste: am Rechner zwei Ufer nebeneinander, jedes Stück so hoch wie möglich, ohne das vorige zu überdecken */
  const zeit = document.querySelector('[data-zeit]');
  const lege = () => {
    if (!zeit) return;
    const st = $$('.ze', zeit);
    if (innerWidth <= 900) { zeit.classList.remove('liegt'); $$('.ze--quer, .ze--oben', zeit).forEach(e => e.classList.remove('ze--quer', 'ze--oben')); zeit.style.height = ''; return; }
    zeit.classList.add('liegt');
    const unten = { s: 0, l: 0 }; let letzte = -1e9; const abstand = 64, schritt = 110, luft = 22, spiel = 160;
    st.forEach(el => {
      const s = el.classList.contains('ze--s') ? 's' : 'l', g = s === 's' ? 'l' : 's';
      const bild = el.querySelector('.ze__b');
      el.classList.remove('ze--quer', 'ze--oben');
      let t = Math.max(unten[s] + (unten[s] ? abstand : 0), letzte + schritt), art = '', bh = 0;
      if (bild) {
        el.classList.add('ze--quer'); bh = bild.offsetHeight; el.classList.remove('ze--quer');
        const eigen = unten[s] ? unten[s] + abstand : 0, gegen = unten[g] ? unten[g] + abstand : 0;
        /* Bild füllt die Leere: über der Tafel in der eigenen Spalte, wenn dort Platz ist, sonst auf der freien Gegenseite neben der Tafel */
        if (t - eigen >= bh + luft) { art = 'oben'; el.style.setProperty('--ob', (t - eigen) + 'px'); }
        else if (gegen <= t + spiel) { art = 'quer'; t = Math.max(t, gegen); }
        if (art) el.classList.add('ze--' + art);
      }
      el.style.setProperty('--t', t + 'px');
      unten[s] = t + el.offsetHeight; letzte = t;
      if (art === 'quer') unten[g] = t + bh;
    });
    zeit.style.height = Math.max(unten.s, unten.l) + 'px';
  };

  /* 6 Auftakt: öffnet sich von selbst, sobald Schrift und erstes Bild da sind */
  const auftakt = document.getElementById('auftakt');
  const oeffne = () => { auftakt.classList.add('da'); $$('[data-m], [data-schlitz]', auftakt).forEach(el => el.classList.add('da')); };

  /* Erster Blick komplett: die Seite bleibt unsichtbar, bis alle sechs Auftakt-Bilder geladen sind (nur load), dann alles in einem Moment */
  const geladen = i => i.complete && i.naturalWidth ? Promise.resolve() : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
  const los = () => {
    setze(); lege(); beobachte();
    Promise.race([Promise.all($$('img', auftakt).map(geladen)), new Promise(r => setTimeout(r, 4000))])
      .then(() => { document.documentElement.classList.remove('wartet'); oeffne(); });
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(los);
  let breite = innerWidth;
  addEventListener('resize', () => { if (Math.abs(innerWidth - breite) > 30) { breite = innerWidth; setze(); $$('[data-schlitz]').forEach(t => t.closest('.da, #auftakt.da') && t.classList.add('da')); lege(); } });

  /* 7 Leiste: weg beim Hinunterscrollen, zurück beim Hinaufscrollen, fest ab dem Ende des Auftakts */
  const leiste = document.getElementById('leiste');
  let y0 = scrollY, tick = false;
  const lage = () => {
    const y = scrollY, h = auftakt.offsetHeight - 80;
    leiste.classList.toggle('fest', y > h);
    if (y > h && y > y0 + 4) leiste.classList.add('weg');
    else if (y < y0 - 4 || y < h) leiste.classList.remove('weg');
    y0 = y; tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(lage); } }, { passive: true });

  /* 8 Reservieren: Wahl des Hauses */
  const wahl = document.getElementById('wahl');
  $$('[data-buchen]').forEach(b => b.addEventListener('click', () => { $$('img[data-srcset]', wahl).forEach(lade); wahl.showModal ? wahl.showModal() : wahl.setAttribute('open', ''); }));
  wahl.querySelector('[data-zu]').addEventListener('click', () => wahl.close());
  wahl.addEventListener('click', e => { if (e.target === wahl) wahl.close(); });
})();
