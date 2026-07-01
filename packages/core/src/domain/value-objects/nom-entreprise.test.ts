import { describe, expect, it } from "vitest";
import { NomEntreprise } from "./nom-entreprise.js";

describe("NomEntreprise", () => {
  describe("cas invalides", () => {
    it("rejette une chaîne vide", () => {
      expect(() => NomEntreprise.from("")).toThrow();
    });

    it("rejette une chaîne composée uniquement d'espaces", () => {
      expect(() => NomEntreprise.from("   ")).toThrow();
    });

    it("rejette un nom trop long (> 200 caractères)", () => {
      const nomTropLong = "a".repeat(201);

      expect(() => NomEntreprise.from(nomTropLong)).toThrow();
    });

    it("rejette un nom contenant un caractère de contrôle", () => {
      expect(() => NomEntreprise.from("Acme\u0000Corp")).toThrow();
    });
  });

  describe("cas valides", () => {
    it("accepte un nom valide et expose sa valeur", () => {
      const nomEntreprise = NomEntreprise.from("Acme Corp");

      expect(nomEntreprise.toString()).toBe("Acme Corp");
    });

    it("accepte un nom de exactement 200 caractères", () => {
      const nomLimite = "a".repeat(200);

      expect(() => NomEntreprise.from(nomLimite)).not.toThrow();
    });
  });

  describe("equals", () => {
    it("retourne true pour deux noms construits à partir de la même valeur", () => {
      expect(NomEntreprise.from("Acme Corp").equals(NomEntreprise.from("Acme Corp"))).toBe(true);
    });

    it("retourne false pour deux noms différents", () => {
      expect(NomEntreprise.from("Acme Corp").equals(NomEntreprise.from("Globex"))).toBe(false);
    });
  });
});
