# GitHub Copilot: Grundlagen für den Einstieg

**Onboarding-Dokument für neue Mitarbeitende und Studierende ohne Vorkenntnisse**

| | |
|---|---|
| **Zielgruppe** | Alle, die noch nie mit GitHub Copilot gearbeitet haben |
| **Voraussetzungen** | VS Code, ein aktueller Browser, Grundkenntnisse in HTML, CSS und JavaScript. Node.js wird nicht benötigt |
| **Stand** | September 2026 |
| **Lesezeit** | ca. 40 Minuten, mit Übungen etwa 2 Stunden |

> Alle Beispiele beziehen sich auf denselben kleinen **Taschenrechner** (Kapitel 2). Er besteht aus genau drei Dateien und wird per Doppelklick im Browser geöffnet. Keine Installation, kein Server, keine Bibliothek.

---

## Inhaltsverzeichnis

1. Was kann GitHub Copilot?
2. Das Beispielprojekt
3. Die Benutzeroberfläche verstehen
4. Die wichtigsten Begriffe
5. Inline-Vervollständigung
6. Die verschiedenen Modi im Chat
7. Richtiges Prompting
8. Instructions verstehen
9. Agents verstehen
10. Skills verstehen
11. Best Practices

---

## 1. Was kann GitHub Copilot?

GitHub Copilot ist ein KI-Assistent für die Softwareentwicklung. Er hat als Autovervollständigung angefangen und besteht heute aus mehreren Bausteinen.

| Baustein | Was er tut | Wo |
|---|---|---|
| **Inline-Vervollständigung** | Ergänzt Code, während du tippst | Editor |
| **Next Edit Suggestions** | Schlägt die nächste Folgeänderung an anderer Stelle vor | Editor |
| **Chat** | Erklärt Code, beantwortet Fragen, plant Änderungen | IDE, GitHub.com |
| **Agent** | Bearbeitet selbstständig mehrere Dateien, führt Befehle aus und korrigiert sich | IDE |
| **Cloud Agent** | Arbeitet im Hintergrund auf GitHub und liefert einen Pull Request | GitHub.com |
| **Code Review** | Kommentiert Pull Requests | GitHub.com |
| **Copilot CLI** | Agent im Terminal | Kommandozeile |

**Was Copilot gut kann**

- Code nach bekanntem Muster schreiben, zum Beispiel eine weitere Funktion im Stil der bestehenden
- Fremden Code erklären, gerade bei Event-Handling und Zustandsvariablen
- Fehlermeldungen übersetzen und Ursachen eingrenzen
- Umbenennungen und andere mechanische Änderungen über mehrere Dateien
- HTML-Gerüste, CSS-Layouts, Kommentare, Dokumentation

**Was Copilot nicht kann**

- Wissen, was du ihm nicht gibst. Es sieht weder deinen Browser noch dein Design
- Garantieren, dass der Code korrekt ist. Er sieht oft richtig aus, auch wenn er falsch ist
- Entscheiden, was fachlich gewollt ist
- Die Verantwortung übernehmen. Die bleibt bei dir, sobald du committest

**Wichtigster Perspektivwechsel:** Du beschreibst zunehmend Ergebnisse statt einzelner Zeilen. Deine Arbeit verschiebt sich vom Tippen zum Beschreiben, Steuern und Prüfen.

---

## 2. Das Beispielprojekt

Wir benutzen durchgehend einen bewusst kleinen **Taschenrechner** mit der klassischen Oberfläche, den vier Grundrechenarten und einer Fehlerbehandlung für ungültige Berechnungen.

**Warum dieses Projekt:** Jeder weiß sofort, was er tun soll. Dadurch bleibt in jedem Beispiel sichtbar, was Copilot tut, statt dass die Technik im Weg steht. Trotzdem steckt genug drin, um alle Bausteine zu zeigen: Zustand, Ereignisse, Fehlerfälle und eine Falle bei Kommazahlen.

### 2.1 Struktur

```text
taschenrechner/
├── index.html    # Anzeige und Tasten
├── script.js     # Rechenlogik, Zustand, Tastenverarbeitung
└── styles.css    # Layout und Farben
```

### 2.2 So funktioniert er

Der Rechner merkt sich seinen Zustand in fünf Variablen in `script.js`:

| Variable | Bedeutung |
|---|---|
| `aktuelleEingabe` | Text der angezeigten Zahl. Intern mit Punkt, angezeigt mit Komma |
| `gespeicherterWert` | die erste Zahl, solange eine Rechenart gewählt ist |
| `operator` | die gewählte Rechenart (`+`, `-`, `*`, `/`) oder `null` |
| `neueEingabeBeginnt` | `true` bedeutet: die nächste Ziffer ersetzt die Anzeige |
| `fehlerText` | Meldung bei ungültiger Berechnung, sonst `null` |

Ablauf bei der Eingabe **7 + 3 =**:

| Taste | Was passiert | Zustand danach |
|---|---|---|
| `7` | Ziffer wird angehängt | `aktuelleEingabe = "7"` |
| `+` | erste Zahl und Rechenart merken | `gespeicherterWert = 7`, `operator = "+"`, `neueEingabeBeginnt = true` |
| `3` | erste Ziffer der zweiten Zahl | `aktuelleEingabe = "3"`, `neueEingabeBeginnt = false` |
| `=` | `berechne(7, "+", 3)` liefert 10 | `aktuelleEingabe = "10"`, `operator = null` |

Ungültige Berechnungen (Division durch 0, zu großes Ergebnis) lösen in `berechne` einen `Error` aus. `berechneErgebnis` fängt ihn ab, merkt sich die Meldung in `fehlerText` und die Anzeige zeigt sie in Rot. Ein Druck auf `C` oder eine Ziffer setzt den Rechner zurück.

### 2.3 Der Ausgangscode

**`index.html`**

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Taschenrechner</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="rechner">
      <!-- Anzeige: zeigt die aktuelle Zahl oder eine Fehlermeldung -->
      <output id="anzeige" class="anzeige" aria-live="polite">0</output>

      <!-- Tasten: jede Taste hat genau ein data-Attribut,
           damit script.js sie unterscheiden kann -->
      <div id="tasten" class="tasten">
        <button type="button" class="taste taste-aktion taste-loeschen" data-aktion="loeschen" aria-label="Alles löschen">C</button>
        <button type="button" class="taste taste-operator" data-operator="/" aria-label="geteilt durch">÷</button>

        <button type="button" class="taste" data-ziffer="7">7</button>
        <button type="button" class="taste" data-ziffer="8">8</button>
        <button type="button" class="taste" data-ziffer="9">9</button>
        <button type="button" class="taste taste-operator" data-operator="*" aria-label="mal">×</button>

        <button type="button" class="taste" data-ziffer="4">4</button>
        <button type="button" class="taste" data-ziffer="5">5</button>
        <button type="button" class="taste" data-ziffer="6">6</button>
        <button type="button" class="taste taste-operator" data-operator="-" aria-label="minus">−</button>

        <button type="button" class="taste" data-ziffer="1">1</button>
        <button type="button" class="taste" data-ziffer="2">2</button>
        <button type="button" class="taste" data-ziffer="3">3</button>
        <button type="button" class="taste taste-operator" data-operator="+" aria-label="plus">+</button>

        <button type="button" class="taste taste-null" data-ziffer="0">0</button>
        <button type="button" class="taste" data-aktion="komma" aria-label="Komma">,</button>
        <button type="button" class="taste taste-operator" data-aktion="gleich" aria-label="gleich">=</button>
      </div>
    </main>

    <script src="script.js"></script>
  </body>
</html>
```

**`script.js`**

```javascript
// Taschenrechner mit den vier Grundrechenarten.
// Oben stehen die Rechenfunktionen ohne DOM-Zugriff,
// darunter der Zustand und die Verarbeitung der Tasten.

// ---------------------------------------------------------------
// Rechenfunktionen (kein Zugriff auf document)
// ---------------------------------------------------------------

/**
 * Führt eine der vier Grundrechenarten aus.
 * @param {number} a - Erster Wert.
 * @param {string} operator - "+", "-", "*" oder "/".
 * @param {number} b - Zweiter Wert.
 * @returns {number} Das Ergebnis.
 * @throws {Error} Bei Division durch 0, unbekannter Rechenart oder zu großem Ergebnis.
 */
function berechne(a, operator, b) {
  let ergebnis;

  switch (operator) {
    case "+":
      ergebnis = a + b;
      break;
    case "-":
      ergebnis = a - b;
      break;
    case "*":
      ergebnis = a * b;
      break;
    case "/":
      if (b === 0) {
        throw new Error("Durch 0 teilen geht nicht");
      }
      ergebnis = a / b;
      break;
    default:
      throw new Error("Unbekannte Rechenart");
  }

  if (!Number.isFinite(ergebnis)) {
    throw new Error("Ergebnis zu groß");
  }
  return ergebnis;
}

// ---------------------------------------------------------------
// Zustand
// ---------------------------------------------------------------

const MAX_ZEICHEN = 12;

const anzeige = document.querySelector("#anzeige");
const tasten = document.querySelector("#tasten");

let aktuelleEingabe = "0"; // Text der angezeigten Zahl, intern mit Punkt als Dezimaltrenner
let gespeicherterWert = null; // erste Zahl, solange eine Rechenart gewählt ist
let operator = null; // gewählte Rechenart oder null
let neueEingabeBeginnt = false; // true: die nächste Ziffer ersetzt die Anzeige
let fehlerText = null; // Meldung bei ungültiger Berechnung, sonst null

/** Setzt den Rechner in den Startzustand zurück. */
function setzeZurueck() {
  aktuelleEingabe = "0";
  gespeicherterWert = null;
  operator = null;
  neueEingabeBeginnt = false;
  fehlerText = null;
}

/** Merkt sich eine Fehlermeldung und verwirft die laufende Rechnung. */
function meldeFehler(text) {
  fehlerText = text;
  aktuelleEingabe = "0";
  gespeicherterWert = null;
  operator = null;
  neueEingabeBeginnt = true;
}

// ---------------------------------------------------------------
// Tastenlogik
// ---------------------------------------------------------------

/** Hängt eine Ziffer an die aktuelle Eingabe an. */
function tippeZiffer(ziffer) {
  if (fehlerText !== null) {
    setzeZurueck();
  }

  if (neueEingabeBeginnt) {
    aktuelleEingabe = ziffer;
    neueEingabeBeginnt = false;
  } else if (aktuelleEingabe === "0") {
    aktuelleEingabe = ziffer;
  } else if (aktuelleEingabe.length < MAX_ZEICHEN) {
    aktuelleEingabe += ziffer;
  }
}

/** Fügt ein Dezimalkomma ein, aber höchstens eins pro Zahl. */
function tippeKomma() {
  if (fehlerText !== null) {
    setzeZurueck();
  }

  if (neueEingabeBeginnt) {
    aktuelleEingabe = "0.";
    neueEingabeBeginnt = false;
  } else if (!aktuelleEingabe.includes(".")) {
    aktuelleEingabe += ".";
  }
}

/** Merkt sich die erste Zahl und die gewählte Rechenart. */
function waehleOperator(neuerOperator) {
  if (fehlerText !== null) {
    return;
  }

  // Zweimal hintereinander eine Rechenart gedrückt: die neue ersetzt die alte.
  if (operator !== null && neueEingabeBeginnt) {
    operator = neuerOperator;
    return;
  }

  // Kette wie 2 + 3 + : erst das Zwischenergebnis berechnen.
  if (operator !== null) {
    berechneErgebnis();
    if (fehlerText !== null) {
      return;
    }
  }

  gespeicherterWert = Number(aktuelleEingabe);
  operator = neuerOperator;
  neueEingabeBeginnt = true;
}

/** Berechnet das Ergebnis der aktuellen Rechnung. */
function berechneErgebnis() {
  if (fehlerText !== null || operator === null) {
    return;
  }

  try {
    const ergebnis = berechne(gespeicherterWert, operator, Number(aktuelleEingabe));

    // Übung aus Kapitel 5 des Onboarding-Dokuments:
    // Das Ergebnis wird hier noch ungerundet in Text umgewandelt.
    // Deshalb zeigt 0,1 + 0,2 aktuell 0,30000000000000004 an.
    aktuelleEingabe = String(ergebnis);

    gespeicherterWert = null;
    operator = null;
    neueEingabeBeginnt = true;
  } catch (fehler) {
    meldeFehler(fehler.message);
  }
}

// ---------------------------------------------------------------
// Anzeige und Ereignisse
// ---------------------------------------------------------------

/** Schreibt den aktuellen Zustand in die Anzeige. */
function aktualisiereAnzeige() {
  // Intern rechnen wir mit Punkt, angezeigt wird ein Komma.
  const text = fehlerText ?? aktuelleEingabe.replace(".", ",");
  anzeige.textContent = text;
  anzeige.classList.toggle("fehler", fehlerText !== null);
}

// Ein einziger Klick-Handler für alle Tasten (Event-Delegation).
tasten.addEventListener("click", (ereignis) => {
  const taste = ereignis.target.closest("button");
  if (taste === null) {
    return;
  }

  if ("ziffer" in taste.dataset) {
    tippeZiffer(taste.dataset.ziffer);
  } else if ("operator" in taste.dataset) {
    waehleOperator(taste.dataset.operator);
  } else if (taste.dataset.aktion === "komma") {
    tippeKomma();
  } else if (taste.dataset.aktion === "gleich") {
    berechneErgebnis();
  } else if (taste.dataset.aktion === "loeschen") {
    setzeZurueck();
  }

  aktualisiereAnzeige();
});

aktualisiereAnzeige();
```

**`styles.css`**

```css
/* Farben und Maße zentral als Variablen */
:root {
  --hintergrund: #10141c;
  --gehaeuse: #1b2130;
  --anzeige-hintergrund: #0b0f16;
  --taste: #2b3345;
  --taste-hover: #364058;
  --operator: #5b9dff;
  --operator-hover: #7db1ff;
  --operator-text: #0b1020;
  --aktion: #ff8a80;
  --text: #e8ecf4;
  --fehler: #ff8080;
  --radius: 12px;
  --abstand: 0.75rem;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--hintergrund);
  color: var(--text);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}

.rechner {
  width: min(100% - 2rem, 340px);
  padding: var(--abstand);
  background: var(--gehaeuse);
  border-radius: 16px;
}

/* Anzeige */
.anzeige {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 4.5rem;
  margin-bottom: var(--abstand);
  padding: 0.5rem 1rem;
  background: var(--anzeige-hintergrund);
  border-radius: var(--radius);
  font-size: 2.2rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow-x: auto;
}

.anzeige.fehler {
  color: var(--fehler);
  font-size: 1.1rem;
}

/* Tasten: vier Spalten, C und 0 sind breiter */
.tasten {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--abstand);
}

.taste {
  min-height: 3.5rem;
  border: 0;
  border-radius: var(--radius);
  background: var(--taste);
  color: var(--text);
  font-size: 1.3rem;
  cursor: pointer;
}

.taste:hover {
  background: var(--taste-hover);
}

.taste:focus-visible {
  outline: 2px solid var(--operator);
  outline-offset: 2px;
}

.taste-operator {
  background: var(--operator);
  color: var(--operator-text);
  font-weight: 600;
}

.taste-operator:hover {
  background: var(--operator-hover);
}

.taste-aktion {
  color: var(--aktion);
}

.taste-loeschen {
  grid-column: span 3;
}

.taste-null {
  grid-column: span 2;
}
```

### 2.4 Starten

Ordner `taschenrechner` in VS Code öffnen, dann `index.html` per Doppelklick im Datei-Explorer des Betriebssystems im Browser öffnen. Nach jeder Änderung an einer Datei speichern und die Seite im Browser neu laden (`F5`).

### 2.5 Testfälle

Es gibt keine automatischen Tests. Stattdessen prüfen wir mit einer festen Liste von Tastenfolgen im Browser. Diese Tabelle kommt in den folgenden Kapiteln immer wieder vor.

| Nr. | Tastenfolge | Erwartete Anzeige |
|---|---|---|
| 1 | `7` `+` `3` `=` | `10` |
| 2 | `8` `÷` `4` `=` | `2` |
| 3 | `2` `+` `3` `+` `4` `=` | `9` |
| 4 | `5` `÷` `0` `=` | rote Meldung „Durch 0 teilen geht nicht“, danach `C` setzt zurück |
| 5 | `3` `+` `×` `4` `=` | `12` (die zweite Rechenart ersetzt die erste) |
| 6 | `1` `,` `5` `+` `1` `,` `5` `=` | `3` |
| 7 | `5` `−` `8` `=` | `-3` |
| 8 | `0` `,` `1` `+` `0` `,` `2` `=` | `0,3` |

**Achtung:** Fall 8 schlägt im Ausgangszustand bewusst fehl. Er zeigt `0,30000000000000004`. Das ist die bekannte Schwäche, die wir in den Kapiteln 5 und 6 mit Copilot beheben.

### 2.6 Das laufende Feature

Durch die Kapitel 5 bis 10 begleiten uns drei Erweiterungen:

1. **Rundung:** Fall 8 soll `0,3` anzeigen (Kapitel 5 und 6).
2. **Rückschritt-Taste ⌫:** löscht die zuletzt getippte Ziffer (Kapitel 6 bis 8).
3. **Prozent-Taste %:** teilt die angezeigte Zahl durch 100 (Kapitel 7 und 10).

Als freie Zusatzübung: Bedienung mit der Tastatur (Kapitel 7 und 11).

### 2.7 Was am Ende zusätzlich im Ordner liegt

```text
taschenrechner/
├── AGENTS.md                            # Kapitel 8: projektweite Regeln
├── index.html
├── script.js
├── styles.css
└── .github/
    ├── instructions/
    │   └── css.instructions.md          # Kapitel 8: Regeln nur für CSS
    ├── agents/
    │   ├── erklaerer.agent.md           # Kapitel 9
    │   └── reviewer.agent.md            # Kapitel 9
    └── skills/
        └── neue-taste/                  # Kapitel 10
            ├── SKILL.md
            └── vorlage.md
