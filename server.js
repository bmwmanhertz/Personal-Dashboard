// Sehr kleiner Entwicklungsserver ohne externe Abhängigkeiten.
// Er liefert die statischen Dateien aus und speichert die Daten in data/daten.json.
// Ein Browser darf selbst keine Dateien auf der Festplatte schreiben,
// deshalb übernimmt das dieser Server.

import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = fileURLToPath(new URL(".", import.meta.url));
const DATENDATEI = join(WURZEL, "data", "daten.json");
const PORT = 3000;

const TYPEN = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

/** Liest den kompletten Anfragekörper als Text. */
async function leseKoerper(anfrage) {
  const teile = [];
  for await (const teil of anfrage) {
    teile.push(teil);
  }
  return Buffer.concat(teile).toString("utf-8");
}

/** Beantwortet die API-Aufrufe unter /api/daten. */
async function behandleApi(anfrage, antwort) {
  if (anfrage.method === "GET") {
    const inhalt = await readFile(DATENDATEI, "utf-8");
    antwort.writeHead(200, { "Content-Type": TYPEN[".json"] });
    antwort.end(inhalt);
    return;
  }

  if (anfrage.method === "PUT") {
    const koerper = await leseKoerper(anfrage);
    let daten;
    try {
      daten = JSON.parse(koerper);
    } catch {
      antwort.writeHead(400, { "Content-Type": TYPEN[".json"] });
      antwort.end(JSON.stringify({ fehler: "Ungültiges JSON" }));
      return;
    }

    if (!Array.isArray(daten.aufgaben) || !Array.isArray(daten.notizen)) {
      antwort.writeHead(400, { "Content-Type": TYPEN[".json"] });
      antwort.end(JSON.stringify({ fehler: "aufgaben und notizen müssen Arrays sein" }));
      return;
    }

    await writeFile(DATENDATEI, JSON.stringify(daten, null, 2), "utf-8");
    antwort.writeHead(200, { "Content-Type": TYPEN[".json"] });
    antwort.end(JSON.stringify({ status: "gespeichert" }));
    return;
  }

  antwort.writeHead(405).end("Methode nicht erlaubt");
}

/** Liefert eine Datei aus dem Projektordner aus. */
async function liefereDatei(pfad, antwort) {
  // normalize verhindert, dass über ".." Dateien außerhalb des Ordners gelesen werden.
  const sicherePfad = normalize(pfad).replace(/^(\.\.[/\\])+/, "");
  const datei = join(WURZEL, sicherePfad);

  try {
    const inhalt = await readFile(datei);
    const typ = TYPEN[extname(datei)] ?? "application/octet-stream";
    antwort.writeHead(200, { "Content-Type": typ });
    antwort.end(inhalt);
  } catch {
    antwort.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    antwort.end("Nicht gefunden");
  }
}

const server = createServer(async (anfrage, antwort) => {
  try {
    const url = new URL(anfrage.url, `http://localhost:${PORT}`);

    if (url.pathname === "/api/daten") {
      await behandleApi(anfrage, antwort);
      return;
    }

    const pfad = url.pathname === "/" ? "/index.html" : url.pathname;
    await liefereDatei(pfad, antwort);
  } catch (fehler) {
    console.error(fehler);
    antwort.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    antwort.end("Serverfehler");
  }
});

server.listen(PORT, () => {
  console.log(`Personal Dashboard läuft auf http://localhost:${PORT}`);
});
