import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, Tag, Video, ArrowRight } from "lucide-react";
import { getWebinars } from "../../api/webinar";
import { getResources } from "../../api/resource";

const UserKnowledgeHub = () => {
  const [webinars, setWebinars] = useState([]);
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState("webinars");

  useEffect(() => {
    fetchWebinars();
    fetchResources();
  }, []);

  const fetchWebinars = async () => {
    try {
      const data = await getWebinars(); // Only fetch for users
      setWebinars(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (err) {
      console.error(err);
    }
  };

  function getYouTubeID(url) {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 text-center text-white">
        <h1 className="text-5xl lg:text-6xl font-bold mb-4">GAD Knowledge Hub</h1>
        <p className="max-w-3xl mx-auto text-lg">
          Explore articles, webinars, and resources on gender and development topics.
        </p>
      </section>

      {/* Tabs */}
      <section className="py-12 max-w-6xl mx-auto px-6">
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("webinars")}
            className={`pb-3 px-4 font-medium transition ${activeTab === "webinars" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            <div className="flex items-center gap-2">
              <Video size={18} />
              Webinars & Trainings
            </div>
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`pb-3 px-4 font-medium transition ${activeTab === "resources" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              Resources
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === "webinars" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {webinars.map((item) => (
              <div key={item._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  {item.videoUrl ? (
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeID(item.videoUrl)}/hqdefault.jpg`}
                      alt={item.title}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(item.videoUrl, "_blank")}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      No Video
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    {item.speaker} — {item.organization}
                  </p>
                  <p className="text-sm text-gray-400 mb-2">{item.date} • {item.duration}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags?.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resources.map((res) => (
              <a
                key={res._id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-6 bg-white border border-slate-200 hover:border-violet-600 hover:shadow-lg transition-all duration-300 rounded-lg"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">{res.title}</h3>
                <p className="text-sm text-gray-500 mb-1">Date: {res.date}</p>
                <p className="text-sm text-gray-500">Size: {res.size}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default UserKnowledgeHub;
