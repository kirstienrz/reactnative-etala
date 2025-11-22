import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Megaphone,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Calendar,
  Link,
} from "lucide-react";
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../api/newsAnnouncement";


const AdminNewsAnnouncements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("news");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState("news");

  const [news, setNews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    content: "",
    link: "",
    file: null, // for image upload
  });


  // Fetch all on mount
  useEffect(() => {
    fetchNews();
    fetchAnnouncements();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await getNews();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        date: "",
        content: "",
        imageUrl: "",
        link: "",
        file: null,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      title: "",
      date: "",
      content: "",
      imageUrl: "",
      link: "",
      file: null,
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.content) {
        alert("Please fill in all required fields.");
        return;
      }

      if (modalType === "news") {
        const payload = new FormData();
        payload.append("title", formData.title);
        payload.append("content", formData.content);
        if (formData.date) payload.append("date", formData.date);
        if (formData.link) payload.append("link", formData.link);
        if (formData.file) payload.append("image", formData.file); // matches backend req.file

        if (editingItem) {
          await updateNews(editingItem._id || editingItem.id, payload);
        } else {
          await createNews(payload);
        }
        await fetchNews();
      } else {
        // Announcements remain text-only
        const payload = {
          title: formData.title,
          content: formData.content,
          link: formData.link,
        };

        if (editingItem) {
          await updateAnnouncement(editingItem._id || editingItem.id, payload);
        } else {
          await createAnnouncement(payload);
        }
        await fetchAnnouncements();
      }

      closeModal();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Something went wrong while saving.");
    }
  };


  const handleDelete = async (type, id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        if (type === "news") {
          await deleteNews(id);
          await fetchNews();
        } else {
          await deleteAnnouncement(id);
          await fetchAnnouncements();
        }
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete item.");
      }
    }
  };

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            News & Announcements Admin
          </h1>
          <p className="text-gray-600">Manage latest updates and announcements</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("news")}
            className={`pb-3 px-4 font-medium transition ${activeTab === "news"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <div className="flex items-center gap-2">
              <Newspaper size={18} />
              News
            </div>
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`pb-3 px-4 font-medium transition ${activeTab === "announcements"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <div className="flex items-center gap-2">
              <Megaphone size={18} />
              Announcements
            </div>
          </button>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
          <div className="flex items-center w-full sm:w-96 border rounded-lg px-3 py-2 bg-white shadow-sm">
            <Search className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal(activeTab === "news" ? "news" : "announcement")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Add {activeTab === "news" ? "News" : "Announcement"}
          </button>
        </div>

        {/* Content */}
        {activeTab === "news" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNews.map((item) => (
              <div
                key={item._id || item.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <Calendar size={14} /> {item.date}
                  </p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {item.content}
                  </p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                    >
                      <Link size={14} /> Read more
                    </a>
                  )}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <button
                      onClick={() => openModal("news", item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete("news", item._id || item.id)
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Content</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map((a) => (
                  <tr key={a._id || a.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{a.title}</td>
                    <td className="p-3 text-gray-600">{a.date}</td>
                    <td className="p-3 text-gray-600 line-clamp-2">
                      {a.content}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openModal("announcement", a)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("announcement", a._id || a.id)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? "Edit" : "Add"}{" "}
                  {modalType === "news" ? "News" : "Announcement"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                </div>
                {modalType === "news" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setFormData({ ...formData, file: e.target.files[0] })
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      />
                      {formData.file && (
                        <p className="mt-2 text-sm text-gray-500">{formData.file.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        External Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/full-article"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.link}
                        onChange={(e) =>
                          setFormData({ ...formData, link: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsAnnouncements;