// import React, { useState, useEffect } from "react";
// import {
//     getOrgChartImages,
//     uploadOrgChartImage,
//     archiveOrgChartImage,
//     getArchivedOrgChartImages,
//     restoreOrgChartImage,
// } from "../../api/organizational";

// export default function OrgChartManagement() {
//     const [charts, setCharts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewUrl, setPreviewUrl] = useState(null);
//     const [viewArchived, setViewArchived] = useState(false);
//     const [selectedCharts, setSelectedCharts] = useState(new Set());

//     useEffect(() => {
//         fetchCharts();
//     }, [viewArchived]);

//     const fetchCharts = async () => {
//         setLoading(true);
//         try {
//             const data = viewArchived
//                 ? await getArchivedOrgChartImages()
//                 : await getOrgChartImages();
//             setCharts(data);
//             setSelectedCharts(new Set());
//         } catch (err) {
//             setError("Failed to load organizational charts");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         setSelectedFile(file);
//         if (file) setPreviewUrl(URL.createObjectURL(file));
//         else setPreviewUrl(null);
//     };

//     const handleUpload = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");

//         if (!selectedFile) return setError("Select a file first");

//         const formData = new FormData();
//         formData.append("image", selectedFile);

//         try {
//             await uploadOrgChartImage(formData);
//             setSuccess("Organizational chart uploaded!");
//             setSelectedFile(null);
//             setPreviewUrl(null);
//             fetchCharts();
//         } catch (err) {
//             setError("Upload failed");
//         }
//     };

//     const toggleSelection = (id) => {
//         const newSet = new Set(selectedCharts);
//         if (newSet.has(id)) newSet.delete(id);
//         else newSet.add(id);
//         setSelectedCharts(newSet);
//     };

//     const handleBulkAction = async (action) => {
//         if (selectedCharts.size === 0) return setError("Select at least one chart");
//         const promises = Array.from(selectedCharts).map((id) =>
//             action === "archive" ? archiveOrgChartImage(id) : restoreOrgChartImage(id) // ✅ FIXED
//         );
//         try {
//             await Promise.all(promises);
//             setSuccess(`${action}d ${selectedCharts.size} chart(s)`);
//             fetchCharts();
//         } catch {
//             setError("Failed to perform bulk action");
//         }
//     };
//     if (loading)
//         return (
//             <div className="flex justify-center items-center h-64">
//                 <p>Loading organizational charts...</p>
//             </div>
//         );

//     return (
//         <div className="max-w-7xl mx-auto p-6">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-3xl font-bold">
//                     Organizational Chart Management
//                 </h1>
//                 <button
//                     onClick={() => setViewArchived(!viewArchived)}
//                     className="px-4 py-2 bg-gray-700 text-white rounded"
//                 >
//                     {viewArchived ? "View Active Charts" : "View Archived Charts"}
//                 </button>
//             </div>

//             {/* Alerts */}
//             {error && (
//                 <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
//             )}
//             {success && (
//                 <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
//             )}

//             {/* Upload */}
//             {!viewArchived && (
//                 <form onSubmit={handleUpload} className="mb-6">
//                     <input type="file" onChange={handleFileChange} />
//                     <button
//                         type="submit"
//                         className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
//                     >
//                         Upload
//                     </button>
//                 </form>
//             )}

//             {/* Preview */}
//             {previewUrl && (
//                 <img
//                     src={previewUrl}
//                     alt="Preview"
//                     className="w-64 h-64 object-contain border mb-4"
//                 />
//             )}

//             {/* Chart Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                 {charts.length === 0 && <p>No charts found.</p>}
//                 {charts.map((chart) => (
//                     <div key={chart._id} className="border rounded p-2 relative">
//                         <input
//                             type="checkbox"
//                             className="absolute top-2 left-2"
//                             checked={selectedCharts.has(chart._id)}
//                             onChange={() => toggleSelection(chart._id)}
//                         />
//                         <img
//                             src={chart.imageUrl}
//                             alt="Org Chart"
//                             className="w-full h-48 object-contain"
//                         />
//                         <div className="flex justify-between mt-2">
//                             {viewArchived ? (
//                                 <button
//                                     onClick={() => restoreOrgChartImage(chart._id).then(fetchCharts)} // ✅ FIXED
//                                     className="px-2 py-1 bg-green-500 text-white rounded text-sm"
//                                 >
//                                     Restore
//                                 </button>
//                             ) : (
//                                 <button
//                                     onClick={() => archiveOrgChartImage(chart._id).then(fetchCharts)} // ✅ FIXED
//                                     className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
//                                 >
//                                     Archive
//                                 </button>
//                             )}
//                         </div>

