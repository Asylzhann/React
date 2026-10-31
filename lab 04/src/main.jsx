import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// StrictMode runs every effect twice in development (mount, cleanup, mount again).
// If an effect is missing its cleanup, this makes the bug visible.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
