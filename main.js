// Einziger Ort im Projekt mit DOM-Zugriff und Event-Handlern.
// Die eigentliche Logik steht in aufgaben.js und notizen.js.

import {
  erstelleAufgabe,
  fuegeAufgabeHinzu,
  schalteAufgabeUm,
  loescheAufgabe,
  offeneAufgaben,
} from "./aufgaben.js";
import {
  erstelleNotiz,
  fuegeNotizHinzu,
  bearbeiteNotiz,
  loescheNotiz,
} from "./notizen.js";
import { laden, speichern } from "./speicher.js";
import { starteUhr } from "./uhr.js";
import { starteWetter } from "./wetter.js";

// Der komplette Zustand des Dashboards.
let daten = { aufgaben: [], notizen: [] };

const elemente = {
  status: document.querySelector("#status"),
  uhr: document.querySelector("#uhr"),
  datum: document.querySelector("#datum"),
  wetter: document.querySelector("#wetter"),
  aufgabenFormular: document.querySelector("#aufgaben-formular"),
  aufgabeEingabe: document.querySelector("#aufgabe-eingabe"),
  aufgabenliste: document.querySelector("#aufgabenliste"),
  aufgabenZaehler: document.querySelector("#aufgaben-zaehler"),
  notizenFormular: document.querySelector("#notizen-formular"),
  notizEingabe: document.querySelector("#notiz-eingabe"),
  notizenliste: document.querySelector("#notizenliste"),
};

/**
 * Zeigt eine kurze Meldung im Kopfbereich an.
 * @param {string} text
 * @param {boolean} istFehler
 */
function zeigeStatus(text, istFehler = false) {
  elemente.status.textContent = text;
  elemente.status.classList.toggle("fehler", istFehler);
}

/** Speichert den aktuellen Zustand und meldet Fehler sichtbar. */
async function speichereZustand() {
  try {
    await speichern(daten);
    zeigeStatus("Gespeichert");
  } catch (fehler) {
    zeigeStatus("Speichern fehlgeschlagen", true);
    console.error(fehler);
  }
}

/** Baut einen Listeneintrag mit Text und Schaltflächen. */
function baueEintrag(text, istErledigt, schaltflaechen) {
  const li = document.createElement("li");
  li.className = "eintrag";
  li.classList.toggle("erledigt", istErledigt);

  const span = document.createElement("span");
  span.className = "titel";
  // textContent statt innerHTML, damit Nutzereingaben kein HTML einschleusen können.
  span.textContent = text;
  li.append(span);

  for (const schaltflaeche of schaltflaechen) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "leise";
    button.textContent = schaltflaeche.beschriftung;
    button.title = schaltflaeche.titel;
    button.addEventListener("click", schaltflaeche.beiKlick);
    li.append(button);
  }

  return li;
}

/** Zeichnet die Aufgabenliste neu. */
function zeichneAufgaben() {
  elemente.aufgabenliste.replaceChildren();

  if (daten.aufgaben.length === 0) {
    const leer = document.createElement("li");
    leer.className = "leer";
    leer.textContent = "Noch keine Aufgaben";
    elemente.aufgabenliste.append(leer);
  }

  for (const aufgabe of daten.aufgaben) {
    const eintrag = baueEintrag(aufgabe.titel, aufgabe.erledigt, [
      {
        beschriftung: aufgabe.erledigt ? "↩" : "✓",
        titel: aufgabe.erledigt ? "Wieder öffnen" : "Abhaken",
        beiKlick: async () => {
          daten.aufgaben = schalteAufgabeUm(daten.aufgaben, aufgabe.id);
          zeichneAufgaben();
          await speichereZustand();
        },
      },
      {
        beschriftung: "✕",
        titel: "Löschen",
        beiKlick: async () => {
          daten.aufgaben = loescheAufgabe(daten.aufgaben, aufgabe.id);
          zeichneAufgaben();
          await speichereZustand();
        },
      },
    ]);
    elemente.aufgabenliste.append(eintrag);
  }

  const offen = offeneAufgaben(daten.aufgaben).length;
  elemente.aufgabenZaehler.textContent = `${offen} von ${daten.aufgaben.length} offen`;
}

/** Zeichnet die Notizenliste neu. */
function zeichneNotizen() {
  elemente.notizenliste.replaceChildren();

  if (daten.notizen.length === 0) {
    const leer = document.createElement("li");
    leer.className = "leer";
    leer.textContent = "Noch keine Notizen";
    elemente.notizenliste.append(leer);
  }

  for (const notiz of daten.notizen) {
    const eintrag = baueEintrag(notiz.text, false, [
      {
        beschriftung: "✎",
        titel: "Bearbeiten",
        beiKlick: async () => {
          const neuerText = prompt("Notiz bearbeiten", notiz.text);
          if (neuerText === null) {
            return;
          }
          try {
            daten.notizen = bearbeiteNotiz(daten.notizen, notiz.id, neuerText);
            zeichneNotizen();
            await speichereZustand();
          } catch (fehler) {
            zeigeStatus(fehler.message, true);
          }
        },
      },
      {
        beschriftung: "✕",
        titel: "Löschen",
        beiKlick: async () => {
          daten.notizen = loescheNotiz(daten.notizen, notiz.id);
          zeichneNotizen();
          await speichereZustand();
        },
      },
    ]);
    elemente.notizenliste.append(eintrag);
  }
}

/** Verbindet die beiden Formulare mit der Logik. */
function verbindeFormulare() {
  elemente.aufgabenFormular.addEventListener("submit", async (ereignis) => {
    ereignis.preventDefault();
    try {
      const aufgabe = erstelleAufgabe(elemente.aufgabeEingabe.value);
      daten.aufgaben = fuegeAufgabeHinzu(daten.aufgaben, aufgabe);
      elemente.aufgabeEingabe.value = "";
      zeichneAufgaben();
      await speichereZustand();
    } catch (fehler) {
      zeigeStatus(fehler.message, true);
    }
  });

  elemente.notizenFormular.addEventListener("submit", async (ereignis) => {
    ereignis.preventDefault();
    try {
      const notiz = erstelleNotiz(elemente.notizEingabe.value);
      daten.notizen = fuegeNotizHinzu(daten.notizen, notiz);
      elemente.notizEingabe.value = "";
      zeichneNotizen();
      await speichereZustand();
    } catch (fehler) {
      zeigeStatus(fehler.message, true);
    }
  });
}

/** Startet das Dashboard. */
async function start() {
  starteUhr(elemente.uhr, elemente.datum);
  starteWetter(elemente.wetter);
  verbindeFormulare();

  try {
    daten = await laden();
    zeigeStatus("Daten geladen");
  } catch (fehler) {
    zeigeStatus("Daten konnten nicht geladen werden", true);
    console.error(fehler);
  }

  zeichneAufgaben();
  zeichneNotizen();
}

start();
