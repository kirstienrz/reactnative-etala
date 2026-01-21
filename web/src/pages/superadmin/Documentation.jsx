

// import React, { useState, useEffect } from 'react';
// import {
//     Upload, Edit2, Trash2, Plus, X, Archive, RefreshCw, FileText, 
//     File, FileVideo, Eye, Download, Maximize2
// } from 'lucide-react';
// import {
//     getAllDocs,
//     uploadFiles,
//     archiveDoc,
//     deleteFile,
//     createDoc
// } from '../../api/documentation';

// export default function DocumentationAdmin() {
//     const [docs, setDocs] = useState([]);
//     const [viewArchived, setViewArchived] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [showModal, setShowModal] = useState(false);
//     const [currentDoc, setCurrentDoc] = useState(null);
//     const [fileUploads, setFileUploads] = useState([]);
//     const [isUploading, setIsUploading] = useState(false);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [newDocTitle, setNewDocTitle] = useState('');
//     const [newDocDescription, setNewDocDescription] = useState('');
//     const [captions, setCaptions] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [showViewer, setShowViewer] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [selectedDoc, setSelectedDoc] = useState(null);

//     // Sa frontend component, add this:
// const getActualFileType = (file) => {
//     const fileName = file.originalName || file.name || '';
//     const storedFileType = file.fileType || file.type || '';
    
//     // Override if filename indicates PDF but stored type is image
//     if (fileName.toLowerCase().endsWith('.pdf')) {
//         return 'pdf';
//     }
    
//     // Check URL too
//     const fileUrl = file.fileUrl || file.url || '';
//     if (fileUrl.toLowerCase().includes('.pdf')) {
//         return 'pdf';
//     }
    
//     return storedFileType;
// };
//     // Fetch documents
//     const fetchDocs = async () => {
//         setIsLoading(true);
//         try {
//             const response = await getAllDocs();
            
//             let docsArray = [];
            
//             if (Array.isArray(response)) {
//                 docsArray = response;
//             } else if (response && response.data && Array.isArray(response.data)) {
//                 docsArray = response.data;
//             } else if (response && response.docs && Array.isArray(response.docs)) {
//                 docsArray = response.docs;
//             } else if (response && response.data && response.data.docs && Array.isArray(response.data.docs)) {
//                 docsArray = response.data.docs;
//             } else {
//                 docsArray = [];
//             }
            
//             const filtered = viewArchived
//                 ? docsArray.filter(d => d.isArchived === true)
//                 : docsArray.filter(d => !d.isArchived || d.isArchived === false);
            
//             setDocs(filtered);
//         } catch (err) {
//             console.error('Failed to fetch docs:', err);
//             alert('Failed to load documents');
//             setDocs([]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDocs();
//     }, [viewArchived]);

//     // File selection for upload
//     const handleFileChange = (e) => {
//         const files = Array.from(e.target.files);
//         if (files.length === 0) return;
        
//         setFileUploads(files);
        
//         const newCaptions = files.map(() => '');
//         setCaptions(newCaptions);
//     };

//     // Handle caption change
//     const handleCaptionChange = (index, value) => {
//         const newCaptions = [...captions];
//         newCaptions[index] = value;
//         setCaptions(newCaptions);
//     };

//     // Upload files to a doc
//     const handleUpload = async () => {
//         if (!currentDoc || fileUploads.length === 0) return;
        
//         setIsUploading(true);
        
//         try {
//             await uploadFiles(currentDoc._id, fileUploads, captions);
//             alert('Files uploaded successfully!');
//             setFileUploads([]);
//             setCaptions([]);
//             setShowModal(false);
//             fetchDocs();
//         } catch (err) {
//             console.error('Upload error:', err);
//             alert(`Upload failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     const handleArchive = async (docId) => {
//         if (!window.confirm('Archive this document? It will be moved to archived section.')) return;
//         try {
//             await archiveDoc(docId);
//             alert('Document archived successfully!');
//             fetchDocs();
//         } catch (err) {
//             console.error(err);
//             alert(`Failed to archive document: ${err.response?.data?.message || err.message}`);
//         }
//     };

//     const handleDeleteFile = async (docId, fileId) => {
//         if (!window.confirm('Are you sure you want to delete this file?')) return;
//         try {
//             await deleteFile(docId, fileId);
//             alert('File deleted successfully!');
//             fetchDocs();
//         } catch (err) {
//             console.error(err);
//             alert(`Failed to delete file: ${err.response?.data?.message || err.message}`);
//         }
//     };

