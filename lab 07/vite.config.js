import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { serviceWorkerPlugin } from "./build/sw-plugin.js";

// base "./" makes the build work from a sub-folder such as /React/lab-07/
// serviceWorkerPlugin() creates dist/sw.js after the build (see build/sw-plugin.js)
export default defineConfig({ plugins: [react(), serviceWorkerPlugin()], base: "./" });
