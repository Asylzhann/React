// Shows a loading, error or empty message, with an optional action button.
export default function StatusMessage({ kind, message, action }) {
  return (
    <div className={`status ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {kind === "loading" && <span className="spinner" aria-hidden="true" />}
      <p>{message}</p>
      {action && <button onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}
