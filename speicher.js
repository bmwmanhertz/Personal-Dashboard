// Einziger Ort im Projekt, an dem mit dem Server gesprochen wird.

/**
 * Lädt Aufgaben und Notizen vom Server.
 * @returns {Promise<{aufgaben: Array, notizen: Array}>}
 */
export async function laden() {
  const antwort = await fetch("/api/daten");
  if (!antwort.ok) {
    throw new Error("Daten konnten nicht geladen werden");
  }
  return antwort.json();
}

/**
 * Speichert Aufgaben und Notizen auf dem Server.
 * @param {{aufgaben: Array, notizen: Array}} daten
 */
export async function speichern(daten) {
  const antwort = await fetch("/api/daten", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(daten),
  });
  if (!antwort.ok) {
    throw new Error("Daten konnten nicht gespeichert werden");
  }
}
