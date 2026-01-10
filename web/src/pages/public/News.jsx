import React, { useEffect, useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { getNews } from "../../api/newsAnnouncement";

const AllNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

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

                <a
                  href={item.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-violet-700 font-semibold hover:gap-3 transition-all"
                >
                  Read more
                  <ArrowRight size={18} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AllNews;
