import type { Preview } from "@storybook/nextjs-vite";
import { cssVariables } from "@job-tracker/design-tokens";

if (typeof document !== "undefined" && !document.getElementById("design-tokens")) {
  const style = document.createElement("style");
  style.id = "design-tokens";
  style.innerHTML = cssVariables;
  document.head.appendChild(style);
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
