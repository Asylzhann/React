// A short message about the result of an action (success or error).
export default function Notice({ notice, onDismiss }) {
  return (
    <div className={`notice ${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
      <span>{notice.text}</span>
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}
