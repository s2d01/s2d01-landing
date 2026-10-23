(() => {
  'use strict';
  const ga = 'G-8R69M3DQYM';
  const ads = 'AW-11465969104';
  const key = 's2d01-cookie-consent-v1';
  const lifetime = 180 * 86400000;
  const it = document.documentElement.lang.toLowerCase().startsWith('it');
  let choice = { analytics: false, ads: false };
  let saved = false;
  let loaded = false;
  let analyticsStarted = false;
  let adsStarted = false;
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (data && typeof data.analytics === 'boolean' && typeof data.ads === 'boolean' &&
        data.at <= Date.now() && Date.now() - data.at < lifetime) {
      choice = { analytics: data.analytics, ads: data.ads }; saved = true;
    }
  } catch (_) {}
  const text = it ? {
    title: 'Cookie facoltativi',
    intro: 'Possiamo usare cookie per le statistiche di Google Analytics e la misurazione pubblicitaria di Google Ads? Sono disattivati finché non scegli. Il sito funziona anche se rifiuti.',
    details: 'Informazioni e scelta personalizzata',
    info: 'Simone Cappelli (S2D01) usa Google Analytics 4 per misurare visite e Google Ads per misurare le conversioni dei link Spotify. I servizi sono forniti da Google. Le due finalità si possono scegliere separatamente. Non inviamo contenuti dei moduli. La scelta viene conservata in questo browser per 180 giorni e può essere modificata da “Preferenze cookie”. I cookie analitici sono impostati con durata massima di 180 giorni.',
    analytics: 'Statistiche (Google Analytics)', ads: 'Misurazione pubblicitaria (Google Ads)',
    reject: 'Rifiuta tutto', accept: 'Accetta tutto', save: 'Salva la selezione',
    privacy: 'Informativa privacy di Google', contact: 'Per informazioni'
  } : {
    title: 'Optional cookies',
    intro: 'May we use cookies for Google Analytics statistics and Google Ads advertising measurement? Both stay off until you choose. The website works if you reject.',
    details: 'Information and custom choices',
    info: 'Simone Cappelli (S2D01) uses Google Analytics 4 to measure visits and Google Ads to measure Spotify link conversions. These services are provided by Google. You can choose each purpose separately. We do not send form contents. Your choice is stored in this browser for 180 days and can be changed using “Cookie preferences”. Analytics cookies have a maximum lifetime of 180 days.',
    analytics: 'Statistics (Google Analytics)', ads: 'Advertising measurement (Google Ads)',
    reject: 'Reject all', accept: 'Accept all', save: 'Save selection',
    privacy: 'Google privacy policy', contact: 'For questions'
  };
  const panel = document.createElement('section');
  panel.className = 's2-consent';
  panel.setAttribute('aria-labelledby', 's2-consent-heading');
  panel.innerHTML = `<h2 id="s2-consent-heading">${text.title}</h2><p>${text.intro}</p>
    <details><summary>${text.details}</summary><p>${text.info}</p>
    <p>${text.contact}: <a href="mailto:info@s2d01.org">info@s2d01.org</a>. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">${text.privacy}</a>.</p>
    <label><input type="checkbox" id="s2-analytics">${text.analytics}</label>
    <label><input type="checkbox" id="s2-ads">${text.ads}</label>
    <button type="button" id="s2-save">${text.save}</button></details>
    <div class="s2-consent-actions"><button type="button" id="s2-reject">${text.reject}</button><button type="button" id="s2-accept">${text.accept}</button></div>`;
  document.body.appendChild(panel);
  const statsBox = document.getElementById('s2-analytics');
  const adsBox = document.getElementById('s2-ads');
  const settings = document.getElementById('s2d01-cookie-settings');

  function clearCookies(analytics, advertising) {
    document.cookie.split(';').forEach(part => {
      const name = part.trim().split('=')[0];
      if (!(analytics && (name === '_ga' || name.startsWith('_ga_'))) &&
          !(advertising && name.startsWith('_gcl_'))) return;
      ['', '; domain=s2d01.org', '; domain=.s2d01.org', '; domain=' + location.hostname].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
      });
    });
  }
  function start() {
    window['ga-disable-' + ga] = !choice.analytics;
    window['ga-disable-' + ads] = !choice.ads;
    clearCookies(!choice.analytics, !choice.ads);
    if ((!choice.analytics && !choice.ads) || !['s2d01.org', 'www.s2d01.org'].includes(location.hostname)) return;
    if (!loaded) {
      loaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      window.gtag('js', new Date());
    }
    window.gtag('consent', 'update', {
      analytics_storage: choice.analytics ? 'granted' : 'denied',
      ad_storage: choice.ads ? 'granted' : 'denied',
      ad_user_data: choice.ads ? 'granted' : 'denied',
      ad_personalization: 'denied'
    });
    let referrer = '';
    try { referrer = new URL(document.referrer).origin; } catch (_) {}
    const options = {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_domain: 's2d01.org', cookie_expires: 15552000, cookie_update: false,
      page_location: location.origin + location.pathname, page_referrer: referrer
    };
    if (choice.analytics && !analyticsStarted) {
      analyticsStarted = true; window.gtag('config', ga, options);
    }
    if (choice.ads && !adsStarted) {
      adsStarted = true; window.gtag('config', ads, options);
    }
    if (!document.getElementById('s2-google-tag')) {
      const script = document.createElement('script');
      script.id = 's2-google-tag'; script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + (choice.analytics ? ga : ads);
      document.head.appendChild(script);
    }
  }
  function save(next) {
    const withdrawn = (choice.analytics && !next.analytics) || (choice.ads && !next.ads);
    choice = next;
    try { localStorage.setItem(key, JSON.stringify({ ...choice, at: Date.now() })); } catch (_) {}
    panel.hidden = true;
    start();
    if (withdrawn && loaded) location.reload();
    settings.focus();
  }
  document.getElementById('s2-reject').addEventListener('click', () => save({ analytics: false, ads: false }));
  document.getElementById('s2-accept').addEventListener('click', () => save({ analytics: true, ads: true }));
  document.getElementById('s2-save').addEventListener('click', () => save({ analytics: statsBox.checked, ads: adsBox.checked }));
  settings.addEventListener('click', () => {
    statsBox.checked = choice.analytics; adsBox.checked = choice.ads;
    panel.hidden = false; document.getElementById('s2-reject').focus();
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!choice.ads || !adsStarted || !link) return;
    let url;
    try { url = new URL(link.href); } catch (_) { return; }
    if (url.hostname === 'open.spotify.com') window.gtag('event', 'conversion', {
      send_to: 'AW-11465969104/1XtjCOeB9e4aENCbs9sq', value: 1.0, currency: 'EUR'
    });
  });
  statsBox.checked = choice.analytics; adsBox.checked = choice.ads;
  panel.hidden = saved;
  start();
})();
