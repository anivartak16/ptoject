import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth, getDashboardPath } from "./context/AuthContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { Guard } from "./components/auth/Guard.jsx";
import { ChatBot } from "./components/chatbot/ChatBot.jsx";

import { HomePage } from "./pages/HomePage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LotsPage } from "./pages/LotsPage.jsx";
import { OffersPage } from "./pages/OffersPage.jsx";
import { TransactionsPage } from "./pages/TransactionsPage.jsx";
import { PaymentPage } from "./pages/PaymentPage.jsx";
import { OperationalPage } from "./pages/OperationalPage.jsx";
import { DynamicPage } from "./pages/DynamicPage.jsx";
import { AdminLoginPage } from "./pages/AdminLoginPage.jsx";
import { PredictionPage } from "./pages/PredictionPage.jsx";
import { AdminMarketSyncPage } from "./pages/AdminMarketSyncPage.jsx";
import { InspectionPage } from "./pages/InspectionPage.jsx";
import { ProfileManagement } from "./components/profile/ProfileManagement.jsx";

function RoleDashboardRedirect() {
  const { user } = useAuth();
  const { r } = useParams();
  const role = (r || user?.role || "").toLowerCase().replaceAll("_", "-");
  return ["farmer", "buyer", "fpo", "admin", "krishi-kendra"].includes(role) ? (
    <Navigate to={`/${role}/dashboard`} replace />
  ) : (
    <Navigate to="/" replace />
  );
}

function PredictionRouteGuard() {
  const { r } = useParams();
  if (r?.toLowerCase() === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <PredictionPage />;
}

function PricesRouteGuard({ op }) {
  const { r } = useParams();
  if (r?.toLowerCase() === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return op("Market prices & comparison", "prices");
}

export function App() {
  const op = (title, type) => (
    <Guard>
      <OperationalPage title={title} type={type} />
    </Guard>
  );

  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage reg={false} />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/register"
          element={<Navigate to="/register/farmer" replace />}
        />
        <Route path="/register/:role" element={<AuthPage reg={true} />} />
        <Route
          path="/:r/inspections"
          element={
            <Guard>
              <InspectionPage />
            </Guard>
          }
        />
        <Route
          path="/:r"
          element={
            <Guard>
              <RoleDashboardRedirect />
            </Guard>
          }
        />
        <Route
          path="/:r/dashboard"
          element={
            <Guard>
              <DashboardPage />
            </Guard>
          }
        />
        <Route
          path="/:r/profile"
          element={
            <Guard>
              <ProfileManagement />
            </Guard>
          }
        />
        <Route
          path="/:r/predictions"
          element={
            <Guard>
              <PredictionRouteGuard />
            </Guard>
          }
        />
        <Route
          path="/:r/lots"
          element={
            <Guard>
              <LotsPage />
            </Guard>
          }
        />
        <Route
          path="/:r/offers"
          element={
            <Guard>
              <OffersPage />
            </Guard>
          }
        />
        <Route
          path="/:r/transactions"
          element={
            <Guard>
              <TransactionsPage />
            </Guard>
          }
        />
        <Route
          path="/:r/payments"
          element={
            <Guard>
              <PaymentPage />
            </Guard>
          }
        />
        <Route
          path="/:r/payments/:transactionId"
          element={
            <Guard>
              <PaymentPage />
            </Guard>
          }
        />
        <Route
          path="/:r/demands"
          element={op("Buyer demands", "demands")}
        />
        <Route
          path="/:r/prices"
          element={<PricesRouteGuard op={op} />}
        />
        <Route
          path="/:r/market-sync"
          element={
            <Guard>
              <AdminMarketSyncPage />
            </Guard>
          }
        />
        <Route
          path="/:r/storage"
          element={op("Storage discovery", "storage")}
        />
        <Route
          path="/:r/logistics"
          element={op("Logistics coordination", "logistics")}
        />
        <Route
          path="/:r/notifications"
          element={op("Notifications", "notifications")}
        />
        <Route
          path="/:r/aggregation"
          element={op("FPO aggregation", "aggregation")}
        />
        <Route
          path="/:r/users"
          element={op("Users & verification", "admin")}
        />
        <Route
          path="/:r/disputes"
          element={op("Dispute management", "disputes")}
        />
        <Route
          path="/:r/analytics"
          element={op("Marketplace analytics", "analytics")}
        />
        <Route
          path="/:r/:misc"
          element={
            <Guard>
              <DynamicPage />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatBot />
    </LanguageProvider>
  );
}

export default App;

