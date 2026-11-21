// Registers the service worker and reports its life events to the app.
//   onUpdate()        a new version has been downloaded and is waiting
//   onOfflineReady()  the first version is installed: the app can now work offline
// Returns { applyUpdate, stop }.
export function registerServiceWorker({ onUpdate, onOfflineReady }) {
  // Only in the built app: in `npm run dev` a service worker would get in the way of hot reload.
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return { applyUpdate() {}, stop() {} };

  let registration = null;
  let updateRequested = false; // true only after the user pressed "Update"

  const watch = (worker) => {
    worker.addEventListener("statechange", () => {
      if (worker.state !== "installed") return;
      // A controller means an older version is running, so this one is an update.
      // No controller means this is the very first install.
      if (navigator.serviceWorker.controller) onUpdate();
      else onOfflineReady();
    });
  };

  const start = async () => {
    try {
      // updateViaCache: "none" = always ask the server for a fresh sw.js, never the browser's HTTP cache.
      registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: "none" });
    } catch (error) {
      console.warn("Service worker registration failed", error);
      return;
    }
    if (registration.waiting && navigator.serviceWorker.controller) onUpdate(); // an update was already waiting
    registration.addEventListener("updatefound", () => registration.installing && watch(registration.installing));
  };

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });

  // When the waiting version takes over, reload once so the page uses the new files.
  const onControllerChange = () => {
    if (updateRequested) window.location.reload();
  };
  navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

  // Look for a new version every hour and whenever the user comes back to the tab.
  const checkForUpdate = () => registration && registration.update().catch(() => {});
  const timer = setInterval(checkForUpdate, 60 * 60 * 1000);
  const onVisible = () => document.visibilityState === "visible" && checkForUpdate();
  document.addEventListener("visibilitychange", onVisible);

  return {
    applyUpdate() {
      updateRequested = true;
      if (registration && registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
    },
    stop() {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    },
  };
}
