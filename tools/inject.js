// Stylus Dev Preview – holt bahn-expert-redesign.user.css vom lokalen dev-server.mjs,
// wandelt das UserCSS-Format (Header, @var, @-moz-document) in normales CSS um
// und aktualisiert die Vorschau alle 1,5s live. In der Browser-Konsole auf bahn.expert ausführen:
//   fetch("https://localhost:5678/inject.js").then(r => r.text()).then(eval)
// Einmalig vorher https://localhost:5678/style.css öffnen und das selbstsignierte
// Zertifikat im Browser bestätigen, sonst blockiert der Browser den fetch().
(function () {
  const SERVER = window.__STYLUS_DEV_SERVER__ || 'https://localhost:5678';
  const STYLE_TAG_ID = 'stylus-dev-preview';

  function parseVars(header) {
    const vars = {};
    const re = /@var\s+(\w+)\s+(\S+)\s+"[^"]*"\s+(.+)/g;
    let m;
    while ((m = re.exec(header))) {
      const [, type, name, rawValue] = m;
      const value = rawValue.trim();
      if (type === 'range') {
        const arr = value.match(/\[([^\]]*)\]/);
        if (arr) {
          const parts = arr[1].split(',').map((p) => p.trim().replace(/^'|'$/g, ''));
          const [def, , , , unit = ''] = parts;
          vars[name] = `${def}${unit}`;
        }
      } else if (type === 'color') {
        vars[name] = value.split(/\s+/)[0];
      } else if (type === 'text') {
        const str = value.match(/"([^"]*)"/);
        if (str) vars[name] = str[1];
      } else if (type === 'checkbox') {
        vars[name] = value.trim();
      }
      // select/dropdown u.a. werden für die Vorschau ignoriert (nicht relevant für Standardwerte)
    }
    return vars;
  }

  function matchesCondition(fn, arg, href) {
    const url = new URL(href);
    if (fn === 'domain') {
      return url.hostname === arg || url.hostname.endsWith(`.${arg}`);
    }
    if (fn === 'url') {
      return href === arg;
    }
    if (fn === 'url-prefix') {
      return href.startsWith(arg);
    }
    if (fn === 'regexp') {
      try {
        return new RegExp(arg).test(href);
      } catch {
        return false;
      }
    }
    return false;
  }

  // @-moz-document nimmt eine kommagetrennte Liste von domain()/url()/url-prefix()/regexp()
  // Bedingungen – wie bei Stylus/Firefox gilt OR-Verknüpfung: reicht eine passende Bedingung.
  function selectorMatches(selectorList, href) {
    const re = /([\w-]+)\(\s*"([^"]*)"\s*\)/g;
    let m;
    let found = false;
    while ((m = re.exec(selectorList))) {
      found = true;
      if (matchesCondition(m[1], m[2], href)) return true;
    }
    return !found; // kein erkennbarer Selector -> sicherheitshalber nicht filtern
  }

  function unwrapMozDocument(css, href) {
    let out = '';
    let i = 0;
    while (i < css.length) {
      const idx = css.indexOf('@-moz-document', i);
      if (idx === -1) {
        out += css.slice(i);
        break;
      }
      out += css.slice(i, idx);
      const braceStart = css.indexOf('{', idx);
      if (braceStart === -1) {
        out += css.slice(idx);
        break;
      }
      const selectorList = css.slice(idx + '@-moz-document'.length, braceStart);
      let depth = 1;
      let j = braceStart + 1;
      while (j < css.length && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      if (selectorMatches(selectorList, href)) {
        out += css.slice(braceStart + 1, j - 1);
      }
      i = j;
    }
    return out;
  }

  async function refresh() {
    let raw;
    try {
      raw = await fetch(`${SERVER}/style.css`, { cache: 'no-store' }).then((r) => r.text());
    } catch (err) {
      console.error('[stylus-dev-preview] Konnte CSS nicht laden – läuft der Server?', err);
      return;
    }

    const headerMatch = raw.match(/\/\*\s*==UserStyle==([\s\S]*?)==\/UserStyle==\s*\*\//);
    const header = headerMatch ? headerMatch[1] : '';
    const body = headerMatch ? raw.slice(headerMatch.index + headerMatch[0].length) : raw;

    const vars = parseVars(header);
    const varsCss = Object.keys(vars).length
      ? `:root {\n${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join('\n')}\n}\n`
      : '';

    const finalCss = varsCss + unwrapMozDocument(body, location.href);

    let style = document.getElementById(STYLE_TAG_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_TAG_ID;
      document.head.appendChild(style);
    }
    if (style.textContent !== finalCss) {
      style.textContent = finalCss;
      console.log('[stylus-dev-preview] aktualisiert', new Date().toLocaleTimeString());
    }
  }

  if (window.__stylusDevInterval) clearInterval(window.__stylusDevInterval);
  refresh();
  window.__stylusDevInterval = setInterval(refresh, 1500);
  console.log(`[stylus-dev-preview] aktiv, pollt ${SERVER}/style.css alle 1.5s`);
})();
