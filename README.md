# Bahn Expert Redesign

Ein [Stylus](https://github.com/openstyles/stylus)-Userstyle, das die Oberfläche von [bahn.expert](https://bahn.expert) neu gestaltet: abgerundete Ecken, angepasster Innenabstand, eine eigene Akzentfarbe sowie überarbeitete Sidebar-, Header- und Zugansicht-Elemente.

## Installation

1. [Stylus](https://github.com/openstyles/stylus) für deinen Browser installieren ([Chrome](https://chromewebstore.google.com/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne), [Firefox](https://addons.mozilla.org/firefox/addon/styl-us/)).
2. Auf die [Raw-Datei](https://raw.githubusercontent.com/Ddgdhfjb/Stylus/main/bahn-expert-redesign.user.css) dieses Styles gehen.
3. Stylus erkennt die Datei automatisch und bietet die Installation an – oder in Stylus manuell über **Style importieren** die Datei einfügen.

## Einstellungen

Im Stylus-Konfigurationsdialog des Styles lassen sich anpassen:

| Variable       | Beschreibung   | Standard |
|----------------|----------------|----------|
| `borderRadius` | Border-Radius  | `5px`    |
| `padding`      | Innenabstand   | `5px`    |
| `spezialRot`   | Akzentfarbe    | `#EC0016`|

## Live-Vorschau während der Entwicklung

Zum Testen von Änderungen, ohne Stylus jedes Mal neu zu installieren:

1. Einmalig Abhängigkeiten installieren: `npm install`
2. Preview-Server starten:
   - VS Code: **Run and Debug** → **Stylus Preview-Server starten** (▶), oder
   - Terminal: `npm run dev` (bzw. `node tools/dev-server.mjs`)
2. Einmalig `https://localhost:5678/style.css` direkt im Browser öffnen und die Sicherheitswarnung des selbstsignierten Zertifikats bestätigen ("Erweitert" → "Trotzdem fortfahren"). Ohne diesen Schritt blockiert der Browser den Abruf von einer HTTPS-Seite aus als Mixed Content.
3. [bahn.expert](https://bahn.expert) öffnen und in der Browser-Konsole (F12) ausführen:
   ```js
   fetch("https://localhost:5678/inject.js").then(r => r.text()).then(eval)
   ```
4. Datei speichern → die Seite übernimmt Änderungen automatisch (Polling alle 1,5s), ohne Reload.

Der Server liest `bahn-expert-redesign.user.css` live von der Platte, generiert sich beim ersten Start ein lokales HTTPS-Zertifikat (`tools/.certs/`, nicht versioniert) und liefert die Datei unter `https://localhost:5678/style.css` aus; `tools/inject.js` wandelt das UserCSS-Format (Header, `@var`-Standardwerte, `@-moz-document`-Blöcke) automatisch in reguläres CSS um.

Falls `npm install` übersprungen wurde, fällt der Server auf HTTP zurück (Auto-Refresh funktioniert dann nicht, da `bahn.expert` als HTTPS-Seite den Zugriff als Mixed Content blockiert) – als Alternative den Inhalt von `bahn-expert-redesign.user.css` manuell in die Konsole kopieren.

## Update

Stylus prüft automatisch anhand der `@updateURL` im Style-Header auf neue Versionen. Beim Veröffentlichen einer neuen Version die `@version` in [bahn-expert-redesign.user.css](bahn-expert-redesign.user.css) erhöhen.

## Lizenz

[CC-BY-SA-4.0](LICENSE)
