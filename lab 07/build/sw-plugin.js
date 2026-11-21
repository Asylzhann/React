import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULTS = {
  apiOrigins: ["https://dog.ceo"],
  imageOrigins: ["https://images.dog.ceo"],
  maxApiEntries: 50,
  maxImageEntries: 60,
};

// All files below `dir`, as paths relative to it, with "/" separators.
function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join("/")];
  });
}

// Files that must not be pre-cached: the service worker itself, the connectivity probe, source maps, junk.
const skip = (file) => file === "sw.js" || file === "ping.txt" || file.endsWith(".map") || file.endsWith(".DS_Store");

export function generateServiceWorker(distDir, options = {}) {
  const settings = { ...DEFAULTS, ...options };
  const files = listFiles(distDir).filter((file) => !skip(file)).sort();

  const hash = crypto.createHash("sha1");
  for (const file of files) {
    hash.update(file);
    hash.update(fs.readFileSync(path.join(distDir, file)));
  }
  const version = hash.digest("hex").slice(0, 10);

  let source = fs.readFileSync(path.join(here, "sw-template.js"), "utf8");
  const fill = (marker, value) => {
    if (!source.includes(marker)) throw new Error(`sw-template.js has no ${marker}`);
    source = source.split(marker).join(typeof value === "string" ? value : JSON.stringify(value));
  };
  fill("__VERSION__", version);
  fill("/*__PRECACHE_URLS__*/ []", files);
  fill("/*__API_ORIGINS__*/ []", settings.apiOrigins);
  fill("/*__IMAGE_ORIGINS__*/ []", settings.imageOrigins);
  fill("/*__MAX_API_ENTRIES__*/ 50", settings.maxApiEntries);
  fill("/*__MAX_IMAGE_ENTRIES__*/ 60", settings.maxImageEntries);

  fs.writeFileSync(path.join(distDir, "sw.js"), source);
  return { version, files };
}

// The Vite plugin: runs after the bundle has been written to dist.
export function serviceWorkerPlugin(options) {
  let outDir = "dist";
  return {
    name: "generate-service-worker",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const { version, files } = generateServiceWorker(outDir, options);
      console.log(`service worker: version ${version}, ${files.length} files pre-cached`);
    },
  };
}
