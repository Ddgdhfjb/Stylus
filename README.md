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

## Update

Stylus prüft automatisch anhand der `@updateURL` im Style-Header auf neue Versionen. Beim Veröffentlichen einer neuen Version die `@version` in [bahn-expert-redesign.user.css](bahn-expert-redesign.user.css) erhöhen.

## Lizenz

[CC-BY-SA-4.0](LICENSE)
