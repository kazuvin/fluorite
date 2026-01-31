import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateThemeCSS } from "../src/tailwind";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../generated/theme.css");

const css = generateThemeCSS();
writeFileSync(outputPath, css, "utf-8");

console.log(`Generated: ${outputPath}`);
