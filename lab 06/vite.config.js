import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the build work from a sub-folder such as /React/lab-05/
export default defineConfig({ plugins: [react()], base: "./" });
