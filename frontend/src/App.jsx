import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useAuth, getDashboardPath } from "./context/AuthContext.jsx";
import { Guard } from "./components/auth/Guard.jsx";
import { ChatBot } from "./components/chatbot/ChatBot.jsx";

import { HomePage } from "./pages/HomePage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LotsPage } from "./pages/LotsPage.jsx";
import { OffersPage } from "./pages/OffersPage.jsx";
import { TransactionsPage } from "./pages/TransactionsPage.jsx";
import { OperationalPage } from "./pages/OperationalPage.jsx";
import { DynamicPage } from "./pages/DynamicPage.jsx";
import { AdminLoginPage } from "./pages/AdminLoginPage.jsx";
import { PredictionPage } from "./pages/PredictionPage.jsx";

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

export function App() {
  const op = (title, type) => (
    <Guard>
      <OperationalPage title={title} type={type} />
    </Guard>
  );

  return (
    <>
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
          element={op("Inspection desk", "inspections")}
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
          path="/:r/predictions"
          element={
            <Guard>
              <PredictionPage />
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
          path="/:r/demands"
          element={op("Buyer demands", "demands")}
        />
        <Route
          path="/:r/prices"
          element={op("Market prices & comparison", "prices")}
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
          path="/:r/payments"
          element={op("Payment tracking", "payments")}
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
    </>
  );
}

export default App;
