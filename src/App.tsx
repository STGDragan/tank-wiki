
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import AquariumDetail from "./pages/AquariumDetail";
import Shopping from "./pages/Shopping";
import SharedWithMe from "./pages/SharedWithMe";
import AcceptInvitation from "./pages/AcceptInvitation";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBaseArticle from "./pages/KnowledgeBaseArticle";
import LegalPage from "./pages/LegalPage";
import LegalDocumentPage from "./pages/LegalDocumentPage";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";
import { AdminRoute } from "./components/admin/AdminRoute";
import Products from "./pages/admin/Products";
import AdminKnowledgeBase from "./pages/admin/KnowledgeBase";
import ArticleEditor from "./pages/admin/ArticleEditor";
import AdminSlideshow from "./pages/admin/Slideshow";
import AdminLegal from "./pages/admin/Legal";
import AdminFeedback from "./pages/admin/Feedback";
import SubscriptionManager from "./pages/admin/SubscriptionManager";
import AdminManagement from "./pages/admin/AdminManagement";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/legal/:documentId" element={<LegalDocumentPage />} />
                
                {/* Protected routes with app layout */}
                <Route path="/" element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/aquarium/:id" element={<AquariumDetail />} />
                  <Route path="/shopping" element={<Shopping />} />
                  <Route path="/shared-with-me" element={<SharedWithMe />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticle />} />
                  <Route path="/feedback" element={<Feedback />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminRoute />}>
                    <Route path="products" element={<Products />} />
                    <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
                    <Route path="knowledge-base/new" element={<ArticleEditor />} />
                    <Route path="knowledge-base/edit/:id" element={<ArticleEditor />} />
                    <Route path="slideshow" element={<AdminSlideshow />} />
                    <Route path="legal" element={<AdminLegal />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="subscriptions" element={<SubscriptionManager />} />
                    <Route path="management" element={<AdminManagement />} />
                  </Route>
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