```

Diese Dateien liegen im Repository. Sie sind damit versioniert und gelten automatisch für alle im Team.

---

## 3. Die Benutzeroberfläche verstehen

### 3.1 Wo Copilot in VS Code auftaucht

```text
┌──────────────────────────────────────────────────────────────────────┐
│  VS Code                                                             │
│                                                                      │
│  ┌──────────────┐  ┌───────────────────────────┐  ┌───────────────┐  │
│  │ Explorer     │  │ Editor                    │  │ Chat-Ansicht  │  │
│  │ index.html   │  │  grauer Ghost Text  (1)   │  │               │  │
│  │ script.js    │  │  Inline Chat  Strg+I (2)  │  │  Verlauf (4)  │  │
│  │ styles.css   │  │                           │  │               │  │
│  │              │  ├───────────────────────────┤  │  Eingabefeld  │  │
│  │              │  │ Terminal / Probleme (3)   │  │  + Regler (5) │  │
│  └──────────────┘  └───────────────────────────┘  └───────────────┘  │
│  Statusleiste mit Copilot-Symbol (6)                                 │
└──────────────────────────────────────────────────────────────────────┘
```

1. **Ghost Text:** Vorschlag beim Tippen. `Tab` übernimmt, `Esc` verwirft.
2. **Inline Chat** (`Strg+I`, macOS `Cmd+I`): kleine Änderung an markiertem Code direkt im Editor.
3. **Terminal und Probleme:** Quelle für Kontext. Fehlermeldungen kannst du in den Chat kopieren. Fehler aus der Browser-Konsole (`F12`) ebenfalls.
4. **Chat-Ansicht** (`Strg+Alt+I`, macOS `Ctrl+Cmd+I`): Hauptoberfläche für alles Weitere.
5. **Regler im Eingabefeld:** siehe unten.
6. **Statusleiste:** zeigt, ob Copilot aktiv ist, und erlaubt das Pausieren der Vorschläge.

### 3.2 Die Regler im Chat-Eingabefeld

Hier stellst du ein, **wie** gearbeitet wird.

| Regler | Frage | Einstellung für den Anfang |
|---|---|---|
| **Session Target** | Welche Umgebung führt die Sitzung aus? (Local, Copilot, Claude, Codex, Cloud) | `Copilot` |
| **Agent** | Welche Rolle mit welchen Anweisungen und Werkzeugen? (Ask, Plan, Agent) | `Ask` zum Lernen, `Agent` zum Umsetzen |
| **Modell** | Welches Sprachmodell denkt? | `Auto` |
| **Permissions** | Was darf ohne Rückfrage passieren? | `Manual permissions` |

### 3.3 Eingaben im Chat

| Zeichen | Bedeutung | Beispiel |
|---|---|---|
| `#` | Kontext oder Werkzeug referenzieren | `#codebase`, `#file:script.js` |
| `/` | Skill oder Befehl aufrufen | `/init`, `/compact`, `/neue-taste` |
| Drag and Drop | Datei als Kontext anhängen | `script.js` aus dem Explorer ins Chatfeld ziehen |

Über das Zahnrad **Configure Chat** öffnest du die Verwaltung der Anpassungen (Instructions, Agents, Skills). Über **Diagnostics** im Kontextmenü der Chat-Ansicht siehst du, welche Anpassungen tatsächlich geladen wurden. Das ist die erste Anlaufstelle, wenn etwas nicht wirkt.

### 3.4 Änderungen prüfen

Alle Dateiänderungen eines Agenten erscheinen als Diff mit grünen und roten Zeilen. Du kannst sie einzeln annehmen, verwerfen oder komplett zurückrollen, bevor du speicherst und committest. **Diesen Schritt nie überspringen.**

---

## 4. Die wichtigsten Begriffe

### LLM (Large Language Model)

Das Sprachmodell ist der Teil, der „denkt“. Es sagt auf Basis des bisherigen Textes voraus, was wahrscheinlich als Nächstes kommt. Daraus folgen drei Eigenschaften, die den Alltag prägen:

- Es **weiß nichts** über dein Projekt, außer dem, was im Prompt steht.
- Es antwortet **nicht immer gleich**. Dieselbe Frage kann zu unterschiedlichen Ergebnissen führen.
- Es kann **überzeugend falsch** liegen, zum Beispiel eine JavaScript-Funktion erfinden, die es nicht gibt.

Copilot bietet Modelle mehrerer Anbieter an. Die Einstellung **Auto** überlässt die Wahl Copilot und ist für den Anfang die richtige.

### Kontextfenster

Die begrenzte Textmenge, die das Modell pro Anfrage lesen kann. Hinein passen deine Nachricht, der bisherige Gesprächsverlauf, Ausschnitte aus Dateien und die Instructions.

```text
Kontextfenster (begrenzt)
┌──────────────────────────────────────────────────┐
│ Instructions │ Verlauf │ Dateien │ Deine Nachricht│
└──────────────────────────────────────────────────┘
        ▲ immer dabei      ▲ wächst mit der Sitzung
```

Praktische Folgen:

- Was nicht im Kontext ist, existiert für das Modell nicht. Deshalb `#file:script.js` angeben oder die Datei anhängen.
- Zu viel Kontext schadet ebenfalls. Wichtiges geht zwischen Unwichtigem unter.
- Sehr lange Sitzungen werden schlechter. Dann `/compact` nutzen oder neu anfangen.

### Tool

Ein Werkzeug, das das Modell aufrufen kann, statt nur Text zu schreiben. Beispiele: Datei lesen, Datei ändern, Terminalbefehl ausführen, im Projekt suchen, Webseite abrufen.

Daraus entsteht der **Agent-Loop**:

```text
Aufgabe ─► Modell überlegt ─► Werkzeug nötig? ─ja─► Werkzeug ausführen (ggf. Freigabe)
                 ▲                                          │
                 └─────────── Ergebnis zurück ──────────────┘
                                  │ nein
                                  ▼
                            Antwort an dich
```

Beispiel: Du bittest um die Rundung von Ergebnissen. Der Agent liest `script.js`, schreibt die Funktion `formatiereErgebnis`, ersetzt den Aufruf in `berechneErgebnis` und meldet dir, welche Testfälle du prüfen sollst. Jeder Schritt ist ein Durchlauf dieser Schleife.

**Grenze des Beispiels:** Ohne zusätzliche Werkzeuge kann der Agent den Rechner nicht im Browser bedienen. Ob die Anzeige wirklich `0,3` zeigt, prüfst du.

### Harness

Der **Agent Harness** ist die Software, die diese Schleife steuert: welche Werkzeuge es gibt, wie Kontext gesammelt wird, wann du freigeben musst und wohin Änderungen geschrieben werden. VS Code unterstützt die Harnesses **Local**, **Copilot**, **Claude** und **Codex** sowie ein **Cloud**-Ziel für Sitzungen auf GitHub-Infrastruktur.

Merksatz: Das **Modell** denkt, der **Harness** handelt. Beides wählst du getrennt.

### Instructions

Markdown-Dateien im Projekt mit Regeln, die Copilot automatisch mitliest. Sie beantworten die Frage: **Wie arbeiten wir in diesem Projekt?** Beispiel: „Rechenfunktionen greifen nicht auf `document` zu.“ Details in Kapitel 8.

### Agent

Der Begriff hat zwei Bedeutungen, die oft verwechselt werden:

1. **Agent als Modus:** Copilot arbeitet selbstständig in mehreren Schritten und benutzt Werkzeuge.
2. **Custom Agent als Rolle:** Eine gespeicherte Konfiguration aus Anweisungen und erlaubten Werkzeugen, zum Beispiel ein Reviewer, der nur lesen darf. Sie steht in einer `.agent.md`-Datei.

