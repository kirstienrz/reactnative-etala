import React, { useState, useEffect } from 'react';
import { getOrgChartImages } from '../../api/organizational';

const Organizational = () => {
  const [latestChart, setLatestChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestChart();
  }, []);

  const fetchLatestChart = async () => {
    try {
      setLoading(true);
      const charts = await getOrgChartImages();
      
      if (charts.length > 0) {
        // Get the latest chart (most recent createdAt)
        const sorted = [...charts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setLatestChart(sorted[0]);
      }
    } catch (err) {
      console.error('Error fetching org chart:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <span className="text-sm font-bold text-violet-300 tracking-wider uppercase mb-6 inline-block">
            Our Team
          </span>
          <h1 className="text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Organizational Structure
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-xl text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Meet the dedicated team working to promote gender equality and development at TUP Taguig
          </p>
        </div>
      </section>

      {/* Organizational Chart Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
            </div>
          )}

          {/* Org Chart Display */}
          {!loading && latestChart && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            
              <div className="p-8">
                <img 
                  src={latestChart.imageUrl} 
                  alt="GAD Office Organizational Chart"
                  className="w-full h-auto max-w-4xl mx-auto object-contain"
                />
              </div>

                <div className="p-4 bg-slate-50 border-b border-slate-200">
                <p className="text-center text-slate-600 text-sm">
                  Current organizational chart
                </p>
              </div>
            </div>
          )}

          {/* No Chart */}
          {!loading && !latestChart && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Organizational chart will be available soon
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Organizational;