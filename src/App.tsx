
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
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
import AdminShoppingManager from "./pages/admin/ShoppingManager";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
                <Route path="/admin/shopping" element={<AdminShoppingManager />} />
                <Route path="/knowledge-base" element={<KnowledgeBase />} />
                <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticle />} />
                <Route path="/shopping" element={<Shopping />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/shared-with-me" element={<SharedWithMe />} />
                <Route path="/legal/:type" element={<LegalPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
