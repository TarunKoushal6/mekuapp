import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls window to top on every route change. Keeps nav feeling native/Apple-like. */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // jump (no animation) so transitions feel instant like native iOS
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

export default ScrollToTop;
