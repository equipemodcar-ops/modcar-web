import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./core/contexts/AuthContext";
import { ProtectedRoute } from "./core/shared/components/ProtectedRoute";
import { DashboardLayout } from "./core/shared/components/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import { AdminDashboard } from "./core/admin/pages/AdminDashboard";
import { AdminProducts } from "./core/admin/pages/AdminProducts";
import { AdminPartners } from "./core/admin/pages/AdminPartners";
import { AdminReports } from "./core/admin/pages/AdminReports";
import { AdminSettings } from "./core/admin/pages/AdminSettings";
import { AdminCustomers } from "./core/admin/pages/AdminCustomers";
import { AdminKPIs } from "./core/admin/pages/AdminKPIs";
import { AdminCampaigns } from "./core/admin/pages/AdminCampaigns";
import { PartnerDashboard } from "./core/partner/pages/PartnerDashboard";
import { PartnerProducts } from "./core/partner/pages/PartnerProducts";
import { PartnerSettings } from "./core/partner/pages/PartnerSettings";
import { PartnerCampaigns } from "./core/partner/pages/PartnerCampaigns";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import Signup from "./pages/Signup";
import SignupSuccess from "./pages/SignupSuccess";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/partner'} replace /> : <Index />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/partner'} replace /> : <Login />} />
      <Route path="/checkout/:planId" element={<Checkout />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-success" element={<SignupSuccess />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminProducts /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/partners" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminPartners /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminReports /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminSettings /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminCustomers /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/kpis" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminKPIs /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/campaigns" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout><AdminCampaigns /></DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Partner Routes */}
      <Route path="/partner" element={
        <ProtectedRoute allowedRoles={['partner']}>
          <DashboardLayout><PartnerDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/partner/products" element={
        <ProtectedRoute allowedRoles={['partner']}>
          <DashboardLayout><PartnerProducts /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/partner/settings" element={
        <ProtectedRoute allowedRoles={['partner']}>
          <DashboardLayout><PartnerSettings /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/partner/campaigns" element={
        <ProtectedRoute allowedRoles={['partner']}>
          <DashboardLayout><PartnerCampaigns /></DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
