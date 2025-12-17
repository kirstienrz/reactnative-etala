import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { getAccomplishments } from "../../api/accomplishments"; // Axios API call

const Accomplishment = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAccomplishments(); // GET /api/accomplishments
      setReports(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load accomplishment reports.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Accomplishment Reports
          </h1>
          <div className="w-20 h-1 bg-violet-400 mx-auto"></div>
        </div>
      </section>

      {/* Reports Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          {loading && <p className="text-center text-gray-500">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          <div className="space-y-4">
            {!loading && !error && reports.length === 0 && (
              <p className="text-center text-gray-500">No reports available.</p>
            )}

            {reports.map((report) => (
              <a
                key={report._id}
                href={report.fileUrl} // Cloudinary PDF URL
                target="_blank"
                rel="noopener noreferrer"
                download
                className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white border border-slate-200 hover:border-violet-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    {report.title} ({report.year})
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Uploaded At: {new Date(report.createdAt).toLocaleDateString()}{" "}
                    {new Date(report.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-violet-600 font-semibold mt-4 md:mt-0 group-hover:gap-4 transition-all">
                  <span>Download</span>
                  <Download className="w-5 h-5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Accomplishment;