//     const handleCreateDocument = async () => {
//         if (!newDocTitle.trim()) {
//             alert('Please enter a title for the document');
//             return;
//         }

//         try {
//             await createDoc({
//                 title: newDocTitle,
//                 description: newDocDescription
//             });
//             alert('Document created successfully!');
//             setNewDocTitle('');
//             setNewDocDescription('');
//             setShowCreateModal(false);
//             fetchDocs();
//         } catch (err) {
//             console.error(err);
//             alert(`Failed to create document: ${err.response?.data?.message || err.message}`);
//         }
//     };

//     // ========== FIXED: CLOUDINARY PDF VIEWING ==========
    
//     // Get file extension from URL or filename
//     const getFileExtension = (file) => {
//         const fileName = file.originalName || file.name || '';
//         const fileUrl = file.fileUrl || file.url || '';
        
//         // Try filename first
//         if (fileName.includes('.')) {
//             return fileName.toLowerCase().split('.').pop();
//         }
        
//         // Try URL
//         if (fileUrl.includes('.')) {
//             const urlParts = fileUrl.split('.');
//             return urlParts[urlParts.length - 1].split('?')[0].toLowerCase();
//         }
        
//         return '';
//     };

//     // Check if file is PDF (FIXED for Cloudinary)
//     const isPdfFile = (file) => {
//         const extension = getFileExtension(file);
//         const fileName = (file.originalName || file.name || '').toLowerCase();
//         const fileUrl = (file.fileUrl || file.url || '').toLowerCase();
        
//         // Check multiple indicators
//         if (extension === 'pdf') return true;
//         if (fileName.endsWith('.pdf')) return true;
//         if (fileUrl.includes('.pdf')) return true;
//         if ((file.fileType || file.type || '').includes('pdf')) return true;
        
//         return false;
//     };

//     // Check if file is image
//     const isImageFile = (file) => {
//         if (isPdfFile(file)) return false; // PDFs are not images even if Cloudinary says so
        
//         const extension = getFileExtension(file);
//         const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
//         return imageExtensions.includes(extension);
//     };

//     // FIXED: Get Cloudinary PDF view URL
//     const getCloudinaryPdfUrl = (fileUrl) => {
//         if (!fileUrl.includes('cloudinary.com')) return fileUrl;
        
//         // Remove any existing query parameters
//         const baseUrl = fileUrl.split('?')[0];
        
//         // Check if it's a PDF file by URL pattern
//         if (baseUrl.includes('.pdf')) {
//             // For PDF viewing in Cloudinary, use these parameters:
//             // - fl_attachment: forces download (use for download)
//             // - Without fl_attachment: tries to display
//             // For VIEWING PDFs in browser, we need a different approach
            
//             // OPTION 1: Try to view as PDF (might open in browser PDF viewer)
//             return baseUrl;
            
//             // OPTION 2: If above doesn't work, try embedding
//             // return `${baseUrl}?fn=${encodeURIComponent(fileName)}`;
//         }
        
//         return fileUrl;
//     };

//     // FIXED: Handle file viewing/download
//     const handleFileAction = (file) => {
//         const fileName = file.originalName || file.name || 'file';
//         const fileUrl = file.fileUrl || file.url;
        
//         console.log('File details:', {
//             fileName,
//             fileUrl,
//             isPdf: isPdfFile(file),
//             isImage: isImageFile(file),
//             extension: getFileExtension(file)
//         });
        
//         if (isImageFile(file)) {
//             // For images, open in viewer
//             setSelectedFile(file);
//             setSelectedDoc({ title: 'Image Viewer' });
//             setShowViewer(true);
//         } else if (isPdfFile(file)) {
//             // FIXED: For PDFs on Cloudinary - SPECIAL HANDLING
//             if (fileUrl.includes('cloudinary.com')) {
//                 // Strategy 1: Try to open PDF directly
//                 const cleanUrl = fileUrl.split('?')[0];
                
//                 // Create a temporary iframe to test if PDF can be viewed
//                 const testIframe = document.createElement('iframe');
//                 testIframe.style.display = 'none';
//                 testIframe.src = cleanUrl;
//                 testIframe.onload = () => {
//                     // If iframe loads, PDF might be viewable
//                     document.body.removeChild(testIframe);
                    
//                     // Try to open in new tab
//                     window.open(cleanUrl, '_blank', 'noopener,noreferrer');
//                 };
//                 testIframe.onerror = () => {
//                     // If iframe fails, try download
//                     document.body.removeChild(testIframe);
                    
//                     // Force download with fl_attachment
//                     const downloadUrl = cleanUrl + '?fl_attachment';
//                     const link = document.createElement('a');
//                     link.href = downloadUrl;
//                     link.download = fileName;
//                     link.target = '_blank';
//                     document.body.appendChild(link);
//                     link.click();
//                     document.body.removeChild(link);
//                 };
                
//                 document.body.appendChild(testIframe);
                
//                 // Also try direct approach after 1 second
//                 setTimeout(() => {
//                     const link = document.createElement('a');
//                     link.href = cleanUrl;
//                     link.target = '_blank';
//                     link.rel = 'noopener noreferrer';
//                     document.body.appendChild(link);
//                     link.click();
//                     document.body.removeChild(link);
//                 }, 1000);
                
//             } else {
//                 // For non-Cloudinary PDFs
//                 window.open(fileUrl, '_blank');
//             }
//         } else {
//             // For other file types
//             window.open(fileUrl, '_blank');
//         }
//     };

//     // Get file icon
//     const getFileIcon = (file) => {
//         if (isPdfFile(file)) {
//             return <FileText size={24} className="text-red-500" />;
//         } else if (isImageFile(file)) {
//             return (
//                 <div className="text-blue-500 text-center">
//                     <div className="text-sm font-medium">IMG</div>
//                 </div>
//             );
//         } else {
//             const extension = getFileExtension(file);
//             switch (extension) {
//                 case 'doc':
//                 case 'docx':
//                     return <FileText size={24} className="text-blue-500" />;
//                 case 'xls':
//                 case 'xlsx':
//                     return <FileText size={24} className="text-green-500" />;
//                 case 'ppt':
//                 case 'pptx':
//                     return <FileText size={24} className="text-orange-500" />;
//                 case 'txt':
//                     return <FileText size={24} className="text-gray-500" />;
//                 case 'mp4':
//                 case 'avi':
//                 case 'mov':
//                     return <FileVideo size={24} className="text-red-500" />;
//                 default:
//                     return <File size={24} className="text-gray-500" />;
//             }
//         }
//     };

//     // Get file type label
//     const getFileTypeLabel = (file) => {
//         if (isPdfFile(file)) return 'PDF';
//         if (isImageFile(file)) return 'Image';
        
//         const extension = getFileExtension(file);
//         switch (extension) {
//             case 'doc':
//             case 'docx': return 'Word';
//             case 'xls':
//             case 'xlsx': return 'Excel';
//             case 'ppt':
//             case 'pptx': return 'PowerPoint';
//             case 'txt': return 'Text';
//             case 'mp4':
//             case 'avi':
//             case 'mov': return 'Video';
//             default: return 'File';
//         }
//     };

//     const formatFileSize = (bytes) => {
//         if (!bytes || bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     };

//     const filteredDocs = docs.filter(d =>
//         d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         d.description?.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Header */}
//             <div className="bg-white border-b shadow-sm">
//                 <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-900">Documentation Drive</h1>
//                         <p className="text-gray-600 mt-1">
//                             {viewArchived ? 'View archived documents' : 'Manage your documents and files'}
//                         </p>
//                     </div>
//                     <div className="flex gap-3">
//                         {!viewArchived && (
//                             <button
//                                 onClick={() => setShowCreateModal(true)}
//                                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
//                             >
//                                 <Plus size={20} />
//                                 <span>New Document</span>
//                             </button>
//                         )}
//                         <button
//                             onClick={() => setViewArchived(!viewArchived)}
//                             className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
//                         >
//                             {viewArchived ? (
//                                 <>
//                                     <FileText size={20} />
//                                     <span>View Active Docs</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <Archive size={20} />
//                                     <span>View Archived Docs</span>
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-6 py-8">
//                 {/* Search and Stats */}
//                 <div className="mb-8">
//                     <div className="flex items-center justify-between mb-4">
//                         <h2 className="text-xl font-semibold text-gray-800">
//                             {viewArchived ? 'Archived Documents' : 'Active Documents'} ({filteredDocs.length})
//                         </h2>
//                         <div className="text-sm text-gray-500">
//                             Total Files: {docs.reduce((sum, doc) => sum + (doc.files?.length || 0), 0)}
//                         </div>
//                     </div>
//                     <div className="flex gap-4">
//                         <input
//                             type="text"
//                             placeholder="Search documents by title or description..."
//                             value={searchQuery}
//                             onChange={e => setSearchQuery(e.target.value)}
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                         <button
//                             onClick={fetchDocs}
//                             disabled={isLoading}
//                             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
//                         >
//                             <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
//                             <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Loading State */}
//                 {isLoading && (
//                     <div className="text-center py-12">
//                         <RefreshCw size={48} className="mx-auto animate-spin text-blue-500" />
//                         <p className="mt-4 text-gray-600">Loading documents...</p>
//                     </div>
//                 )}

