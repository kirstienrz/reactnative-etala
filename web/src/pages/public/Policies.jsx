import React, { useState, useEffect } from "react";
import {
    FileText,
    Search,
    Download,
    Filter,
    X,
    Calendar,
    User,
    File
} from "lucide-react";
import { getDocuments } from "../../api/documents";

const DOCUMENT_TYPES = [
    { value: "policy", label: "Policy" },
    { value: "circular", label: "Circular" },
    { value: "resolution", label: "Resolution" },
    { value: "memorandum", label: "Memorandum" },
    { value: "office_order", label: "Office Order" },
];

const UserDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // ========================= FETCH =========================
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const docs = await getDocuments(); // Active documents lang
            setDocuments(docs);
            setFilteredDocuments(docs);
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    // ========================= FILTERING =========================
    useEffect(() => {
        const filtered = documents.filter((doc) => {
            // Search filter
            const matchesSearch = 
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (doc.issued_by && doc.issued_by.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            // Type filter
            const matchesType = selectedTypeFilter === "all" || doc.document_type === selectedTypeFilter;
            
            return matchesSearch && matchesType;
        });
        setFilteredDocuments(filtered);
    }, [searchQuery, selectedTypeFilter, documents]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedTypeFilter("all");
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get document type label
    const getDocumentTypeLabel = (type) => {
        const found = DOCUMENT_TYPES.find(t => t.value === type);
        return found ? found.label : type;
    };

    // Download file
    const handleDownload = (fileUrl, title) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        }
    };

    return (
        <main className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                
                <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Policies & Issuances
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
                    <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
                        Official policies, circulars, resolutions, memoranda, and office orders of Technological University of the Philippines - Taguig
                    </p>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-16 bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Document Overview</h2>
                    <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
                        <p>
                            This portal provides access to all official documents and issuances of TUP Taguig. 
                            These include policies, circulars, resolutions, memoranda, and office orders that 
                            govern the operations and activities of the university community.
                        </p>
                        <p>
                            All documents are organized by type and can be filtered for easier navigation. 
                            Each document includes important details such as the issuing authority, date of issuance, 
                            and a brief description to help you understand its purpose and applicability.
                        </p>
                        <p>
                            For questions or clarifications regarding any document, please contact the 
                            Office of the President or the relevant department mentioned in the document.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="py-8 bg-slate-50 border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="w-full md:w-auto">
                            <h2 className="text-2xl font-bold text-slate-900">Browse Documents</h2>
                            <p className="text-slate-600 mt-1">
                                {loading ? "Loading..." : `Found ${filteredDocuments.length} documents`}
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            {/* Search */}
                            <div className="flex items-center w-full md:w-64 border border-slate-300 rounded-lg px-4 py-2.5 bg-white">
                                <Search className="text-slate-400 mr-3" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    className="flex-1 outline-none text-slate-700 placeholder-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="text-slate-400 hover:text-slate-600 ml-2"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition ${selectedTypeFilter !== "all"
                                        ? "bg-violet-50 text-violet-700 border-violet-200"
                                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <Filter size={18} />
                                    Filter by Type
                                    {selectedTypeFilter !== "all" && (
                                        <span className="bg-violet-100 text-violet-600 text-xs px-2 py-1 rounded-full">
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
                                        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                                            <div className="p-3 border-b border-slate-200">
                                                <h3 className="font-medium text-slate-700">Filter by Document Type</h3>
                                            </div>
                                            <div className="p-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedTypeFilter("all");
                                                        setFilterDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded ${selectedTypeFilter === "all"
                                                        ? "bg-violet-50 text-violet-700"
                                                        : "hover:bg-slate-50 text-slate-700"
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
                                                            ? "bg-violet-50 text-violet-700"
                                                            : "hover:bg-slate-50 text-slate-700"
                                                        }`}
                                                    >
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="border-t border-slate-200 p-2">
                                                <button
                                                    onClick={resetFilters}
                                                    className="w-full text-center px-3 py-2 text-slate-600 hover:bg-slate-50 rounded"
                                                >
                                                    Reset All Filters
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(selectedTypeFilter !== "all" || searchQuery) && (
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <span className="text-sm text-slate-600">Active filters:</span>
                            {selectedTypeFilter !== "all" && (
                                <span className="bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                                    Type: {DOCUMENT_TYPES.find(t => t.value === selectedTypeFilter)?.label}
                                    <button
                                        onClick={() => setSelectedTypeFilter("all")}
                                        className="text-violet-400 hover:text-violet-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                                    Search: "{searchQuery}"
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Documents Section */}
            <section className="py-16 bg-slate-50">
                <div className="max-w-5xl mx-auto px-8">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                            <p className="mt-4 text-slate-600">Loading documents...</p>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No documents found</h3>
                            <p className="text-slate-600 mb-6">
                                {searchQuery || selectedTypeFilter !== "all" 
                                    ? "No documents match your search or filter criteria." 
                                    : "No documents available at the moment."}
                            </p>
                            {(searchQuery || selectedTypeFilter !== "all") && (
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-medium"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="bg-white border border-slate-200 rounded-lg p-8 hover:border-violet-300 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                        <div className="flex items-start gap-6 flex-1">
                                            <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {doc.document_type === "policy" && <FileText className="w-7 h-7 text-violet-600" />}
                                                {doc.document_type === "circular" && <FileText className="w-7 h-7 text-blue-600" />}
                                                {doc.document_type === "resolution" && <FileText className="w-7 h-7 text-emerald-600" />}
                                                {doc.document_type === "memorandum" && <FileText className="w-7 h-7 text-amber-600" />}
                                                {doc.document_type === "office_order" && <FileText className="w-7 h-7 text-rose-600" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                                        doc.document_type === "policy" ? "bg-violet-100 text-violet-800" :
                                                        doc.document_type === "circular" ? "bg-blue-100 text-blue-800" :
                                                        doc.document_type === "resolution" ? "bg-emerald-100 text-emerald-800" :
                                                        doc.document_type === "memorandum" ? "bg-amber-100 text-amber-800" :
                                                        "bg-rose-100 text-rose-800"
                                                    }`}>
                                                        {getDocumentTypeLabel(doc.document_type)}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                                    {doc.title}
                                                </h3>
                                                
                                                {doc.description && (
                                                    <p className="text-slate-600 leading-relaxed mb-4">
                                                        {doc.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                    {doc.issued_by && (
                                                        <div className="flex items-center gap-1">
                                                            <User size={14} />
                                                            <span>Issued by: {doc.issued_by}</span>
                                                        </div>
                                                    )}
                                                    {doc.date_issued && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            <span>Date: {formatDate(doc.date_issued)}</span>
                                                        </div>
                                                    )}
                                                    {doc.file_url && (
                                                        <div className="flex items-center gap-1">
                                                            <File size={14} />
                                                            <span>File attached</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {doc.file_url && (
                                            <button
                                                onClick={() => handleDownload(doc.file_url, doc.title)}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-3 rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-medium text-sm flex-shrink-0 self-start"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Document Types Legend */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Types Legend</h3>
                        <div className="flex flex-wrap gap-3">
                            {DOCUMENT_TYPES.map((type) => (
                                <div key={type.value} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded ${
                                        type.value === "policy" ? "bg-violet-500" :
                                        type.value === "circular" ? "bg-blue-500" :
                                        type.value === "resolution" ? "bg-emerald-500" :
                                        type.value === "memorandum" ? "bg-amber-500" :
                                        "bg-rose-500"
                                    }`}></div>
                                    <span className="text-sm text-slate-600">{type.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default UserDocuments;