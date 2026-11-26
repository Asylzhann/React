// Registers the service worker. onUpdate: a new version is waiting. onOfflineReady: first install done.
export function registerServiceWorker({ onUpdate, onOfflineReady }) {
  // Production build only: in `npm run dev` a service worker would get in the way of hot reload.
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return { applyUpdate() {}, stop() {} };

  let registration = null;
  let updateRequested = false;

  const watch = (worker) => {
    worker.addEventListener("statechange", () => {
      if (worker.state !== "installed") return;
      // A controller means an older version is running, so this is an update.
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
    if (registration.waiting && navigator.serviceWorker.controller) onUpdate();
    registration.addEventListener("updatefound", () => registration.installing && watch(registration.installing));
  };

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });

  const onControllerChange = () => {
    if (updateRequested) window.location.reload();
  };
  navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

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
