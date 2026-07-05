export * from "./colors";
export * from "./typography";
export * from "./radii";
export * from "./spacing";

import { neutralColors, statusColors } from "./colors";
import { radii } from "./radii";
import { controlHeights, controlPaddingInline } from "./spacing";

function toCssVarBlock(prefix: string, values: Record<string, string>): string {
  return Object.entries(values)
    .map(([key, value]) => `  --${prefix}-${kebabCase(key)}: ${value};`)
    .join("\n");
}

function kebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export const cssVariables = `:root {
${toCssVarBlock("color", neutralColors)}
${Object.entries(statusColors)
  .map(([status, tokens]) =>
    Object.entries(tokens)
      .map(([tokenName, value]) => `  --color-status-${status.replace(/_/g, "-")}-${tokenName}: ${value};`)
      .join("\n"),
  )
  .join("\n")}
${toCssVarBlock("radius", radii)}
${toCssVarBlock("control-height", controlHeights)}
${toCssVarBlock("control-padding-inline", controlPaddingInline)}
}
`;