//                 {/* Documents Grid */}
//                 {!isLoading && (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {filteredDocs.length > 0 ? (
//                             filteredDocs.map(doc => (
//                                 <div key={doc._id || doc.id} className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
//                                     <div className="p-4 flex justify-between items-start">
//                                         <div className="flex-1">
//                                             <h3 className="font-semibold text-lg text-gray-900 mb-1">{doc.title || 'Untitled'}</h3>
//                                             <p className="text-sm text-gray-600 mb-2 line-clamp-2">{doc.description || 'No description'}</p>
//                                             <div className="flex items-center gap-4 text-xs text-gray-500">
//                                                 <span className="flex items-center gap-1">
//                                                     <FileText size={12} />
//                                                     {doc.files?.length || 0} files
//                                                 </span>
//                                                 {doc.createdAt && (
//                                                     <span>
//                                                         Created: {new Date(doc.createdAt).toLocaleDateString()}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                         <div className="flex gap-2">
//                                             {!viewArchived && (
//                                                 <>
//                                                     <button
//                                                         onClick={() => {
//                                                             setCurrentDoc(doc);
//                                                             setFileUploads([]);
//                                                             setCaptions([]);
//                                                             setShowModal(true);
//                                                         }}
//                                                         className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition"
//                                                         title="Upload files"
//                                                     >
//                                                         <Upload size={16} />
//                                                         <span className="text-sm">Upload</span>
//                                                     </button>
//                                                     <button
//                                                         onClick={() => handleArchive(doc._id || doc.id)}
//                                                         className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg"
//                                                         title="Archive document"
//                                                     >
//                                                         <Archive size={16} />
//                                                     </button>
//                                                 </>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Files inside doc */}
//                                     <div className="p-3 border-t bg-gray-50">
//                                         <h4 className="font-medium text-sm text-gray-700 mb-2">Files:</h4>
//                                         <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
//                                             {doc.files && doc.files.length > 0 ? (
//                                                 doc.files.map(file => {
//                                                     const isImage = isImageFile(file);
//                                                     const isPdf = isPdfFile(file);
//                                                     const fileTypeLabel = getFileTypeLabel(file);
                                                    
