
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AquariumDetail from "./pages/AquariumDetail";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./providers/AuthProvider";
import Shopping from "./pages/Shopping";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AdminRoute } from "./components/admin/AdminRoute";
import AdminProducts from "./pages/admin/Products";
import Account from "./pages/Account";
import KnowledgeBase from "./pages/KnowledgeBase";
import AdminKnowledgeBase from "./pages/admin/KnowledgeBase";
import ArticleEditor from "./pages/admin/ArticleEditor";
import KnowledgeBaseArticle from "./pages/KnowledgeBaseArticle";
import AdminSlideshow from "./pages/admin/Slideshow";
import AdminLegal from "./pages/admin/Legal";
import LegalPage from "./pages/LegalPage";
import LegalDocumentPage from "./pages/LegalDocumentPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/legal/:document_type" element={<LegalDocumentPage />} />
            
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aquarium/:id" element={<AquariumDetail />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/knowledge-base/:slug" element={<KnowledgeBaseArticle />} />
              <Route path="/account" element={<Account />} />
              
              <Route element={<AdminRoute />}>
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/knowledge-base" element={<AdminKnowledgeBase />} />
                <Route path="/admin/knowledge-base/article/new" element={<ArticleEditor />} />
                <Route path="/admin/knowledge-base/article/edit/:articleId" element={<ArticleEditor />} />
                <Route path="/admin/slideshow" element={<AdminSlideshow />} />
                <Route path="/admin/legal" element={<AdminLegal />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
