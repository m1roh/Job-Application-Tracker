import { describe, expect, it } from "vitest";
import { CandidatureId } from "./candidature-id.js";

describe("CandidatureId", () => {
  describe("from (cas invalides)", () => {
    it("rejette une chaîne vide", () => {
      expect(() => CandidatureId.from("")).toThrow();
    });

    it("rejette une chaîne qui n'est pas un UUID", () => {
      expect(() => CandidatureId.from("pas-un-uuid")).toThrow();
    });
  });

  describe("from (cas valides)", () => {
    it("accepte un UUID v4 valide et expose sa valeur", () => {
      const uuid = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

      const id = CandidatureId.from(uuid);

      expect(id.toString()).toBe(uuid);
    });
  });

  describe("generate", () => {
    it("génère un identifiant valide (réutilisable via from)", () => {
      const id = CandidatureId.generate();

      expect(() => CandidatureId.from(id.toString())).not.toThrow();
    });

    it("génère un identifiant différent à chaque appel", () => {
      const first = CandidatureId.generate();
      const second = CandidatureId.generate();

      expect(first.toString()).not.toBe(second.toString());
    });
  });

  describe("equals", () => {
    it("retourne true pour deux identifiants construits à partir de la même valeur", () => {
      const uuid = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

      expect(CandidatureId.from(uuid).equals(CandidatureId.from(uuid))).toBe(true);
    });

    it("retourne false pour deux identifiants différents", () => {
      const a = CandidatureId.generate();
      const b = CandidatureId.generate();

      expect(a.equals(b)).toBe(false);
    });
  });
});
