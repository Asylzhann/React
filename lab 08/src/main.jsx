import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { store } from "./store";
import { PwaProvider } from "./context/PwaContext";
import "./styles/main.css";

// HashRouter keeps the route after "#" (for example /#/pets/3).
// GitHub Pages has no server rules, so refreshing a page or opening a direct link still works.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <HashRouter>
        <PwaProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PwaProvider>
      </HashRouter>
    </Provider>
  </StrictMode>
);
