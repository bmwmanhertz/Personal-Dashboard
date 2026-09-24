import { describe, it, expect } from "vitest";
import {
  erstelleNotiz,
  fuegeNotizHinzu,
  bearbeiteNotiz,
  loescheNotiz,
} from "../js/notizen.js";

describe("erstelleNotiz", () => {
  it("entfernt Leerzeichen am Rand", () => {
    expect(erstelleNotiz("  Hallo  ").text).toBe("Hallo");
  });

  it("wirft bei leerem Text", () => {
    expect(() => erstelleNotiz("  ")).toThrow();
  });
});

describe("fuegeNotizHinzu", () => {
  it("verändert die Originalliste nicht", () => {
    const original = [];

    fuegeNotizHinzu(original, erstelleNotiz("Test"));

    expect(original).toHaveLength(0);
  });
});

describe("bearbeiteNotiz", () => {
  it("ersetzt den Text", () => {
    const liste = [{ id: "1", text: "alt" }];

    const neu = bearbeiteNotiz(liste, "1", "neu");

    expect(neu[0].text).toBe("neu");
  });

  it("verändert die Originalliste nicht", () => {
    const original = [{ id: "1", text: "alt" }];

    bearbeiteNotiz(original, "1", "neu");

    expect(original[0].text).toBe("alt");
  });

  it("wirft bei leerem Text", () => {
    const liste = [{ id: "1", text: "alt" }];

    expect(() => bearbeiteNotiz(liste, "1", "   ")).toThrow();
  });
});

describe("loescheNotiz", () => {
  it("entfernt genau einen Eintrag", () => {
    const liste = [
      { id: "1", text: "A" },
      { id: "2", text: "B" },
    ];

    expect(loescheNotiz(liste, "1")).toHaveLength(1);
  });
});
