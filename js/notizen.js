// Reine Notizenlogik. Kein Zugriff auf document oder window.

/**
 * Erstellt eine neue Notiz.
 * @param {string} text - Der Inhalt der Notiz, darf nicht leer sein.
 * @returns {{id: string, text: string}}
 */
export function erstelleNotiz(text) {
  const bereinigt = text.trim();
  if (bereinigt === "") {
    throw new Error("Die Notiz braucht einen Text");
  }
  return { id: crypto.randomUUID(), text: bereinigt };
}

/**
 * Gibt eine neue Liste mit der zusätzlichen Notiz zurück.
 * Die übergebene Liste wird nicht verändert.
 */
export function fuegeNotizHinzu(notizen, notiz) {
  return [...notizen, notiz];
}

/**
 * Gibt eine neue Liste zurück, in der der Text der Notiz ersetzt ist.
 * Wirft einen Error, wenn der neue Text leer ist.
 */
export function bearbeiteNotiz(notizen, id, neuerText) {
  const bereinigt = neuerText.trim();
  if (bereinigt === "") {
    throw new Error("Die Notiz braucht einen Text");
  }
  return notizen.map((n) => (n.id === id ? { ...n, text: bereinigt } : n));
}

/** Gibt eine neue Liste ohne die Notiz mit der ID zurück. */
export function loescheNotiz(notizen, id) {
  return notizen.filter((n) => n.id !== id);
}
