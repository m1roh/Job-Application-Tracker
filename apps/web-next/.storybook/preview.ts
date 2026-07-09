import type { Preview } from "@storybook/nextjs-vite";
import { cssVariables } from "@job-tracker/design-tokens";

if (typeof document !== "undefined" && !document.getElementById("design-tokens")) {
  const style = document.createElement("style");
  style.id = "design-tokens";
  style.innerHTML = cssVariables;
  document.head.appendChild(style);
}

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "error",
    },
  },
};

export default preview;
