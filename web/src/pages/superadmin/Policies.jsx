import React, { useState, useEffect } from "react";
import {
    FileText,
    Search,
    Plus,
    Edit2,
    X,
    Save,
    Calendar,
    File,
    Archive,
    Paperclip,
    Upload,
    Filter
} from "lucide-react";
import {
    getDocuments,
    getArchivedDocuments,
    uploadDocument,
    archiveDocument,
    restoreDocument,
} from "../../api/documents";

const DOCUMENT_TYPES = [
    { value: "policy", label: "Policy" },
    { value: "circular", label: "Circular" },
    { value: "resolution", label: "Resolution" },
    { value: "memorandum", label: "Memorandum" },
    { value: "office_order", label: "Office Order" },
];

const AdminDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [archived, setArchived] = useState([]);
    const [activeTab, setActiveTab] = useState("active");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const [formData, setFormData] = useState({
        title: "",
        document_type: "policy",
        issued_by: "",
        date_issued: "",
        description: "",
        file: null,
        file_url: "",
    });

    // ========================= FETCH =========================
    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setFetching(true);
            const docs = await getDocuments(); // Active lang (status !== "archived")
            const archivedDocs = await getArchivedDocuments(); // Archived lang (status === "archived")

            setDocuments(docs);
            setArchived(archivedDocs);
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Failed to load documents");
        } finally {
            setFetching(false);
        }
    };

    // ========================= FILTERING =========================
    const activeList = (activeTab === "active" ? documents : archived).filter((d) => {
        const matchesSearch =
            d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.issued_by && d.issued_by.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = selectedTypeFilter === "all" || d.document_type === selectedTypeFilter;

        return matchesSearch && matchesType;
    });

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedTypeFilter("all");
    };

    // ========================= MODAL =========================
    const openModal = (item = null) => {
        console.log("openModal called with:", item); // Debug
        setErrors({});
        setTouched({});

        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                document_type: item.document_type,
                issued_by: item.issued_by || "",
                date_issued: item.date_issued?.slice(0, 10) || "",
                description: item.description || "",
                file: null,
                file_url: item.file_url || "",
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: "",
                document_type: "policy",
                issued_by: "",
                date_issued: "",
                description: "",
                file: null,
                file_url: "",
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        console.log("closeModal called"); // Debug
        setShowModal(false);
        setEditingItem(null);
        setErrors({});
        setTouched({});
    };

    // ========================= ARCHIVE/RESTORE =========================
    const handleArchive = async (id) => {
        if (window.confirm("Are you sure you want to archive this document? It will be moved to the archived tab.")) {
            try {
                await archiveDocument(id);
                await fetchAll();
            } catch (err) {
                console.error("Archive error:", err);
                alert("Failed to archive document.");
            }
        }
    };

    const handleRestore = async (id) => {
        if (window.confirm("Are you sure you want to restore this document to active?")) {
            try {
                await restoreDocument(id);
                await fetchAll();
            } catch (err) {
                console.error("Restore error:", err);
                alert("Failed to restore document.");
            }
        }
    };

    // ========================= SUBMIT =========================
    const handleSubmit = async () => {
        // Validation
        const allTouched = {
            title: true,
            issued_by: true,
            date_issued: true,
            description: true,
            file: true,
        };
        setTouched(allTouched);

        // Simple validation
        if (!formData.title.trim()) {
            alert("Title is required");
            return;
        }

        if (!editingItem && !formData.file) {
            alert("File is required for new documents");
            return;
        }

        try {
            setLoading(true);

            const payload = new FormData();
            payload.append("title", formData.title.trim());
            payload.append("document_type", formData.document_type);
            payload.append("issued_by", formData.issued_by.trim());
            payload.append("date_issued", formData.date_issued);
            payload.append("description", formData.description.trim());

            if (formData.file) {
                payload.append("file", formData.file);
            } else if (editingItem && formData.file_url) {
                payload.append("file_url", formData.file_url);
            }

            if (editingItem) {
                await uploadDocument(editingItem._id, payload);
            } else {
                await uploadDocument(null, payload);
            }

            await fetchAll();
            closeModal();
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save document.");
        } finally {
            setLoading(false);
        }
    };

    // ========================= UI =========================
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Policies & Issuances
                    </h1>
                    <p className="text-gray-600">
                        Manage policies, circulars, resolutions, memoranda, and office orders
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`pb-3 px-4 font-medium transition ${activeTab === "active"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Active Documents ({documents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("archived")}
                        className={`pb-3 px-4 font-medium transition ${activeTab === "archived"
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Archived ({archived.length})
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        {/* Search */}
                        <div className="flex items-center w-full sm:w-96 border rounded-lg px-3 py-2 bg-white">
                            <Search className="text-gray-400 mr-2" size={18} />
                            <input
                                type="text"
                                placeholder="Search by title, type, or issued by..."
                                className="flex-1 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${selectedTypeFilter !== "all"
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <Filter size={18} />
                                    Filter by Type
                                    {selectedTypeFilter !== "all" && (
                                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                                            {DOCUMENT_TYPES.find(t => t.value === selectedTypeFilter)?.label}
                                        </span>
                                    )}
                                </button>

                                {filterDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setFilterDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-20">
                                            <div className="p-3 border-b">
                                                <h3 className="font-medium text-gray-700">Filter by Document Type</h3>
                                            </div>
                                            <div className="p-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTypeFilter("all");
                                                        setFilterDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded ${selectedTypeFilter === "all"
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "hover:bg-gray-50"
                                                        }`}
                                                >
                                                    All Types
                                                </button>
                                                {DOCUMENT_TYPES.map((type) => (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => {
                                                            setSelectedTypeFilter(type.value);
                                                            setFilterDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded ${selectedTypeFilter === type.value
                                                            ? "bg-blue-50 text-blue-600"
                                                            : "hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="border-t p-2">
                                                <button
                                                    onClick={resetFilters}
                                                    className="w-full text-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded"
                                                >
                                                    Reset All Filters
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Add Document Button - Active tab lang */}
                            {activeTab === "active" && (
                                <button
                                    onClick={() => openModal()}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ml-auto relative z-30"
                                >
                                    <Plus size={18} />
                                    Add Document
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {activeList.length} {activeTab === "active" ? "active" : "archived"} documents
                </div>

                {/* Loading */}
                {fetching && (
                    <div className="text-center py-6 text-gray-600">
                        Loading documents...
                    </div>
                )}

                {/* Table */}
                {!fetching && (
                    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                        {activeList.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                {searchQuery || selectedTypeFilter !== "all" ? (
                                    <>
                                        <p className="mb-2">No documents match your filters</p>
                                        <button
                                            onClick={resetFilters}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Clear all filters
                                        </button>
                                    </>
                                ) : (
                                    <p>No {activeTab === "active" ? "active" : "archived"} documents found</p>
                                )}
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="p-3 text-left">Title</th>
                                        <th className="p-3 text-left">Type</th>
                                        <th className="p-3 text-left">Issued By</th>
                                        <th className="p-3 text-left">Date</th>
                                        <th className="p-3 text-center">File</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeList.map((d) => (
                                        <tr key={d._id} className="border-t hover:bg-gray-50">
                                            <td className="p-3 font-medium">{d.title}</td>
                                            <td className="p-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                    {d.document_type}
                                                </span>
                                            </td>
                                            <td className="p-3">{d.issued_by || "-"}</td>
                                            <td className="p-3">
                                                {d.date_issued
                                                    ? new Date(d.date_issued).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td className="p-3 text-center">
                                                {d.file_url && (
                                                    <a
                                                        href={d.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-blue-600 hover:underline flex justify-center"
                                                    >
                                                        <File size={16} />
                                                    </a>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2 justify-center">
                                                    {activeTab === "active" ? (
                                                        <>
                                                            <button
                                                                onClick={() => openModal(d)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleArchive(d._id)}
                                                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                                                                title="Archive"
                                                            >
                                                                <Archive size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRestore(d._id)}
                                                            className="px-3 py-1 text-green-600 hover:bg-green-50 rounded border border-green-200"
                                                            title="Restore"
                                                        >
                                                            Restore
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ==================== MODAL ==================== */}
                {showModal && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-50"
                            onClick={closeModal}
                        />

                        {/* Modal */}
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-6 border-b">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {editingItem ? "Edit Document" : "Add New Document"}
                                    </h2>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className={`w-full px-3 py-2 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter document title"
                                            />
                                            {errors.title && (
                                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                            )}
                                        </div>

                                        {/* Document Type & Issued By */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Document Type *
                                                </label>
                                                <select
                                                    value={formData.document_type}
                                                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    {DOCUMENT_TYPES.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Issued By *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.issued_by}
                                                    onChange={(e) => setFormData({ ...formData, issued_by: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="e.g., Office of the President"
                                                />
                                            </div>
                                        </div>

                                        {/* Date Issued */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date Issued *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={formData.date_issued}
                                                    onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="Brief description of the document..."
                                            />
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {editingItem ? "Replace File (Optional)" : "File *"}
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    id="file-upload"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setFormData({ ...formData, file: file });
                                                        }
                                                    }}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                />
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    {formData.file ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <FileText className="text-green-600" size={24} />
                                                            <div className="text-left">
                                                                <p className="font-medium text-gray-900">{formData.file.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setFormData({ ...formData, file: null });
                                                                }}
                                                                className="ml-2 text-red-600"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ) : formData.file_url ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <FileText className="text-blue-600" size={24} />
                                                            <div>
                                                                <p className="font-medium text-gray-900">Current file attached</p>
                                                                <a
                                                                    href={formData.file_url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-sm text-blue-600 hover:underline"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    View existing file
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                                            <p className="text-gray-600 mb-1">
                                                                Click to upload or drag and drop
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (Max: 10MB)
                                                            </p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {editingItem
                                                    ? "Leave empty to keep existing file"
                                                    : "File is required for new documents"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-3 p-6 border-t">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                {editingItem ? "Update Document" : "Save Document"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDocuments;