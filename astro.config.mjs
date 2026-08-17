import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://cyanseek.github.io",
  base: "/VibeMath",
  trailingSlash: "always",
  build: { format: "directory" },
});
