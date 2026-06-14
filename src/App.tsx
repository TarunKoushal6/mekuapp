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
import Auth from "./pages/Auth.tsx";
import Settings from "./pages/Settings.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import Appearance from "./pages/Appearance.tsx";
import Privacy from "./pages/Privacy.tsx";
import Wallet from "./pages/Wallet.tsx";
import PostDetail from "./pages/PostDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import { RequireAuth } from "./components/RequireAuth.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/p/:id" element={<PostDetail />} />
          <Route path="/u/:handle" element={<Profile />} />
          <Route path="/create" element={<RequireAuth><Create /></RequireAuth>} />
          <Route path="/inbox" element={<RequireAuth><Inbox /></RequireAuth>} />
          <Route path="/inbox/:id" element={<RequireAuth><Chat /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/onchain" element={<RequireAuth><Onchain /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/settings/profile" element={<RequireAuth><EditProfile /></RequireAuth>} />
          <Route path="/settings/appearance" element={<Appearance />} />
          <Route path="/settings/privacy" element={<RequireAuth><Privacy /></RequireAuth>} />
          <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
