// Widget: Wetter.
// Liest vorerst Mock-Daten aus data/wetter.mock.json.
// Später kann hier eine echte Wetter-API angebunden werden.

/**
 * Baut den Anzeigetext für das Wetter.
 * Reine Funktion ohne DOM, damit sie testbar ist.
 * @param {{ort: string, temperatur: number, beschreibung: string}} wetter
 * @returns {string}
 */
export function formatiereWetter(wetter) {
  if (!wetter) {
    return "Keine Wetterdaten";
  }
  return `${wetter.ort}: ${wetter.temperatur} Grad, ${wetter.beschreibung}`;
}

/**
 * Lädt die Mock-Wetterdaten und schreibt sie in das Element.
 * @param {HTMLElement} element
 */
export async function starteWetter(element) {
  try {
    const antwort = await fetch("data/wetter.mock.json");
    if (!antwort.ok) {
      throw new Error("Wetterdaten nicht erreichbar");
    }
    const wetter = await antwort.json();
    element.textContent = formatiereWetter(wetter);
  } catch (fehler) {
    element.textContent = "Wetter konnte nicht geladen werden";
    console.error(fehler);
  }
}