Details in Kapitel 9.

### Skill

Ein Ordner mit einer Datei `SKILL.md` und optional Vorlagen oder Skripten. Er bringt Copilot einen **wiederholbaren Arbeitsablauf** bei, zum Beispiel „So fügen wir dem Rechner eine neue Taste hinzu“. Copilot lädt einen Skill nur, wenn die Aufgabe dazu passt. Details in Kapitel 10.

### MCP (Model Context Protocol)

Ein offener Standard, um KI-Agenten mit externen Systemen zu verbinden. Ein **MCP-Server** stellt zusätzliche Werkzeuge bereit, zum Beispiel „GitHub-Issue lesen“ oder „Seite im Browser öffnen und bedienen“.

**Analogie:** MCP ist für KI-Agenten das, was USB für Computer ist. Ein einheitlicher Stecker statt einer Speziallösung pro Gerät.

Für den Taschenrechner brauchst du MCP nicht. Ein Fall, in dem es hilfreich würde: Ein Playwright-MCP-Server kann den Browser steuern, `0,1 + 0,2 =` tippen und die Anzeige auslesen. Damit schließt sich die Lücke, dass der Agent seine Änderungen sonst nicht selbst prüfen kann.

Eingerichtet wird MCP im Extensions-Bereich über die Suche `@mcp` oder über eine Datei im Projekt:

```json
{
  "servers": {
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp" }
  }
}
```

**Sicherheitshinweis:** Lokal laufende MCP-Server können beliebigen Code auf deinem Rechner ausführen. Nur Server aus vertrauenswürdigen Quellen nutzen und niemals Zugangsdaten direkt in die Konfiguration schreiben.

### Wie alles zusammenspielt

| Baustein | Wirkung | Wann aktiv |
|---|---|---|
| Instructions | leiten das Modell | automatisch bei jeder Anfrage |
| Skills | bringen Abläufe bei | bei passender Aufgabe oder per `/name` |
| Custom Agents | legen Rolle und Rechte fest | wenn du den Agenten auswählst |
| MCP | erweitert die Werkzeuge | wenn der Agent ein externes System braucht |

---

## 5. Inline-Vervollständigung

### 5.1 So funktioniert sie

Während du tippst, schickt Copilot den umgebenden Code an das Modell und zeigt den Vorschlag grau an.

| Aktion | Kürzel |
|---|---|
| Vorschlag übernehmen | `Tab` |
| Vorschlag verwerfen | `Esc` |
| Nur nächstes Wort übernehmen | `Strg+→` |
| Andere Vorschläge durchblättern | `Alt+]` / `Alt+[` |

**Next Edit Suggestions** gehen einen Schritt weiter: Nach einer Änderung erkennt Copilot, dass an anderer Stelle etwas nachgezogen werden muss, und springt auf `Tab` dorthin.

### 5.2 Erste Übung: die Rundung beheben

Öffne `script.js` und probiere Fall 8 aus Kapitel 2.5 im Browser aus. Die Anzeige zeigt `0,30000000000000004`. Der Grund: Computer speichern Kommazahlen binär, und `0.1 + 0.2` ergibt in JavaScript nicht exakt `0.3`. Das Ergebnis ist mathematisch nur minimal daneben, sieht aber falsch aus.

Wir schreiben die Funktion `formatiereErgebnis`. Lege sie direkt unter `berechne` an und tippe **nur** den Kommentar und die Signatur:

```javascript
/**
 * Formatiert ein Rechenergebnis für die Anzeige.
 * @param {number} zahl
 * @returns {string}
 */
function formatiereErgebnis(zahl) {
```

Ein häufiger Vorschlag ohne weiteren Hinweis:

```javascript
  return String(zahl);
}
```

Das läuft, sieht richtig aus und ändert nichts am Fehler. Ergänze jetzt im Kommentar, was du wirklich willst:

```javascript
/**
 * Formatiert ein Rechenergebnis für die Anzeige.
 * Rundet auf höchstens 12 gültige Ziffern, damit Rechenungenauigkeiten
 * nicht sichtbar werden: 0.1 + 0.2 soll "0.3" ergeben, nicht "0.30000000000000004".
 * @param {number} zahl
 * @returns {string}
 */
function formatiereErgebnis(zahl) {
```

Jetzt schlägt Copilot in der Regel einen Rundungsschritt vor, zum Beispiel:

```javascript
  return String(Number(zahl.toPrecision(12)));
}
```

Die Vorschläge unterscheiden sich von Sitzung zu Sitzung. Entscheidend ist, dass du sie **liest**: Rundet der Vorschlag wirklich? Bleibt `10` weiterhin `10`? Was passiert bei `1 ÷ 3`?

**Einbauen:** Ersetze in `berechneErgebnis` die Zeile `aktuelleEingabe = String(ergebnis);` durch `aktuelleEingabe = formatiereErgebnis(ergebnis);` und lösche den Übungskommentar darüber. Lade die Seite neu und gehe die Testfälle aus Kapitel 2.5 durch. Jetzt müssen alle acht stimmen.

**Next Edit Suggestion ausprobieren:** Benenne die Funktion `berechne` in `rechne` um. Copilot erkennt, dass `berechneErgebnis` dadurch nicht mehr funktioniert, und bietet die Anpassung des Aufrufs an.

### 5.3 Tipps

- **Name, Parameter und Kommentar sind dein Prompt.** Je genauer die Beschreibung, desto besser der Vorschlag.
- **Beteiligte Dateien offen lassen.** Offene Tabs fließen in den Kontext ein.
- **In kleinen Schritten arbeiten.** Eine Funktion prüfst du leicht, eine ganze Datei kaum.
- **Nie blind akzeptieren.** Mit jedem `Tab` übernimmst du die Verantwortung für die Zeile.

---

## 6. Die verschiedenen Modi im Chat

### 6.1 Die drei eingebauten Rollen

| Modus | Verhalten | Ändert Dateien? | Wofür |
|---|---|---|---|
| **Ask** | Beantwortet Fragen, erklärt, zeigt Codebeispiele | Nein | Verstehen und lernen |
| **Plan** | Untersucht das Projekt und schreibt einen Umsetzungsplan | Nein | Größere Änderungen vorbereiten |
| **Agent** | Setzt um, ändert Dateien, führt Befehle aus, korrigiert sich | Ja | Features, Refactorings, Bugfixes |

Dazu kommt der **Inline Chat** im Editor für kleine Änderungen an einer markierten Stelle.

### 6.2 Wann welcher Modus?

```text
Verstehe ich das Problem?
   │ nein ──► Ask
   │ ja
   ▼
Ist die Lösung klein und klar? (eine Funktion, wenige Zeilen)
   │ ja ──► Inline Chat oder Agent
   │ nein
   ▼
Plan ──► Plan lesen und anpassen ──► Agent
```

### 6.3 Praxis im Taschenrechner

**Ask: Code verstehen**

```text
Erkläre mir Schritt für Schritt, was in #file:script.js passiert, wenn ich
nacheinander 7, +, 3 und = drücke. Erkläre es so, als hätte ich JavaScript
gerade erst gelernt, und gehe besonders auf die Variablen aktuelleEingabe,
gespeicherterWert und neueEingabeBeginnt ein.
```

**Ask: Konzepte klären**

```text
Warum steht die Funktion berechne oben in script.js und greift nicht
auf document zu? Nenne zwei Vorteile und zeige je ein Beispiel aus diesem Projekt.
```

**Plan: Änderung vorbereiten**

```text
Der Rechner soll eine Taste ⌫ bekommen, die die zuletzt getippte Ziffer löscht.
Erstelle einen Umsetzungsplan: betroffene Stellen in index.html, script.js
und styles.css, Randfälle (zum Beispiel ⌫ bei "0", bei einem Ergebnis,
bei einer Fehlermeldung, bei "0,") und eine Liste von Testfällen.
Noch nichts umsetzen.
```

Der Plan-Modus ändert nichts. Du liest ihn, korrigierst fachliche Punkte und gibst ihn dann an den Agenten weiter. Achte darauf, ob die Randfälle wirklich zum Zustand aus Kapitel 2.2 passen, denn gerade dort machen Pläne Fehler.

**Agent: Umsetzen**

```text
Ziel: Setze die Rundung um. Lege in script.js die Funktion formatiereErgebnis(zahl)
an und verwende sie in berechneErgebnis anstelle von String(ergebnis).
Ändere sonst nichts.

Fertig, wenn: 0,1 + 0,2 = zeigt 0,3, 1 ÷ 3 = zeigt höchstens 12 Ziffern,
7 + 3 = zeigt weiterhin 10. Beschreibe am Ende, welche Testfälle ich
im Browser prüfen soll.
```

