# Personal Dashboard

Übungsprojekt zum Onboarding-Dokument **GitHub Copilot: Grundlagen für den Einstieg**.

Ein einfaches persönliches Dashboard mit Uhrzeit, Wetter-Widget (noch Mock-Daten), Aufgabenliste und Notizen. Aufgaben und Notizen werden in `data/daten.json` gespeichert.

Kein Framework, kein Build-Schritt. Nur HTML, CSS und JavaScript mit ES-Modulen.

## Start

Voraussetzung: Node.js 20 oder neuer.

```bash
npm install     # installiert nur vitest
npm start       # Dashboard unter http://localhost:3000
npm test        # Tests einmalig ausführen
npm run test:watch
```

Das Dashboard lässt sich **nicht** durch Doppelklick auf `index.html` öffnen. Es braucht den Server aus `server.js`, weil ein Browser aus Sicherheitsgründen keine Dateien auf der Festplatte schreiben darf. Der Server liefert die Dateien aus und speichert `data/daten.json`.

## Struktur

```text
personal-dashboard/
├── index.html            Aufbau der Seite, vier Widgets
├── styles.css            Layout und Farben
├── server.js             kleiner Entwicklungsserver, GET und PUT /api/daten
├── js/
│   ├── main.js           einziger Ort mit DOM-Zugriff und Event-Handlern
│   ├── uhr.js            Uhr-Widget
│   ├── wetter.js         Wetter-Widget, liest data/wetter.mock.json
│   ├── aufgaben.js       reine Aufgabenlogik, kein DOM
│   ├── notizen.js        reine Notizenlogik, kein DOM
│   └── speicher.js       einziger Ort mit fetch auf /api/daten
├── data/
│   ├── daten.json        Aufgaben und Notizen
│   └── wetter.mock.json  Beispiel-Wetterdaten
└── tests/
    ├── aufgaben.test.js
    └── notizen.test.js
```

## Regeln im Projekt

Diese Regeln erklären, warum der Code so geschnitten ist. Sie wandern in Kapitel 8 des Onboarding-Dokuments in eine `AGENTS.md`.

- `aufgaben.js` und `notizen.js` enthalten reine Logik und greifen nie auf `document` oder `window` zu. Dadurch sind sie ohne Browser testbar.
- Logikfunktionen verändern übergebene Arrays und Objekte nicht, sondern geben neue zurück.
- DOM-Zugriff und Event-Handler stehen ausschließlich in `main.js`.
- Texte von Nutzern werden mit `textContent` gesetzt, nie mit `innerHTML`.
- Fehler werden mit `throw new Error("deutscher Text")` geworfen.
- Keine externen Bibliotheken außer `vitest`.

## Absichtlich offen gelassen

`js/aufgaben.js` enthält bewusst **keine** Funktion `bearbeiteAufgabe`. Sie ist die erste Übung in Kapitel 5 des Onboarding-Dokuments. Nach dem Schreiben der Funktion kann in `main.js` eine Bearbeiten-Schaltfläche für Aufgaben ergänzt werden, analog zu den Notizen.

## Ideen für die weiteren Übungen

1. `bearbeiteAufgabe` in `aufgaben.js` schreiben und in `main.js` einbinden
2. Fälligkeitsdatum für Aufgaben, überfällige Einträge hervorheben
3. Suchfeld für Notizen
4. Echte Wetter-API statt der Mock-Datei anbinden
5. Dark- und Light-Theme umschaltbar machen
