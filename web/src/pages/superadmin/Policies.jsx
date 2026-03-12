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
    Upload,
    Filter,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Minimize2,
    Download,
    CheckCircle2,
    Loader2,
    Image as ImageIcon,
    FileVideo
} from "lucide-react";
import {
    getDocuments,
    getArchivedDocuments,
    createDocument,
    updateDocument,
    uploadDocumentFiles,
    deleteDocumentFile,
    archiveDocument,
    restoreDocument,
    deleteDocument,
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
    const [viewArchived, setViewArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Viewer State
    const [showViewer, setShowViewer] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form Data
    const [formData, setFormData] = useState({
        title: "",
        document_type: "policy",
        issued_by: "",
        date_issued: "",
        description: "",
    });

    const [filesToUpload, setFilesToUpload] = useState([]);
    const [captions, setCaptions] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) {
            setFilesToUpload(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [viewArchived]);

    const fetchAll = async () => {
        try {
            setFetching(true);
            const data = viewArchived ? await getArchivedDocuments() : await getDocuments();
            setDocuments(data || []);
        } catch (err) {
            setError("Failed to load documents");
        } finally {
            setFetching(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.document_type) return;
        setUploading(true);
        try {
            let res;
            if (editingItem) {
                res = await updateDocument(editingItem._id, formData);
                setSuccess("Document info updated");
            } else {
                res = await createDocument(formData);
                const newId = res.data._id;
                if (filesToUpload.length > 0) {
                    await uploadDocumentFiles(newId, filesToUpload, captions);
                }
                setSuccess("Document created successfully");
            }
            setShowModal(false);
            resetForm();
            fetchAll();
        } catch (err) {
            setError("Failed to save document");
        } finally {
            setUploading(false);
        }
    };

    const handleUploadMore = async () => {
        if (!editingItem || filesToUpload.length === 0) return;
        setUploading(true);
        try {
            await uploadDocumentFiles(editingItem._id, filesToUpload, captions);
            setSuccess("Files added successfully");
            setShowUploadModal(false);
            resetForm();
            fetchAll();
        } catch (err) {
            setError("Failed to upload files");
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            document_type: "policy",
            issued_by: "",
            date_issued: "",
            description: "",
        });
        setFilesToUpload([]);
        setCaptions([]);
        setEditingItem(null);
    };

    const handleArchive = async (id) => {
        if (!window.confirm("Archive this document?")) return;
        try {
            await archiveDocument(id);
            fetchAll();
        } catch (err) {
            setError("Failed to archive");
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm("Restore this document?")) return;
        try {
            await restoreDocument(id);
            fetchAll();
        } catch (err) {
            setError("Failed to restore");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("PERMANENTLY delete this document?")) return;
        try {
            await deleteDocument(id);
            fetchAll();
        } catch (err) {
            setError("Failed to delete");
        }
    };

    const handleDeleteFile = async (docId, fileId) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            await deleteDocumentFile(docId, fileId);
            fetchAll();
        } catch (err) {
            setError("Failed to delete file");
        }
    };

    // Media Helpers
    const getFileExtension = (file) => {
        const fileName = file.originalName || file.name || '';
        const fileUrl = file.fileUrl || file.url || '';
        if (fileName.includes('.')) return fileName.toLowerCase().split('.').pop();
        if (fileUrl.includes('.')) {
            const urlParts = fileUrl.split('.');
            return urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
        }
        return '';
    };

    const isImageFile = (file) => {
        const ext = getFileExtension(file);
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || (file.fileType === 'image');
    };

    const isVideoFile = (file) => {
        const ext = getFileExtension(file);
        return ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext) || (file.fileType === 'video');
    };

    const isPdfFile = (file) => {
        const ext = getFileExtension(file);
        return ext === 'pdf' || (file.fileType === 'pdf');
    };

    const getFileIcon = (file) => {
        if (isPdfFile(file)) return <FileText size={18} className="text-red-500" />;
        if (isVideoFile(file)) return <FileVideo size={18} className="text-red-500" />;
        if (isImageFile(file)) return <ImageIcon size={18} className="text-blue-500" />;
        return <File size={18} className="text-gray-400" />;
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

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    };

    const filteredDocs = documents.filter(d => {
        const matchesSearch = d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.issued_by?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedTypeFilter === "all" || d.document_type === selectedTypeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Policies & Issuances</h1>
                    <p className="text-gray-600">Official documentation and university policies</p>
                </div>

                <div className="flex gap-4 mb-6 border-b">
                    <button onClick={() => setViewArchived(false)} className={`pb-3 px-4 font-medium transition ${!viewArchived ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}>Active</button>
                    <button onClick={() => setViewArchived(true)} className={`pb-3 px-4 font-medium transition ${viewArchived ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}>Archived</button>
                </div>

                <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search policies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:bg-white focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <select value={selectedTypeFilter} onChange={e => setSelectedTypeFilter(e.target.value)} className="px-4 py-2 bg-white border rounded-lg outline-none focus:border-blue-500">
                            <option value="all">All Types</option>
                            {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        {!viewArchived && (
                            <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                <Plus size={18} /> Add Policy
                            </button>
                        )}
                    </div>
                </div>

                {/* Messaging */}
                {(error || success) && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-semibold ${error ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {error ? <X size={20} /> : <CheckCircle2 size={20} />}
                        <span className="flex-1">{error || success}</span>
                        <X size={18} className="cursor-pointer opacity-50" onClick={() => { setError(""); setSuccess(""); }} />
                    </div>
                )}

                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    {fetching ? (
                        <div className="p-20 flex flex-col items-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
                    ) : filteredDocs.length === 0 ? (
                        <div className="p-20 text-center text-gray-400"><p>No documents found.</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-gray-600 text-xs font-black uppercase">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Title</th>
                                        <th className="px-6 py-4 text-left">Type</th>
                                        <th className="px-6 py-4 text-left">Issued By</th>
                                        <th className="px-6 py-4 text-left">Files</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredDocs.map(d => (
                                        <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{d.title}</td>
                                            <td className="px-6 py-4 uppercase text-[10px] font-black"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{d.document_type}</span></td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{d.issued_by || "-"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex -space-x-2">
                                                    {(d.files || []).slice(0, 3).map((f, i) => (
                                                        <div key={i} onClick={() => handleFileAction(f, d.files)} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 shadow-sm flex items-center justify-center cursor-pointer hover:scale-110 transition-all">
                                                            {isImageFile(f) ? <img src={f.fileUrl} className="w-full h-full object-cover rounded-full" /> : getFileIcon(f)}
                                                        </div>
                                                    ))}
                                                    {(d.files || []).length > 3 && <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">+{(d.files || []).length - 3}</div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    {(d.files || []).length > 0 && <button onClick={() => handleFileAction(d.files[0], d.files)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>}
                                                    {!viewArchived ? (
                                                        <>
                                                            <button onClick={() => { setEditingItem(d); setFormData({ title: d.title, document_type: d.document_type, issued_by: d.issued_by || "", date_issued: d.date_issued?.slice(0, 10) || "", description: d.description || "" }); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                                            <button onClick={() => { setEditingItem(d); setFilesToUpload([]); setShowUploadModal(true); }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Add Files"><Upload size={18} /></button>
                                                            <button onClick={() => handleArchive(d._id)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"><Archive size={18} /></button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleRestore(d._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><RefreshCcw size={18} /></button>
                                                    )}
                                                    <button onClick={() => handleDelete(d._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* FORM MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingItem ? "Edit Policy" : "New Policy"}</h3>
                            <button onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border rounded-lg" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Type</label>
                                    <select value={formData.document_type} onChange={e => setFormData({ ...formData, document_type: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg">
                                        {DOCUMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase mb-1">Date Issued</label>
                                    <input type="date" value={formData.date_issued} onChange={e => setFormData({ ...formData, date_issued: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-1">Issued By</label>
                                <input type="text" value={formData.issued_by} onChange={e => setFormData({ ...formData, issued_by: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Upload Files (Initial)</label>
                                <div
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-blue-600 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        onChange={e => setFilesToUpload(prev => [...prev, ...Array.from(e.target.files)])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                            <Upload size={24} />
                                        </div>
                                        <p className="font-bold text-gray-900">Click to upload or drag & drop</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PDF, Images, Videos, Office Docs</p>
                                    </div>
                                </div>

                                {filesToUpload.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {filesToUpload.map((file, i) => (
                                            <div key={i} className="bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {getFileIcon(file)}
                                                    <span className="text-[10px] font-bold text-gray-900 truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFilesToUpload(prev => prev.filter((_, idx) => idx !== i))}
                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-lg font-bold">Cancel</button>
                                <button type="submit" disabled={uploading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold flex justify-center items-center gap-2">
                                    {uploading && <Loader2 size={18} className="animate-spin" />}
                                    {editingItem ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* UPLOAD MODAL */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Add Files</h3>
                            <button onClick={() => setShowUploadModal(false)}><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm font-medium">Adding files to: <span className="font-bold text-blue-600">{editingItem?.title}</span></p>

                            <div
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${isDragging ? 'border-blue-600 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                            >
                                <input
                                    type="file"
                                    multiple
                                    onChange={e => setFilesToUpload(prev => [...prev, ...Array.from(e.target.files)])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-3 pointer-events-none">
                                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                                        <Upload size={28} />
                                    </div>
                                    <p className="font-black text-gray-900 text-lg">Drop your files here</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">or click to browse local files</p>
                                </div>
                            </div>

                            {filesToUpload.length > 0 && (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filesToUpload.map((file, i) => (
                                        <div key={i} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100 group/file">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0 group-hover/file:scale-110 transition-transform">
                                                    {getFileIcon(file)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-900 truncate max-w-[240px]">{file.name}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{formatFileSize(file.size)}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFilesToUpload(prev => prev.filter((_, idx) => idx !== i))}
                                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 bg-gray-100 rounded-lg font-bold">Cancel</button>
                                <button onClick={handleUploadMore} disabled={uploading || filesToUpload.length === 0} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold flex justify-center items-center gap-2">
                                    {uploading && <Loader2 size={18} className="animate-spin" />}
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEWER MODAL */}
            {showViewer && selectedFile && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in transition-all">
                    <div className={`${isFullscreen ? 'w-screen h-screen' : 'bg-white w-full sm:max-w-6xl h-full sm:h-[90vh] sm:rounded-2xl'} flex flex-col overflow-hidden`}>
                        <div className="p-4 border-b flex justify-between items-center bg-white text-gray-900 sticky top-0 z-10">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0"><FileText size={20} /></div>
                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-lg font-bold truncate">{selectedFile.originalName}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatFileSize(selectedFile.size)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={selectedFile.fileUrl} download={selectedFile.originalName} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Download size={20} /></a>
                                <button onClick={() => setIsFullscreen(!isFullscreen)} className="hidden sm:block p-2 text-gray-500 hover:bg-gray-100 rounded-lg">{isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button>
                                <button onClick={() => setShowViewer(false)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-100/50 rounded-full transition-all"><X size={24} /></button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-900 flex items-center justify-center relative group overflow-hidden">
                            {previewFiles.length > 1 && (
                                <>
                                    <button onClick={() => { const i = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length; setCurrentPreviewIndex(i); setSelectedFile(previewFiles[i]); }} className="absolute left-4 z-20 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={24} /></button>
                                    <button onClick={() => { const i = (currentPreviewIndex + 1) % previewFiles.length; setCurrentPreviewIndex(i); setSelectedFile(previewFiles[i]); }} className="absolute right-4 z-20 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={24} /></button>
                                </>
                            )}
                            <div className="w-full h-full p-2 sm:p-6 flex items-center justify-center">
                                {isImageFile(selectedFile) ? <img src={selectedFile.fileUrl} className="max-w-full max-h-full object-contain" /> : isVideoFile(selectedFile) ? <video src={selectedFile.fileUrl} controls autoPlay className="max-w-full max-h-full" /> : <iframe src={getEmbedUrl(selectedFile)} className="w-full h-full bg-white rounded-lg shadow-2xl" />}
                            </div>
                            {previewFiles.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{currentPreviewIndex + 1} / {previewFiles.length}</div>}
                            {!viewArchived && <button onClick={() => handleDeleteFile(editingItem?._id || previewFiles[0]?.documentId, selectedFile._id)} className="absolute top-4 right-4 p-2 bg-red-500/50 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDocuments;