/* Bildwahl in der echten Seite: an jeder doppelten Stelle Pfeile links und rechts, unten links die Übersicht der Wahl */
(() => {
  const D = window.BILDWAHL, wahl = {};
  const panel = document.createElement('aside'); panel.className = 'bwp';
  panel.innerHTML = '<p class="bwp__t">Bildwahl</p><ol class="bwp__l"></ol>';
  document.body.appendChild(panel);
  const liste = panel.querySelector('.bwp__l');
  const finde = st => {
    for (const c of document.querySelectorAll(st.sel)) for (const i of c.querySelectorAll('img')) {
      const s = i.dataset.src || i.getAttribute('src') || '';
      if (s.includes('/' + st.key + '-')) return i;
    }
    return null;
  };
  D.stellen.forEach(st => {
    const img = finde(st); if (!img) return;
    const box = img.parentElement;
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    box.id = 'bw-' + st.nr;
    const reihe = [st.heute, ...D.kand[st.haus]];
    let i = 0, orig = null;
    const ui = document.createElement('div'); ui.className = 'bw';
    ui.innerHTML = '<button type="button" class="bw__p bw__p--l" aria-label="Voriges Foto"><svg viewBox="0 0 16 10"><path d="M16 5H2M6 1L2 5l4 4"/></svg></button><button type="button" class="bw__p bw__p--r" aria-label="Nächstes Foto"><svg viewBox="0 0 16 10"><path d="M0 5h14M10 1l4 4-4 4"/></svg></button><span class="bw__s"></span>';
    box.appendChild(ui);
    const zeile = document.createElement('li');
    zeile.innerHTML = `<a href="#bw-${st.nr}" title="${st.name} (${st.auch})"><b>${st.nr}</b><em></em></a>`;
    liste.appendChild(zeile);
    zeile.querySelector('a').addEventListener('click', ev => { ev.preventDefault(); box.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    const zeig = () => {
      const k = reihe[i];
      if (!orig) orig = { srcset: img.dataset.srcset || img.getAttribute('srcset') || '', src: img.dataset.src || img.getAttribute('src') };
      delete img.dataset.srcset;
      if (i === 0) { img.srcset = orig.srcset; img.src = orig.src; }
      else { img.removeAttribute('srcset'); img.src = k.src; }
      const r = box.getBoundingClientRect(), noetig = r.width * 2;
      const breit = k.w / k.h > r.width / r.height ? k.h * r.width / r.height : k.w;
      const schaerfe = breit >= noetig * .9 ? 'scharf' : breit >= noetig * .6 ? 'etwas weich' : 'weich';
      const name = i === 0 ? 'heute' : k.n;
      ui.querySelector('.bw__s').innerHTML = `<b>${st.nr}</b> · ${name} <i>${i} / ${reihe.length - 1}</i> <u class="${schaerfe.replace(' ', '-')}">${schaerfe}</u>`;
      wahl[st.nr] = name;
      const em = zeile.querySelector('em'); em.textContent = name; em.className = i === 0 ? '' : 'neu';
    };
    ui.querySelector('.bw__p--l').addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); i = (i - 1 + reihe.length) % reihe.length; zeig(); });
    ui.querySelector('.bw__p--r').addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); i = (i + 1) % reihe.length; zeig(); });
    zeig();
  });
})();
