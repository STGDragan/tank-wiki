
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AquariumDetail from "./pages/AquariumDetail";
import Account from "./pages/Account";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBaseArticle from "./pages/KnowledgeBaseArticle";
import Shopping from "./pages/Shopping";
import ProductDetail from "./pages/ProductDetail";
import Feedback from "./pages/Feedback";
import SharedWithMe from "./pages/SharedWithMe";
import LegalPage from "./pages/LegalPage";
import Pro from "./pages/Pro";
import Upgrade from "./pages/Upgrade";
import Analytics from "./pages/Analytics";
import Compatibility from "./pages/Compatibility";
import AdminProducts from "./pages/admin/Products";
import AdminKnowledgeBase from "./pages/admin/KnowledgeBase";
import AdminSlideshow from "./pages/admin/Slideshow";
import AdminLegal from "./pages/admin/Legal";
import AdminFeedback from "./pages/admin/Feedback";
import AdminSubscriptionManager from "./pages/admin/SubscriptionManager";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminSocialMedia from "./pages/admin/SocialMedia";
import ArticleEditor from "./pages/admin/ArticleEditor";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/aquarium/:id" element={<AquariumDetail />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticle />} />
                  <Route path="/shopping" element={<Shopping />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/shared-with-me" element={<SharedWithMe />} />
                  <Route path="/legal/:type" element={<LegalPage />} />
                  <Route path="/pro" element={<Pro />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/compatibility" element={<Compatibility />} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/knowledge-base" element={<AdminKnowledgeBase />} />
                    <Route path="/admin/knowledge-base/article/new" element={<ArticleEditor />} />
                    <Route path="/admin/knowledge-base/article/edit/:slug" element={<ArticleEditor />} />
                    <Route path="/admin/slideshow" element={<AdminSlideshow />} />
                    <Route path="/admin/legal" element={<AdminLegal />} />
                    <Route path="/admin/feedback" element={<AdminFeedback />} />
                    <Route path="/admin/subscriptions" element={<AdminSubscriptionManager />} />
                    <Route path="/admin/management" element={<AdminManagement />} />
                    <Route path="/admin/social-media" element={<AdminSocialMedia />} />
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
