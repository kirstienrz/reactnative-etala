import React, { useState, useEffect } from "react";
import { Download, Eye, X, FileText } from "lucide-react";
import { getAccomplishments } from "../../api/accomplishments"; // Axios API call

const Accomplishment = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);

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

  // Robust PDF Embed URL generator
  const getEmbedUrl = (url) => {
    if (!url) return "";
    // If it's a Cloudinary raw URL, use Google Docs Viewer proxy to ensure inline viewing
    if (url.includes('/raw/upload/') && url.toLowerCase().endsWith('.pdf')) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    // For 'image' resource type PDFs, standard URL works
    return `${url}#toolbar=0`;
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
              <div
                key={report._id}
                onClick={() => setSelectedPdf(report)}
                className="group flex flex-col md:flex-row items-center justify-between p-6 bg-white border border-slate-200 hover:border-violet-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    {report.title} ({report.year})
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Published: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-violet-600 font-semibold mt-4 md:mt-0 group-hover:gap-4 transition-all">
                  <span>View Document</span>
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedPdf(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 text-slate-900">
              <div>
                <h3 className="text-xl font-bold truncate max-w-xl">{selectedPdf.title}</h3>
                <p className="text-sm text-slate-500">Resource from {selectedPdf.year}</p>
              </div>
              <button
                onClick={() => setSelectedPdf(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center relative">
              <iframe
                src={getEmbedUrl(selectedPdf.fileUrl)}
                className="w-full h-full border-none"
                title={selectedPdf.title}
              />

              <div className="absolute bottom-6 right-6 flex gap-3">
                <a
                  href={selectedPdf.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-white transition shadow-lg flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Accomplishment;
