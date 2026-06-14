import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import { WalletProvider } from "./hooks/useWallet.tsx";
import { PinChallengeModal } from "./components/meku/PinChallengeModal.tsx";

// Asset protection — block context menu / drag on every <img> globally.
if (typeof window !== "undefined") {
  window.addEventListener("contextmenu", (e) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "IMG" || t.closest("img"))) e.preventDefault();
  });
  window.addEventListener("dragstart", (e) => {
    const t = e.target as HTMLElement | null;
    if (t && t.tagName === "IMG") e.preventDefault();
  });
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <WalletProvider>
        <App />
        <PinChallengeModal />
      </WalletProvider>
    </AuthProvider>
  </ThemeProvider>
);
