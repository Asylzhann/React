import { useState, useEffect, useRef } from "react";

// A search box that reports its text 400 ms after the user stops typing (debounce), or at once on Enter.
// `value` is the text from the URL; the typed text is local until it is reported.
export default function SearchInput({ value, onSearch, placeholder, label, delay = 400 }) {
  const [text, setText] = useState(value);
  const sent = useRef(value);
  const report = useRef(onSearch);
  report.current = onSearch; // always the newest function, so a waiting timer never uses outdated URL values

  // Back / Forward / Reset change the URL from outside: the box follows it.
  useEffect(() => {
    if (value !== sent.current) {
      sent.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === sent.current) return;
    const timer = setTimeout(() => {
      sent.current = trimmed;
      report.current(trimmed);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  const submit = (e) => {
    e.preventDefault();
    sent.current = text.trim();
    report.current(sent.current);
  };

  return (
    <form className="search" role="search" onSubmit={submit}>
      <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={label} />
    </form>
  );
}
