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
      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
            Our <span className="text-violet-400">Team</span>
          </h1>
          <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Meet the dedicated individuals working together to promote gender equality and development.
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