//                                                     return (
//                                                         <div key={file._id || file.id} className="relative bg-white border rounded p-2 hover:bg-gray-50 transition group">
//                                                             <div 
//                                                                 className={`flex flex-col items-center justify-center h-20 cursor-pointer ${isImage ? '' : 'hover:bg-blue-50'}`}
//                                                                 onClick={() => handleFileAction(file)}
//                                                                 title={`Click to ${isImage ? 'view' : 'open'} ${file.originalName || file.name}`}
//                                                             >
//                                                                 {isImage ? (
//                                                                     // For images, try to show thumbnail
//                                                                     <div className="relative w-full h-full">
//                                                                         <img 
//                                                                             src={file.fileUrl || file.url}
//                                                                             alt={file.originalName || file.name}
//                                                                             className="h-full w-full object-cover rounded"
//                                                                             onError={(e) => {
//                                                                                 // If image fails to load, show icon instead
//                                                                                 e.target.style.display = 'none';
//                                                                                 const parent = e.target.parentElement;
//                                                                                 parent.innerHTML = `
//                                                                                     <div class="flex flex-col items-center justify-center h-full w-full">
//                                                                                         ${getFileIcon(file).outerHTML || '<div class="text-blue-500">IMG</div>'}
//                                                                                     </div>
//                                                                                 `;
//                                                                             }}
//                                                                         />
//                                                                     </div>
//                                                                 ) : (
//                                                                     // For non-image files (PDFs, etc.), show icon
//                                                                     <div className="flex flex-col items-center justify-center h-full w-full p-2">
//                                                                         {getFileIcon(file)}
//                                                                         <span className="text-xs text-gray-600 truncate w-full text-center mt-1 px-1">
//                                                                             {file.originalName || file.name}
//                                                                         </span>
//                                                                         {isPdf && (
//                                                                             <span className="text-xs text-red-500 font-medium">PDF</span>
//                                                                         )}
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                             <div className="absolute bottom-1 left-1 text-xs text-gray-400">
//                                                                 {fileTypeLabel}
//                                                             </div>
//                                                             <div className="absolute top-1 left-1 text-xs text-gray-400">
//                                                                 {formatFileSize(file.size || 0)}
//                                                             </div>
//                                                             {!viewArchived && (
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleDeleteFile(doc._id || doc.id, file._id || file.id);
//                                                                     }}
//                                                                     className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
//                                                                     title="Delete file"
//                                                                 >
//                                                                     <Trash2 size={10} />
//                                                                 </button>
//                                                             )}
//                                                         </div>
//                                                     );
//                                                 })
//                                             ) : (
//                                                 <div className="col-span-2 text-center py-6 text-gray-400">
//                                                     <FileText size={32} className="mx-auto mb-2 opacity-50" />
//                                                     <p className="text-sm">No files uploaded yet</p>
//                                                     {!viewArchived && (
//                                                         <button
//                                                             onClick={() => {
//                                                                 setCurrentDoc(doc);
//                                                                 setShowModal(true);
//                                                             }}
//                                                             className="mt-2 text-xs text-blue-500 hover:text-blue-600"
//                                                         >
//                                                             Upload your first file
//                                                         </button>
//                                                     )}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))
//                         ) : (
//                             !isLoading && (
//                                 <div className="col-span-full text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
//                                     <FileText size={64} className="mx-auto mb-4 text-gray-300" />
//                                     <p className="text-xl text-gray-500 mb-2">
//                                         {viewArchived ? 'No archived documents' : 'No documents found'}
//                                     </p>
//                                     <p className="text-gray-400 mb-6">
//                                         {!viewArchived && searchQuery ? 'Try a different search term' : 'Create a new document to get started'}
//                                     </p>
//                                     {!viewArchived && !searchQuery && (
//                                         <button
//                                             onClick={() => setShowCreateModal(true)}
//                                             className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 mx-auto"
//                                         >
//                                             <Plus size={20} />
//                                             <span>Create First Document</span>
//                                         </button>
//                                     )}
//                                 </div>
//                             )
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* Create Document Modal */}
//             {showCreateModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg max-w-md w-full p-6">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-xl font-bold text-gray-800">Create New Document</h2>
//                             <button 
//                                 onClick={() => setShowCreateModal(false)}
//                                 className="text-gray-500 hover:text-gray-700"
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>
                        
//                         <div className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Title *
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={newDocTitle}
//                                     onChange={e => setNewDocTitle(e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     placeholder="Enter document title"
//                                 />
//                             </div>
                            
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Description
//                                 </label>
//                                 <textarea
//                                     value={newDocDescription}
//                                     onChange={e => setNewDocDescription(e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     placeholder="Enter document description"
//                                     rows="3"
//                                 />
//                             </div>
//                         </div>
                        
//                         <div className="flex gap-3 mt-8 justify-end">
//                             <button
//                                 onClick={() => setShowCreateModal(false)}
//                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleCreateDocument}
//                                 className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                             >
//                                 Create Document
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Upload Files Modal */}
//             {showModal && currentDoc && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//                         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//                             <div>
//                                 <h2 className="text-xl font-bold text-gray-800">Upload Files</h2>
//                                 <p className="text-sm text-gray-600">
//                                     Uploading to: <span className="font-medium">{currentDoc.title}</span>
//                                 </p>
//                             </div>
//                             <button 
//                                 onClick={() => {
//                                     setShowModal(false);
//                                     setFileUploads([]);
//                                     setCaptions([]);
//                                 }}
//                                 className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
//                             >
//                                 <X size={24} />
//                             </button>
//                         </div>

//                         <div className="p-6">
//                             <div className="mb-6">
//                                 <input
//                                     type="file"
//                                     multiple
//                                     onChange={handleFileChange}
//                                     className="hidden"
//                                     id="docFileUpload"
//                                     accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
//                                 />
                                
