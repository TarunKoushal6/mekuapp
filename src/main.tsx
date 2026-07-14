import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
// @ts-ignore -- font side-effect import
import "@fontsource-variable/manrope";
import "./index.css";
import "./styles/transitions.css";
import { AuthProvider } from "./hooks/useAuth.tsx";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import { WalletProvider } from "./hooks/useWallet.tsx";
import { PinProvider } from "./hooks/usePin.tsx";


// Asset protection — block context menu / drag globally, but only when the
// event target is an actual Element. `e.target` for `selectstart` can be a
// non-Element (text/document), which is why `t.closest` was crashing.
if (typeof window !== "undefined") {
  const isElement = (n: unknown): n is Element =>
    !!n && typeof n === "object" && (n as Element).nodeType === 1 &&
    typeof (n as Element).closest === "function";

  const stopOnImage = (e: Event) => {
    const t = e.target;
    if (!isElement(t)) return;
    if (t.tagName === "IMG" || t.closest("img") || t.closest(".no-save")) {
      e.preventDefault();
    }
  };
  window.addEventListener("contextmenu", stopOnImage);
  window.addEventListener("dragstart", stopOnImage);
  document.addEventListener("selectstart", (e) => {
    const t = e.target;
    if (isElement(t) && t.closest(".no-save")) e.preventDefault();
  });
  // iOS Safari: ensure long-press menu is suppressed via CSS only.
  document.addEventListener("touchstart", () => {}, { passive: true });
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AuthProvider>
      <WalletProvider>
        <PinProvider>
          <App />
        </PinProvider>
      </WalletProvider>

    </AuthProvider>
  </ThemeProvider>
);
