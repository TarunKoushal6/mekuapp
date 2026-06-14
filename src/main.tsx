import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./hooks/useAuth.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import { WalletProvider } from "./hooks/useWallet.tsx";
import { PinChallengeModal } from "./components/meku/PinChallengeModal.tsx";

// Asset protection — block context menu / drag / selection globally.
if (typeof window !== "undefined") {
  const stopOnImage = (e: Event) => {
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "IMG" || t.closest("img") || t.closest(".no-save"))) {
      e.preventDefault();
    }
  };
  window.addEventListener("contextmenu", stopOnImage);
  window.addEventListener("dragstart", stopOnImage);
  window.addEventListener("selectstart", (e) => {
    const t = e.target as HTMLElement | null;
    if (t && t.closest(".no-save")) e.preventDefault();
  });
  // iOS Safari long-press
  document.addEventListener("touchstart", () => {}, { passive: true });
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
