import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

import FloatingChatbot from "./components/FloatingChatbot";

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
import InfographicsPage from "./pages/superadmin/Infographics";
import AccomplishmentsPage from "./pages/superadmin/Accomplishments";
import PoliciesPage from "./pages/superadmin/Policies";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import AdminCases from "./pages/admin/Cases";
import AdminInbox from "./pages/admin/Inbox";

import UserDashboard from "./pages/user/Dashboard";
import UserProfile from "./pages/user/Profile";
import UserInbox from "./pages/user/Inbox";
import UserReports from "./pages/user/Reports";

import MissionVision from "./pages/public/MissionVision";
import Organization from "./pages/public/Organization";
import Accomplishment from "./pages/public/Accomplishment";
import Policies from "./pages/public/Policies";
import Projects from "./pages/public/Projects";
import Handbook from "./pages/public/Handbook";
import Knowledge from "./pages/public/Knowledge";
import PlanAndBudget from "./pages/public/PlanAndBudget";
import CommitteeReport from "./pages/public/CommitteeReport";
import SuggestionBox from "./pages/public/SuggestionBox";
import Infographics from "./pages/public/Infographics";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Reports from "./pages/user/Reports";

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/Mission-Vision" element={<MissionVision />} />
            <Route path="/Organization" element={<Organization />} />
            <Route path="/Accomplishment" element={<Accomplishment />} />
            <Route path="/Policies" element={<Policies />} />
            <Route path="/Projects" element={<Projects />} />
            <Route path="/Handbook" element={<Handbook />} />
            <Route path="/Knowledge" element={<Knowledge />} />
            <Route path="/PlanAndBudget" element={<PlanAndBudget />} />
            <Route path="/CommitteeReport" element={<CommitteeReport />} />
            <Route path="/SuggestionBox" element={<SuggestionBox />} />
            <Route path="/Infographics" element={<Infographics />} />
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
              <Route path="/superadmin/infographics" element={<InfographicsPage />} />
              <Route path="/superadmin/accomplishments" element={<AccomplishmentsPage />} />
              <Route path="/superadmin/policies" element={<PoliciesPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/cases" element={<AdminCases />} />
              <Route path="/admin/inbox" element={<AdminInbox />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/user/inbox" element={<UserInbox />} />
              <Route path="/user/reports" element={<UserReports />} />
            </Route>
          </Routes>
          <FloatingChatbot />

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
