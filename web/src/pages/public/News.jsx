import React, { useEffect, useState } from "react";
import { Calendar, ArrowRight, X } from "lucide-react";
import { getNews } from "../../api/newsAnnouncement";

const AllNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await getNews();
      setNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white min-h-screen">
      {/* HEADER */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-violet-900 to-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-5xl font-black text-white mb-2">
            In the News
          </h1>
          <div className="w-16 h-1 bg-violet-400"></div>
        </div>
      </section>

      {/* LIST */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          {loading && (
            <p className="text-center text-gray-500">Loading news...</p>
          )}

          {!loading && news.length === 0 && (
            <p className="text-center text-gray-500">
              No news available.
            </p>
          )}

          {news.map((item) => (
            <article
              key={item._id}
              className="flex flex-col sm:flex-row gap-6 p-6 border border-slate-200 rounded-xl hover:border-violet-600 hover:shadow-lg transition"
            >
              {/* IMAGE */}
              <div className="w-full sm:w-40 flex-shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-40 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 font-bold">
                    NEWS
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {item.title}
                </h3>

                <p className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <Calendar size={14} />
                  {item.date
                    ? new Date(item.date).toLocaleDateString()
                    : "—"}
                </p>

                <p className="text-slate-700 line-clamp-3 mb-4">
                  {item.content}
                </p>

                <button
                  onClick={() => setSelectedNews(item)}
                  className="inline-flex items-center gap-2 text-violet-700 font-semibold hover:gap-3 transition-all"
                >
                  Read more
                  <ArrowRight size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Modal View for Full News Content */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 right-0 z-10 flex justify-end p-4 pointer-events-none">
              <button
                onClick={() => setSelectedNews(null)}
                className="pointer-events-auto bg-gray-100/80 backdrop-blur-md hover:bg-gray-200 text-gray-700 p-2 rounded-full transition shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-8 pb-8 -mt-12">
              {selectedNews.imageUrl && (
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.title}
                  className="w-full h-64 md:h-80 object-cover rounded-xl mt-12 mb-6 shadow-md"
                />
              )}
              <h2 className={`text-2xl md:text-3xl font-black text-slate-900 mb-4 ${!selectedNews.imageUrl ? "mt-12" : ""}`}>
                {selectedNews.title}
              </h2>
              <p className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
                <Calendar size={16} />
                {selectedNews.date ? new Date(selectedNews.date).toLocaleDateString() : "—"}
              </p>
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px] md:text-base">
                {selectedNews.content}
              </div>

              {selectedNews.link && (
                <a
                  href={selectedNews.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex mt-8 items-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition shadow-lg"
                >
                  Visit External Link <ArrowRight size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AllNews;
