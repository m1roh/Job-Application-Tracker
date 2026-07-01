const LONGUEUR_MAX = 200;
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/;

export class NomEntreprise {
  private constructor(private readonly value: string) {}

  static from(value: string): NomEntreprise {
    if (value.trim().length === 0) {
      throw new Error("NomEntreprise invalide : la valeur ne peut pas être vide");
    }

    if (value.length > LONGUEUR_MAX) {
      throw new Error(`NomEntreprise invalide : dépasse ${LONGUEUR_MAX} caractères`);
    }

    if (CONTROL_CHAR_PATTERN.test(value)) {
      throw new Error("NomEntreprise invalide : contient un caractère de contrôle");
    }

    return new NomEntreprise(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: NomEntreprise): boolean {
    return this.value === other.value;
  }
}
