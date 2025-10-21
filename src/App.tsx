import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Barbers from "./pages/Barbers";
import Services from "./pages/Services";
import Products from "./pages/Products";
import Transactions from "./pages/Transactions";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/barbers" element={<Layout><Barbers /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
          <Route path="/history" element={<Layout><History /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
