import { usePwa } from "../context/PwaContext";

export default function ConnectionBadge() {
  const { online } = usePwa();
  return (
    <span className={online ? "conn on" : "conn off"} role="status">
      <span className="dot" aria-hidden="true" />
      {online ? "Online" : "Offline"}
    </span>
  );
}
