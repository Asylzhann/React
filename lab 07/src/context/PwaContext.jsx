import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { registerServiceWorker } from "../pwa/registerSW";

// Everything about "the app as an installed, offline-capable program":
// connection status, update notification, install button.
const PwaContext = createContext({ online: true, checkNow: async () => true });

const PING_URL = `${import.meta.env.BASE_URL}ping.txt`;

// navigator.onLine only says whether the device has a network card connected. It can say "true"
// with no internet. So we really ask the server: a small file that is never cached.
async function reachServer() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(`${PING_URL}?t=${Date.now()}`, { cache: "no-store", signal: controller.signal });
    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function PwaProvider({ children }) {
  const [online, setOnline] = useState(navigator.onLine);
  const [updateReady, setUpdateReady] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const worker = useRef({ applyUpdate() {} });

  // Check the connection: the browser's quick answer first, then the real test.
  const checkNow = useCallback(async () => {
    const result = navigator.onLine ? await reachServer() : false;
    setOnline(result);
    return result;
  }, []);

  useEffect(() => {
    checkNow();
    const goOffline = () => setOnline(false); // the browser is sure about this one
    const recheck = () => checkNow();
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", recheck);
    document.addEventListener("visibilitychange", recheck);
    const timer = setInterval(() => document.visibilityState === "visible" && checkNow(), 15000);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", recheck);
      document.removeEventListener("visibilitychange", recheck);
      clearInterval(timer);
    };
  }, [checkNow]);

  useEffect(() => {
    worker.current = registerServiceWorker({
      onUpdate: () => setUpdateReady(true),
      onOfflineReady: () => setOfflineReady(true),
    });
    return () => worker.current.stop();
  }, []);

  // The browser fires this when the app can be installed. We keep it to show our own button.
  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const value = {
    online,
    checkNow,
    updateReady,
    applyUpdate: () => worker.current.applyUpdate(),
    dismissUpdate: () => setUpdateReady(false),
    offlineReady,
    dismissOfflineReady: () => setOfflineReady(false),
    canInstall: Boolean(installEvent),
    install,
  };
  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export const usePwa = () => useContext(PwaContext);
