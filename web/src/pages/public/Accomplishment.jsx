import React, { useState, useEffect } from "react";
import { Download, FileText, X, Maximize2, Minimize2 } from "lucide-react";
import { getAccomplishments } from "../../api/accomplishments"; // Axios API call
const Accomplishment = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedPdfName, setSelectedPdfName] = useState("");
  const [selectedPdfType, setSelectedPdfType] = useState("pdf");
  const [isFullscreen, setIsFullscreen] = useState(false);

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
                onClick={() => {
                  setSelectedPdf(report.fileUrl);
                  setSelectedPdfName(report.title);
                  setSelectedPdfType(report.type || "pdf");
                }}
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
                  <span>View Report</span>
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PDF Viewer Modal - Events Style */}
      {selectedPdf && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black ${isFullscreen ? 'bg-black' : 'bg-opacity-90'} p-4 backdrop-blur-sm transition-all shadow-2xl`}>
          <div className={`${isFullscreen ? 'w-screen h-screen' : 'bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh]'} flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300`}>

            {/* Info bar / Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="text-violet-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold truncate">{selectedPdfName || "Report Preview"}</h3>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Accomplishment Report</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
                </button>

                <button
                  onClick={() => {
                    setSelectedPdf(null);
                    setIsFullscreen(false);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white flex items-center justify-center">
              {selectedPdfType === "video" ? (
                <video
                  src={selectedPdf}
                  controls
                  autoPlay
                  className="w-full max-h-full rounded-lg bg-black"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : selectedPdfType === "image" ? (
                <img
                  src={selectedPdf}
                  alt={selectedPdfName}
                  className="w-full max-h-full object-contain rounded-lg"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(selectedPdf)}&embedded=true`}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                  onContextMenu={(e) => e.preventDefault()}
                ></iframe>
              )}
            </div>

            {!isFullscreen && (
              <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-slate-900">
                <p className="text-sm font-medium text-slate-500 italic">Previewing official document...</p>
                <button
                  onClick={() => {
                    setSelectedPdf(null);
                    setIsFullscreen(false);
                  }}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors font-medium shadow-md shadow-slate-200"
                >
                  Close Preview
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Accomplishment;
