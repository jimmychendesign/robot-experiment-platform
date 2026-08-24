import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const portableRoot = fileURLToPath(new URL("./tools/portable", import.meta.url));
const outputDirectory = process.env.ROBOTOPS_PORTABLE_OUT;

if (!outputDirectory) {
  throw new Error("ROBOTOPS_PORTABLE_OUT is required.");
}

export default defineConfig({
  root: portableRoot,
  base: "./",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, outputDirectory),
    emptyOutDir: true,
    sourcemap: false,
    target: "es2022",
  },
});
