import "./global.css";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Placeholder from "./pages/Placeholder";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={80}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route
              path="simulations"
              element={
                <Placeholder
                  title="Scenario Lab"
                  description="Run sensitivity analyses across lead times, dual-sourcing programs, and regional shifts before committing to simulation."
                  callToAction="Define scenario template"
                />
              }
            />
            <Route
              path="playbooks"
              element={
                <Placeholder
                  title="Diversification Playbooks"
                  description="Bundle supplier diversification plays with change management notes and procurement workflows."
                  callToAction="Author a new playbook"
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<AppRoutes />);
