import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

import ProtectedRoute from "./components/ProtectedRoute";

import SuperAdminLayout from "./components/SuperAdminLayout";

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import ProfilePage from "./pages/superadmin/Profile";
import UserManagementPage from "./pages/superadmin/UserManagement";
import ReportsPage from "./pages/superadmin/Reports";
import ReferralPage from "./pages/superadmin/Referral";
import MessagesPage from "./pages/superadmin/Messages";
import AnalyticsPage from "./pages/superadmin/Analytics";
import CarouselPage from "./pages/superadmin/Carousel";
import EventsPage from "./pages/superadmin/Events";
import KnowledgeHubPage from "./pages/superadmin/KnowledgeHub";
import SuggestionsPage from "./pages/superadmin/Suggestions";
import NewsPage from "./pages/superadmin/News";
import ExportsPage from "./pages/superadmin/Exports";
import TemplatesPage from "./pages/superadmin/Templates";
import ProjectsPage from "./pages/superadmin/Projects";
import BudgetPage from "./pages/superadmin/Budget";

import AdminDashboard from "./pages/admin/Dashboard";
import UserDashboard from "./pages/user/Dashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/profile" element={<ProfilePage />} />
              <Route path="/superadmin/users" element={<UserManagementPage />} />
              <Route path="/superadmin/reports" element={<ReportsPage />} />
              <Route path="/superadmin/referral" element={<ReferralPage />} />
              <Route path="/superadmin/messages" element={<MessagesPage />} />
              <Route path="/superadmin/analytics" element={<AnalyticsPage />} />
              <Route path="/superadmin/carousel" element={<CarouselPage />} />
              <Route path="/superadmin/events" element={<EventsPage />} />
              <Route path="/superadmin/knowledge" element={<KnowledgeHubPage />} />
              <Route path="/superadmin/suggestions" element={<SuggestionsPage />} />
              <Route path="/superadmin/news" element={<NewsPage />} />
              <Route path="/superadmin/exports" element={<ExportsPage />} />
              <Route path="/superadmin/templates" element={<TemplatesPage />} />
              <Route path="/superadmin/projects" element={<ProjectsPage />} />
              <Route path="/superadmin/budget" element={<BudgetPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
            </Route>
          </Routes>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </Provider>
  );
};

export default App;
