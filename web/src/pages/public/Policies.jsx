import React, { useState, useEffect } from "react";
import {
    FileText,
    Search,
    Download,
    Filter,
    X,
    Calendar,
    User,
    File,
    Eye,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    ImageIcon,
    FileVideo
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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Viewer State
    const [showViewer, setShowViewer] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const docs = await getDocuments();
            setDocuments(docs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getEmbedUrl = (file) => {
        const url = file.fileUrl || file.url;
        if (!url) return "";
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.match(/\.(xls|xlsx|ppt|pptx|doc|docx)$/)) {
            return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
        }
        if (lowerUrl.match(/\.(pdf|csv|txt)$/) || url.includes('/raw/upload/')) {
            return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
        }
        return url;
    };

    const handleFileAction = (file, allFiles = []) => {
        setPreviewFiles(allFiles);
        const index = allFiles.findIndex(f => (f._id || f.id) === (file._id || file.id));
        setCurrentPreviewIndex(index >= 0 ? index : 0);
        setSelectedFile(file);
        setShowViewer(true);
    };

    const isImageFile = (file) => {
        const url = (file.fileUrl || file.url || "").toLowerCase();
        return url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || file.fileType === 'image';
    };

    const isVideoFile = (file) => {
        const url = (file.fileUrl || file.url || "").toLowerCase();
        return url.match(/\.(mp4|webm|ogg|mov|avi)$/) || file.fileType === 'video';
    };

    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.issued_by && doc.issued_by.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = selectedTypeFilter === "all" || doc.document_type === selectedTypeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <main className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
                        Policies & <span className="text-violet-400">Issuances</span>
                    </h1>
                    <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
                    <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
                        Access official university guidelines, administrative orders, and academic policies.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 bg-slate-50 min-h-[60vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 mb-12 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title or keyword..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all outline-none font-medium"
                            />
                        </div>
                        <select
                            value={selectedTypeFilter}
                            onChange={e => setSelectedTypeFilter(e.target.value)}
                            className="w-full md:w-64 px-6 py-4 bg-slate-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="all">All Document Types</option>
                            {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20">
                            <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Repository...</p>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <FileText className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                            <p className="text-slate-400 font-bold text-xl">No documents match your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredDocuments.map(doc => (
                                <div key={doc._id} className="group bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-violet-100 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-violet-50 text-violet-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {doc.document_type}
                                            </span>
                                            {doc.date_issued && (
                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                    {new Date(doc.date_issued).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-violet-600 transition-colors leading-tight">
                                            {doc.title}
                                        </h3>
                                        <p className="text-slate-500 font-medium mt-3 line-clamp-2 text-sm leading-relaxed">
                                            {doc.description || "Official university issuance for public information and compliance."}
                                        </p>
                                        <div className="flex items-center gap-4 mt-6">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <User size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{doc.issued_by || "University Administration"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-3">
                                        {doc.files?.length > 0 ? (
                                            <>
                                                <button
                                                    onClick={() => handleFileAction(doc.files[0], doc.files)}
                                                    className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-violet-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
                                                >
                                                    View Documents
                                                    <Eye size={20} />
                                                </button>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    {doc.files.length} {doc.files.length === 1 ? 'File' : 'Files'} Attached
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-slate-300 font-bold text-sm italic">Digitizing document...</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Viewer Modal */}
            {showViewer && selectedFile && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className={`${isFullscreen ? 'w-screen h-screen' : 'bg-white w-full sm:max-w-6xl h-full sm:h-[90vh] sm:rounded-[3rem]'} flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300`}>
                        <div className="p-4 sm:px-10 sm:py-6 border-b flex justify-between items-center bg-white text-slate-900 sticky top-0 z-10">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FileText size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base sm:text-xl font-black truncate leading-tight uppercase tracking-tight">{selectedFile.originalName}</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Policy Document Resource</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <a href={selectedFile.fileUrl} download={selectedFile.originalName} target="_blank" rel="noreferrer" className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all" title="Download">
                                    <Download size={24} />
                                </a>
                                <button onClick={() => setIsFullscreen(!isFullscreen)} className="hidden sm:block p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                                    {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                                </button>
                                <button onClick={() => setShowViewer(false)} className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-900 flex items-center justify-center relative group overflow-hidden">
                            {previewFiles.length > 1 && (
                                <>
                                    <button onClick={() => { const i = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length; setCurrentPreviewIndex(i); setSelectedFile(previewFiles[i]); }} className="absolute left-6 z-20 p-5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"><ChevronLeft size={32} /></button>
                                    <button onClick={() => { const i = (currentPreviewIndex + 1) % previewFiles.length; setCurrentPreviewIndex(i); setSelectedFile(previewFiles[i]); }} className="absolute right-6 z-20 p-5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"><ChevronRight size={32} /></button>
                                </>
                            )}
                            <div className="w-full h-full flex items-center justify-center p-4 sm:p-10">
                                {isImageFile(selectedFile) ? (
                                    <img src={selectedFile.fileUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onContextMenu={e => e.preventDefault()} />
                                ) : isVideoFile(selectedFile) ? (
                                    <video src={selectedFile.fileUrl} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl" />
                                ) : (
                                    <iframe src={getEmbedUrl(selectedFile)} className="w-full h-full border-none bg-white rounded-2xl shadow-2xl" />
                                )}
                            </div>
                            {previewFiles.length > 1 && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full text-xs font-black tracking-[0.2em] transition-all group-hover:scale-110">
                                    {currentPreviewIndex + 1} / {previewFiles.length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default UserDocuments;