//                                 <label
//                                     htmlFor="docFileUpload"
//                                     className="cursor-pointer block"
//                                 >
//                                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors hover:bg-blue-50">
//                                         <div className="flex flex-col items-center justify-center min-h-[200px]">
//                                             <Upload size={64} className="text-gray-400 mb-4" />
//                                             <p className="text-gray-700 font-medium text-lg mb-1">Click to select files</p>
//                                             <p className="text-gray-500 text-sm">or drag and drop files here</p>
//                                             <p className="text-gray-400 text-xs mt-2">
//                                                 Supports: Images, Videos, PDF, DOC, TXT, Excel, PowerPoint
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </label>
                                
//                                 {fileUploads.length > 0 && (
//                                     <div className="mt-6">
//                                         <h3 className="font-medium text-gray-700 mb-4">Selected Files ({fileUploads.length}):</h3>
//                                         <div className="space-y-4 max-h-96 overflow-y-auto">
//                                             {fileUploads.map((file, index) => (
//                                                 <div key={index} className="border rounded-lg p-4 bg-gray-50">
//                                                     <div className="flex gap-4">
//                                                         <div className="h-20 w-20 flex items-center justify-center bg-white border rounded">
//                                                             {file.type.includes('image') ? (
//                                                                 <div className="text-blue-500 text-center">
//                                                                     <div className="text-sm font-medium">Image</div>
//                                                                     <div className="text-xs">{file.name.split('.').pop()}</div>
//                                                                 </div>
//                                                             ) : file.type.includes('video') ? (
//                                                                 <FileVideo size={32} className="text-red-500" />
//                                                             ) : file.name.toLowerCase().endsWith('.pdf') ? (
//                                                                 <FileText size={32} className="text-red-500" />
//                                                             ) : (
//                                                                 <FileText size={32} className="text-blue-500" />
//                                                             )}
//                                                         </div>
//                                                         <div className="flex-1">
//                                                             <div className="flex justify-between items-start mb-2">
//                                                                 <div>
//                                                                     <p className="font-medium text-gray-900 truncate">{file.name}</p>
//                                                                     <p className="text-sm text-gray-500">
//                                                                         {formatFileSize(file.size)} • {file.type}
//                                                                     </p>
//                                                                 </div>
//                                                             </div>
//                                                             <div>
//                                                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                                     Caption (optional)
//                                                                 </label>
//                                                                 <input
//                                                                     type="text"
//                                                                     value={captions[index] || ''}
//                                                                     onChange={e => handleCaptionChange(index, e.target.value)}
//                                                                     className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
//                                                                     placeholder="Add a caption for this file"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="flex gap-3 justify-end border-t pt-4">
//                                 <button
//                                     onClick={() => {
//                                         setShowModal(false);
//                                         setFileUploads([]);
//                                         setCaptions([]);
//                                     }}
//                                     className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleUpload}
//                                     disabled={fileUploads.length === 0 || isUploading}
//                                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                 >
//                                     {isUploading ? (
//                                         <>
//                                             <RefreshCw size={16} className="animate-spin" />
//                                             Uploading...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Upload size={16} />
//                                             Upload {fileUploads.length} File{fileUploads.length !== 1 ? 's' : ''}
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* File Viewer Modal for Images Only */}
//             {showViewer && selectedFile && (
//                 <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] p-4">
//                     <div className="relative w-full h-full flex flex-col">
//                         <div className="flex justify-between items-center bg-black bg-opacity-50 text-white p-4">
//                             <div>
//                                 <h2 className="text-xl font-bold">
//                                     {selectedFile.originalName || selectedFile.name}
//                                 </h2>
//                                 <p className="text-sm text-gray-300">
//                                     From: {selectedDoc?.title}
//                                 </p>
//                             </div>
//                             <div className="flex gap-2">
//                                 <button 
//                                     onClick={() => setShowViewer(false)}
//                                     className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
//                                 >
//                                     <X size={24} />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
//                             <img 
//                                 src={selectedFile.fileUrl || selectedFile.url} 
//                                 alt={selectedFile.originalName || selectedFile.name}
//                                 className="max-w-full max-h-full object-contain rounded-lg"
//                                 onError={(e) => {
//                                     e.target.onerror = null;
//                                     e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3EImage Not Available%3C/text%3E%3C/svg%3E";
//                                 }}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


import React, { useState, useEffect } from 'react';
import {
    Upload, Edit2, Trash2, Plus, X, Archive, RefreshCw, FileText, 
    File, FileVideo, Eye, Download, Maximize2, ChevronDown, ChevronUp,
    Image as ImageIcon, Folder, FolderOpen, Search, Filter, MoreVertical
} from 'lucide-react';
import {
    getAllDocs,
    uploadFiles,
    archiveDoc,
    deleteFile,
    createDoc
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

    // Fetch documents
    const fetchDocs = async () => {
        setIsLoading(true);
        try {
            const response = await getAllDocs();
            
            let docsArray = [];
            
            if (Array.isArray(response)) {
                docsArray = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                docsArray = response.data;
            } else if (response && response.docs && Array.isArray(response.docs)) {
                docsArray = response.docs;
            } else if (response && response.data && response.data.docs && Array.isArray(response.data.docs)) {
                docsArray = response.data.docs;
            } else {
                docsArray = [];
            }
            
            const filtered = viewArchived
                ? docsArray.filter(d => d.isArchived === true)
                : docsArray.filter(d => !d.isArchived || d.isArchived === false);
            
            setDocs(filtered);
            
            // Auto-expand documents with few files
            const autoExpanded = {};
            filtered.forEach(doc => {
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

    useEffect(() => {
        fetchDocs();
    }, [viewArchived]);

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

    const handleArchive = async (docId) => {
        if (!window.confirm('Archive this document? It will be moved to archived section.')) return;
        try {
            await archiveDoc(docId);
            alert('Document archived successfully!');
            fetchDocs();
        } catch (err) {
            console.error(err);
            alert(`Failed to archive document: ${err.response?.data?.message || err.message}`);
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
        if (isPdfFile(file)) return false;
        
        const extension = getFileExtension(file);
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        return imageExtensions.includes(extension);
    };

    // Handle file viewing
    const handleFileAction = (file) => {
        const fileName = file.originalName || file.name || 'file';
        const fileUrl = file.fileUrl || file.url;
        
        if (isImageFile(file)) {
            setSelectedFile(file);
            setSelectedDoc({ title: 'Image Viewer' });
            setShowViewer(true);
        } else if (isPdfFile(file)) {
            if (fileUrl.includes('cloudinary.com')) {
                const cleanUrl = fileUrl.split('?')[0];
                window.open(cleanUrl, '_blank', 'noopener,noreferrer');
            } else {
                window.open(fileUrl, '_blank');
            }
        } else {
            window.open(fileUrl, '_blank');
        }
    };

    // Get file icon
    const getFileIcon = (file) => {
        if (isPdfFile(file)) {
            return <FileText size={16} className="text-red-500" />;
        } else if (isImageFile(file)) {
            return <ImageIcon size={16} className="text-blue-500" />;
        } else {
            const extension = getFileExtension(file);
            switch (extension) {
                case 'doc':
                case 'docx':
                    return <FileText size={16} className="text-blue-500" />;
                case 'xls':
                case 'xlsx':
                    return <FileText size={16} className="text-green-500" />;
                case 'mp4':
                case 'avi':
                case 'mov':
                    return <FileVideo size={16} className="text-red-500" />;
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
                        <h1 className="text-xl font-bold text-gray-900">📁 Documentation Drive</h1>
                        <p className="text-xs text-gray-500 mt-1">
                            {viewArchived ? '📦 Archived' : '📂 Active'} • {filteredDocs.length} docs • {docs.reduce((sum, doc) => sum + (doc.files?.length || 0), 0)} files
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

                {/* Documents List */}
                {!isLoading && (
                    <div className="divide-y">
                        {filteredDocs.length > 0 ? (
                            filteredDocs.map(doc => {
                                const isExpanded = expandedDocs[doc._id || doc.id];
                                const fileCount = doc.files?.length || 0;
                                
                                return (
                                    <div key={doc._id || doc.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Document Header */}
                                        <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(doc._id || doc.id)}>
                                            <div className="flex items-center gap-3 flex-1">
                                                {isExpanded ? (
                                                    <FolderOpen size={18} className="text-blue-500" />
                                                ) : (
                                                    <Folder size={18} className="text-gray-500" />
                                                )}
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-gray-900 truncate">
                                                            {doc.title || 'Untitled'}
                                                        </h3>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                            {fileCount} file{fileCount !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {doc.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">
                                                    {doc.createdAt && new Date(doc.createdAt).toLocaleDateString()}
                                                </span>
                                                
                                                <button className="p-1 hover:bg-gray-200 rounded">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                                
                                                <div className="flex gap-1">
                                                    {!viewArchived && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCurrentDoc(doc);
                                                                    setFileUploads([]);
                                                                    setCaptions([]);
                                                                    setShowModal(true);
                                                                }}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                                                title="Upload files"
                                                            >
                                                                <Upload size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleArchive(doc._id || doc.id);
                                                                }}
                                                                className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded"
                                                                title="Archive document"
                                                            >
                                                                <Archive size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Files Grid (Collapsible) */}
                                        {isExpanded && (
                                            <div className="px-3 pb-3 pl-9">
                                                {fileCount > 0 ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                                        {doc.files.map(file => {
                                                            const isImage = isImageFile(file);
                                                            const isPdf = isPdfFile(file);
                                                            const fileTypeLabel = getFileTypeLabel(file);
                                                            const fileName = file.originalName || file.name || 'file';
                                                            const shortName = fileName.length > 20 
                                                                ? fileName.substring(0, 17) + '...' 
                                                                : fileName;
                                                            
                                                            return (
                                                                <div 
                                                                    key={file._id || file.id} 
                                                                    className="group relative bg-gray-50 border rounded p-2 hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                                                                    onClick={() => handleFileAction(file)}
                                                                >
                                                                    {/* File Preview/Icon */}
                                                                    <div className="flex flex-col items-center justify-center h-20">
                                                                        {isImage ? (
                                                                            <div className="relative w-full h-full">
                                                                                <img 
                                                                                    src={file.fileUrl || file.url}
                                                                                    alt={shortName}
                                                                                    className="h-full w-full object-cover rounded"
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        const parent = e.target.parentElement;
                                                                                        parent.innerHTML = `
                                                                                            <div class="flex flex-col items-center justify-center h-full w-full">
                                                                                                <div class="text-blue-500">
                                                                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                                                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                                                                        <polyline points="21 15 16 10 5 21"></polyline>
                                                                                                    </svg>
                                                                                                </div>
                                                                                            </div>
                                                                                        `;
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex flex-col items-center justify-center h-full w-full">
                                                                                <div className="mb-2">
                                                                                    {getFileIcon(file)}
                                                                                </div>
                                                                                <span className={`text-xs font-medium ${isPdf ? 'text-red-600' : 'text-gray-600'}`}>
                                                                                    {fileTypeLabel}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* File Info */}
                                                                    <div className="mt-2">
                                                                        <div className="text-xs font-medium text-gray-900 truncate" title={fileName}>
                                                                            {shortName}
                                                                        </div>
                                                                        <div className="flex justify-between items-center mt-1">
                                                                            <span className="text-xs text-gray-500">
                                                                                {formatFileSize(file.size || 0)}
                                                                            </span>
                                                                            {!viewArchived && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDeleteFile(doc._id || doc.id, file._id || file.id);
                                                                                    }}
                                                                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                                                                                    title="Delete file"
                                                                                >
                                                                                    <Trash2 size={12} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                                                        <FileText size={24} className="mx-auto text-gray-300 mb-2" />
                                                        <p className="text-sm text-gray-500">No files uploaded yet</p>
                                                        {!viewArchived && (
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentDoc(doc);
                                                                    setShowModal(true);
                                                                }}
                                                                className="mt-2 text-xs text-blue-500 hover:text-blue-600"
                                                            >
                                                                Upload first file
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            !isLoading && (
                                <div className="p-8 text-center">
                                    <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 mb-2">
                                        {viewArchived ? 'No archived documents' : 'No documents found'}
                                    </p>
                                    {!viewArchived && !searchQuery && (
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="mt-3 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                        >
                                            Create First Document
                                        </button>
                                    )}
                                </div>
                            )
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
                                                        ) : file.name.toLowerCase().endsWith('.pdf') ? (
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

            {/* Image Viewer Modal */}
            {showViewer && selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100]">
                    <div className="relative w-full h-full flex flex-col">
                        <div className="flex justify-between items-center bg-black bg-opacity-50 text-white p-3">
                            <div className="text-sm">
                                <h2 className="font-medium truncate">
                                    {selectedFile.originalName || selectedFile.name}
                                </h2>
                            </div>
                            <button 
                                onClick={() => setShowViewer(false)}
                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
                            <img 
                                src={selectedFile.fileUrl || selectedFile.url} 
                                alt={selectedFile.originalName || selectedFile.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}