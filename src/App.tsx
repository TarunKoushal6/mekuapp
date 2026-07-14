import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Intro from "./pages/Intro.tsx";
import Home from "./pages/Home.tsx";
import Explore from "./pages/Explore.tsx";
import Create from "./pages/Create.tsx";
import Inbox from "./pages/Inbox.tsx";
import Profile from "./pages/Profile.tsx";
import Notifications from "./pages/Notifications.tsx";
import Onchain from "./pages/Onchain.tsx";
import Chat from "./pages/Chat.tsx";
import NewMessage from "./pages/NewMessage.tsx";
import Auth from "./pages/Auth.tsx";
import Settings from "./pages/Settings.tsx";
import EditProfile from "./pages/EditProfile.tsx";

import Privacy from "./pages/Privacy.tsx";
import Wallet from "./pages/Wallet.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import Browser from "./pages/Browser.tsx";
import Bookmarks from "./pages/Bookmarks.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminVerification from "./pages/admin/AdminVerification.tsx";
import NotFound from "./pages/NotFound.tsx";
import { RequireAuth } from "./components/RequireAuth.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { NotificationsListener } from "./hooks/useNotifications.tsx";
import { PageTransition } from "./components/meku/PageTransition.tsx";
import { useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { easeOutStrong } from "./lib/motion";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Intro />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/p/:id" element={<PostDetail />} />
        <Route path="/u/:handle" element={<Profile />} />
        <Route path="/create" element={<RequireAuth><Create /></RequireAuth>} />
        <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
        <Route path="/inbox/new" element={<RequireAuth><NewMessage /></RequireAuth>} />
        <Route path="/inbox/:id" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/onchain" element={<RequireAuth><Onchain /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="/settings/profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
        <Route path="/settings/privacy" element={<RequireAuth><Privacy /></RequireAuth>} />
        <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
        <Route path="/browser" element={<Browser />} />
        <Route path="/bookmarks" element={<RequireAuth><Bookmarks /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminOverview /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
        <Route path="/admin/verification" element={<RequireAuth><AdminVerification /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <NotificationsListener />
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
