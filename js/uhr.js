// Widget: Uhrzeit und Datum.
// Bekommt seine Ziel-Elemente übergeben und sucht sie nicht selbst.

/**
 * Formatiert die Uhrzeit im deutschen Format, zum Beispiel "09:05:03".
 * Reine Funktion, damit sie ohne Browser testbar ist.
 * @param {Date} zeitpunkt
 * @returns {string}
 */
export function formatiereUhrzeit(zeitpunkt) {
  return zeitpunkt.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Formatiert das Datum, zum Beispiel "Donnerstag, 24. September 2026".
 * @param {Date} zeitpunkt
 * @returns {string}
 */
export function formatiereDatum(zeitpunkt) {
  return zeitpunkt.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Startet die Uhr und aktualisiert die Elemente jede Sekunde.
 * @param {HTMLElement} uhrElement
 * @param {HTMLElement} datumElement
 */
export function starteUhr(uhrElement, datumElement) {
  function aktualisieren() {
    const jetzt = new Date();
    uhrElement.textContent = formatiereUhrzeit(jetzt);
    datumElement.textContent = formatiereDatum(jetzt);
  }

  aktualisieren();
  setInterval(aktualisieren, 1000);
}
