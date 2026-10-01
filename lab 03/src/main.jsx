import { createRoot } from "react-dom/client";
import App from "./App";

// StrictMode is left off on purpose so each console.log fires once per render.
createRoot(document.getElementById("root")).render(<App />);