Was dann passiert:

1. Der Agent liest `script.js`.
2. Er legt die Funktion an und ändert den Aufruf.
3. Er beschreibt das Ergebnis und nennt Testfälle für dich.
4. Falls Node.js installiert ist und du es erlaubst, kann er mit `node --check script.js` auf Syntaxfehler prüfen.

### 6.4 Freigaben

- **Manual permissions:** Der Agent fragt vor Terminalbefehlen. Für den Anfang die richtige Einstellung.
- **Allow all:** Keine Rückfragen. Nur sinnvoll, wenn du weißt, was du tust.
- **Befehle vor der Freigabe lesen.** Ein Befehl, der Dateien löscht, fällt nur auf, wenn jemand hinschaut.

---

## 7. Richtiges Prompting

### 7.1 Aufbau eines Prompts

Ein guter Prompt beantwortet bis zu fünf Fragen. Für kleine Aufgaben reichen die ersten zwei, je größer die Aufgabe, desto wichtiger werden die übrigen.

| Baustein | Frage | Beispiel aus dem Taschenrechner |
|---|---|---|
| **1. Ziel** | Was soll am Ende da sein? | „Taste `%`, die die angezeigte Zahl durch 100 teilt“ |
| **2. Kontext** | Worauf baut das auf? | „Tasten werden im Klick-Handler in `#file:script.js` verarbeitet“ |
| **3. Bedingungen** | Was ist erlaubt, was nicht? | „kein eval, keine Bibliothek, keine neuen Farben“ |
| **4. Fertig, wenn** | Woran erkennt man den Erfolg? | „`50` `%` zeigt `0,5`, danach funktionieren die Testfälle 1 bis 8 weiterhin“ |
| **5. Form** | Wie soll das Ergebnis aussehen? | „zuerst den Plan zeigen, dann umsetzen“ |

Als Schablone zum Kopieren:

```text
Ziel: <was entstehen soll>
Kontext: <Dateien, vorhandene Funktionen, Beispiel>
Bedingungen: <Vorgaben und Verbote>
Fertig, wenn: <überprüfbares Kriterium>
```

Zwei Zusatzregeln:

- **Erst diagnostizieren, dann ändern.** Bei Fehlern zuerst „finde die Ursache, ändere noch nichts“.
- **Ein Ziel pro Prompt.** Mehrere Aufgaben lieber nacheinander.

**Zum Erfolgskriterium:** Weil es im Projekt keine automatischen Tests gibt, ersetzen konkrete Tastenfolgen mit erwarteter Anzeige den Test. Je genauer sie im Prompt stehen, desto besser kann Copilot seine eigene Lösung gedanklich prüfen.

### 7.2 Beispiele für schlechte Prompts

**Beispiel 1**

```text
Mach den Taschenrechner besser.
```

Problem: „Besser“ ist nicht definiert. Der Agent ändert irgendetwas, oft sehr viel auf einmal, und du kannst das Ergebnis nicht beurteilen.

**Beispiel 2**

```text
Warum funktioniert das nicht?
```

Problem: Das Modell sieht deinen Browser nicht. Ohne Tastenfolge, erwartete und tatsächliche Anzeige kann es nur raten.

**Beispiel 3**

```text
Schreib eine Funktion für die Division.
```

Problem: Die Division steckt schon in `berechne`. Ohne Kontext legt der Agent eine zweite, leicht andere Version an. So entsteht doppelter Code, der später auseinanderläuft.

**Beispiel 4**

```text
Bau Prozent, Wurzel, Klammern, einen Verlauf, einen Hell-Dunkel-Schalter
und Tastatureingabe ein.
```

Problem: sechs Aufgaben auf einmal. Das Ergebnis ist ein großer Diff, den niemand mehr vernünftig prüft, und ein Fehler in einem Teil blockiert alles andere. Klammern verändern außerdem die Grundarchitektur des Rechners.

**Beispiel 5**

```text
Nutze die eingebaute Funktion Math.prozent für die Prozent-Taste.
```

Problem: Die gibt es nicht. Eine falsche Annahme im Prompt wird vom Modell selten korrigiert, sondern übernommen. Dann entsteht Code um eine erfundene Funktion herum.

**Beispiel 6**

```text
Mach es so wie besprochen.
```

Problem: Bezug auf Wissen, das nicht im Kontext steht, etwa eine frühere Sitzung oder ein Gespräch im Team. Copilot hat darauf keinen Zugriff.

### 7.3 Beispiele für gute Prompts

**Beispiel 1: Neue Funktion**

```text
Ziel: Funktion formatiereErgebnis(zahl) in script.js, die ein Rechenergebnis
für die Anzeige in Text umwandelt.

Kontext: Aktuell zeigt 0,1 + 0,2 den Wert 0,30000000000000004. Die Funktion
ersetzt String(ergebnis) in berechneErgebnis. Platz und Stil wie bei
berechne: oben in der Datei, ohne document-Zugriff.

Bedingungen: keine Bibliothek, Kommentar auf Deutsch, berechne bleibt unverändert.

Fertig, wenn: 0,1 + 0,2 = zeigt 0,3, 1 ÷ 3 = zeigt höchstens 12 Ziffern,
7 + 3 = zeigt weiterhin 10.
```

**Beispiel 2: Fehler analysieren**

```text
Wenn ich 0,1 + 0,2 = eingebe, zeigt die Anzeige 0,30000000000000004
statt 0,3. Erkläre mir die Ursache in einfachen Worten und nenne die
Stelle in #file:script.js, an der das sichtbar wird.
Ändere zunächst nichts.
```

**Beispiel 3: Code verstehen**

```text
Erkläre #file:script.js so, als würdest du es jemandem im ersten Semester
erklären. Gehe besonders auf die Variable neueEingabeBeginnt ein: Wann wird
sie true, wann false, und warum braucht der Rechner sie?
```

**Beispiel 4: Gezielte Änderung**

```text
In #file:styles.css sollen die Tasten beim Klicken kurz kleiner werden.
Ergänze dafür nur eine :active-Regel für .taste mit transform: scale(0.96).
Ändere sonst nichts und verwende keine neuen Farben.
```

**Beispiel 5: Annahmen prüfen lassen**

```text
Der Rechner soll auch mit der Tastatur bedienbar sein (Ziffern, + - * /,
Enter, Escape). Prüfe zuerst, wie #file:script.js Tastendrücke aktuell
verarbeitet, und schlage zwei Varianten vor, die vorhandene Funktionen
wiederverwenden, mit Vor- und Nachteilen. Noch nichts umsetzen.
```

**Beispiel 6: Testfälle gedanklich durchspielen**

```text
Gehe die folgenden Eingaben gedanklich durch #file:script.js und sage mir
für jede, was in der Anzeige steht. Ändere nichts.

1. 7 + 3 =
2. 5 ÷ 0 =, danach 8
3. 3 + × 4 =
4. 5 + =
5. 2 + 3 + 4 =

Nenne abweichende Ergebnisse mit der verantwortlichen Stelle im Code.
```

Auch diese Antwort ersetzt keinen Test im Browser, denn das Modell kann sich beim Nachvollziehen irren. Sie ist aber ein guter erster Filter.

### 7.4 Nachsteuern statt neu anfangen

Wenn das Ergebnis nicht passt, hilft präzises Feedback mehr als ein neuer Versuch:

| Statt | Besser |
|---|---|
| „Nein, falsch.“ | „Du hast für die neue Taste einen eigenen addEventListener geschrieben. Behandle sie stattdessen im vorhandenen Klick-Handler.“ |
| „Nochmal.“ | „Die Funktion passt, aber ⌫ bei einer Fehlermeldung fehlt. Ergänze diesen Fall.“ |
| „Geht immer noch nicht.“ | „Bei 5 ÷ 0 = und danach ⌫ zeigt die Anzeige nun `undefined`. Erwartet ist, dass der Rechner zurückgesetzt wird.“ |

Wenn du denselben Hinweis zum dritten Mal tippst, gehört er nicht in den Chat, sondern in die Instructions (Kapitel 8) oder in einen Skill (Kapitel 10).

---

## 8. Instructions verstehen

### 8.1 Wie funktionieren Instructions?

Instructions sind Markdown-Dateien im Projekt, die Copilot **automatisch** mitliest. Sie ersparen dir den Satz „Und denk daran, dass wir kein eval benutzen“, den du sonst in jeden Prompt schreiben müsstest.

```text
Deine Nachricht ─┐
Instructions ────┼─► Prompt ─► Modell
Dateikontext ────┘
```

Es gibt zwei Arten:

| Art | Datei | Wirkung |
|---|---|---|
| **Immer aktiv** | `AGENTS.md` im Projektordner oder `.github/copilot-instructions.md` | bei jeder Anfrage |
| **Dateibezogen** | `.github/instructions/*.instructions.md` mit `applyTo` | nur wenn die bearbeitete Datei zum Muster passt |

Drei Dinge, die man wissen sollte:

- Instructions sind **Empfehlungen an das Modell**, keine technische Garantie. Was zwingend gelten muss, gehört in Tests, Linter oder CI.
- Sie kosten bei **jeder** Anfrage Platz im Kontextfenster. Kurz ist besser als vollständig.
- Sie liegen im Projekt und gelten deshalb für alle im Team.

### 8.2 Instructions erstellen

**Schnellstart:** Tippe `/init` im Chat. Copilot sieht sich das Projekt an und erzeugt einen Entwurf. Diesen danach **kürzen und korrigieren**. Automatisch erzeugte Instructions sind meistens zu lang und enthalten Selbstverständlichkeiten.

**Was hineingehört**

- Wie das Projekt aufgebaut ist und was wohin gehört
- Konventionen, die man dem Code nicht ansieht
- Wie man prüft, ob eine Änderung funktioniert
- Typische Fallen und Verbote

**Was nicht hineingehört**

- Allgemeine Ratschläge wie „schreibe sauberen Code“
- Alles, was schon im Code oder in einer README steht
- Lange Erklärtexte

**`AGENTS.md` im Taschenrechner**

```markdown
# Taschenrechner

Kleiner Taschenrechner mit vier Grundrechenarten. Nur HTML, CSS und JavaScript,
keine Bibliothek, kein Build-Schritt.

## Aufbau
- `index.html`: Anzeige und Tasten. Jede Taste hat ein data-Attribut
  (`data-ziffer`, `data-operator` oder `data-aktion`).
- `script.js`: oben die Rechenfunktionen ohne DOM-Zugriff, darunter Zustand,
  Tastenlogik und Ereignisse.
- `styles.css`: Layout und Farben, Farben nur als Variablen in `:root`.

## Konventionen
- Reines JavaScript ohne import. script.js wird als normales Skript geladen,
  damit index.html per Doppelklick funktioniert.
- Rechenfunktionen (`berechne`, `formatiereErgebnis`) greifen nicht auf `document` zu.
- Ungültige Berechnungen mit `throw new Error("deutscher Text")` melden.
  Der Text erscheint in der Anzeige.
- Texte für Nutzer und Kommentare auf Deutsch. Intern Dezimalpunkt,
  in der Anzeige Dezimalkomma.
- Neue Tasten bekommen ein data-Attribut und werden im zentralen Klick-Handler
  behandelt, nicht mit eigenem Listener pro Taste.

## Prüfen
Es gibt keine automatischen Tests. Nach jeder Änderung die Seite im Browser neu laden
und diese Tastenfolgen prüfen:
- 7 + 3 = ergibt 10
- 2 + 3 + 4 = ergibt 9
- 3 + × 4 = ergibt 12
- 0,1 + 0,2 = ergibt 0,3
- 5 ÷ 0 = zeigt "Durch 0 teilen geht nicht", danach setzt C zurück

## Verboten
- Kein `eval()`, kein `new Function()`, keine Auswertung von Text als Code.
- Kein `innerHTML`, Texte mit `textContent` setzen.
- Kein `onclick` im HTML, keine Inline-Styles.
- Keine externen Bibliotheken oder CDN-Einbindungen.
```

**Dateibezogene Instructions: `.github/instructions/css.instructions.md`**

```markdown
---
applyTo: "**/*.css"
description: Konventionen für Styles im Taschenrechner
---
- Farben, Abstände und Radien nur über die Variablen in `:root`, keine festen Werte in Regeln.
- Klassennamen deutsch und kleingeschrieben, Tastenvarianten nach dem Muster `taste-<art>`.
- Kein `!important`, keine ID-Selektoren zum Gestalten.
- Kommentare auf Deutsch.
```

### 8.3 Instructions verwenden

1. Dateien anlegen und speichern. Sie werden automatisch geladen, kein Neustart nötig.
2. Gegenprobe: Lass den Agenten die Taste ⌫ umsetzen, einmal ohne und einmal mit `AGENTS.md`. Mit den Regeln sollte er den Button mit `type="button"` und `data-aktion` anlegen, die Taste im zentralen Klick-Handler behandeln und weder `onclick` noch `eval` verwenden.
3. Wirkt nichts, über **Diagnostics** prüfen, ob die Datei geladen wurde.
4. Instructions pflegen wie Code. Was nicht mehr stimmt, wird gelöscht.

**Faustregel:** Alles zusammen sollte auf eine Bildschirmseite passen. Bei einem Projekt mit drei Dateien ist mehr selten sinnvoll.

---

## 9. Agents verstehen

### 9.1 Was ist die AGENTS.md?

Hier gibt es eine Verwechslung, die man einmal sauber trennen sollte:

| Datei | Was sie ist | Was sie nicht ist |
|---|---|---|
| `AGENTS.md` im Projektordner | eine **Instructions-Datei** nach offenem Standard, die immer mitgelesen wird | kein Ort, um Agenten zu definieren |
| `.github/agents/*.agent.md` | Definition **eines einzelnen Agenten** mit Rolle und Werkzeugen | keine projektweite Regeldatei |

Die `AGENTS.md` heißt so, weil sie sich an alle KI-Agenten richtet, die im Projekt arbeiten, unabhängig vom Hersteller. Inhaltlich ist sie genau das, was in Kapitel 8.2 steht. Wer projektweite Regeln will, schreibt `AGENTS.md`. Wer eine spezialisierte Rolle bauen will, schreibt eine `.agent.md`.

### 9.2 Agents erstellen

Ein **Custom Agent** ist eine gespeicherte Rolle: Anweisungen plus die Liste der Werkzeuge, die er benutzen darf. Der größte Nutzen für Einsteiger liegt in der Begrenzung. Ein Agent, der nur lesen darf, kann nichts kaputt machen.

Die Dateien liegen unter `.github/agents/` und enden auf `.agent.md`.

**Die wichtigsten Felder im Kopf der Datei**

| Feld | Bedeutung |
|---|---|
| `name` | Name in der Agent-Auswahl |
| `description` | Kurzbeschreibung |
| `tools` | erlaubte Werkzeuge |
| `model` | Modell, optional |
| `handoffs` | Schaltflächen zur Übergabe an einen anderen Agenten |

**Agent 1: Erklärer, nur lesend**

```markdown
---
name: Erklaerer
description: Erklärt Code im Taschenrechner anfängerfreundlich, ändert nichts.
tools: ['search/codebase', 'search/usages']
---
# Rolle
Du erklärst Code für Menschen im ersten Semester. Du änderst keine Dateien.

# Vorgehen
1. Erkläre zuerst in zwei Sätzen, was die Datei insgesamt macht.
2. Gehe dann die wichtigen Stellen durch und erkläre jede in einfachen Worten.
3. Erkläre jeden Fachbegriff beim ersten Vorkommen kurz,
   besonders Variable, Funktion, Ereignis, DOM und data-Attribut.
4. Nenne am Ende eine Tastenfolge, bei der der Rechner falsch reagieren könnte.

# Regeln
- Keine englischen Fachbegriffe ohne Übersetzung.
- Keine Verbesserungsvorschläge, außer ich frage danach.
```

**Agent 2: Reviewer, nur lesend**

```markdown
---
name: Reviewer
description: Prüft Änderungen am Taschenrechner auf Fehler und Regelverstöße, ändert nichts.
tools: ['search/codebase', 'search/usages']
---
# Rolle
Du prüfst Code im Taschenrechner und änderst nichts.

# Prüfe
- Kommt eval, new Function oder innerHTML vor?
- Hat jede neue Taste type="button" und ein data-Attribut?
  Wird sie im zentralen Klick-Handler behandelt statt mit eigenem Listener?
- Werden ungültige Berechnungen als Error gemeldet und in der Anzeige gezeigt?
- Bleibt der Zustand (aktuelleEingabe, gespeicherterWert, operator,
  neueEingabeBeginnt, fehlerText) nach jeder Taste konsistent?
  Was passiert nach einer Fehlermeldung?
- Greifen Rechenfunktionen auf document zu?
- Gibt es doppelten Code, der eine vorhandene Funktion wiederholt?
- Gibt es onclick-Attribute oder Inline-Styles?

# Ausgabe
Tabelle mit Spalten: Schweregrad (hoch, mittel, niedrig), Fundstelle, Empfehlung.
```

**Erzeugen lassen:** Mit `/create-agent` im Chat beschreibst du die Rolle, Copilot stellt Rückfragen und legt die Datei an.

