

import React, { useState, useEffect } from "react";
import {
  BookOpen, Video, Search, Plus, Edit2, Trash2, X, Save, Link, Calendar
} from "lucide-react";
import {
  getWebinars,
  createWebinar,
  updateWebinar,
  deleteWebinar,
} from "../../api/webinar";
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} from "../../api/resource";

const AdminKnowledgeHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("webinars");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState("webinar");

  const [webinars, setWebinars] = useState([]);
  const [resources, setResources] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    speaker: "",
    organization: "",
    date: "",
    duration: "",
    videoUrl: "",
    description: "",
    tags: "",
    size: "",
    url: "",
  });

  // Fetch webinars and resources on mount
  useEffect(() => {
    fetchWebinars();
    fetchResources();
  }, []);

  const fetchWebinars = async () => {
    try {
      const data = await getWebinars();
      setWebinars(data);
    } catch (error) {
      console.error("Error fetching webinars:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setEditingItem(item);
      if (type === "webinar") {
        setFormData({
          ...item,
          tags: item.tags?.join(", ") || "",
        });
      } else {
        setFormData({ ...item });
      }
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        speaker: "",
        organization: "",
        date: "",
        duration: "",
        videoUrl: "",
        description: "",
        tags: "",
        size: "",
        url: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      title: "",
      speaker: "",
      organization: "",
      date: "",
      duration: "",
      videoUrl: "",
      description: "",
      tags: "",
      size: "",
      url: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (modalType === "webinar") {
        if (!formData.title || !formData.speaker || !formData.organization || !formData.date || !formData.videoUrl || !formData.description) {
          alert("Please fill in all required fields");
          return;
        }

        const payload = {
          title: formData.title,
          speaker: formData.speaker,
          organization: formData.organization,
          date: formData.date,
          duration: formData.duration,
          videoUrl: formData.videoUrl,
          description: formData.description,
          tags: formData.tags.split(",").map(tag => tag.trim()),
        };

        if (editingItem) {
          await updateWebinar(editingItem._id || editingItem.id, payload);
        } else {
          await createWebinar(payload);
        }

        await fetchWebinars();
      } else {
        if (!formData.title || !formData.date || !formData.url || !formData.size) {
          alert("Please fill in all required fields");
          return;
        }

        const payload = {
          title: formData.title,
          date: formData.date,
          size: formData.size,
          url: formData.url,
        };

        if (editingItem) {
          await updateResource(editingItem._id || editingItem.id, payload);
        } else {
          await createResource(payload);
        }

        await fetchResources();
      }

      closeModal();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Something went wrong while saving.");
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        if (type === "webinar") {
          await deleteWebinar(id);
          await fetchWebinars();
        } else {
          await deleteResource(id);
          await fetchResources();
        }
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete item.");
      }
    }
  };

  const filteredWebinars = webinars.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResources = resources.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  function getYouTubeID(url) {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Hub Admin</h1>
          <p className="text-gray-600">Manage webinars, trainings, and resources</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("webinars")}
            className={`pb-3 px-4 font-medium transition ${activeTab === "webinars"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <div className="flex items-center gap-2">
              <Video size={18} />
              Webinars & Trainings
            </div>
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`pb-3 px-4 font-medium transition ${activeTab === "resources"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              Resources
            </div>
          </button>
        </div>

        {/* Search and Add Button */}
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
            onClick={() => openModal(activeTab === "webinars" ? "webinar" : "resource")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Add {activeTab === "webinars" ? "Webinar/Training" : "Resource"}
          </button>
        </div>

        {/* Content */}
        {activeTab === "webinars" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWebinars.map((item) => (
              <div key={item._id || item.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition">
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
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <p className="text-sm text-gray-500 italic mb-2">
                    {item.speaker} — {item.organization}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar size={14} /> {item.date} • {item.duration}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags?.map((tag, index) => (
                      <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => openModal("webinar", item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete("webinar", item._id || item.id)}
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
                  <th className="p-3 text-left">Size</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((res) => (
                  <tr key={res._id || res.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{res.title}</td>
                    <td className="p-3 text-gray-600">{res.date}</td>
                    <td className="p-3 text-gray-600">{res.size}</td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openModal("resource", res)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete("resource", res._id || res.id)}
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
                  {editingItem ? "Edit" : "Add"} {modalType === "webinar" ? "Webinar/Training" : "Resource"}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {modalType === "webinar" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Speaker *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.speaker}
                        onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          className="w-full border rounded-lg px-3 py-2"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                        <input
                          type="text"
                          placeholder="e.g., 2 hours"
                          className="w-full border rounded-lg px-3 py-2"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube Embed) *</label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="Leadership, Governance, Women Empowerment"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File URL or PDF Link *</label>
                      <div className="flex items-center gap-2">
                        <Link size={18} className="text-gray-400" />
                        <input
                          type="text"
                          placeholder="https://example.com/document.pdf"
                          className="flex-1 border rounded-lg px-3 py-2"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a direct link to the PDF or document
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          className="w-full border rounded-lg px-3 py-2"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File Size *</label>
                        <input
                          type="text"
                          placeholder="e.g., 2.4 MB"
                          className="w-full border rounded-lg px-3 py-2"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        />
                      </div>
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

export default AdminKnowledgeHub;