//                     </div>
//                 ))}
//             </div>

//             {/* Bulk Actions */}
//             {selectedCharts.size > 0 && (
//                 <div className="mt-4">
//                     <button
//                         onClick={() => handleBulkAction(viewArchived ? "restore" : "archive")}
//                         className="px-4 py-2 bg-indigo-600 text-white rounded"
//                     >
//                         {viewArchived ? "Restore" : "Archive"} Selected ({selectedCharts.size})
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }


// import React, { useState, useEffect } from "react";
// import {
//     getOrgChartImages,
//     uploadOrgChartImage,
//     archiveOrgChartImage,
//     getArchivedOrgChartImages,
//     restoreOrgChartImage,
// } from "../../api/organizational";

// export default function OrgChartManagement() {
//     const [charts, setCharts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [uploading, setUploading] = useState(false);
//     const [processing, setProcessing] = useState({}); // Track individual processing
//     const [bulkProcessing, setBulkProcessing] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewUrl, setPreviewUrl] = useState(null);
//     const [viewArchived, setViewArchived] = useState(false);
//     const [selectedCharts, setSelectedCharts] = useState(new Set());

//     useEffect(() => {
//         fetchCharts();
//     }, [viewArchived]);

//     const fetchCharts = async () => {
//         setLoading(true);
//         try {
//             const data = viewArchived
//                 ? await getArchivedOrgChartImages()
//                 : await getOrgChartImages();
//             setCharts(data);
//             setSelectedCharts(new Set());
//         } catch (err) {
//             setError("Failed to load organizational charts");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         setSelectedFile(file);
//         if (file) setPreviewUrl(URL.createObjectURL(file));
//         else setPreviewUrl(null);
//     };

//     const handleUpload = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");
//         setUploading(true);

//         if (!selectedFile) {
//             setError("Select a file first");
//             setUploading(false);
//             return;
//         }

//         const formData = new FormData();
//         formData.append("image", selectedFile);

//         try {
//             await uploadOrgChartImage(formData);
//             setSuccess("Organizational chart uploaded!");
//             setSelectedFile(null);
//             setPreviewUrl(null);
//             fetchCharts();
//         } catch (err) {
//             setError("Upload failed");
//         } finally {
//             setUploading(false);
//         }
//     };

//     const toggleSelection = (id) => {
//         const newSet = new Set(selectedCharts);
//         if (newSet.has(id)) newSet.delete(id);
//         else newSet.add(id);
//         setSelectedCharts(newSet);
//     };

//     const handleIndividualAction = async (action, id) => {
//         setProcessing(prev => ({ ...prev, [id]: true }));
//         setError("");
//         setSuccess("");
        
//         try {
//             if (action === "archive") {
//                 await archiveOrgChartImage(id);
//                 setSuccess("Chart archived successfully!");
//             } else {
//                 await restoreOrgChartImage(id);
//                 setSuccess("Chart restored successfully!");
//             }
//             fetchCharts();
//         } catch (err) {
//             setError("Action failed");
//         } finally {
//             setProcessing(prev => ({ ...prev, [id]: false }));
//         }
//     };

//     const handleBulkAction = async (action) => {
//         if (selectedCharts.size === 0) return setError("Select at least one chart");
        
//         setBulkProcessing(true);
//         setError("");
//         setSuccess("");
        
//         const promises = Array.from(selectedCharts).map((id) =>
//             action === "archive" ? archiveOrgChartImage(id) : restoreOrgChartImage(id)
//         );
        
//         try {
//             await Promise.all(promises);
//             setSuccess(`${action}d ${selectedCharts.size} chart(s)`);
//             fetchCharts();
//         } catch {
//             setError("Failed to perform bulk action");
//         } finally {
//             setBulkProcessing(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen flex flex-col items-center justify-center">
//                 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
//                 <p className="mt-4 text-gray-600 text-lg">Loading organizational charts...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-7xl mx-auto p-6">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//                 <h1 className="text-3xl font-bold">
//                     Organizational Chart Management
//                 </h1>
//                 <button
//                     onClick={() => setViewArchived(!viewArchived)}
//                     className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50"
//                     disabled={loading}
//                 >
//                     {loading ? "Loading..." : viewArchived ? "View Active Charts" : "View Archived Charts"}
//                 </button>
//             </div>

//             {/* Alerts */}
//             {error && (
//                 <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
//             )}
//             {success && (
//                 <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
//             )}

//             {/* Upload Section */}
//             {!viewArchived && (
//                 <form onSubmit={handleUpload} className="mb-6">
//                     <div className="flex items-center gap-4">
//                         <input 
//                             type="file" 
//                             onChange={handleFileChange}
//                             className="border p-2 rounded"
//                             disabled={uploading}
//                         />
//                         <button
//                             type="submit"
//                             className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                             disabled={uploading || !selectedFile}
//                         >
//                             {uploading ? (
//                                 <>
//                                     <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                                     Uploading...
//                                 </>
//                             ) : (
//                                 "Upload"
//                             )}
//                         </button>
//                     </div>
//                     {uploading && (
//                         <div className="mt-2">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                                 <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
//                             </div>
//                         </div>
//                     )}
//                 </form>
//             )}

//             {/* Preview */}
//             {previewUrl && (
//                 <div className="mb-6">
//                     <p className="text-sm text-gray-600 mb-2">Preview:</p>
//                     <img
//                         src={previewUrl}
//                         alt="Preview"
//                         className="w-64 h-64 object-contain border rounded shadow"
//                     />
//                 </div>
//             )}

//             {/* Chart Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                 {charts.length === 0 ? (
//                     <div className="col-span-full text-center py-12">
//                         <p className="text-gray-500 text-lg">No charts found.</p>
//                     </div>
//                 ) : (
//                     charts.map((chart) => (
//                         <div key={chart._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative">
//                             <input
//                                 type="checkbox"
//                                 className="absolute top-4 left-4 w-5 h-5"
//                                 checked={selectedCharts.has(chart._id)}
//                                 onChange={() => toggleSelection(chart._id)}
//                                 disabled={processing[chart._id]}
//                             />
                            
//                             <div className="relative">
//                                 {processing[chart._id] && (
//                                     <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded">
//                                         <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
//                                     </div>
//                                 )}
//                                 <img
//                                     src={chart.imageUrl}
//                                     alt="Org Chart"
//                                     className="w-full h-56 object-contain rounded"
//                                 />
//                             </div>
                            
//                             <div className="flex justify-between mt-4">
//                                 {viewArchived ? (
//                                     <button
//                                         onClick={() => handleIndividualAction("restore", chart._id)}
//                                         className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                         disabled={processing[chart._id]}
//                                     >
//                                         {processing[chart._id] ? (
//                                             <>
//                                                 <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
//                                                 Restoring...
//                                             </>
//                                         ) : (
//                                             "Restore"
//                                         )}
//                                     </button>
//                                 ) : (
//                                     <button
//                                         onClick={() => handleIndividualAction("archive", chart._id)}
//                                         className="px-4 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                         disabled={processing[chart._id]}
//                                     >
//                                         {processing[chart._id] ? (
//                                             <>
//                                                 <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
//                                                 Archiving...
//                                             </>
//                                         ) : (
//                                             "Archive"
//                                         )}
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>

//             {/* Bulk Actions */}
//             {selectedCharts.size > 0 && (
//                 <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
//                     <div className="flex items-center justify-between">
//                         <p className="text-gray-700">
//                             Selected: <span className="font-bold">{selectedCharts.size}</span> chart(s)
//                         </p>
//                         <button
//                             onClick={() => handleBulkAction(viewArchived ? "restore" : "archive")}
//                             className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                             disabled={bulkProcessing}
//                         >
//                             {bulkProcessing ? (
//                                 <>
//                                     <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                                     Processing...
//                                 </>
//                             ) : (
//                                 `${viewArchived ? "Restore" : "Archive"} Selected`
//                             )}
//                         </button>
//                     </div>
//                     {bulkProcessing && (
//                         <div className="mt-2">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                                 <div className="bg-indigo-600 h-2 rounded-full animate-pulse"></div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// // }

// import React, { useState, useEffect } from "react";
// import { 
//     Archive, 
//     RefreshCw, 
//     Upload, 
//     Eye, 
//     EyeOff, 
//     Trash2,
//     Check,
//     Image as ImageIcon
// } from "lucide-react";
// import {
//     getOrgChartImages,
//     uploadOrgChartImage,
//     archiveOrgChartImage,
//     getArchivedOrgChartImages,
//     restoreOrgChartImage,
// } from "../../api/organizational";

// export default function OrgChartManagement() {
//     const [charts, setCharts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [uploading, setUploading] = useState(false);
//     const [processing, setProcessing] = useState({});
//     const [bulkProcessing, setBulkProcessing] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewUrl, setPreviewUrl] = useState(null);
//     const [viewArchived, setViewArchived] = useState(false);
//     const [selectedCharts, setSelectedCharts] = useState(new Set());

//     useEffect(() => {
//         fetchCharts();
//     }, [viewArchived]);

//     const fetchCharts = async () => {
//         setLoading(true);
//         try {
//             const data = viewArchived
//                 ? await getArchivedOrgChartImages()
//                 : await getOrgChartImages();
//             setCharts(data);
//             setSelectedCharts(new Set());
//         } catch (err) {
//             setError("Failed to load organizational charts");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         setSelectedFile(file);
//         if (file) setPreviewUrl(URL.createObjectURL(file));
//         else setPreviewUrl(null);
//     };

//     const handleUpload = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");
//         setUploading(true);

//         if (!selectedFile) {
//             setError("Select a file first");
//             setUploading(false);
//             return;
//         }

//         const formData = new FormData();
//         formData.append("image", selectedFile);

//         try {
//             await uploadOrgChartImage(formData);
//             setSuccess("Organizational chart uploaded successfully!");
//             setSelectedFile(null);
//             setPreviewUrl(null);
//             fetchCharts();
//         } catch (err) {
//             setError("Upload failed. Please try again.");
//         } finally {
//             setUploading(false);
//         }
//     };

//     const toggleSelection = (id) => {
//         const newSet = new Set(selectedCharts);
//         if (newSet.has(id)) newSet.delete(id);
//         else newSet.add(id);
//         setSelectedCharts(newSet);
//     };

//     const handleIndividualAction = async (action, id) => {
//         setProcessing(prev => ({ ...prev, [id]: true }));
//         setError("");
//         setSuccess("");
        
//         try {
//             if (action === "archive") {
//                 await archiveOrgChartImage(id);
//                 setSuccess("Chart archived successfully!");
//             } else {
//                 await restoreOrgChartImage(id);
//                 setSuccess("Chart restored successfully!");
//             }
//             fetchCharts();
//         } catch (err) {
//             setError("Action failed. Please try again.");
//         } finally {
//             setProcessing(prev => ({ ...prev, [id]: false }));
//         }
//     };

//     const handleBulkAction = async (action) => {
//         if (selectedCharts.size === 0) return setError("Select at least one chart");
        
//         setBulkProcessing(true);
//         setError("");
//         setSuccess("");
        
//         const promises = Array.from(selectedCharts).map((id) =>
//             action === "archive" ? archiveOrgChartImage(id) : restoreOrgChartImage(id)
//         );
        
//         try {
//             await Promise.all(promises);
//             setSuccess(`${action === 'archive' ? 'Archived' : 'Restored'} ${selectedCharts.size} chart(s) successfully!`);
//             fetchCharts();
//         } catch {
//             setError("Failed to perform bulk action");
//         } finally {
//             setBulkProcessing(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
//                 <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent"></div>
//                 <p className="mt-6 text-gray-700 text-lg font-medium">Loading organizational charts...</p>
//                 <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                         <div>
//                             <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
//                                 Organizational Chart Management
//                             </h1>
//                             <p className="text-gray-600 mt-2">
//                                 Manage and organize your organizational structure charts
//                             </p>
//                         </div>
                        
//                         <button
//                             onClick={() => setViewArchived(!viewArchived)}
//                             className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl"
//                         >
//                             {viewArchived ? (
//                                 <>
//                                     <Eye className="w-5 h-5" />
//                                     View Active Charts
//                                 </>
//                             ) : (
//                                 <>
//                                     <EyeOff className="w-5 h-5" />
//                                     View Archived Charts
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Alerts */}
//                 {error && (
//                     <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded-xl shadow-md">
//                         <div className="flex items-center">
//                             <div className="flex-shrink-0">
//                                 <Trash2 className="h-6 w-6 text-red-500" />
//                             </div>
//                             <div className="ml-3">
//                                 <p className="font-medium">Error</p>
//                                 <p className="mt-1">{error}</p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {success && (
//                     <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-5 rounded-xl shadow-md">
//                         <div className="flex items-center">
//                             <div className="flex-shrink-0">
//                                 <Check className="h-6 w-6 text-emerald-500" />
//                             </div>
//                             <div className="ml-3">
//                                 <p className="font-medium">Success</p>
//                                 <p className="mt-1">{success}</p>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Upload Section */}
//                 {!viewArchived && (
//                     <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
//                         <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
//                             <Upload className="w-7 h-7 text-blue-500" />
//                             Upload New Chart
//                         </h2>
                        
//                         <form onSubmit={handleUpload} className="space-y-6">
//                             <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//                                 <div className="flex-1">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Select Image File
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="file"
//                                             onChange={handleFileChange}
//                                             className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-blue-100 file:text-blue-700 hover:file:from-blue-100 hover:file:to-blue-200"
//                                             accept="image/*"
//                                             disabled={uploading}
//                                         />
//                                     </div>
//                                 </div>
                                
//                                 <button
//                                     type="submit"
//                                     disabled={uploading || !selectedFile}
//                                     className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 font-semibold"
//                                 >
//                                     {uploading ? (
//                                         <>
//                                             <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
//                                             Uploading...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Upload className="w-5 h-5" />
//                                             Upload Chart
//                                         </>
//                                     )}
//                                 </button>
//                             </div>

//                             {uploading && (
//                                 <div className="space-y-3">
//                                     <div className="flex justify-between text-sm text-gray-600">
//                                         <span>Uploading your chart...</span>
//                                         <span className="font-medium">Please wait</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-3">
//                                         <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full animate-pulse"></div>
//                                     </div>
//                                 </div>
//                             )}
//                         </form>

//                         {/* Preview */}
//                         {previewUrl && (
//                             <div className="mt-8 pt-6 border-t border-gray-200">
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
//                                 <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 shadow-inner">
//                                     <img
//                                         src={previewUrl}
//                                         alt="Chart Preview"
//                                         className="w-full max-w-md mx-auto h-64 object-contain rounded-lg shadow-lg"
//                                     />
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Charts Grid */}
//                 <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
//                     <div className="flex justify-between items-center mb-8">
//                         <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
//                             <ImageIcon className="w-7 h-7 text-purple-500" />
//                             {viewArchived ? 'Archived Charts' : 'Active Charts'}
//                             <span className="text-sm font-normal bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
//                                 {charts.length} charts
//                             </span>
//                         </h2>
                        
//                         {selectedCharts.size > 0 && (
//                             <div className="flex items-center gap-4">
//                                 <span className="text-gray-600">
//                                     <span className="font-bold text-blue-600">{selectedCharts.size}</span> selected
//                                 </span>
//                                 <button
//                                     onClick={() => handleBulkAction(viewArchived ? "restore" : "archive")}
//                                     disabled={bulkProcessing}
//                                     className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 font-semibold"
//                                 >
//                                     {bulkProcessing ? (
//                                         <>
//                                             <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                                             Processing...
//                                         </>
//                                     ) : viewArchived ? (
//                                         <>
//                                             <RefreshCw className="w-4 h-4" />
//                                             Restore Selected
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Archive className="w-4 h-4" />
//                                             Archive Selected
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         )}
//                     </div>

//                     {charts.length === 0 ? (
//                         <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
//                             <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
//                                 <ImageIcon className="w-12 h-12 text-gray-400" />
//                             </div>
//                             <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                                 No {viewArchived ? 'archived' : 'active'} charts found
//                             </h3>
//                             <p className="text-gray-500 max-w-md mx-auto">
//                                 {viewArchived 
//                                     ? 'All charts are currently active. Archive charts to see them here.'
//                                     : 'Upload your first organizational chart to get started.'}
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {charts.map((chart) => (
//                                 <div 
//                                     key={chart._id} 
//                                     className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
//                                         selectedCharts.has(chart._id) 
//                                             ? 'border-blue-500 ring-4 ring-blue-100' 
//                                             : 'border-gray-200 hover:border-gray-300'
//                                     }`}
//                                 >
//                                     {/* Selection Checkbox */}
//                                     <div className="absolute top-4 left-4 z-10">
//                                         <div 
//                                             onClick={() => toggleSelection(chart._id)}
//                                             className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
//                                                 selectedCharts.has(chart._id)
//                                                     ? 'bg-blue-500 text-white'
//                                                     : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-gray-100'
//                                             }`}
//                                         >
//                                             {selectedCharts.has(chart._id) ? (
//                                                 <Check className="w-4 h-4" />
//                                             ) : (
//                                                 <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Processing Overlay */}
//                                     {processing[chart._id] && (
//                                         <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
//                                             <div className="text-center">
//                                                 <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
//                                                 <p className="text-gray-700 font-medium">
//                                                     {viewArchived ? 'Restoring...' : 'Archiving...'}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     )}

//                                     {/* Chart Image */}
//                                     <div className="p-5">
//                                         <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 mb-4">
//                                             <img
//                                                 src={chart.imageUrl}
//                                                 alt="Organizational Chart"
//                                                 className="w-full h-56 object-contain rounded-lg"
//                                             />
//                                         </div>
                                        
//                                         {/* Action Button */}
//                                         <button
//                                             onClick={() => handleIndividualAction(viewArchived ? "restore" : "archive", chart._id)}
//                                             disabled={processing[chart._id]}
//                                             className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
//                                                 viewArchived
//                                                     ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 hover:from-emerald-100 hover:to-green-200 hover:text-emerald-800'
//                                                     : 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 hover:from-amber-100 hover:to-yellow-200 hover:text-amber-800'
//                                             }`}
//                                         >
//                                             {processing[chart._id] ? (
//                                                 <>
//                                                     <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
//                                                     {viewArchived ? 'Restoring...' : 'Archiving...'}
//                                                 </>
//                                             ) : viewArchived ? (
//                                                 <>
//                                                     <RefreshCw className="w-4 h-4" />
//                                                     Restore Chart
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <Archive className="w-4 h-4" />
//                                                     Archive Chart
//                                                 </>
//                                             )}
//                                         </button>
//                                     </div>

//                                     {/* Date Badge */}
//                                     <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full">
//                                         {new Date(chart.createdAt).toLocaleDateString('en-US', {
//                                             month: 'short',
//                                             day: 'numeric',
//                                             year: 'numeric'
//                                         })}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }


import React, { useState, useEffect } from "react";
import { 
    Archive, 
    RefreshCw, 
    Upload, 
    Eye, 
    EyeOff, 
    Trash2,
    Check,
    Image as ImageIcon,
    Clock,
    Calendar,
    TrendingUp
} from "lucide-react";
import {
    getOrgChartImages,
    uploadOrgChartImage,
    archiveOrgChartImage,
    getArchivedOrgChartImages,
    restoreOrgChartImage,
} from "../../api/organizational";

export default function OrgChartManagement() {
    const [charts, setCharts] = useState([]);
    const [latestUpload, setLatestUpload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState({});
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [viewArchived, setViewArchived] = useState(false);
    const [selectedCharts, setSelectedCharts] = useState(new Set());

    useEffect(() => {
        fetchCharts();
    }, [viewArchived]);

    const fetchCharts = async () => {
        setLoading(true);
        try {
            const data = viewArchived
                ? await getArchivedOrgChartImages()
                : await getOrgChartImages();
            
            setCharts(data);
            
            // Find the latest upload (most recent createdAt)
            if (data.length > 0 && !viewArchived) {
                const sorted = [...data].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setLatestUpload(sorted[0]);
            } else {
                setLatestUpload(null);
            }
            
            setSelectedCharts(new Set());
        } catch (err) {
            setError("Failed to load organizational charts");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
        else setPreviewUrl(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setUploading(true);

        if (!selectedFile) {
            setError("Select a file first");
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            const result = await uploadOrgChartImage(formData);
            setSuccess("Organizational chart uploaded successfully!");
            setSelectedFile(null);
            setPreviewUrl(null);
            
            // Set the newly uploaded chart as latest
            if (result.data) {
                setLatestUpload(result.data);
            }
            
            fetchCharts();
        } catch (err) {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedCharts);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCharts(newSet);
    };

    const handleIndividualAction = async (action, id) => {
        setProcessing(prev => ({ ...prev, [id]: true }));
        setError("");
        setSuccess("");
        
        try {
            if (action === "archive") {
                await archiveOrgChartImage(id);
                setSuccess("Chart archived successfully!");
            } else {
                await restoreOrgChartImage(id);
                setSuccess("Chart restored successfully!");
            }
            fetchCharts();
        } catch (err) {
            setError("Action failed. Please try again.");
        } finally {
            setProcessing(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedCharts.size === 0) return setError("Select at least one chart");
        
        setBulkProcessing(true);
        setError("");
        setSuccess("");
        
        const promises = Array.from(selectedCharts).map((id) =>
            action === "archive" ? archiveOrgChartImage(id) : restoreOrgChartImage(id)
        );
        
        try {
            await Promise.all(promises);
            setSuccess(`${action === 'archive' ? 'Archived' : 'Restored'} ${selectedCharts.size} chart(s) successfully!`);
            fetchCharts();
        } catch {
            setError("Failed to perform bulk action");
        } finally {
            setBulkProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-6 text-gray-700 text-lg font-medium">Loading organizational charts...</p>
                <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                Organizational Chart Management
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Manage and organize your organizational structure charts
                            </p>
                        </div>
                        
                        <button
                            onClick={() => setViewArchived(!viewArchived)}
                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {viewArchived ? (
                                <>
                                    <Eye className="w-5 h-5" />
                                    View Active Charts
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-5 h-5" />
                                    View Archived Charts
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* LATEST UPLOAD SECTION - Only show for active charts */}
                {!viewArchived && latestUpload && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-8 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Latest Upload</h2>
                                    <p className="text-gray-600 text-sm">Most recent organizational chart</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Uploaded {formatTimeAgo(latestUpload.createdAt)}</span>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Latest Upload Preview */}
                            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-md border">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <ImageIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Current Active Chart</h3>
                                        <p className="text-sm text-gray-500">Displayed for all users</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                                    <img
                                        src={latestUpload.imageUrl}
                                        alt="Latest Organizational Chart"
                                        className="w-full h-64 object-contain rounded-lg"
                                    />
                                </div>
                            </div>
                            
                            {/* Upload Stats */}
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-4 shadow-md border">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Upload Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Status</span>
                                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                Active
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Upload Date</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(latestUpload.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Upload Time</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(latestUpload.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Total Charts</span>
                                            <span className="font-bold text-blue-600">{charts.length}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold text-green-700">Note:</span> This is the chart currently displayed to all users on the public website.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerts */}
                {error && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded-xl shadow-md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="font-medium">Error</p>
                                <p className="mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-5 rounded-xl shadow-md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Check className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div className="ml-3">
                                <p className="font-medium">Success</p>
                                <p className="mt-1">{success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                {!viewArchived && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Upload className="w-7 h-7 text-blue-500" />
                            Upload New Chart
                        </h2>
                        
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Image File
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-blue-100 file:text-blue-700 hover:file:from-blue-100 hover:file:to-blue-200"
                                            accept="image/*"
                                            disabled={uploading}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        The uploaded chart will become the new "Latest Upload" displayed to users
                                    </p>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={uploading || !selectedFile}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 font-semibold"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload New Chart
                                        </>
                                    )}
                                </button>
                            </div>

                            {uploading && (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Uploading new chart...</span>
                                        <span className="font-medium">Will become the latest chart</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Preview */}
                        {previewUrl && (
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview of New Chart</h3>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 shadow-inner">
                                    <img
                                        src={previewUrl}
                                        alt="Chart Preview"
                                        className="w-full max-w-md mx-auto h-64 object-contain rounded-lg shadow-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Charts Grid */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <ImageIcon className="w-7 h-7 text-purple-500" />
                            {viewArchived ? 'Archived Charts' : 'All Active Charts'}
                            <span className="text-sm font-normal bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                {charts.length} {charts.length === 1 ? 'chart' : 'charts'}
                            </span>
                        </h2>
                        
                        {selectedCharts.size > 0 && (
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600">
                                    <span className="font-bold text-blue-600">{selectedCharts.size}</span> selected
                                </span>
                                <button
                                    onClick={() => handleBulkAction(viewArchived ? "restore" : "archive")}
                                    disabled={bulkProcessing}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3 font-semibold"
                                >
                                    {bulkProcessing ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Processing...
                                        </>
                                    ) : viewArchived ? (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Restore Selected
                                        </>
                                    ) : (
                                        <>
                                            <Archive className="w-4 h-4" />
                                            Archive Selected
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {charts.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No {viewArchived ? 'archived' : 'active'} charts found
                            </h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                {viewArchived 
                                    ? 'All charts are currently active. Archive charts to see them here.'
                                    : 'Upload your first organizational chart to get started.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {charts.map((chart) => (
                                <div 
                                    key={chart._id} 
                                    className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                                        selectedCharts.has(chart._id) 
                                            ? 'border-blue-500 ring-4 ring-blue-100' 
                                            : chart._id === latestUpload?._id && !viewArchived
                                            ? 'border-green-500 ring-4 ring-green-100'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {/* Latest Badge */}
                                    {chart._id === latestUpload?._id && !viewArchived && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                LATEST
                                            </div>
                                        </div>
                                    )}

                                    {/* Selection Checkbox */}
                                    <div className="absolute top-4 left-4 z-10">
                                        <div 
                                            onClick={() => toggleSelection(chart._id)}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                                selectedCharts.has(chart._id)
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-gray-100'
                                            }`}
                                        >
                                            {selectedCharts.has(chart._id) ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Processing Overlay */}
                                    {processing[chart._id] && (
                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
                                            <div className="text-center">
                                                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                                <p className="text-gray-700 font-medium">
                                                    {viewArchived ? 'Restoring...' : 'Archiving...'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chart Image */}
                                    <div className="p-5">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 mb-4">
                                            <img
                                                src={chart.imageUrl}
                                                alt="Organizational Chart"
                                                className="w-full h-56 object-contain rounded-lg"
                                            />
                                        </div>
                                        
                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleIndividualAction(viewArchived ? "restore" : "archive", chart._id)}
                                            disabled={processing[chart._id]}
                                            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                                                viewArchived
                                                    ? 'bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 hover:from-emerald-100 hover:to-green-200 hover:text-emerald-800'
                                                    : chart._id === latestUpload?._id
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-100 text-green-700 hover:from-green-100 hover:to-emerald-200 hover:text-green-800'
                                                    : 'bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 hover:from-amber-100 hover:to-yellow-200 hover:text-amber-800'
                                            }`}
                                        >
                                            {processing[chart._id] ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                                    {viewArchived ? 'Restoring...' : 'Archiving...'}
                                                </>
                                            ) : viewArchived ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4" />
                                                    Restore Chart
                                                </>
                                            ) : chart._id === latestUpload?._id ? (
                                                <>
                                                    <TrendingUp className="w-4 h-4" />
                                                    Current Active Chart
                                                </>
                                            ) : (
                                                <>
                                                    <Archive className="w-4 h-4" />
                                                    Archive Chart
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Date Badge */}
                                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                        {new Date(chart.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper function to format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}