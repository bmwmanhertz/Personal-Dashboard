// Reine Aufgabenlogik. Diese Datei greift nicht auf document oder window zu,
// damit sie ohne Browser getestet werden kann.

/**
 * Erstellt eine neue Aufgabe.
 * @param {string} titel - Der Text der Aufgabe, darf nicht leer sein.
 * @returns {{id: string, titel: string, erledigt: boolean}}
 */
export function erstelleAufgabe(titel) {
  const bereinigt = titel.trim();
  if (bereinigt === "") {
    throw new Error("Die Aufgabe braucht einen Titel");
  }
  return { id: crypto.randomUUID(), titel: bereinigt, erledigt: false };
}

/**
 * Gibt eine neue Liste mit der zusätzlichen Aufgabe zurück.
 * Die übergebene Liste wird nicht verändert.
 */
export function fuegeAufgabeHinzu(aufgaben, aufgabe) {
  return [...aufgaben, aufgabe];
}

/**
 * Gibt eine neue Liste zurück, in der die Aufgabe mit der ID umgeschaltet ist.
 * Die übergebene Liste wird nicht verändert.
 */
export function schalteAufgabeUm(aufgaben, id) {
  return aufgaben.map((a) => (a.id === id ? { ...a, erledigt: !a.erledigt } : a));
}

/** Gibt eine neue Liste ohne die Aufgabe mit der ID zurück. */
export function loescheAufgabe(aufgaben, id) {
  return aufgaben.filter((a) => a.id !== id);
}

/** Gibt nur die noch offenen Aufgaben zurück. */
export function offeneAufgaben(aufgaben) {
  return aufgaben.filter((a) => !a.erledigt);
}

// Übung aus Kapitel 5 des Onboarding-Dokuments:
// Hier fehlt bewusst die Funktion bearbeiteAufgabe(aufgaben, id, neuerTitel).
// Schreibe sie mit Hilfe der Inline-Vervollständigung und binde sie danach
// in js/main.js ein.
