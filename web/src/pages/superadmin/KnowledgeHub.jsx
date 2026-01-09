import React, { useState, useEffect } from "react";
import { Video, Search, Plus, Edit2, Trash2, X, Save, Calendar } from "lucide-react";
import { getWebinars, createWebinar, updateWebinar, deleteWebinar } from "../../api/webinar";

const AdminKnowledgeHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    speaker: "",
    organization: "",
    date: "",
    duration: "",
    videoUrl: "",
    description: "",
    tags: "",
  });

  // Fetch webinars on mount
  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const data = await getWebinars();
      setWebinars(data);
    } catch (error) {
      console.error("Error fetching webinars:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (webinar = null) => {
    if (webinar) {
      setEditingWebinar(webinar);
      setFormData({
        ...webinar,
        tags: webinar.tags?.join(", ") || "",
      });
    } else {
      setEditingWebinar(null);
      setFormData({
        title: "",
        speaker: "",
        organization: "",
        date: "",
        duration: "",
        videoUrl: "",
        description: "",
        tags: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingWebinar(null);
    setFormData({
      title: "",
      speaker: "",
      organization: "",
      date: "",
      duration: "",
      videoUrl: "",
      description: "",
      tags: "",
    });
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.title || !formData.speaker || !formData.organization || 
          !formData.date || !formData.videoUrl || !formData.description) {
        alert("Please fill in all required fields");
        return;
      }

      const payload = {
        title: formData.title,
        speaker: formData.speaker,
        organization: formData.organization,
        date: formData.date,
        duration: formData.duration || "N/A",
        videoUrl: formData.videoUrl,
        description: formData.description,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
      };

      if (editingWebinar) {
        await updateWebinar(editingWebinar._id || editingWebinar.id, payload);
      } else {
        await createWebinar(payload);
      }

      await fetchWebinars();
      closeModal();
    } catch (error) {
      console.error("Error saving webinar:", error);
      alert("Something went wrong while saving.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this webinar?")) {
      try {
        await deleteWebinar(id);
        await fetchWebinars();
      } catch (error) {
        console.error("Error deleting webinar:", error);
        alert("Failed to delete webinar.");
      }
    }
  };

  const filteredWebinars = webinars.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
          </div>
          <p className="text-gray-600">Manage recorded webinars and training sessions</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
          <div className="flex items-center w-full sm:w-96 border rounded-lg px-3 py-2 bg-white shadow-sm">
            <Search className="text-gray-400 mr-2" size={18} />
            <input
              type="text"
              placeholder="Search webinars..."
              className="flex-1 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={18} />
            Add New Webinar
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading webinars...</p>
          </div>
        ) : (
          <>
            {/* Webinar Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredWebinars.length} of {webinars.length} webinars
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Webinars Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredWebinars.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white rounded-lg border">
                  <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No webinars found
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery ? "Try a different search term" : "Add your first webinar to get started"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => openModal()}
                      className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus size={16} />
                      Add First Webinar
                    </button>
                  )}
                </div>
              ) : (
                filteredWebinars.map((item) => (
                  <div key={item._id || item.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition">
                    <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
                      {item.videoUrl ? (
                        <>
                          <img
                            src={`https://img.youtube.com/vi/${getYouTubeID(item.videoUrl)}/hqdefault.jpg`}
                            alt={item.title}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => window.open(item.videoUrl, "_blank")}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full">
                              <Video className="w-6 h-6 text-red-600" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                          <Video className="w-12 h-12 mb-2" />
                          <p>No Video Thumbnail</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      <p className="text-sm text-gray-500 italic mb-3">
                        {item.speaker} — {item.organization}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Calendar size={14} /> {item.date} • {item.duration}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags?.map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-3 border-t">
                        <button
                          onClick={() => openModal(item)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id || item.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingWebinar ? "Edit" : "Add"} Webinar/Training
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Webinar title"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Speaker <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      placeholder="Speaker name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Organization name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2 hours"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube Video URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the full YouTube URL or embed link
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the webinar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Leadership, Governance, Women Empowerment, Gender Equality"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>
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
                  {editingWebinar ? "Update Webinar" : "Save Webinar"}
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