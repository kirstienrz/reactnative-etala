import React, { useState, useEffect } from "react";
import { Calendar, FileText, Download, Filter, X } from "lucide-react";
import { getAnnouncements } from "../../api/newsAnnouncement";

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, selectedYear, selectedMonth]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filteredData = [...announcements];

    if (selectedYear !== "all") {
      filteredData = filteredData.filter(
        (a) => new Date(a.createdAt).getFullYear() === parseInt(selectedYear)
      );
    }

    if (selectedMonth !== "all") {
      filteredData = filteredData.filter(
        (a) => new Date(a.createdAt).getMonth() === parseInt(selectedMonth)
      );
    }

    setFiltered(filteredData);
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) window.open(fileUrl, "_blank");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate years dynamically from announcements
  const years = Array.from(
    new Set(announcements.map((a) => new Date(a.createdAt).getFullYear()))
  ).sort((a, b) => b - a);

  // Months in selected year
  const months = selectedYear === "all"
    ? []
    : Array.from(
        new Set(
          announcements
            .filter((a) => new Date(a.createdAt).getFullYear() === parseInt(selectedYear))
            .map((a) => new Date(a.createdAt).getMonth())
        )
      ).sort((a, b) => a - b);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const resetFilters = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
        <div className="max-w-5xl mx-auto px-8 text-center text-white relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">Announcements</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-6"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Latest news, system updates, and important notifications
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <span className="font-semibold text-slate-700">Filter by:</span>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth("all");
              }}
              className="border rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={selectedYear === "all"}
              className={`border rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                selectedYear === "all" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <option value="all">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthNames[m]}
                </option>
              ))}
            </select>

            {(selectedYear !== "all" || selectedMonth !== "all") && (
              <button
                onClick={resetFilters}
                className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="text-slate-600 mt-2 md:mt-0">
            {filtered.length} announcement{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
              <p className="mt-4 text-slate-600">Loading announcements...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No announcements found
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((item) => (
                <div
                  key={item._id}
                  className="bg-white border border-slate-200 rounded-lg p-8 hover:border-violet-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex items-start gap-6 flex-1">
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-7 h-7 text-violet-600" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          {item.title}
                        </h3>

                        {item.message && (
                          <p className="text-slate-600 leading-relaxed mb-4">
                            {item.message}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {item.fileUrl && (
                      <button
                        onClick={() => handleDownload(item.fileUrl)}
                        className="bg-white text-violet-700 border border-violet-200 rounded-lg px-4 py-2 shadow hover:bg-violet-50 transition-colors dark:bg-white dark:text-violet-700 dark:hover:bg-violet-100"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Announcement;
