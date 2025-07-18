import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ListingsPage from "./pages/listings/index";
import ListingDetails from "./pages/listings/[id]";
import CreateListingPage from "./pages/listings/CreateListing";
import EditListingPage from "./pages/listings/EditListing";
import MessagesPage from "./pages/messages/index";
import UserSettingsPage from "./pages/settings/index";
import FeedbackPage from "./pages/FeedbackPage";
import SellerFeedbackPage from "./pages/SellerFeedbackPage";
import { AuthProvider } from "./hooks/auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route path="/listings/create" element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            } />
            {/* NEW: Edit listing route */}
            <Route path="/listings/:id/edit" element={
              <ProtectedRoute>
                <EditListingPage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <UserSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            } />
            <Route path="/sellers/:sellerId/feedback" element={<SellerFeedbackPage />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