### 9.3 Agents verwenden

1. Datei speichern und im Chat in der Agent-Auswahl den neuen Agenten wählen.
2. Aufgabe stellen. Der Agent bringt seine Anweisungen und Beschränkungen automatisch mit.

```text
Erklaerer:  Erkläre mir #file:script.js.
Reviewer:   Prüfe meine neue Taste ⌫ in index.html und script.js.
```

Typischer Ablauf im Taschenrechner:

```text
[Erklaerer] ──► verstehen
                    │
              [Agent] ──► umsetzen
                    │
              [Reviewer] ──► prüfen, danach selbst nachbessern
                    │
              [Du] ──► Testfälle im Browser durchgehen
```

**Subagents:** Ein Agent kann Teilaufgaben an einen anderen Agenten abgeben, der in einem eigenen Kontext arbeitet und nur das Ergebnis zurückgibt. Für ein Projekt dieser Größe brauchst du das nicht, für große Codebasen hält es den Kontext schlank.

**Wann lohnen sich Custom Agents?** Erst, wenn sich eine Rolle wiederholt. Für einmalige Aufgaben reicht ein guter Prompt. Zwei gepflegte Agents sind besser als zehn ungenutzte.

---

## 10. Skills verstehen

### 10.1 Was ist eine SKILL.md?

Zuerst der Name, weil ein Tippfehler hier zu stillen Fehlern führt: Die Datei heißt **`SKILL.md`**, in der Einzahl und in Großbuchstaben. Sie liegt in einem eigenen Ordner pro Skill. Ein Skill ist also kein einzelnes Dokument, sondern ein kleines Paket:

```text
.github/skills/
└── neue-taste/            ← Ordnername
    ├── SKILL.md           ← Anweisungen und Metadaten (Pflicht)
    └── vorlage.md         ← Vorlage (optional)
```

**Unterschied zu Instructions**

| | Instructions | Skills |
|---|---|---|
| Zweck | Regeln und Standards | Arbeitsabläufe und Fähigkeiten |
| Inhalt | nur Text | Text plus Vorlagen, Beispiele, Skripte |
| Wann geladen | immer oder je nach Datei | nur wenn die Aufgabe dazu passt |
| Reichweite | VS Code und GitHub.com | auch Copilot CLI und Cloud Agent |

**Wie Copilot einen Skill lädt, in drei Stufen**

1. **Entdecken:** Copilot kennt zunächst nur `name` und `description`. Das kostet fast keinen Platz im Kontext.
2. **Anweisungen laden:** Passt die Aufgabe zur Beschreibung, wird der Text der `SKILL.md` geladen.
3. **Dateien nutzen:** Vorlagen werden erst gelesen, wenn die `SKILL.md` darauf verweist und der Agent sie braucht.

Daraus folgt die wichtigste Regel: **Die `description` entscheidet, ob ein Skill gefunden wird.** Sie muss beschreiben, was er tut **und wann** er zu verwenden ist.

### 10.2 Skills erstellen

**Die Felder im Kopf der `SKILL.md`**

| Feld | Pflicht | Hinweis |
|---|---|---|
| `name` | ja | nur Kleinbuchstaben, Ziffern und Bindestriche, **muss exakt dem Ordnernamen entsprechen** |
| `description` | ja | was und wann, höchstens 1024 Zeichen |
| `argument-hint` | nein | Hinweistext beim Aufruf über `/` |
| `user-invocable` | nein | `false` versteckt den Skill im `/`-Menü |
| `disable-model-invocation` | nein | `true` erlaubt nur den manuellen Aufruf |

Passen Ordnername und `name` nicht zusammen oder enthält der Name ungültige Zeichen, wird der Skill **ohne Fehlermeldung nicht geladen**. Das ist der häufigste Anfängerfehler.

**Wofür taugt ein Skill im Taschenrechner?** Für alles, was sich wiederholt und immer gleich abläuft. Jede neue Taste braucht dieselben Schritte an denselben drei Stellen: Button in `index.html`, Behandlung in `script.js`, eventuell Stil in `styles.css`. Genau das ist ein Ablauf, den man einmal aufschreibt.

**`.github/skills/neue-taste/SKILL.md`**

```markdown
---
name: neue-taste
description: Fügt dem Taschenrechner eine neue Taste hinzu (HTML-Button, Behandlung in script.js, Styling und Testfälle). Verwenden, wenn eine neue Funktion wie Prozent, Vorzeichenwechsel oder Rückschritt als Taste ergänzt werden soll.
argument-hint: "[Beschriftung] [was die Taste tun soll]"
---
# Neue Taste im Taschenrechner

## Schritte
1. Lies die [Vorlage](./vorlage.md) und übernimm ihr Muster.
2. Ergänze den Button in `index.html` an passender Stelle im Raster,
   mit `type="button"`, einem passenden data-Attribut und einem aria-label,
   wenn die Beschriftung ein Symbol ist.
3. Rechnet die Taste etwas, lege die Berechnung als eigene Funktion
   ohne document-Zugriff oben in `script.js` an. Bei ungültigen Eingaben
   wirf einen Error mit deutschem Text.
4. Behandle die Taste im zentralen Klick-Handler. Kein eigener
   addEventListener pro Taste.
5. Ergänze in `styles.css` nur, was wirklich nötig ist, und nutze die
   vorhandenen CSS-Variablen.
6. Gehe die Testfälle aus der AGENTS.md sowie mindestens zwei Fälle
   für die neue Taste gedanklich durch den Code. Nenne die neuen Fälle
   am Ende als Liste, damit ich sie im Browser prüfen kann.
7. Fasse in drei Sätzen zusammen, was du geändert hast.

## Checkliste
- [ ] Button hat type="button" und ein data-Attribut
- [ ] Kein onclick im HTML
- [ ] Berechnung ohne document-Zugriff
- [ ] Fehlerfall behandelt, auch mit Fehlermeldung und leerer Eingabe
- [ ] Anzeige wird über aktualisiereAnzeige() aktualisiert
- [ ] Kein eval, kein innerHTML
```

**`.github/skills/neue-taste/vorlage.md`**

````markdown
# Muster für eine neue Taste

## 1. Button in index.html
Passende Stelle im Raster wählen. Das data-Attribut sagt script.js, was die Taste tut.

```html
<button type="button" class="taste" data-aktion="beispiel" aria-label="Beispiel">B</button>
```

Die drei Arten von data-Attributen im Projekt:
- `data-ziffer="7"` für Ziffern
- `data-operator="+"` für Rechenarten
- `data-aktion="komma"` für alle übrigen Tasten (komma, gleich, loeschen, neue Aktionen)

## 2. Funktion in script.js
Rechenlogik gehört oben in die Datei und greift nicht auf document zu.
Ungültige Eingaben mit einem Error melden.

```javascript
/**
 * Beschreibung auf Deutsch.
 * @param {number} wert
 * @returns {number}
 * @throws {Error} Bei ungültiger Eingabe.
 */
function beispielRechnung(wert) {
  if (!Number.isFinite(wert)) {
    throw new Error("Ungültige Eingabe");
  }
  return wert;
}
```

## 3. Zweig im Klick-Handler
Im vorhandenen `tasten.addEventListener("click", ...)` einen weiteren Zweig ergänzen.
Ergebnisse immer als Text in `aktuelleEingabe` speichern und Fehler mit `meldeFehler` melden.

```javascript
} else if (taste.dataset.aktion === "beispiel") {
  try {
    aktuelleEingabe = String(beispielRechnung(Number(aktuelleEingabe)));
    neueEingabeBeginnt = true;
  } catch (fehler) {
    meldeFehler(fehler.message);
  }
}
```

## 4. Stil in styles.css (nur wenn nötig)
Vorhandene Klassen wiederverwenden. Farben nur über Variablen aus `:root`.

## 5. Testfälle
Immer mindestens: Normalfall, Randfall (zum Beispiel `0`), Zustand nach einer Fehlermeldung.
````

**Erzeugen lassen:** `/create-skill` im Chat, oder nach einer gelungenen Sitzung: „Mach aus unserem Vorgehen einen Skill.“

**Hinweis:** Früher wurden solche Abläufe als Prompt Files (`*.prompt.md`) abgelegt. Laut aktueller VS-Code-Dokumentation sind Prompt Files für Agent-Host-Sitzungen veraltet und werden dort nicht geladen. Für Neues also direkt Skills verwenden.

### 10.3 Skills verwenden

**Automatisch:** Der Agent erkennt an der Beschreibung, dass der Skill passt.

```text
Füge dem Rechner eine Taste hinzu, die die angezeigte Zahl durch 100 teilt.
```

**Manuell über einen Slash-Befehl:**

