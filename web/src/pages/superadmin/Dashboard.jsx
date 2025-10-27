import React, { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Repeat,
  MessageSquare,
  Bell,
  Image,
  CalendarDays,
  BookOpen,
  Lightbulb,
  BarChart3,
  Newspaper,
  FileSpreadsheet,
  FileSignature,
  Briefcase,
  DollarSign,
  Menu,
  X,
} from "lucide-react";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sections = {
    overview: {
      title: "🌐 System Overview",
      description: "Welcome, SuperAdmin! Select a feature from the left to manage system modules.",
    },
    reports: {
      title: "🧾 Report Management",
      description:
        "View all submitted reports (including anonymous), filter by status, and access attachments securely.",
    },
    referral: {
      title: "🔁 Referral & Assignment",
      description:
        "Refer cases to departments (OSA, HR, eTC), add instructions, and track referral history.",
    },
    messages: {
      title: "💬 Messaging System",
      description:
        "Communicate with admins or reporters regarding specific cases with threaded chat history.",
    },
    monitoring: {
      title: "🧮 Report Monitoring",
      description:
        "Track department performance, view progress logs, and access full audit history.",
    },
    notifications: {
      title: "🔔 Notifications",
      description:
        "Receive instant alerts when reports are submitted, referred, or updated.",
    },
    carousel: {
      title: "🖼️ Carousel Management",
      description:
        "Upload, edit, or disable homepage carousel items with titles, captions, and links.",
    },
    events: {
      title: "🗓️ Event Management",
      description:
        "Add or edit events (Awareness, Mandatory, Training, Emergency) that appear system-wide.",
    },
    knowledge: {
      title: "📘 Knowledge Hub",
      description:
        "Upload educational content, guidelines, and resources. Categorize by topic or tag.",
    },
    suggestions: {
      title: "💬 Suggestion Box",
      description:
        "Manage feedback and mark as Reviewed, Under Consideration, or Implemented.",
    },
    infographics: {
      title: "📊 Infographics Posting",
      description:
        "Post awareness campaign visuals, statistics, and publication updates.",
    },
    news: {
      title: "📰 News & Announcements",
      description:
        "Post and manage news updates. Pin important announcements to the dashboard.",
    },
    analytics: {
      title: "📊 Database Tracking & Analytics",
      description:
        "View total complaints, recurring violations, heatmap data, and sentiment analysis charts.",
    },
    exports: {
      title: "📤 Exportable Reports",
      description:
        "Generate and export system-wide reports (Monthly, Quarterly, Annual) in PDF or Excel.",
    },
    templates: {
      title: "📄 Templates Page",
      description:
        "Access official document templates like acknowledgment, referral, and resolution letters.",
    },
    projects: {
      title: "📸 Projects & Activities",
      description:
        "Upload project photos, event details, and participant data for archiving.",
    },
    budget: {
      title: "💰 Budget & Programs",
      description:
        "View budget allocation, spending breakdown, and program details with utilization stats.",
    },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1
            className={`font-bold text-lg transition-all ${
              sidebarOpen ? "opacity-100" : "opacity-0 hidden"
            }`}
          >
            GAD Admin
          </h1>
          <button
            className="text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 text-sm">
            <li className="text-gray-500 uppercase mt-2 mb-1 font-semibold">
              Main
            </li>
            <MenuItem
              icon={<LayoutDashboard size={18} />}
              label="Overview"
              active={activePage === "overview"}
              onClick={() => setActivePage("overview")}
              open={sidebarOpen}
            />
            <li className="text-gray-500 uppercase mt-4 mb-1 font-semibold">
              Report Handling
            </li>
            <MenuItem
              icon={<FileText size={18} />}
              label="Report Management"
              active={activePage === "reports"}
              onClick={() => setActivePage("reports")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<Repeat size={18} />}
              label="Referral & Assignment"
              active={activePage === "referral"}
              onClick={() => setActivePage("referral")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<MessageSquare size={18} />}
              label="Messaging System"
              active={activePage === "messages"}
              onClick={() => setActivePage("messages")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<BarChart3 size={18} />}
              label="Monitoring & Analytics"
              active={activePage === "analytics"}
              onClick={() => setActivePage("analytics")}
              open={sidebarOpen}
            />
            <li className="text-gray-500 uppercase mt-4 mb-1 font-semibold">
              Content Management
            </li>
            <MenuItem
              icon={<Image size={18} />}
              label="Carousel"
              active={activePage === "carousel"}
              onClick={() => setActivePage("carousel")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<CalendarDays size={18} />}
              label="Events"
              active={activePage === "events"}
              onClick={() => setActivePage("events")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<BookOpen size={18} />}
              label="Knowledge Hub"
              active={activePage === "knowledge"}
              onClick={() => setActivePage("knowledge")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<Lightbulb size={18} />}
              label="Suggestion Box"
              active={activePage === "suggestions"}
              onClick={() => setActivePage("suggestions")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<Newspaper size={18} />}
              label="News & Announcements"
              active={activePage === "news"}
              onClick={() => setActivePage("news")}
              open={sidebarOpen}
            />
            <li className="text-gray-500 uppercase mt-4 mb-1 font-semibold">
              Admin Tools
            </li>
            <MenuItem
              icon={<FileSpreadsheet size={18} />}
              label="Export Reports"
              active={activePage === "exports"}
              onClick={() => setActivePage("exports")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<FileSignature size={18} />}
              label="Templates"
              active={activePage === "templates"}
              onClick={() => setActivePage("templates")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<Briefcase size={18} />}
              label="Projects & Activities"
              active={activePage === "projects"}
              onClick={() => setActivePage("projects")}
              open={sidebarOpen}
            />
            <MenuItem
              icon={<DollarSign size={18} />}
              label="Budget & Programs"
              active={activePage === "budget"}
              onClick={() => setActivePage("budget")}
              open={sidebarOpen}
            />
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-2">
          {sections[activePage].title}
        </h2>
        <p className="text-gray-700">{sections[activePage].description}</p>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, active, onClick, open }) => (
  <li
    onClick={onClick}
    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer mb-1 ${
      active ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
    }`}
  >
    {icon}
    {open && <span>{label}</span>}
  </li>
);

export default Dashboard;
