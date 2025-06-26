
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AquariumDetail from "./pages/AquariumDetail";
import SharedWithMe from "./pages/SharedWithMe";
import AcceptInvitation from "./pages/AcceptInvitation";
import Shopping from "./pages/Shopping";
import ProductDetail from "./pages/ProductDetail";
import PlaceholderProduct from "./pages/PlaceholderProduct";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBaseArticle from "./pages/KnowledgeBaseArticle";
import SpeciesBrowserPage from "./pages/SpeciesBrowser";
import Account from "./pages/Account";
import Feedback from "./pages/Feedback";
import LegalPage from "./pages/LegalPage";
import LegalDocumentPage from "./pages/LegalDocumentPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminProducts from "./pages/admin/Products";
import AdminShoppingManager from "./pages/admin/ShoppingManager";
import AdminKnowledgeBase from "./pages/admin/KnowledgeBase";
import ArticleEditor from "./pages/admin/ArticleEditor";
import AdminSlideshow from "./pages/admin/Slideshow";
import AdminLegal from "./pages/admin/Legal";
import AdminFeedback from "./pages/admin/Feedback";
import AdminSubscriptions from "./pages/admin/SubscriptionManager";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminSocialMedia from "./pages/admin/SocialMedia";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/legal/:slug" element={<LegalDocumentPage />} />
                <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/aquarium/:id" element={<AquariumDetail />} />
                  <Route path="/aquariums/:id" element={<AquariumDetail />} />
                  <Route path="/shared-with-me" element={<SharedWithMe />} />
                  <Route path="/shopping" element={<Shopping />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/placeholder-product/:id" element={<PlaceholderProduct />} />
                  <Route path="/knowledge-base" element={<KnowledgeBase />} />
                  <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticle />} />
                  <Route path="/species-browser" element={<SpeciesBrowserPage />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                  <Route path="/admin/shopping-manager" element={<AdminRoute><AdminShoppingManager /></AdminRoute>} />
                  <Route path="/admin/knowledge-base" element={<AdminRoute><AdminKnowledgeBase /></AdminRoute>} />
                  <Route path="/admin/knowledge-base/article/new" element={<AdminRoute><ArticleEditor /></AdminRoute>} />
                  <Route path="/admin/knowledge-base/article/edit/:slug" element={<AdminRoute><ArticleEditor /></AdminRoute>} />
                  <Route path="/admin/slideshow" element={<AdminRoute><AdminSlideshow /></AdminRoute>} />
                  <Route path="/admin/legal" element={<AdminRoute><AdminLegal /></AdminRoute>} />
                  <Route path="/admin/feedback" element={<AdminRoute><AdminFeedback /></AdminRoute>} />
                  <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
                  <Route path="/admin/management" element={<AdminRoute><AdminManagement /></AdminRoute>} />
                  <Route path="/admin/social-media" element={<AdminRoute><AdminSocialMedia /></AdminRoute>} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