```text
/neue-taste % teilt die angezeigte Zahl durch 100
```

**Prüfen, ob es klappt**

- `/` im Chat tippen. Steht der Skill in der Liste?
- Läuft die Aufgabe, verweist der Agent sichtbar auf den Skill.
- Wird er nie automatisch genutzt, ist die `description` zu vage. Ergänze konkrete Auslöser.
- Taucht er gar nicht auf, stimmen Ordnername und `name` nicht überein. **Diagnostics** zeigt geladene Skills und Fehler.

**Fremde Skills:** Sammlungen wie `github/awesome-copilot` bieten fertige Skills an. Vor der Nutzung lesen, besonders enthaltene Skripte, denn der Agent kann sie ausführen.

---

## 11. Best Practices

### 11.1 Arbeitsweise

- **Klein anfangen.** Eine Aufgabe pro Sitzung, lieber drei kleine Prompts als einer mit vier Zielen.
- **Erst verstehen, dann ändern.** Bei Fehlern zuerst die Ursache erklären lassen.
- **Jede Änderung lesen.** Du unterschreibst den Commit, egal wer den Code geschrieben hat.
- **Testfälle vorgeben.** Ohne automatische Tests sind konkrete Tastenfolgen mit erwarteter Anzeige dein Erfolgskriterium. Nenne sie im Prompt und geh sie nach der Änderung im Browser durch.
- **Der Browser ist die Wahrheit.** Copilot kann nicht sehen, wie die Seite aussieht und reagiert. Ein Vorschlag, der im Editor sauber wirkt, kann im Browser falsch sein.
- **Sitzungen kurz halten.** Bei langen Verläufen `/compact` nutzen oder neu starten.
- **Wiederholte Hinweise automatisieren.** Dreimal derselbe Satz im Chat bedeutet: ab in die Instructions oder in einen Skill.
- **Selbst mitdenken.** Wenn du eine Erklärung nicht verstehst, nachfragen statt übernehmen. Sonst wächst Code, den niemand im Team erklären kann.

### 11.2 Projekt-Setup

- Mit einer kurzen `AGENTS.md` anfangen. Alles andere kommt bei Bedarf.
- Dateibezogene Instructions nutzen, statt eine Regeldatei aufzublähen.
- Custom Agents erst anlegen, wenn sich eine Rolle wiederholt.
- Skills für Abläufe mit Vorlage und Checkliste.
- Alle Anpassungen ins Repository einchecken, damit das ganze Team davon profitiert.

### 11.3 Sicherheit

- **Nur die nötigen Werkzeuge.** Erklärer und Reviewer lesen nur.
- **Terminalbefehle vor der Freigabe lesen.**
- **Vorsicht bei `eval()`.** Bei Taschenrechner-Aufgaben liegt `eval("3+4*2")` als Abkürzung nahe und wird gelegentlich vorgeschlagen. `eval` führt beliebigen Text als Code aus. Solange der Rechner nur Tasten hat, ist das Risiko klein. Sobald später ein Textfeld, eine URL oder ein Import von Daten dazukommt, wird daraus eine Sicherheitslücke. Deshalb steht das Verbot in der `AGENTS.md`, und der Reviewer prüft es.
- **`innerHTML` mit Nutzereingaben vermeiden.** `textContent` verwenden.
- **Keine Zugangsdaten** in Prompts, Instructions oder Code.
- **Keine echten personenbezogenen Daten** in Prompts kopieren.
- **Vorsicht bei fremden Inhalten.** Texte aus Issues, Webseiten oder PDFs können versteckte Anweisungen enthalten, die ein Agent ausführt. Solche Inhalte keinem Agenten mit Schreibrechten ungeprüft vorlegen.

### 11.4 Kosten

Seit dem 1. Juni 2026 rechnet GitHub Copilot nutzungsbasiert über **GitHub AI Credits** ab. Der Verbrauch hängt von den verarbeiteten Tokens und dem gewählten Modell ab. Praktisch heißt das:

- Lange Agent-Sitzungen mit großen Modellen kosten deutlich mehr als kurze Fragen.
- Gute Instructions sparen Credits, weil weniger Korrekturrunden nötig sind.
- Für einfache Fragen Ask statt Agent verwenden, Modell auf `Auto` lassen.
- Aktuelle Kontingente stehen auf der offiziellen Billing-Seite von GitHub und ändern sich regelmäßig.

### 11.5 Typische Fehler auf einen Blick

| Fehler | Folge | Abhilfe |
|---|---|---|
| Vorschläge ungelesen übernehmen | Fehler, die erst spät auffallen (zum Beispiel die Rundung) | jeden Diff lesen, Testfälle durchgehen |
| Kein Kontext im Prompt | Agent erfindet doppelte Funktionen | `#file:` nutzen oder Datei anhängen |
| Falsche Annahme im Prompt | Agent baut auf etwas Nichtexistierendem auf | erst prüfen lassen, dann bauen |
| Vorschlag mit `eval()` | Sicherheitslücke bei späterer Erweiterung | Verbot in AGENTS.md, Reviewer-Agent |
| Eigener Listener statt zentralem Klick-Handler | Logik verteilt sich, Fehler schwer zu finden | Regel in AGENTS.md, Skill `neue-taste` |
| Zustand nach Fehlermeldung nicht zurückgesetzt | Rechner reagiert seltsam oder hängt | Randfall im Prompt nennen, Testfall 4 prüfen |
| Mehrere Aufgaben in einem Prompt | unübersichtlicher Riesen-Diff | eine Aufgabe pro Sitzung |
| Skill-`name` passt nicht zum Ordner | Skill lädt stillschweigend nicht | Namen abgleichen, Diagnostics prüfen |
| Endlose Sitzung | schlechtere Antworten, höhere Kosten | `/compact` oder neue Sitzung |

### 11.6 Übungen

1. Lass dir mit dem Modus **Ask** den Ablauf von `7 + 3 =` in `script.js` erklären und notiere eine Stelle, die du allein nicht verstanden hättest.
2. Schreibe mit Inline-Vervollständigung die Funktion `formatiereErgebnis`, einmal mit und einmal ohne den Hinweis auf die Rundung im Kommentar. Vergleiche die Vorschläge.
3. Bau die Funktion ein und gehe alle acht Testfälle aus Kapitel 2.5 im Browser durch.
4. Lass den Agenten die Taste **⌫** umsetzen. Prüfe den Diff Zeile für Zeile und teste die Randfälle `0`, `0,` und nach einer Fehlermeldung.
5. Schreibe eine `AGENTS.md` mit höchstens 30 Zeilen und lass die Taste ⌫ noch einmal umsetzen. Was ändert sich im Ergebnis?
6. Formuliere einen schlechten Prompt aus Kapitel 7.2 um und vergleiche die Ergebnisse.
7. Lege den Skill `neue-taste` an und lass die **%-Taste** bauen, ohne den Skill manuell aufzurufen.
8. Baue den Agenten `Reviewer` und lass ihn deine Lösung aus Übung 4 prüfen.
9. Bitte den Agenten bewusst, den Rechner so umzubauen, dass er Terme wie `3+4*2` aus einem Textfeld auswertet. Schau, ob `eval` auftaucht, und lass danach den Reviewer darüberschauen.
10. Zusatz: Lass die Bedienung mit der Tastatur ergänzen, zuerst mit Plan und Prompt Nr. 5 aus Kapitel 7.3.

---

## Quellen

Offizielle Dokumentation, Stand September 2026:

- VS Code, Agents Overview: https://code.visualstudio.com/docs/agents/overview
- VS Code, Agent Customization: https://code.visualstudio.com/docs/agents/concepts/customization
- VS Code, Custom Instructions: https://code.visualstudio.com/docs/agent-customization/custom-instructions
- VS Code, Custom Agents: https://code.visualstudio.com/docs/agent-customization/custom-agents
- VS Code, Agent Skills: https://code.visualstudio.com/docs/agent-customization/agent-skills
- VS Code, MCP-Server: https://code.visualstudio.com/docs/agent-customization/mcp-servers
- VS Code, Prompt Files: https://code.visualstudio.com/docs/agent-customization/prompt-files
- VS Code, Agent Harnesses: https://code.visualstudio.com/docs/agents/run/agent-harnesses
- GitHub Blog, nutzungsbasierte Abrechnung: https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/
- Agent Skills Standard: https://agentskills.io
- Model Context Protocol: https://modelcontextprotocol.io
- Community-Sammlung: https://github.com/github/awesome-copilot

---

*Gepflegt von: [Team/Ansprechperson eintragen]. Letzte Prüfung: September 2026. Copilot ändert sich monatlich, bitte quartalsweise gegen die offiziellen Quellen prüfen.*
