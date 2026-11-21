import { usePwa } from "../context/PwaContext";

// Messages about the app itself: no connection, a new version, ready for offline use.
export default function AppNotices() {
  const { online, updateReady, applyUpdate, dismissUpdate, offlineReady, dismissOfflineReady } = usePwa();
  return (
    <>
      {!online && (
        <div className="offline-banner" role="status">
          You are offline. Pages you have opened and saved data are still available.
        </div>
      )}
      {(updateReady || offlineReady) && (
        <div className="toast" role="status">
          {updateReady ? (
            <>
              <span>A new version of the app is available.</span>
              <button className="primary" onClick={applyUpdate}>
                Update
              </button>
              <button onClick={dismissUpdate}>Later</button>
            </>
          ) : (
            <>
              <span>The app is ready to work offline.</span>
              <button onClick={dismissOfflineReady}>OK</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
