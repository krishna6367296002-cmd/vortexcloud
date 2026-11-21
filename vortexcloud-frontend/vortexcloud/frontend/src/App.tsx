import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { NavigationHeader } from "@/components/layout/NavigationHeader";
import { Footer } from "@/components/layout/Footer";
import { FloatingSupport } from "@/components/common/FloatingSupport";
import { RecentBookingsTicker } from "@/components/common/RecentBookingsTicker";
import { scrollToSection } from "@/lib/sections";
import Home from "@/pages/Home";
import GameDetail from "@/pages/GameDetail";
import MyBookings from "@/pages/MyBookings";
import LiveSession from "@/pages/LiveSession";
import AdminDashboard from "@/pages/AdminDashboard";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const t = setTimeout(() => scrollToSection(id), 80);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

// One Router and one QueryClientProvider live in main.tsx; this is just the routes table.
export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const isSession = pathname.startsWith("/session");

  return (
    <div className="cyber-grid flex min-h-screen flex-col bg-background text-foreground">
      <ScrollManager />
      <AnnouncementBar />
      <NavigationHeader />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={<GameDetail />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/session/:bookingId" element={<LiveSession />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/owner" element={<Navigate to="/admin" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {!isAdmin && <FloatingSupport />}
      {!isAdmin && !isSession && <RecentBookingsTicker />}
      <Toaster offset={{ bottom: 88 }} mobileOffset={{ bottom: 84 }} />
    </div>
  );
}
