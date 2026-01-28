import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import AddQuestion from "./pages/AddQuestion";
import QuestionBank from "./pages/QuestionBank";
import TakeTest from "./pages/TakeTest";
import TestResults from "./pages/TestResults";
import Statistics from "./pages/Statistics";
import ManageCategories from "./pages/ManageCategories";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/add-question" element={<AddQuestion />} />
              <Route path="/question-bank" element={<QuestionBank />} />
              <Route path="/take-test" element={<TakeTest />} />
              <Route path="/test-results" element={<TestResults />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/manage-categories" element={<ManageCategories />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
