import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Services from "./pages/Services";
import SubmitRequest from "./pages/SubmitRequest";
import SubmitComplaint from "./pages/SubmitComplaint";
import TrackStatus from "./pages/TrackStatus";
import NotFound from "./pages/NotFound";
import AdminPortal from "./pages/Adminportal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="portal" element = {<AdminPortal/>} />
          <Route path="/services" element={<Services />} />
          <Route path="/submit-request" element={<SubmitRequest />} />
          <Route path="/submit-complaint" element={<SubmitComplaint />} />
          <Route path="/track" element={<TrackStatus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
