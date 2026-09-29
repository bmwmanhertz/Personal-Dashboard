import { describe, it, expect } from "vitest";
import {
  erstelleAufgabe,
  fuegeAufgabeHinzu,
  schalteAufgabeUm,
  loescheAufgabe,
  offeneAufgaben,
} from "../js/aufgaben.js";

describe("erstelleAufgabe", () => {
  it("entfernt Leerzeichen am Rand", () => {
    const aufgabe = erstelleAufgabe("  Einkaufen  ");

    expect(aufgabe.titel).toBe("Einkaufen");
  });

  it("legt neue Aufgaben als offen an", () => {
    const aufgabe = erstelleAufgabe("Lernen");

    expect(aufgabe.erledigt).toBe(false);
  });

  it("wirft bei leerem Titel", () => {
    expect(() => erstelleAufgabe("   ")).toThrow();
  });
});

describe("fuegeAufgabeHinzu", () => {
  it("verändert die Originalliste nicht", () => {
    const original = [];

    fuegeAufgabeHinzu(original, erstelleAufgabe("Test"));

    expect(original).toHaveLength(0);
  });
});

describe("schalteAufgabeUm", () => {
  it("hakt eine offene Aufgabe ab", () => {
    const liste = [{ id: "1", titel: "Test", erledigt: false }];

    const neu = schalteAufgabeUm(liste, "1");

    expect(neu[0].erledigt).toBe(true);
  });

  it("verändert die Originalliste nicht", () => {
    const original = [{ id: "1", titel: "Test", erledigt: false }];

    schalteAufgabeUm(original, "1");

    expect(original[0].erledigt).toBe(false);
  });

  it("ignoriert unbekannte IDs", () => {
    const liste = [{ id: "1", titel: "Test", erledigt: false }];

    const neu = schalteAufgabeUm(liste, "gibt-es-nicht");

    expect(neu).toEqual(liste);
  });
});

describe("loescheAufgabe", () => {
  it("entfernt genau einen Eintrag", () => {
    const liste = [
      { id: "1", titel: "A", erledigt: false },
      { id: "2", titel: "B", erledigt: false },
    ];

    const neu = loescheAufgabe(liste, "1");

    expect(neu).toHaveLength(1);
    expect(neu[0].id).toBe("2");
  });

  it("verändert die Originalliste nicht", () => {
    const original = [{ id: "1", titel: "A", erledigt: false }];

    loescheAufgabe(original, "1");

    expect(original).toHaveLength(1);
  });
});

describe("offeneAufgaben", () => {
  it("gibt nur nicht erledigte Aufgaben zurück", () => {
    const liste = [
      { id: "1", titel: "A", erledigt: true },
      { id: "2", titel: "B", erledigt: false },
    ];

    expect(offeneAufgaben(liste)).toHaveLength(1);
  });

  it("gibt bei leerer Liste eine leere Liste zurück", () => {
    expect(offeneAufgaben([])).toEqual([]);
  });
});
