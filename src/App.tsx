
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import AquariumDetail from "./pages/AquariumDetail";
import Shopping from "./pages/Shopping";
import ProductDetail from "./pages/ProductDetail";
import PlaceholderProduct from "./pages/PlaceholderProduct";
import SharedWithMe from "./pages/SharedWithMe";
import AcceptInvitation from "./pages/AcceptInvitation";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBaseArticle from "./pages/KnowledgeBaseArticle";
import SpeciesBrowser from "./pages/SpeciesBrowser";
import Feedback from "./pages/Feedback";
import LegalPage from "./pages/LegalPage";
import LegalDocumentPage from "./pages/LegalDocumentPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Pro from "./pages/Pro";
import Upgrade from "./pages/Upgrade";
import AdminRoute from "./components/admin/AdminRoute";
import Products from "./pages/admin/Products";
import KnowledgeBaseAdmin from "./pages/admin/KnowledgeBase";
import ArticleEditor from "./pages/admin/ArticleEditor";
import Slideshow from "./pages/admin/Slideshow";
import Legal from "./pages/admin/Legal";
import FeedbackAdmin from "./pages/admin/Feedback";
import AdminManagement from "./pages/admin/AdminManagement";
import ShoppingManager from "./pages/admin/ShoppingManager";
import SocialMedia from "./pages/admin/SocialMedia";
import SubscriptionManager from "./pages/admin/SubscriptionManager";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/legal/:documentType" element={<LegalDocumentPage />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/account" element={<Account />} />
                <Route path="/aquarium/:id" element={<AquariumDetail />} />
                <Route path="/aquariums/:id" element={<AquariumDetail />} />
                <Route path="/shopping" element={<Shopping />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/placeholder-product" element={<PlaceholderProduct />} />
                <Route path="/shared-with-me" element={<SharedWithMe />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />
                <Route path="/knowledge-base" element={<KnowledgeBase />} />
                <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticle />} />
                <Route path="/species-browser" element={<SpeciesBrowser />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/pro" element={<Pro />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin/products" element={<Products />} />
                  <Route path="/admin/knowledge-base" element={<KnowledgeBaseAdmin />} />
                  <Route path="/admin/knowledge-base/article/:id?" element={<ArticleEditor />} />
                  <Route path="/admin/slideshow" element={<Slideshow />} />
                  <Route path="/admin/legal" element={<Legal />} />
                  <Route path="/admin/feedback" element={<FeedbackAdmin />} />
                  <Route path="/admin/management" element={<AdminManagement />} />
                  <Route path="/admin/shopping" element={<ShoppingManager />} />
                  <Route path="/admin/social-media" element={<SocialMedia />} />
                  <Route path="/admin/subscriptions" element={<SubscriptionManager />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
