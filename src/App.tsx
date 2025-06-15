
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

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
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
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
