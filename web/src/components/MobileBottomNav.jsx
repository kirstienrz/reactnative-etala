import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Newspaper, Calendar, Menu, X, Users, FileText, Image, FlaskConical, BarChart2, Lightbulb, MessageSquare, Download } from "lucide-react";

const allMenuItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "News", path: "/News", icon: Newspaper },
  { label: "Calendar", path: "/Calendar", icon: Calendar },
  { label: "Gallery", path: "/album", icon: Image },
  { label: "About", path: "/Mission-Vision", icon: Users },
  { label: "Committee", path: "/Organization", icon: Users },
  { label: "Projects", path: "/Projects", icon: FileText },
  { label: "Research", path: "/Research", icon: FlaskConical },
  { label: "Infographics", path: "/Infographics", icon: BarChart2 },
  { label: "Knowledge", path: "/Knowledge", icon: Lightbulb },
  { label: "Plan & Budget", path: "/PlanAndBudget", icon: FileText },
  { label: "Accomplishment", path: "/Accomplishment", icon: FileText },
  { label: "Suggestion", path: "/SuggestionBox", icon: MessageSquare },
  { label: "Contact", path: "/Contact", icon: MessageSquare },
  { label: "Download App", path: "/download", icon: Download },
];

// Bottom bar shows only 4 main items + "More" button
const mainItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "News", path: "/News", icon: Newspaper },
  { label: "Calendar", path: "/Calendar", icon: Calendar },
  { label: "Gallery", path: "/album", icon: Image },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const [showDrawer, setShowDrawer] = React.useState(false);

  // Only show on public routes (not superadmin, not user, not login/signup)
  const hiddenPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/activate"];
  const isAdminOrUser = location.pathname.startsWith("/superadmin") || location.pathname.startsWith("/user");
  const isHidden = isAdminOrUser || hiddenPaths.some(p => location.pathname.startsWith(p));

  if (isHidden) return null;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Drawer Overlay */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          onClick={() => setShowDrawer(false)}
        />
      )}

      {/* Slide-up Drawer */}
      <div
        className={`fixed bottom-16 left-0 right-0 z-50 sm:hidden bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          showDrawer ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-700">All Pages</span>
          <button onClick={() => setShowDrawer(false)} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 p-3 max-h-72 overflow-y-auto">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setShowDrawer(false)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1 safe-area-pb">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-0 flex-1 ${
                  active ? "text-violet-700" : "text-gray-500"
                }`}
              >
                <div className={`p-1 rounded-lg transition-all ${active ? "bg-violet-100" : ""}`}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-medium truncate ${active ? "text-violet-700" : "text-gray-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all flex-1 ${
              showDrawer ? "text-violet-700" : "text-gray-500"
            }`}
          >
            <div className={`p-1 rounded-lg transition-all ${showDrawer ? "bg-violet-100" : ""}`}>
              <Menu size={20} strokeWidth={showDrawer ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-medium ${showDrawer ? "text-violet-700" : "text-gray-500"}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Spacer so content doesn't hide behind bottom nav */}
      <div className="h-16 sm:hidden" />
    </>
  );
};

export default MobileBottomNav;
