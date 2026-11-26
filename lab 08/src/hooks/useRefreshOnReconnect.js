import { useEffect, useRef } from "react";
import { usePwa } from "../context/PwaContext";

// When the connection comes back, call refresh() if the screen shows an error or a saved copy.
export function useRefreshOnReconnect(needsRefresh, refresh) {
  const { online } = usePwa();
  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current && needsRefresh) refresh();
    wasOnline.current = online;
  }, [online]);
}
