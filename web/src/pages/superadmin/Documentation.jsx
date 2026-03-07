

import React, { useState, useEffect } from 'react';
import {
    Upload, Edit2, Trash2, Plus, X, Archive, RefreshCw, FileText,
    File, FileVideo, Eye, Download, Maximize2, Minimize2, ChevronDown, ChevronUp,
    ChevronLeft, ChevronRight, Image as ImageIcon, Folder, FolderOpen, Search, Filter, MoreVertical
} from 'lucide-react';
import {
    getAllDocs,
    getArchivedDocs,  // <-- MAKE SURE THIS IS IMPORTED
    uploadFiles,
    archiveDoc,
    deleteFile,
    createDoc,
    deleteDoc
} from '../../api/documentation';

export default function DocumentationAdmin() {
    const [docs, setDocs] = useState([]);
    const [viewArchived, setViewArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [fileUploads, setFileUploads] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [newDocDescription, setNewDocDescription] = useState('');
    const [captions, setCaptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [expandedDocs, setExpandedDocs] = useState({});
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [previewFiles, setPreviewFiles] = useState([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Toggle document expansion
    const toggleExpand = (docId) => {
        setExpandedDocs(prev => ({
            ...prev,
            [docId]: !prev[docId]
        }));
    };

    // Toggle all documents
    const toggleAllExpand = () => {
        if (Object.keys(expandedDocs).length === filteredDocs.length) {
            setExpandedDocs({});
        } else {
            const allExpanded = {};
            filteredDocs.forEach(doc => {
                allExpanded[doc._id || doc.id] = true;
            });
            setExpandedDocs(allExpanded);
        }
    };

    // Get actual file type
    const getActualFileType = (file) => {
        const fileName = file.originalName || file.name || '';
        const storedFileType = file.fileType || file.type || '';

        if (fileName.toLowerCase().endsWith('.pdf')) {
            return 'pdf';
        }

        const fileUrl = file.fileUrl || file.url || '';
        if (fileUrl.toLowerCase().includes('.pdf')) {
            return 'pdf';
        }

        return storedFileType;
    };
    // Fetch documents based on viewArchived state
    const fetchDocs = async () => {
        setIsLoading(true);
        try {
            let docsArray = [];

            if (viewArchived) {
                // Kunin ang archived documents
                docsArray = await getArchivedDocs();
                console.log('Archived docs:', docsArray);
            } else {
                // Kunin ang active documents
                docsArray = await getAllDocs();
                console.log('Active docs:', docsArray);
            }

            setDocs(docsArray || []);

            // Auto-expand documents with few files
            const autoExpanded = {};
            (docsArray || []).forEach(doc => {
                if ((doc.files?.length || 0) <= 3) {
                    autoExpanded[doc._id || doc.id] = true;
                }
            });
            setExpandedDocs(autoExpanded);

        } catch (err) {
            console.error('Failed to fetch docs:', err);
            alert('Failed to load documents');
            setDocs([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Update useEffect dependency
    useEffect(() => {
        fetchDocs();
    }, [viewArchived]); // Magre-refetch every time mag-switch ng tab

    // File selection for upload
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setFileUploads(files);

        const newCaptions = files.map(() => '');
        setCaptions(newCaptions);
    };

    // Handle caption change
    const handleCaptionChange = (index, value) => {
        const newCaptions = [...captions];
        newCaptions[index] = value;
        setCaptions(newCaptions);
    };

    // Upload files to a doc
    const handleUpload = async () => {
        if (!currentDoc || fileUploads.length === 0) return;

        setIsUploading(true);

        try {
            await uploadFiles(currentDoc._id, fileUploads, captions);
            alert('Files uploaded successfully!');
            setFileUploads([]);
            setCaptions([]);
            setShowModal(false);
            fetchDocs();
        } catch (err) {
            console.error('Upload error:', err);
            alert(`Upload failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!window.confirm('WARNING: This will permanently delete this document collection and all its files. Are you sure you want to proceed?')) return;

        try {
            await deleteDoc(docId);
            fetchDocs();
            alert('Document collection deleted successfully!');
        } catch (err) {
            console.error('Delete block error:', err);
            alert(`Failed to delete collection: ${err.message}`);
        }
    };

    const handleArchive = async (docId) => {
        if (!window.confirm('Archive this document?')) return;

        try {
            await archiveDoc(docId);

            // I-refetch para ma-update ang list
            await fetchDocs();

            alert('Document archived successfully!');
        } catch (err) {
            console.error('Archive error:', err);
            alert(`Failed to archive: ${err.message}`);
        }
    };

    const handleDeleteFile = async (docId, fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await deleteFile(docId, fileId);
            alert('File deleted successfully!');
            fetchDocs();
        } catch (err) {
            console.error(err);
            alert(`Failed to delete file: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleCreateDocument = async () => {
        if (!newDocTitle.trim()) {
            alert('Please enter a title for the document');
            return;
        }

        try {
            await createDoc({
                title: newDocTitle,
                description: newDocDescription
            });
            alert('Document created successfully!');
            setNewDocTitle('');
            setNewDocDescription('');
            setShowCreateModal(false);
            fetchDocs();
        } catch (err) {
            console.error(err);
            alert(`Failed to create document: ${err.response?.data?.message || err.message}`);
        }
    };

    // Get file extension
    const getFileExtension = (file) => {
        const fileName = file.originalName || file.name || '';
        const fileUrl = file.fileUrl || file.url || '';

        if (fileName.includes('.')) {
            return fileName.toLowerCase().split('.').pop();
        }

        if (fileUrl.includes('.')) {
            const urlParts = fileUrl.split('.');
            return urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
        }

        return '';
    };

    // Check if file is PDF
    const isPdfFile = (file) => {
        const extension = getFileExtension(file);
        const fileName = (file.originalName || file.name || '').toLowerCase();
        const fileUrl = (file.fileUrl || file.url || '').toLowerCase();

        if (extension === 'pdf') return true;
        if (fileName.endsWith('.pdf')) return true;
        if (fileUrl.includes('.pdf')) return true;
        if ((file.fileType || file.type || '').includes('pdf')) return true;

        return false;
    };

    // Check if file is image
    const isImageFile = (file) => {
        if (!file) return false;
        const extension = getFileExtension(file);
        const mimeType = file.mimetype || file.type || '';
        if (mimeType.startsWith('image/')) return true;
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        return imageExtensions.includes(extension);
    };

    // Check if file is video
    const isVideoFile = (file) => {
        if (!file) return false;
        const extension = getFileExtension(file);
        const mimeType = file.mimetype || file.type || '';
        if (mimeType.startsWith('video/')) return true;
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
        return videoExtensions.includes(extension);
    };

    // Robust Google Docs Viewer URL generator
    const getEmbedUrl = (file) => {
        const url = file.fileUrl || file.url;
        if (!url) return "";

        // Specifically use Google Viewer for all document types
        // This is often more robust than gview
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    };

    // Handle file viewing
    const handleFileAction = (file, docFiles = []) => {
        const fileUrl = file.fileUrl || file.url;

        // If we have access to all files in the doc, set them for navigation
        if (docFiles.length > 0) {
            setPreviewFiles(docFiles);
            const index = docFiles.findIndex(f => (f._id || f.id) === (file._id || file.id));
            setCurrentPreviewIndex(index >= 0 ? index : 0);
        } else {
            setPreviewFiles([file]);
            setCurrentPreviewIndex(0);
        }

        setSelectedFile(file);
        setShowViewer(true);
    };

    const handleNextPreview = () => {
        if (previewFiles.length > 0) {
            const nextIndex = (currentPreviewIndex + 1) % previewFiles.length;
            setCurrentPreviewIndex(nextIndex);
            setSelectedFile(previewFiles[nextIndex]);
        }
    };

    const handlePrevPreview = () => {
        if (previewFiles.length > 0) {
            const prevIndex = (currentPreviewIndex - 1 + previewFiles.length) % previewFiles.length;
            setCurrentPreviewIndex(prevIndex);
            setSelectedFile(previewFiles[prevIndex]);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleFileDownload = (file) => {
        const fileUrl = file.fileUrl || file.url;
        const fileName = file.originalName || file.name || 'download';

        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank'; // Fallback for some browsers
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get file icon
    const getFileIcon = (file) => {
        if (isPdfFile(file)) {
            return <FileText size={16} className="text-red-500" />;
        } else if (isImageFile(file)) {
            return <ImageIcon size={16} className="text-blue-500" />;
        } else if (isVideoFile(file)) {
            return <FileVideo size={16} className="text-red-500" />;
        } else {
            const extension = getFileExtension(file);
            switch (extension) {
                case 'doc':
                case 'docx':
                    return <FileText size={16} className="text-blue-500" />;
                case 'xls':
                case 'xlsx':
                    return <FileText size={16} className="text-green-500" />;
                default:
                    return <File size={16} className="text-gray-500" />;
            }
        }
    };

    // Get file type label
    const getFileTypeLabel = (file) => {
        if (isPdfFile(file)) return 'PDF';
        if (isImageFile(file)) return 'IMG';

        const extension = getFileExtension(file);
        return extension.toUpperCase();
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
    };

    const filteredDocs = docs.filter(d =>
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Compact Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900"> Documentation Drive</h1>
                        <p className="text-xs text-gray-500 mt-1">
                            {viewArchived ? ' Archived' : ' Active'} • {filteredDocs.length} docs • {docs.reduce((sum, doc) => sum + (doc.files?.length || 0), 0)} files
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={fetchDocs}
                            disabled={isLoading}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                        >
                            {viewMode === 'grid' ? (
                                <div className="text-xs font-medium">List</div>
                            ) : (
                                <div className="text-xs font-medium">Grid</div>
                            )}
                        </button>

                        <button
                            onClick={() => setViewArchived(!viewArchived)}
                            className="px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center gap-2"
                        >
                            <Archive size={14} />
                            <span>{viewArchived ? 'Active' : 'Archived'}</span>
                        </button>

                        {!viewArchived && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <Plus size={14} />
                                <span>New</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Documents Area */}
            <div className="bg-white rounded-lg shadow-sm">
                {/* Header Actions */}
                <div className="p-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleAllExpand}
                            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                            {Object.keys(expandedDocs).length === filteredDocs.length ? (
                                <>
                                    <ChevronUp size={12} />
                                    Collapse All
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={12} />
                                    Expand All
                                </>
                            )}
                        </button>
                        <span className="text-xs text-gray-500">
                            Showing {filteredDocs.length} documents
                        </span>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="p-8 text-center">
                        <RefreshCw size={24} className="mx-auto animate-spin text-blue-500" />
                        <p className="mt-2 text-sm text-gray-600">Loading...</p>
                    </div>
                )}

                {/* Documents Content */}
                {!isLoading && (
                    <div className="overflow-x-auto">
                        {filteredDocs.length > 0 ? (
                            viewMode === 'list' ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-gray-900">Document Name</th>
                                            <th className="px-6 py-3 font-semibold text-gray-900">Description</th>
                                            <th className="px-6 py-3 font-semibold text-gray-900">Files</th>
                                            <th className="px-6 py-3 font-semibold text-gray-900">Date Created</th>
                                            <th className="px-6 py-3 font-semibold text-right text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredDocs.map(doc => {
                                            const fileCount = doc.files?.length || 0;
                                            return (
                                                <tr key={doc._id || doc.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                                <Folder size={18} className="text-blue-600" />
                                                            </div>
                                                            <span className="font-semibold text-gray-900">{doc.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 max-w-sm truncate">
                                                        {doc.description || '---'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {fileCount > 0 ? (
                                                            <div className="flex items-center -space-x-2">
                                                                {doc.files.slice(0, 3).map((file, i) => (
                                                                    <div
                                                                        key={i}
                                                                        onClick={(e) => { e.stopPropagation(); handleFileAction(file, doc.files); }}
                                                                        className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer hover:z-10 transition-transform hover:scale-110 shadow-sm"
                                                                    >
                                                                        {isImageFile(file) ? (
                                                                            <img src={file.fileUrl || file.url} alt="" className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="scale-75 text-gray-500">{getFileIcon(file)}</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {fileCount > 3 && (
                                                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center shadow-sm">
                                                                        +{fileCount - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">No files available</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                        {doc.createdAt && new Date(doc.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => { toggleExpand(doc._id || doc.id); setViewMode('grid'); }}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            {!viewArchived && (
                                                                <button
                                                                    onClick={() => {
                                                                        setCurrentDoc(doc);
                                                                        setFileUploads([]);
                                                                        setCaptions([]);
                                                                        setShowModal(true);
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                    title="Upload Files"
                                                                >
                                                                    <Upload size={18} />
                                                                </button>
                                                            )}
                                                            {!viewArchived && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteDoc(doc._id || doc.id);
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Delete Collection"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredDocs.map(doc => {
                                        const isExpanded = expandedDocs[doc._id || doc.id];
                                        const fileCount = doc.files?.length || 0;

                                        return (
                                            <div key={doc._id || doc.id} className="transition-all">
                                                {/* Document Header */}
                                                <div
                                                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-all border-l-4 ${isExpanded ? 'border-blue-500 bg-blue-50/5' : 'border-transparent'}`}
                                                    onClick={() => toggleExpand(doc._id || doc.id)}
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            {isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center flex-wrap gap-2">
                                                                <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">
                                                                    {doc.title || 'Untitled Document'}
                                                                </h3>
                                                                <span className="text-[10px] uppercase font-black bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                                                                    {fileCount} {fileCount === 1 ? 'FILE' : 'FILES'}
                                                                </span>

                                                                {/* Quick Preview Stack like Events.jsx */}
                                                                {!isExpanded && fileCount > 0 && (
                                                                    <div className="flex items-center -space-x-2 ml-3">
                                                                        {doc.files.slice(0, 4).map((file, i) => (
                                                                            <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-gray-100 overflow-hidden flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform">
                                                                                {isImageFile(file) ? (
                                                                                    <img src={file.fileUrl || file.url} alt="" className="h-full w-full object-cover" />
                                                                                ) : (
                                                                                    <div className="scale-75 text-gray-600">{getFileIcon(file)}</div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                        {fileCount > 4 && (
                                                                            <div className="h-7 w-7 rounded-full border-2 border-white bg-gray-200 text-gray-700 text-[9px] font-black flex items-center justify-center shadow-md">
                                                                                +{fileCount - 4}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500 truncate mt-1 leading-relaxed max-w-2xl">
                                                                {doc.description || 'No description provided for this collection.'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div className="hidden lg:flex flex-col items-end">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Added</span>
                                                            <span className="text-xs font-semibold text-gray-600">
                                                                {doc.createdAt && new Date(doc.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            {!viewArchived && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteDoc(doc._id || doc.id);
                                                                        }}
                                                                        className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-all shadow-sm bg-red-50"
                                                                        title="Delete Entire Collection"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>

                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setCurrentDoc(doc);
                                                                            setFileUploads([]);
                                                                            setCaptions([]);
                                                                            setShowModal(true);
                                                                        }}
                                                                        className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm bg-blue-50"
                                                                        title="Add More Files"
                                                                    >
                                                                        <Upload size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <div className={`p-2.5 rounded-xl transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>
                                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Files Grid (Collapsible) */}
                                                {isExpanded && (
                                                    <div className="p-6 bg-gray-50/50 border-y border-gray-100">
                                                        {fileCount > 0 ? (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                                                {doc.files.map(file => {
                                                                    const isImage = isImageFile(file);
                                                                    const fileName = file.originalName || file.name || 'document';

                                                                    return (
                                                                        <div
                                                                            key={file._id || file.id}
                                                                            className="group bg-white border border-gray-200 rounded-2xl p-3 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer relative flex flex-col items-center text-center"
                                                                            onClick={() => handleFileAction(file, doc.files)}
                                                                        >
                                                                            <div className="aspect-square w-full bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center mb-3 shadow-inner">
                                                                                {isImage ? (
                                                                                    <img src={file.fileUrl || file.url} alt={fileName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                                                ) : (
                                                                                    <div className="flex flex-col items-center transform group-hover:scale-110 transition-transform duration-300">
                                                                                        <div className="mb-2 shadow-sm rounded-lg">{getFileIcon(file)}</div>
                                                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter bg-gray-100 px-2 py-0.5 rounded">
                                                                                            {getFileTypeLabel(file)}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-[12px] font-bold text-gray-800 truncate w-full px-1" title={fileName}>{fileName}</p>
                                                                            <p className="text-[10px] text-gray-400 font-medium mt-1">{formatFileSize(file.size || 0)}</p>

                                                                            {!viewArchived && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteFile(doc._id || doc.id, file._id || file.id);
                                                                                    }}
                                                                                    className="absolute top-2 right-2 p-2 bg-red-50/80 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-md backdrop-blur-sm"
                                                                                >
                                                                                    <Trash2 size={12} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                                                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                                                    <FileText size={28} className="text-gray-300" />
                                                                </div>
                                                                <h4 className="text-gray-900 font-bold">This folder is empty</h4>
                                                                <p className="text-gray-500 text-sm mt-1">Upload files to start managing them here.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            <div className="p-20 text-center bg-white">
                                <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                    <FolderOpen size={40} className="text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">No document collections found</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">
                                    {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : 'Organize your reports and files by creating your first document collection.'}
                                </p>
                                {!viewArchived && !searchQuery && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 mx-auto"
                                    >
                                        <Plus size={18} />
                                        Create Collection
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Document Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-gray-800">New Document</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newDocTitle}
                                    onChange={e => setNewDocTitle(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                    placeholder="Document title"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={newDocDescription}
                                    onChange={e => setNewDocDescription(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                    placeholder="Brief description"
                                    rows="2"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6 justify-end">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDocument}
                                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Files Modal */}
            {showModal && currentDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-800">Upload Files</h2>
                                <p className="text-xs text-gray-600">
                                    To: <span className="font-medium">{currentDoc.title}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setFileUploads([]);
                                    setCaptions([]);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                id="docFileUpload"
                                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                            />

                            <label
                                htmlFor="docFileUpload"
                                className="cursor-pointer block"
                            >
                                <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-blue-500 transition-colors">
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-700 text-sm">Click to select files</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Images, Videos, PDF, DOC, TXT, Excel
                                    </p>
                                </div>
                            </label>

                            {fileUploads.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        {fileUploads.length} file{fileUploads.length !== 1 ? 's' : ''} selected
                                    </h3>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {fileUploads.map((file, index) => (
                                            <div key={index} className="border rounded p-3 bg-gray-50">
                                                <div className="flex gap-3">
                                                    <div className="h-12 w-12 flex items-center justify-center bg-white border rounded">
                                                        {file.type.includes('image') ? (
                                                            <ImageIcon size={20} className="text-blue-500" />
                                                        ) : file.type.includes('video') ? (
                                                            <FileVideo size={20} className="text-red-500" />
                                                        ) : (file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf')) ? (
                                                            <FileText size={20} className="text-red-500" />
                                                        ) : (
                                                            <FileText size={20} className="text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(file.size)} • {file.type}
                                                        </p>
                                                        <input
                                                            type="text"
                                                            value={captions[index] || ''}
                                                            onChange={e => handleCaptionChange(index, e.target.value)}
                                                            className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded"
                                                            placeholder="Add caption (optional)"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setFileUploads([]);
                                        setCaptions([]);
                                    }}
                                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={fileUploads.length === 0 || isUploading}
                                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={14} />
                                            Upload
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced File Preview Modal */}
            {showViewer && selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-0 md:p-4">
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/70 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                                {getFileIcon(selectedFile)}
                            </div>
                            <div className="text-white">
                                <h2 className="font-semibold text-sm md:text-base line-clamp-1">
                                    {selectedFile.originalName || selectedFile.name || 'File'}
                                </h2>
                                <div className="flex items-center gap-3 mt-0.5 text-[10px] md:text-xs text-gray-300">
                                    <span>{formatFileSize(selectedFile.size || 0)}</span>
                                    <span className="uppercase bg-white/20 px-1.5 py-0.5 rounded text-[9px]">
                                        {getFileExtension(selectedFile)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.open(selectedFile.fileUrl || selectedFile.url, '_blank')}
                                className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all border border-white/10"
                            >
                                <Eye size={16} />
                                Open Original
                            </button>
                            <button
                                onClick={() => handleFileDownload(selectedFile)}
                                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                            >
                                <Download size={16} />
                                Download
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewer(false);
                                    setSelectedFile(null);
                                    setIsFullscreen(false);
                                }}
                                className="p-2 text-white hover:bg-red-500 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className={`relative flex items-center justify-center transition-all duration-300 ${isFullscreen ? 'w-full h-full' : 'max-w-6xl w-full h-[85vh] md:h-[80vh] rounded-xl overflow-hidden bg-gray-900 shadow-2xl'}`}>
                        {/* Navigation */}
                        {previewFiles.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePrevPreview(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm z-30 transition-all border border-white/10"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleNextPreview(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm z-30 transition-all border border-white/10"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full backdrop-blur-md text-xs z-30 border border-white/10">
                                    {currentPreviewIndex + 1} / {previewFiles.length}
                                </div>
                            </>
                        )}

                        {/* Content */}
                        <div className="w-full h-full flex items-center justify-center p-4">
                            {isImageFile(selectedFile) ? (
                                <img
                                    src={selectedFile.fileUrl || selectedFile.url}
                                    alt={selectedFile.originalName}
                                    className="max-w-full max-h-full object-contain animate-in fade-in zoom-in duration-300"
                                />
                            ) : isVideoFile(selectedFile) ? (
                                <video
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full"
                                >
                                    <source src={selectedFile.fileUrl || selectedFile.url} />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (isPdfFile(selectedFile) ||
                                ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(getFileExtension(selectedFile)) ||
                                (selectedFile.mimetype && (selectedFile.mimetype.includes('pdf') || selectedFile.mimetype.includes('document') || selectedFile.mimetype.includes('sheet')))
                            ) ? (
                                <div className="w-full h-full bg-white rounded overflow-hidden">
                                    {isPdfFile(selectedFile) && (selectedFile.fileUrl || selectedFile.url).includes('localhost') ? (
                                        <embed
                                            src={selectedFile.fileUrl || selectedFile.url}
                                            type="application/pdf"
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <iframe
                                            src={getEmbedUrl(selectedFile)}
                                            className="w-full h-full"
                                            title={selectedFile.originalName || selectedFile.name}
                                            style={{ border: 'none' }}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-white">
                                    <File size={64} className="mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium">Preview not available</p>
                                    <p className="text-sm text-gray-400 mt-1">This file type cannot be previewed in the browser</p>
                                    <button
                                        onClick={() => handleFileDownload(selectedFile)}
                                        className="mt-6 flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold mx-auto hover:bg-gray-100 transition-colors"
                                    >
                                        <Download size={18} />
                                        Download File
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}