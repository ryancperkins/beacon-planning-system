import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BookOpen, Users, GraduationCap, Puzzle, Settings } from "lucide-react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/beacon/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import AuthPage from "@/pages/AuthPage";
import OnboardingPage from "@/pages/OnboardingPage";
import TimelinePage from "@/pages/TimelinePage";
import InboxPage from "@/pages/InboxPage";
import InitiativesPage from "@/pages/InitiativesPage";
import InitiativeDetailPage from "@/pages/InitiativeDetailPage";
import CreateInitiativePage from "@/pages/CreateInitiativePage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/timeline" replace />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="initiatives" element={<InitiativesPage />} />
                <Route path="initiatives/:id" element={<InitiativeDetailPage />} />
                <Route path="create" element={<CreateInitiativePage />} />
                <Route path="library" element={<PlaceholderPage title="Resource Library" description="Browse and share creative assets across your church network." Icon={BookOpen} />} />
                <Route path="community" element={<PlaceholderPage title="Community" description="Connect with church creatives, share case studies, and learn together." Icon={Users} />} />
                <Route path="mentorship" element={<PlaceholderPage title="Mentorship" description="Find experienced creative directors who can guide your ministry." Icon={GraduationCap} />} />
                <Route path="integrations" element={<PlaceholderPage title="Integrations" description="Connect Beacon to your existing tools like ClickUp, Planning Center, and Slack." Icon={Puzzle} />} />
                <Route path="admin" element={<PlaceholderPage title="Admin" description="Manage your church workspace, token allocations, and team permissions." Icon={Settings} />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
