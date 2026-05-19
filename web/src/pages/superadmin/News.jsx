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
  Upload,
  Grid,
  List
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [viewLayout, setViewLayout] = useState("grid");

  // Reset page when switching tabs, searching, or toggling layouts
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, viewLayout]);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    content: "",
    link: "",
    file: null, // for image upload
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };


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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const isVideo = (url) => {
    return url && (url.toLowerCase().endsWith(".mp4") || url.toLowerCase().includes("video/upload"));
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

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const currentAnnouncements = filteredAnnouncements.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            News & Announcements Admin
          </h1>
          <p className="text-gray-600">Manage latest GAD news updates and announcements</p>
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
          {/* Announcements tab hidden */}
          {/* <button
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
          </button> */}
        </div>

        {/* Search + Layout Controls + Add */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center w-full sm:w-80 border rounded-lg px-3 py-2 bg-white shadow-sm">
              <Search className="text-gray-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Layout Toggle Buttons */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start">
              <button
                onClick={() => setViewLayout("grid")}
                className={`p-2 rounded-md transition flex items-center gap-1.5 text-xs font-semibold ${
                  viewLayout === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid View"
              >
                <Grid size={16} />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewLayout("list")}
                className={`p-2 rounded-md transition flex items-center gap-1.5 text-xs font-semibold ${
                  viewLayout === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="List View"
              >
                <List size={16} />
                <span>List</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => openModal("news")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center font-semibold"
          >
            <Plus size={18} />
            Add News
          </button>
        </div>

        {/* Content */}
        {activeTab === "news" ? (
          filteredNews.length === 0 ? (
            <div className="bg-white border rounded-lg p-12 text-center text-gray-500 shadow-sm">
              <Newspaper className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-lg font-semibold">No news items found</p>
              <p className="text-sm">Try adjusting your search query</p>
            </div>
          ) : viewLayout === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentNews.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition flex flex-col overflow-hidden"
                >
                  {/* Media Section: YouTube Link > Uploaded Video > Uploaded Image */}
                  {getYouTubeEmbedUrl(item.link) ? (
                    <div className="w-full h-48 bg-black">
                      <iframe
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(item.link)}
                        title={item.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : item.imageUrl ? (
                    isVideo(item.imageUrl) ? (
                      <video
                        controls
                        src={item.imageUrl}
                        className="w-full bg-black"
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full bg-gray-100"
                        style={{ display: 'block' }}
                      />
                    )
                  ) : null}

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                      <Calendar size={14} /> {item.date}
                    </p>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {item.content}
                    </p>
                    {/* Read More Link (if link exists AND isn't youtube) */}
                    {item.link && !getYouTubeEmbedUrl(item.link) && (
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
            <div className="space-y-4">
              {currentNews.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-white border rounded-xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row overflow-hidden items-stretch"
                >
                  {/* Media Section: Compact width and height */}
                  {getYouTubeEmbedUrl(item.link) ? (
                    <div className="w-full sm:w-48 shrink-0 h-32 bg-black">
                      <iframe
                        className="w-full h-full"
                        src={getYouTubeEmbedUrl(item.link)}
                        title={item.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : item.imageUrl ? (
                    isVideo(item.imageUrl) ? (
                      <video
                        controls
                        src={item.imageUrl}
                        className="w-full sm:w-48 shrink-0 bg-black"
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full sm:w-48 shrink-0 bg-gray-100"
                        style={{ display: 'block' }}
                      />
                    )
                  ) : null}

                  <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-900 truncate pr-4">
                          {item.title}
                        </h3>
                        <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                          <Calendar size={12} /> {item.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {item.content}
                      </p>
                      {item.link && !getYouTubeEmbedUrl(item.link) && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-xs hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Link size={12} /> Read more
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-gray-50">
                      <button
                        onClick={() => openModal("news", item)}
                        className="flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete("news", item._id || item.id)}
                        className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          filteredAnnouncements.length === 0 ? (
            <div className="bg-white border rounded-lg p-12 text-center text-gray-500 shadow-sm">
              <Megaphone className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-lg font-semibold">No announcements found</p>
              <p className="text-sm">Try adjusting your search query</p>
            </div>
          ) : viewLayout === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAnnouncements.map((a) => (
                <div key={a._id || a.id} className="bg-white border rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-semibold w-max mb-4">
                      <Megaphone size={14} /> Announcement
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{a.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <Calendar size={12} /> {a.date || new Date().toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed mb-4">{a.content}</p>
                  </div>
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <button
                      onClick={() => openModal("announcement", a)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete("announcement", a._id || a.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-sm font-semibold transition"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
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
                  {currentAnnouncements.map((a) => (
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
          )
        )}

        {/* Pagination Controls */}
        {((activeTab === "news" ? filteredNews : filteredAnnouncements).length > 0) && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">
                {(activeTab === "news" ? filteredNews : filteredAnnouncements).length === 0 ? 0 : indexOfFirstItem + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(indexOfLastItem, (activeTab === "news" ? filteredNews : filteredAnnouncements).length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {(activeTab === "news" ? filteredNews : filteredAnnouncements).length}
              </span>{" "}
              items
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {(() => {
                const totalItems = (activeTab === "news" ? filteredNews : filteredAnnouncements).length;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                const maxButtons = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
                let endPage = Math.min(totalPages, startPage + maxButtons - 1);
                
                if (endPage - startPage + 1 < maxButtons) {
                  startPage = Math.max(1, endPage - maxButtons + 1);
                }

                const buttons = [];
                for (let i = startPage; i <= endPage; i++) {
                  buttons.push(i);
                }
                
                return buttons.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold border transition ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              })()}
              <button
                onClick={() => {
                  const totalItems = (activeTab === "news" ? filteredNews : filteredAnnouncements).length;
                  const totalPages = Math.ceil(totalItems / itemsPerPage);
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                }}
                disabled={currentPage === Math.ceil((activeTab === "news" ? filteredNews : filteredAnnouncements).length / itemsPerPage)}
                className="px-3 py-1.5 rounded-lg border text-sm font-semibold transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? "Edit" : "Add"} News
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
                        Media (Image or Video)
                      </label>
                      <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/*"
                          onChange={(e) =>
                            setFormData({ ...formData, file: e.target.files[0] })
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                        />
                        <div className="pointer-events-none">
                          <Upload className={`mx-auto mb-2 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                          {formData.file ? (
                            <p className="mt-2 text-sm text-gray-700 font-medium">Selected: {formData.file.name}</p>
                          ) : (
                            <>
                              <p className="text-gray-600 font-medium pb-1">Click to browse or drag and drop media here</p>
                              <p className="text-xs text-gray-400">Image or Video formats supported</p>
                            </>
                          )}
                        </div>
                      </div>
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