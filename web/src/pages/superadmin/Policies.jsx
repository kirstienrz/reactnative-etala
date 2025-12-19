
// import React, { useState, useEffect } from "react";
// import {
//     FileText,
//     Search,
//     Plus,
//     Edit2,
//     Trash2,
//     X,
//     Save,
//     Calendar,
//     File,
//     Archive,
//     Paperclip,
//     Upload // Dagdag na icon para sa file attachment
// } from "lucide-react";
// import {
//     getDocuments,
//     getArchivedDocuments,
//     uploadDocument,
//     archiveDocument,
//     restoreDocument,
//     deleteDocument,
// } from "../../api/documents";

// const DOCUMENT_TYPES = [
//     { value: "policy", label: "Policy" },
//     { value: "circular", label: "Circular" },
//     { value: "resolution", label: "Resolution" },
//     { value: "memorandum", label: "Memorandum" },
//     { value: "office_order", label: "Office Order" },
// ];

// const AdminDocuments = () => {
//     const [documents, setDocuments] = useState([]);
//     const [archived, setArchived] = useState([]);
//     const [activeTab, setActiveTab] = useState("active");
//     const [searchQuery, setSearchQuery] = useState("");

//     const [showModal, setShowModal] = useState(false);
//     const [editingItem, setEditingItem] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [fetching, setFetching] = useState(false);

//     const [formData, setFormData] = useState({
//         title: "",
//         document_type: "policy",
//         issued_by: "",
//         date_issued: "",
//         description: "",
//         file: null,
//         file_url: "",
//     });

//     // ========================= FETCH =========================
//     useEffect(() => {
//         fetchAll();
//     }, []);

//     const fetchAll = async () => {
//         try {
//             setFetching(true);
//             const docs = await getDocuments(); // fetch all active
//             const archivedDocs = await getArchivedDocuments(); // fetch archived

//             console.log("Docs fetched:", docs);
//             console.log("Archived fetched:", archivedDocs);

//             setDocuments(docs);
//             setArchived(archivedDocs);
//         } catch (err) {
//             console.error("Fetch error:", err);
//         } finally {
//             setFetching(false);
//         }
//     };

//     // ========================= MODAL =========================
//     const openModal = (item = null) => {
//         if (item) {
//             setEditingItem(item);
//             setFormData({
//                 title: item.title,
//                 document_type: item.document_type,
//                 issued_by: item.issued_by || "",
//                 date_issued: item.date_issued?.slice(0, 10) || "",
//                 description: item.description || "",
//                 file: null,
//                 file_url: item.file_url || "",
//             });
//         } else {
//             setEditingItem(null);
//             setFormData({
//                 title: "",
//                 document_type: "policy",
//                 issued_by: "",
//                 date_issued: "",
//                 description: "",
//                 file: null,
//                 file_url: "",
//             });
//         }
//         setShowModal(true);
//     };

//     const closeModal = () => {
//         setShowModal(false);
//         setEditingItem(null);
//     };

//     // ========================= SUBMIT =========================
//     const handleSubmit = async () => {
//         try {
//             if (!formData.title) {
//                 alert("Title is required.");
//                 return;
//             }

//             if (!editingItem && !formData.file) {
//                 alert("File is required for new documents.");
//                 return;
//             }

//             setLoading(true);

//             const payload = new FormData();
//             payload.append("title", formData.title);
//             payload.append("document_type", formData.document_type);
//             payload.append("issued_by", formData.issued_by);
//             payload.append("date_issued", formData.date_issued);
//             payload.append("description", formData.description);

//             // Append new file if selected
//             if (formData.file) {
//                 payload.append("file", formData.file);
//             } else if (editingItem && formData.file_url) {
//                 // Keep existing file URL for backend to handle
//                 payload.append("file_url", formData.file_url);
//             }

//             if (editingItem) {
//                 await uploadDocument(editingItem._id, payload);
//             } else {
//                 await uploadDocument(null, payload);
//             }

//             await fetchAll();
//             closeModal();
//         } catch (err) {
//             console.error("Save error:", err);
//             alert("Failed to save document.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ========================= FILTER =========================
//     const activeList = (activeTab === "active" ? documents : archived).filter(
//         (d) =>
//             d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             d.document_type.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     // Function to check if there's a file attached
//     const hasFileAttached = () => {
//         return formData.file || (editingItem && formData.file_url);
//     };

//     // ========================= UI =========================
//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                         Policies & Issuances
//                     </h1>
//                     <p className="text-gray-600">
//                         Manage policies, circulars, resolutions, memoranda, and office orders
//                     </p>
//                 </div>

//                 {/* Tabs */}
//                 <div className="flex gap-4 mb-6 border-b">
//                     {["active", "archived"].map((tab) => (
//                         <button
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={`pb-3 px-4 font-medium transition ${activeTab === tab
//                                 ? "border-b-2 border-blue-600 text-blue-600"
//                                 : "text-gray-600 hover:text-gray-900"
//                                 }`}
//                         >
//                             {tab === "active" ? "Active Documents" : "Archived"}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Search + Add */}
//                 <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
//                     <div className="flex items-center w-full sm:w-96 border rounded-lg px-3 py-2 bg-white shadow-sm">
//                         <Search className="text-gray-400 mr-2" size={18} />
//                         <input
//                             type="text"
//                             placeholder="Search by title or type..."
//                             className="flex-1 outline-none"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>

//                     {activeTab === "active" && (
//                         <button
//                             onClick={() => openModal()}
//                             className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
//                         >
//                             <Plus size={18} />
//                             Add Document
//                         </button>
//                     )}
//                 </div>

//                 {/* Loading spinner for fetch */}
//                 {fetching && (
//                     <div className="text-center py-6 text-gray-600">
//                         Loading documents...
//                     </div>
//                 )}

//                 {/* Table */}
//                 {!fetching && (
//                     <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//                         <table className="w-full">
//                             <thead className="bg-gray-100 text-gray-700">
//                                 <tr>
//                                     <th className="p-3 text-left">Title</th>
//                                     <th className="p-3 text-left">Type</th>
//                                     <th className="p-3 text-left">Issued By</th>
//                                     <th className="p-3 text-left">Date</th>
//                                     <th className="p-3 text-center">File</th>
//                                     <th className="p-3 text-center">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {activeList.map((d) => (
//                                     <tr key={d._id} className="border-t hover:bg-gray-50">
//                                         <td className="p-3 font-medium">{d.title}</td>
//                                         <td className="p-3 capitalize">{d.document_type}</td>
//                                         <td className="p-3">{d.issued_by || "-"}</td>
//                                         <td className="p-3">
//                                             {d.date_issued
//                                                 ? new Date(d.date_issued).toLocaleDateString()
//                                                 : "-"}
//                                         </td>
//                                         <td className="p-3 text-center">
//                                             {d.file_url && (
//                                                 <a
//                                                     href={d.file_url}
//                                                     target="_blank"
//                                                     rel="noreferrer"
//                                                     className="text-blue-600 hover:underline flex justify-center"
//                                                 >
//                                                     <File size={16} />
//                                                 </a>
//                                             )}
//                                         </td>
//                                         <td className="p-3">
//                                             <div className="flex gap-2 justify-center">
//                                                 {activeTab === "active" ? (
//                                                     <>
//                                                         <button
//                                                             onClick={() => openModal(d)}
//                                                             className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                                                         >
//                                                             <Edit2 size={16} />
//                                                         </button>
//                                                         <button
//                                                             onClick={() =>
//                                                                 archiveDocument(d._id).then(fetchAll)
//                                                             }
//                                                             className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
//                                                         >
//                                                             <Archive size={16} />
//                                                         </button>
//                                                     </>
//                                                 ) : (
//                                                     <button
//                                                         onClick={() =>
//                                                             restoreDocument(d._id).then(fetchAll)
//                                                         }
//                                                         className="p-2 text-green-600 hover:bg-green-50 rounded"
//                                                     >
//                                                         Restore
//                                                     </button>
//                                                 )}
//                                                 <button
//                                                     onClick={() => deleteDocument(d._id).then(fetchAll)}
//                                                     className="p-2 text-red-600 hover:bg-red-50 rounded"
//                                                 >
//                                                     <Trash2 size={16} />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}

//                 {/* MODAL */}
//                 {showModal && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//                             <div className="flex justify-between p-6 border-b">
//                                 <h2 className="text-xl font-semibold">
//                                     {editingItem ? "Edit Document" : "Add Document"}
//                                 </h2>
//                                 <button onClick={closeModal}>
//                                     <X size={24} />
//                                 </button>
//                             </div>

//                             <div className="p-6 space-y-4">
//                                 {/* File Attachment Indicator */}
//                                 <div className={`flex items-center gap-2 p-3 rounded-lg border ${hasFileAttached() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
//                                     <Paperclip className={hasFileAttached() ? "text-green-600" : "text-gray-400"} size={18} />
//                                     <span className={`text-sm font-medium ${hasFileAttached() ? 'text-green-700' : 'text-gray-600'}`}>
//                                         {hasFileAttached()
//                                             ? "File is attached"
//                                             : "No file attached"}
//                                     </span>
//                                     {hasFileAttached() && (
//                                         <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
//                                             ✓ Ready
//                                         </span>
//                                     )}
//                                 </div>

//                                 <input
//                                     className="w-full border rounded-lg px-3 py-2"
//                                     placeholder="Title *"
//                                     value={formData.title}
//                                     onChange={(e) =>
//                                         setFormData({ ...formData, title: e.target.value })
//                                     }
//                                 />

//                                 <select
//                                     className="w-full border rounded-lg px-3 py-2"
//                                     value={formData.document_type}
//                                     onChange={(e) =>
//                                         setFormData({
//                                             ...formData,
//                                             document_type: e.target.value,
//                                         })
//                                     }
//                                 >
//                                     {DOCUMENT_TYPES.map((t) => (
//                                         <option key={t.value} value={t.value}>
//                                             {t.label}
//                                         </option>
//                                     ))}
//                                 </select>

//                                 <input
//                                     className="w-full border rounded-lg px-3 py-2"
//                                     placeholder="Issued by"
//                                     value={formData.issued_by}
//                                     onChange={(e) =>
//                                         setFormData({ ...formData, issued_by: e.target.value })
//                                     }
//                                 />

//                                 <input
//                                     type="date"
//                                     className="w-full border rounded-lg px-3 py-2"
//                                     value={formData.date_issued}
//                                     onChange={(e) =>
//                                         setFormData({ ...formData, date_issued: e.target.value })
//                                     }
//                                 />

//                                 <textarea
//                                     rows={3}
//                                     className="w-full border rounded-lg px-3 py-2"
//                                     placeholder="Description"
//                                     value={formData.description}
//                                     onChange={(e) =>
//                                         setFormData({ ...formData, description: e.target.value })
//                                     }
//                                 />

//                                 {/* ... ibang code ... */}

//                                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition">
//                                     <label
//                                         htmlFor="fileInput"
//                                         className="cursor-pointer block"
//                                     >
//                                         <div className="mb-2">
//                                             {formData.file ? (
//                                                 <div className="text-green-600 font-medium">
//                                                     <File className="inline mr-2" size={18} />
//                                                     Selected: {formData.file.name}
//                                                 </div>
//                                             ) : (
//                                                 <div className="text-gray-600">
//                                                     <Upload className="inline mr-2" size={18} />
//                                                     Click to choose file (PDF, DOC, DOCX)
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <input
//                                             type="file"
//                                             accept=".pdf,.doc,.docx"
//                                             onChange={(e) =>
//                                                 setFormData({ ...formData, file: e.target.files[0] })
//                                             }
//                                             className="hidden"
//                                             id="fileInput"
//                                         />
//                                         <div className="text-xs text-gray-500 mt-1">
//                                             {!formData.file && "No file chosen"}
//                                         </div>
//                                     </label>
//                                 </div>

//                                 {/* ... ibang code ... */}

//                                 {/* Show existing file link when editing */}
//                                 {editingItem && formData.file_url && (
//                                     <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
//                                         <div className="flex items-center gap-2">
//                                             <File className="text-blue-500" size={16} />
//                                             <span>Current file:</span>
//                                         </div>
//                                         <a
//                                             href={formData.file_url}
//                                             target="_blank"
//                                             rel="noreferrer"
//                                             className="text-blue-600 hover:underline ml-6"
//                                         >
//                                             View existing file
//                                         </a>
//                                     </div>
//                                 )}

//                                 {/* File status summary */}
//                                 <div className="text-xs text-gray-500 mt-2">
//                                     {!editingItem && !formData.file && (
//                                         <div className="text-amber-600 flex items-center gap-1">
//                                             <span>⚠</span> File is required for new documents
//                                         </div>
//                                     )}
//                                     {editingItem && !formData.file && formData.file_url && (
//                                         <div className="text-green-600 flex items-center gap-1">
//                                             <span>✓</span> Existing file will be kept
//                                         </div>
//                                     )}
//                                     {formData.file && (
//                                         <div className="text-green-600 flex items-center gap-1">
//                                             <span>✓</span> New file selected: {formData.file.name}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
//                                 <button
//                                     onClick={closeModal}
//                                     className="px-4 py-2 border rounded-lg"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleSubmit}
//                                     disabled={loading}
//                                     className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${(!editingItem && !formData.file) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
//                                 >
//                                     {loading && (
//                                         <span className="loader border-white mr-2"></span>
//                                     )}
//                                     <Save size={16} /> Save
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // export default AdminDocuments;

// import React, { useState, useEffect } from "react";
// import {
//     FileText,
//     Search,
//     Plus,
//     Edit2,
//     X,
//     Save,
//     Calendar,
//     File,
//     Archive,
//     Paperclip,
//     Upload,
//     Filter
// } from "lucide-react";
// import {
//     getDocuments,
//     getArchivedDocuments,
//     uploadDocument,
//     archiveDocument,
//     restoreDocument,
//     deleteDocument,
// } from "../../api/documents";

// const DOCUMENT_TYPES = [
//     { value: "policy", label: "Policy" },
//     { value: "circular", label: "Circular" },
//     { value: "resolution", label: "Resolution" },
//     { value: "memorandum", label: "Memorandum" },
//     { value: "office_order", label: "Office Order" },
// ];

// const AdminDocuments = () => {
//     const [documents, setDocuments] = useState([]);
//     const [archived, setArchived] = useState([]);
//     const [activeTab, setActiveTab] = useState("active");
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
//     const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    
//     const [showModal, setShowModal] = useState(false);
//     const [editingItem, setEditingItem] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [fetching, setFetching] = useState(false);
    
//     // Validation states
//     const [errors, setErrors] = useState({});
//     const [touched, setTouched] = useState({});

//     const [formData, setFormData] = useState({
//         title: "",
//         document_type: "policy",
//         issued_by: "",
//         date_issued: "",
//         description: "",
//         file: null,
//         file_url: "",
//     });

//     // ========================= VALIDATIONS =========================
//     const validateForm = () => {
//         const newErrors = {};
        
//         // Title validation
//         if (!formData.title.trim()) {
//             newErrors.title = "Title is required";
//         } else if (formData.title.length > 200) {
//             newErrors.title = "Title must be less than 200 characters";
//         }
        
//         // Issued by validation
//         if (formData.issued_by && formData.issued_by.length > 100) {
//             newErrors.issued_by = "Issued by must be less than 100 characters";
//         }
        
//         // Date validation
//         if (formData.date_issued) {
//             const date = new Date(formData.date_issued);
//             const now = new Date();
//             if (date > now) {
//                 newErrors.date_issued = "Date cannot be in the future";
//             }
//         }
        
//         // File validation for new documents
//         if (!editingItem && !formData.file) {
//             newErrors.file = "File is required for new documents";
//         }
        
//         // File validation for file types
//         if (formData.file) {
//             const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//             if (!allowedTypes.includes(formData.file.type)) {
//                 newErrors.file = "File must be PDF, DOC, or DOCX";
//             }
            
//             // File size validation (10MB max)
//             const maxSize = 10 * 1024 * 1024; // 10MB
//             if (formData.file.size > maxSize) {
//                 newErrors.file = "File size must be less than 10MB";
//             }
//         }
        
//         // Description validation
//         if (formData.description && formData.description.length > 1000) {
//             newErrors.description = "Description must be less than 1000 characters";
//         }
        
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleBlur = (field) => {
//         setTouched({ ...touched, [field]: true });
//         validateForm();
//     };

//     // ========================= FETCH =========================
//     useEffect(() => {
//         fetchAll();
//     }, []);

//     const fetchAll = async () => {
//         try {
//             setFetching(true);
//             const docs = await getDocuments();
//             const archivedDocs = await getArchivedDocuments();

//             // Filter out archived documents from active documents
//             const activeDocs = docs.filter(doc => !doc.archived);
//             const archivedOnly = [...archivedDocs, ...docs.filter(doc => doc.archived)];

//             setDocuments(activeDocs);
//             setArchived(archivedOnly);
//         } catch (err) {
//             console.error("Fetch error:", err);
//         } finally {
//             setFetching(false);
//         }
//     };

//     // ========================= FILTERING =========================
//     const activeList = (activeTab === "active" ? documents : archived).filter((d) => {
//         // Search filter
//         const matchesSearch = 
//             d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             d.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             (d.issued_by && d.issued_by.toLowerCase().includes(searchQuery.toLowerCase()));
        
//         // Type filter
//         const matchesType = selectedTypeFilter === "all" || d.document_type === selectedTypeFilter;
        
//         return matchesSearch && matchesType;
//     });

//     // Reset filter
//     const resetFilters = () => {
//         setSearchQuery("");
//         setSelectedTypeFilter("all");
//     };

//     // ========================= MODAL =========================
//     const openModal = (item = null) => {
//         setErrors({});
//         setTouched({});
        
//         if (item) {
//             setEditingItem(item);
//             setFormData({
//                 title: item.title,
//                 document_type: item.document_type,
//                 issued_by: item.issued_by || "",
//                 date_issued: item.date_issued?.slice(0, 10) || "",
//                 description: item.description || "",
//                 file: null,
//                 file_url: item.file_url || "",
//             });
//         } else {
//             setEditingItem(null);
//             setFormData({
//                 title: "",
//                 document_type: "policy",
//                 issued_by: "",
//                 date_issued: "",
//                 description: "",
//                 file: null,
//                 file_url: "",
//             });
//         }
//         setShowModal(true);
//     };

//     const closeModal = () => {
//         setShowModal(false);
//         setEditingItem(null);
//         setErrors({});
//         setTouched({});
//     };

//     // ========================= ARCHIVE/RESTORE HANDLERS =========================
//     const handleArchive = async (id) => {
//         try {
//             await archiveDocument(id);
//             await fetchAll();
//         } catch (err) {
//             console.error("Archive error:", err);
//             alert("Failed to archive document.");
//         }
//     };

//     const handleRestore = async (id) => {
//         try {
//             await restoreDocument(id);
//             await fetchAll();
//         } catch (err) {
//             console.error("Restore error:", err);
//             alert("Failed to restore document.");
//         }
//     };

//     // ========================= SUBMIT =========================
//     const handleSubmit = async () => {
//         // Validate all fields
//         const allTouched = {
//             title: true,
//             issued_by: true,
//             date_issued: true,
//             description: true,
//             file: true,
//         };
//         setTouched(allTouched);
        
//         if (!validateForm()) {
//             alert("Please fix the errors in the form.");
//             return;
//         }

//         try {
//             setLoading(true);

//             const payload = new FormData();
//             payload.append("title", formData.title.trim());
//             payload.append("document_type", formData.document_type);
//             payload.append("issued_by", formData.issued_by.trim());
//             payload.append("date_issued", formData.date_issued);
//             payload.append("description", formData.description.trim());

//             if (formData.file) {
//                 payload.append("file", formData.file);
//             } else if (editingItem && formData.file_url) {
//                 payload.append("file_url", formData.file_url);
//             }

//             if (editingItem) {
//                 await uploadDocument(editingItem._id, payload);
//             } else {
//                 await uploadDocument(null, payload);
//             }

//             await fetchAll();
//             closeModal();
//         } catch (err) {
//             console.error("Save error:", err);
//             alert("Failed to save document.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ========================= UI =========================
//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                         Policies & Issuances
//                     </h1>
//                     <p className="text-gray-600">
//                         Manage policies, circulars, resolutions, memoranda, and office orders
//                     </p>
//                 </div>

//                 {/* Tabs */}
//                 <div className="flex gap-4 mb-6 border-b">
//                     {["active", "archived"].map((tab) => (
//                         <button
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={`pb-3 px-4 font-medium transition ${activeTab === tab
//                                 ? "border-b-2 border-blue-600 text-blue-600"
//                                 : "text-gray-600 hover:text-gray-900"
//                                 }`}
//                         >
//                             {tab === "active" ? "Active Documents" : "Archived"}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Filters Bar */}
//                 <div className="bg-white border rounded-lg p-4 mb-6 shadow-sm">
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                         {/* Left side: Search */}
//                         <div className="flex items-center w-full sm:w-96 border rounded-lg px-3 py-2 bg-white">
//                             <Search className="text-gray-400 mr-2" size={18} />
//                             <input
//                                 type="text"
//                                 placeholder="Search by title, type, or issued by..."
//                                 className="flex-1 outline-none"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                             {searchQuery && (
//                                 <button
//                                     onClick={() => setSearchQuery("")}
//                                     className="text-gray-400 hover:text-gray-600"
//                                 >
//                                     <X size={18} />
//                                 </button>
//                             )}
//                         </div>

//                         {/* Right side: Filters and Add button */}
//                         <div className="flex items-center gap-3 w-full sm:w-auto">
//                             {/* Filter Dropdown */}
//                             <div className="relative">
//                                 <button
//                                     onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
//                                     className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${selectedTypeFilter !== "all"
//                                         ? "bg-blue-50 text-blue-600 border-blue-200"
//                                         : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                                         }`}
//                                 >
//                                     <Filter size={18} />
//                                     Filter by Type
//                                     {selectedTypeFilter !== "all" && (
//                                         <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
//                                             {DOCUMENT_TYPES.find(t => t.value === selectedTypeFilter)?.label || selectedTypeFilter}
//                                         </span>
//                                     )}
//                                 </button>
                                
//                                 {filterDropdownOpen && (
//                                     <>
//                                         <div 
//                                             className="fixed inset-0 z-10"
//                                             onClick={() => setFilterDropdownOpen(false)}
//                                         />
//                                         <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-20">
//                                             <div className="p-3 border-b">
//                                                 <h3 className="font-medium text-gray-700">Filter by Document Type</h3>
//                                             </div>
//                                             <div className="p-2">
//                                                 <button
//                                                     onClick={() => {
//                                                         setSelectedTypeFilter("all");
//                                                         setFilterDropdownOpen(false);
//                                                     }}
//                                                     className={`w-full text-left px-3 py-2 rounded ${selectedTypeFilter === "all"
//                                                         ? "bg-blue-50 text-blue-600"
//                                                         : "hover:bg-gray-50"
//                                                         }`}
//                                                 >
//                                                     All Types
//                                                 </button>
//                                                 {DOCUMENT_TYPES.map((type) => (
//                                                     <button
//                                                         key={type.value}
//                                                         onClick={() => {
//                                                             setSelectedTypeFilter(type.value);
//                                                             setFilterDropdownOpen(false);
//                                                         }}
//                                                         className={`w-full text-left px-3 py-2 rounded ${selectedTypeFilter === type.value
//                                                             ? "bg-blue-50 text-blue-600"
//                                                             : "hover:bg-gray-50"
//                                                             }`}
//                                                     >
//                                                         {type.label}
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                             <div className="border-t p-2">
//                                                 <button
//                                                     onClick={resetFilters}
//                                                     className="w-full text-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded"
//                                                 >
//                                                     Reset All Filters
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </>
//                                 )}
//                             </div>

//                             {/* Active Filters Indicator */}
//                             {(selectedTypeFilter !== "all" || searchQuery) && (
//                                 <div className="flex items-center gap-2 text-sm">
//                                     <span className="text-gray-600">Active filters:</span>
//                                     {selectedTypeFilter !== "all" && (
//                                         <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
//                                             Type: {DOCUMENT_TYPES.find(t => t.value === selectedTypeFilter)?.label}
//                                             <button
//                                                 onClick={() => setSelectedTypeFilter("all")}
//                                                 className="text-blue-400 hover:text-blue-600"
//                                             >
//                                                 <X size={14} />
//                                             </button>
//                                         </span>
//                                     )}
//                                     {searchQuery && (
//                                         <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
//                                             Search: "{searchQuery}"
//                                             <button
//                                                 onClick={() => setSearchQuery("")}
//                                                 className="text-gray-400 hover:text-gray-600"
//                                             >
//                                                 <X size={14} />
//                                             </button>
//                                         </span>
//                                     )}
//                                 </div>
//                             )}

//                             {/* Add Document Button */}
//                             {activeTab === "active" && (
//                                 <button
//                                     onClick={() => openModal()}
//                                     className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ml-auto"
//                                 >
//                                     <Plus size={18} />
//                                     Add Document
//                                 </button>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Results Count */}
//                 <div className="mb-4 text-sm text-gray-600">
//                     Showing {activeList.length} of {activeTab === "active" ? documents.length : archived.length} documents
//                 </div>

//                 {/* Loading spinner for fetch */}
//                 {fetching && (
//                     <div className="text-center py-6 text-gray-600">
//                         Loading documents...
//                     </div>
//                 )}

//                 {/* Table */}
//                 {!fetching && (
//                     <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
//                         {activeList.length === 0 ? (
//                             <div className="text-center py-12 text-gray-500">
//                                 {searchQuery || selectedTypeFilter !== "all" ? (
//                                     <>
//                                         <p className="mb-2">No documents match your filters</p>
//                                         <button
//                                             onClick={resetFilters}
//                                             className="text-blue-600 hover:text-blue-800"
//                                         >
//                                             Clear all filters
//                                         </button>
//                                     </>
//                                 ) : (
//                                     <p>No documents found</p>
//                                 )}
//                             </div>
//                         ) : (
//                             <table className="w-full">
//                                 <thead className="bg-gray-100 text-gray-700">
//                                     <tr>
//                                         <th className="p-3 text-left">Title</th>
//                                         <th className="p-3 text-left">Type</th>
//                                         <th className="p-3 text-left">Issued By</th>
//                                         <th className="p-3 text-left">Date</th>
//                                         <th className="p-3 text-center">File</th>
//                                         <th className="p-3 text-center">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {activeList.map((d) => (
//                                         <tr key={d._id} className="border-t hover:bg-gray-50">
//                                             <td className="p-3 font-medium">{d.title}</td>
//                                             <td className="p-3">
//                                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
//                                                     {d.document_type}
//                                                 </span>
//                                             </td>
//                                             <td className="p-3">{d.issued_by || "-"}</td>
//                                             <td className="p-3">
//                                                 {d.date_issued
//                                                     ? new Date(d.date_issued).toLocaleDateString()
//                                                     : "-"}
//                                             </td>
//                                             <td className="p-3 text-center">
//                                                 {d.file_url && (
//                                                     <a
//                                                         href={d.file_url}
//                                                         target="_blank"
//                                                         rel="noreferrer"
//                                                         className="text-blue-600 hover:underline flex justify-center"
//                                                     >
//                                                         <File size={16} />
//                                                     </a>
//                                                 )}
//                                             </td>
//                                             <td className="p-3">
//                                                 <div className="flex gap-2 justify-center">
//                                                     {activeTab === "active" ? (
//                                                         <>
//                                                             <button
//                                                                 onClick={() => openModal(d)}
//                                                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded"
//                                                                 title="Edit"
//                                                             >
//                                                                 <Edit2 size={16} />
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => handleArchive(d._id)}
//                                                                 className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
//                                                                 title="Archive"
//                                                             >
//                                                                 <Archive size={16} />
//                                                             </button>
//                                                         </>
//                                                     ) : (
//                                                         <button
//                                                             onClick={() => handleRestore(d._id)}
//                                                             className="px-3 py-1 text-green-600 hover:bg-green-50 rounded border border-green-200"
//                                                             title="Restore"
//                                                         >
//                                                             Restore to Active
//                                                         </button>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 )}

//                 {/* MODAL */}
//                 {showModal && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                             <div className="flex justify-between p-6 border-b sticky top-0 bg-white">
//                                 <h2 className="text-xl font-semibold">
//                                     {editingItem ? "Edit Document" : "Add Document"}
//                                 </h2>
//                                 <button onClick={closeModal}>
//                                     <X size={24} />
//                                 </button>
//                             </div>

//                             <div className="p-6 space-y-4">
//                                 {/* File Attachment Indicator */}
//                                 <div className={`flex items-center gap-2 p-3 rounded-lg border ${(formData.file || (editingItem && formData.file_url)) ? 'bg-green-50 border-green-200' : errors.file ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
//                                     <Paperclip className={errors.file ? "text-red-600" : (formData.file || (editingItem && formData.file_url)) ? "text-green-600" : "text-gray-400"} size={18} />
//                                     <span className={`text-sm font-medium ${errors.file ? 'text-red-700' : (formData.file || (editingItem && formData.file_url)) ? 'text-green-700' : 'text-gray-600'}`}>
//                                         {errors.file ? errors.file : (formData.file || (editingItem && formData.file_url)) ? "File is attached" : "No file attached"}
//                                     </span>
//                                 </div>

//                                 {/* Title */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Title *
//                                     </label>
//                                     <input
//                                         className={`w-full border rounded-lg px-3 py-2 ${errors.title && touched.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
//                                         placeholder="Enter document title"
//                                         value={formData.title}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, title: e.target.value })
//                                         }
//                                         onBlur={() => handleBlur('title')}
//                                     />
//                                     {errors.title && touched.title && (
//                                         <p className="mt-1 text-sm text-red-600">{errors.title}</p>
//                                     )}
//                                 </div>

//                                 {/* Document Type */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Document Type *
//                                     </label>
//                                     <select
//                                         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//                                         value={formData.document_type}
//                                         onChange={(e) =>
//                                             setFormData({
//                                                 ...formData,
//                                                 document_type: e.target.value,
//                                             })
//                                         }
//                                     >
//                                         {DOCUMENT_TYPES.map((t) => (
//                                             <option key={t.value} value={t.value}>
//                                                 {t.label}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 {/* Issued By */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Issued By
//                                     </label>
//                                     <input
//                                         className={`w-full border rounded-lg px-3 py-2 ${errors.issued_by && touched.issued_by ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
//                                         placeholder="Enter issuing authority"
//                                         value={formData.issued_by}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, issued_by: e.target.value })
//                                         }
//                                         onBlur={() => handleBlur('issued_by')}
//                                     />
//                                     {errors.issued_by && touched.issued_by && (
//                                         <p className="mt-1 text-sm text-red-600">{errors.issued_by}</p>
//                                     )}
//                                 </div>

//                                 {/* Date Issued */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Date Issued
//                                     </label>
//                                     <input
//                                         type="date"
//                                         className={`w-full border rounded-lg px-3 py-2 ${errors.date_issued && touched.date_issued ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
//                                         value={formData.date_issued}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, date_issued: e.target.value })
//                                         }
//                                         onBlur={() => handleBlur('date_issued')}
//                                     />
//                                     {errors.date_issued && touched.date_issued && (
//                                         <p className="mt-1 text-sm text-red-600">{errors.date_issued}</p>
//                                     )}
//                                 </div>

//                                 {/* Description */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Description
//                                     </label>
//                                     <textarea
//                                         rows={3}
//                                         className={`w-full border rounded-lg px-3 py-2 ${errors.description && touched.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
//                                         placeholder="Enter document description"
//                                         value={formData.description}
//                                         onChange={(e) =>
//                                             setFormData({ ...formData, description: e.target.value })
//                                         }
//                                         onBlur={() => handleBlur('description')}
//                                     />
//                                     <div className="flex justify-between mt-1">
//                                         {errors.description && touched.description && (
//                                             <p className="text-sm text-red-600">{errors.description}</p>
//                                         )}
//                                         <span className={`text-xs ${formData.description.length > 1000 ? 'text-red-600' : 'text-gray-500'}`}>
//                                             {formData.description.length}/1000 characters
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {/* File Upload */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {editingItem ? "Replace File (Optional)" : "File *"}
//                                     </label>
//                                     <div className={`border-2 border-dashed rounded-lg p-4 text-center transition ${errors.file && touched.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}>
//                                         <label
//                                             htmlFor="fileInput"
//                                             className="cursor-pointer block"
//                                         >
//                                             <div className="mb-2">
//                                                 {formData.file ? (
//                                                     <div className="text-green-600 font-medium">
//                                                         <File className="inline mr-2" size={18} />
//                                                         Selected: {formData.file.name}
//                                                     </div>
//                                                 ) : (
//                                                     <div className="text-gray-600">
//                                                         <Upload className="inline mr-2" size={18} />
//                                                         Click to choose file (PDF, DOC, DOCX)
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <input
//                                                 type="file"
//                                                 accept=".pdf,.doc,.docx"
//                                                 onChange={(e) => {
//                                                     const file = e.target.files[0];
//                                                     if (file) {
//                                                         // Check file type
//                                                         const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//                                                         const isValidType = allowedTypes.includes(file.type);
                                                        
//                                                         // Check file size (10MB max)
//                                                         const maxSize = 10 * 1024 * 1024;
//                                                         const isValidSize = file.size <= maxSize;
                                                        
//                                                         if (!isValidType || !isValidSize) {
//                                                             setErrors({
//                                                                 ...errors,
//                                                                 file: !isValidType 
//                                                                     ? "File must be PDF, DOC, or DOCX" 
//                                                                     : "File size must be less than 10MB"
//                                                             });
//                                                             setTouched({ ...touched, file: true });
//                                                         } else {
//                                                             setErrors({ ...errors, file: undefined });
//                                                             setFormData({ ...formData, file });
//                                                         }
//                                                     }
//                                                 }}
//                                                 className="hidden"
//                                                 id="fileInput"
//                                                 onBlur={() => handleBlur('file')}
//                                             />
//                                             <div className="text-xs text-gray-500 mt-1">
//                                                 Max size: 10MB • Allowed: .pdf, .doc, .docx
//                                             </div>
//                                         </label>
//                                     </div>
//                                 </div>

//                                 {/* Show existing file link when editing */}
//                                 {editingItem && formData.file_url && !formData.file && (
//                                     <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
//                                         <div className="flex items-center gap-2">
//                                             <File className="text-blue-500" size={16} />
//                                             <span>Current file:</span>
//                                         </div>
//                                         <a
//                                             href={formData.file_url}
//                                             target="_blank"
//                                             rel="noreferrer"
//                                             className="text-blue-600 hover:underline ml-6"
//                                         >
//                                             View existing file
//                                         </a>
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             Leave empty to keep this file
//                                         </p>
//                                     </div>
//                                 )}

//                                 {/* Form Validation Summary */}
//                                 {Object.keys(errors).length > 0 && (
//                                     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                                         <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
//                                         <ul className="list-disc list-inside text-sm text-red-600">
//                                             {Object.entries(errors).map(([field, error]) => (
//                                                 <li key={field}>{error}</li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                 )}
//                             </div>

//                             <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
//                                 <button
//                                     onClick={closeModal}
//                                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleSubmit}
//                                     disabled={loading || (!editingItem && !formData.file) || Object.keys(errors).length > 0}
//                                     className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 transition ${(!editingItem && !formData.file) || Object.keys(errors).length > 0
//                                         ? 'bg-gray-400 cursor-not-allowed'
//                                         : 'bg-blue-600 hover:bg-blue-700'
//                                         }`}
//                                 >
//                                     {loading && (
//                                         <span className="loader border-white mr-2"></span>
//                                     )}
//                                     <Save size={16} /> Save
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AdminDocuments;


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
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ml-auto"
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
            </div>
        </div>
    );
};

export default AdminDocuments;