// // import React, { useState, useEffect } from "react";
// // import {
// //   FolderKanban,
// //   Search,
// //   Plus,
// //   Archive,
// //   RotateCcw,
// //   X,
// //   Save,
// //   Calendar,
// // } from "lucide-react";
// // import {
// //   getProjects,
// //   getArchivedProjects,
// //   uploadProject,
// //   archiveProject,
// //   restoreProject,
// // } from "../../api/projects";

// // const AdminProjects = () => {
// //   const [projects, setProjects] = useState([]);
// //   const [archived, setArchived] = useState([]);
// //   const [activeTab, setActiveTab] = useState("active");
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [showModal, setShowModal] = useState(false);
// //   const [editingItem, setEditingItem] = useState(null);
// //   const [formData, setFormData] = useState({
// //     title: "",
// //     description: "",
// //     year: "",
// //     image: null,
// //   });

// //   // Load projects
// //   useEffect(() => {
// //     fetchProjects();
// //     fetchArchived();
// //   }, []);

// //   const fetchProjects = async () => {
// //     try {
// //       const data = await getProjects();
// //       setProjects(data);
// //     } catch (err) {
// //       console.error("Error fetching projects:", err);
// //     }
// //   };

// //   const fetchArchived = async () => {
// //     try {
// //       const data = await getArchivedProjects();
// //       setArchived(data);
// //     } catch (err) {
// //       console.error("Error fetching archived:", err);
// //     }
// //   };

// //   const openModal = (item = null) => {
// //     if (item) {
// //       setEditingItem(item);
// //       setFormData({
// //         title: item.title,
// //         description: item.description,
// //         year: item.year,
// //         image: null,
// //       });
// //     } else {
// //       setEditingItem(null);
// //       setFormData({ title: "", description: "", year: "", image: null });
// //     }
// //     setShowModal(true);
// //   };

// //   const closeModal = () => {
// //     setShowModal(false);
// //     setEditingItem(null);
// //     setFormData({ title: "", description: "", year: "", image: null });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!formData.title || !formData.year) {
// //       alert("Please fill in the title and year.");
// //       return;
// //     }

// //     const fd = new FormData();
// //     fd.append("title", formData.title);
// //     fd.append("description", formData.description);
// //     fd.append("year", formData.year);
// //     if (formData.image) fd.append("image", formData.image);

// //     try {
// //       await uploadProject(fd);
// //       alert(editingItem ? "Project updated!" : "Project added!");
// //       fetchProjects();
// //       closeModal();
// //     } catch (err) {
// //       console.error("Error saving project:", err);
// //       alert("Failed to save project.");
// //     }
// //   };

// //   const handleArchive = async (id) => {
// //     if (window.confirm("Archive this project?")) {
// //       await archiveProject(id);
// //       fetchProjects();
// //       fetchArchived();
// //     }
// //   };

// //   const handleRestore = async (id) => {
// //     if (window.confirm("Restore this project?")) {
// //       await restoreProject(id);
// //       fetchProjects();
// //       fetchArchived();
// //     }
// //   };

// //   const filteredProjects = projects.filter(
// //     (p) =>
// //       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       p.description.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   const filteredArchived = archived.filter(
// //     (p) =>
// //       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       p.description.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-6">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="mb-8">
// //           <h1 className="text-3xl font-bold text-gray-900 mb-2">
// //             Gender and Development Projects
// //           </h1>
// //           <p className="text-gray-600">
// //             Manage GAD projects, attachments, and archives.
// //           </p>
// //         </div>

// //         {/* Tabs */}
// //         <div className="flex gap-4 mb-6 border-b">
// //           <button
// //             onClick={() => setActiveTab("active")}
// //             className={`pb-3 px-4 font-medium transition ${
// //               activeTab === "active"
// //                 ? "border-b-2 border-indigo-600 text-indigo-600"
// //                 : "text-gray-600 hover:text-gray-900"
// //             }`}
// //           >
// //             <div className="flex items-center gap-2">
// //               <FolderKanban size={18} /> Active Projects
// //             </div>
// //           </button>
// //           <button
// //             onClick={() => setActiveTab("archived")}
// //             className={`pb-3 px-4 font-medium transition ${
// //               activeTab === "archived"
// //                 ? "border-b-2 border-indigo-600 text-indigo-600"
// //                 : "text-gray-600 hover:text-gray-900"
// //             }`}
// //           >
// //             <div className="flex items-center gap-2">
// //               <Archive size={18} /> Archived Projects
// //             </div>
// //           </button>
// //         </div>

// //         {/* Search + Add */}
// //         <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
// //           <div className="flex items-center w-full sm:w-96 border rounded-lg px-3 py-2 bg-white shadow-sm">
// //             <Search className="text-gray-400 mr-2" size={18} />
// //             <input
// //               type="text"
// //               placeholder="Search projects..."
// //               className="flex-1 outline-none"
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //             />
// //           </div>
// //           {activeTab === "active" && (
// //             <button
// //               onClick={() => openModal()}
// //               className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
// //             >
// //               <Plus size={18} /> Add Project
// //             </button>
// //           )}
// //         </div>

// //         {/* Projects Grid */}
// //         {activeTab === "active" ? (
// //           <ProjectGrid
// //             projects={filteredProjects}
// //             onArchive={handleArchive}
// //             type="active"
// //           />
// //         ) : (
// //           <ProjectGrid
// //             projects={filteredArchived}
// //             onRestore={handleRestore}
// //             type="archived"
// //           />
// //         )}

// //         {/* Modal */}
// //         {showModal && (
// //           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
// //               <div className="flex items-center justify-between p-6 border-b">
// //                 <h2 className="text-xl font-semibold text-gray-900">
// //                   {editingItem ? "Edit Project" : "Add Project"}
// //                 </h2>
// //                 <button
// //                   onClick={closeModal}
// //                   className="text-gray-400 hover:text-gray-600"
// //                 >
// //                   <X size={24} />
// //                 </button>
// //               </div>

// //               <form onSubmit={handleSubmit} className="p-6 space-y-4">
// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Title *
// //                   </label>
// //                   <input
// //                     type="text"
// //                     className="w-full border rounded-lg px-3 py-2"
// //                     value={formData.title}
// //                     onChange={(e) =>
// //                       setFormData({ ...formData, title: e.target.value })
// //                     }
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Description
// //                   </label>
// //                   <textarea
// //                     rows={3}
// //                     className="w-full border rounded-lg px-3 py-2"
// //                     value={formData.description}
// //                     onChange={(e) =>
// //                       setFormData({ ...formData, description: e.target.value })
// //                     }
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Year *
// //                   </label>
// //                   <input
// //                     type="number"
// //                     className="w-full border rounded-lg px-3 py-2"
// //                     value={formData.year}
// //                     onChange={(e) =>
// //                       setFormData({ ...formData, year: e.target.value })
// //                     }
// //                   />
// //                 </div>

// //                 <div>
// //                   <label className="block text-sm font-medium text-gray-700 mb-1">
// //                     Image Attachment
// //                   </label>
// //                   <input
// //                     type="file"
// //                     accept="image/*"
// //                     onChange={(e) => {
// //                       const file = e.target.files[0];
// //                       setFormData({ ...formData, image: file });
// //                     }}
// //                     className="block w-full border rounded-lg px-3 py-2"
// //                   />
// //                   {formData.image && (
// //                     <div className="mt-3">
// //                       <p className="text-sm text-gray-600 mb-2">Preview:</p>
// //                       <img
// //                         src={URL.createObjectURL(formData.image)}
// //                         alt="Preview"
// //                         className="w-full h-48 object-cover rounded-lg border"
// //                       />
// //                     </div>
// //                   )}
// //                   {editingItem && editingItem.attachments?.length > 0 && !formData.image && (
// //                     <div className="mt-3">
// //                       <p className="text-sm text-gray-600 mb-2">Current Image:</p>
// //                       <img
// //                         src={editingItem.attachments[0].imageUrl}
// //                         alt="Current"
// //                         className="w-full h-48 object-cover rounded-lg border"
// //                       />
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div className="flex justify-end gap-3 pt-6 border-t">
// //                   <button
// //                     type="button"
// //                     onClick={closeModal}
// //                     className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
// //                   >
// //                     Cancel
// //                   </button>
// //                   <button
// //                     type="submit"
// //                     className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2"
// //                   >
// //                     <Save size={16} />
// //                     Save Project
// //                   </button>
// //                 </div>
// //               </form>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // // Display component
// // const ProjectGrid = ({ projects, onArchive, onRestore, type }) => {
// //   const [selectedProject, setSelectedProject] = useState(null);

// //   const grouped = projects.reduce((acc, project) => {
// //     acc[project.year] = acc[project.year] || [];
// //     acc[project.year].push(project);
// //     return acc;
// //   }, {});

// //   return (
// //     <div>
// //       {Object.keys(grouped)
// //         .sort((a, b) => b - a)
// //         .map((year) => (
// //           <div key={year} className="mb-8">
// //             <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
// //               <Calendar size={18} /> {year}
// //             </h3>
// //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //               {grouped[year].map((item) => (
// //                 <div key={item._id}>
// //                   <div
// //                     className="bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
// //                     onClick={() => {
// //                       console.log('Project clicked:', item);
// //                       console.log('Attachments:', item.attachments);
// //                       setSelectedProject(item);
// //                     }}
// //                   >
// //                     {item.attachments && item.attachments.length > 0 && item.attachments[0].imageUrl ? (
// //                       <img
// //                         src={item.attachments[0].imageUrl}
// //                         alt={item.title}
// //                         className="w-full h-40 object-cover"
// //                         onError={(e) => {
// //                           console.log('Image failed to load:', item.attachments[0].imageUrl);
// //                           e.target.style.display = 'none';
// //                         }}
// //                       />
// //                     ) : (
// //                       <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
// //                         <p className="text-gray-400">No image</p>
// //                       </div>
// //                     )}
// //                     <div className="p-4">
// //                       <h4 className="text-lg font-semibold text-gray-900 mb-1">
// //                         {item.title}
// //                       </h4>
// //                       <p className="text-sm text-gray-600 mb-3 line-clamp-3">
// //                         {item.description}
// //                       </p>
// //                       <div className="flex gap-2 pt-3 border-t">
// //                         {type === "active" ? (
// //                           <button
// //                             onClick={(e) => {
// //                               e.stopPropagation();
// //                               onArchive(item._id);
// //                             }}
// //                             className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition"
// //                           >
// //                             <Archive size={16} /> Archive
// //                           </button>
// //                         ) : (
// //                           <button
// //                             onClick={(e) => {
// //                               e.stopPropagation();
// //                               onRestore(item._id);
// //                             }}
// //                             className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 transition"
// //                           >
// //                             <RotateCcw size={16} /> Restore
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         ))}

// //       {/* Preview Modal */}
// //       {selectedProject && (
// //         <div
// //           className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
// //           onClick={() => setSelectedProject(null)}
// //         >
// //           <div
// //             className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             <div className="flex items-center justify-between p-6 border-b">
// //               <h2 className="text-xl font-semibold text-gray-900">
// //                 {selectedProject.title}
// //               </h2>
// //               <button
// //                 onClick={() => setSelectedProject(null)}
// //                 className="text-gray-400 hover:text-gray-600"
// //               >
// //                 <X size={24} />
// //               </button>
// //             </div>

// //             <div className="p-6">
// //               {selectedProject.attachments && selectedProject.attachments.length > 0 && selectedProject.attachments[0].imageUrl ? (
// //                 <img
// //                   src={selectedProject.attachments[0].imageUrl}
// //                   alt={selectedProject.title}
// //                   className="w-full h-auto rounded-lg mb-4"
// //                   onError={(e) => {
// //                     console.log('Modal image failed to load');
// //                     e.target.style.display = 'none';
// //                   }}
// //                 />
// //               ) : (
// //                 <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
// //                   <p className="text-gray-400">No image available</p>
// //                 </div>
// //               )}
// //               <div className="space-y-3">
// //                 <div>
// //                   <label className="text-sm font-medium text-gray-700">
// //                     Year:
// //                   </label>
// //                   <p className="text-gray-900">{selectedProject.year}</p>
// //                 </div>
// //                 <div>
// //                   <label className="text-sm font-medium text-gray-700">
// //                     Description:
// //                   </label>
// //                   <p className="text-gray-900">{selectedProject.description}</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default AdminProjects;

// import React, { useState, useEffect } from "react";
// import {
//   FolderKanban,
//   Search,
//   Plus,
//   Archive,
//   RotateCcw,
//   X,
//   Save,
//   Calendar,
// } from "lucide-react";
// import {
//   getProjects,
//   getArchivedProjects,
//   uploadProject,
//   archiveProject,
//   restoreProject,
// } from "../../api/projects";

// const AdminProjects = () => {
//   const [projects, setProjects] = useState([]);
//   const [archived, setArchived] = useState([]);
//   const [activeTab, setActiveTab] = useState("active");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     year: "",
//     location: "",
//     beneficiaries: "",
//     status: "Ongoing",
//     objectives: "",
//     partners: "",
//     image: null,
//   });

//   // Load projects
//   useEffect(() => {
//     fetchProjects();
//     fetchArchived();
//   }, []);

//   const fetchProjects = async () => {
//     try {
//       const data = await getProjects();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//     }
//   };

//   const fetchArchived = async () => {
//     try {
//       const data = await getArchivedProjects();
//       setArchived(data);
//     } catch (err) {
//       console.error("Error fetching archived:", err);
//     }
//   };

//   const openModal = (item = null) => {
//     if (item) {
//       setEditingItem(item);
//       setFormData({
//         title: item.title,
//         description: item.description,
//         year: item.year,
//         location: item.location || "",
//         beneficiaries: item.beneficiaries || "",
//         status: item.status || "Ongoing",
//         objectives: item.objectives || "",
//         partners: item.partners || "",
//         image: null,
//       });
//     } else {
//       setEditingItem(null);
//       setFormData({ 
//         title: "", 
//         description: "", 
//         year: "", 
//         location: "",
//         beneficiaries: "",
//         status: "Ongoing",
//         objectives: "",
//         partners: "",
//         image: null 
//       });
//     }
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditingItem(null);
//     setFormData({ 
//       title: "", 
//       description: "", 
//       year: "", 
//       location: "",
//       beneficiaries: "",
//       status: "Ongoing",
//       objectives: "",
//       partners: "",
//       image: null 
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.title || !formData.year) {
//       alert("Please fill in the title and year.");
//       return;
//     }

//     const fd = new FormData();
//     fd.append("title", formData.title);
//     fd.append("description", formData.description);
//     fd.append("year", formData.year);
//     fd.append("location", formData.location);
//     fd.append("beneficiaries", formData.beneficiaries);
//     fd.append("status", formData.status);
//     fd.append("objectives", formData.objectives);
//     fd.append("partners", formData.partners);
//     if (formData.image) fd.append("image", formData.image);

//     try {
//       await uploadProject(fd);
//       alert(editingItem ? "Project updated!" : "Project added!");
//       fetchProjects();
//       closeModal();
//     } catch (err) {
//       console.error("Error saving project:", err);
//       alert("Failed to save project.");
//     }
//   };

//   const handleArchive = async (id) => {
//     if (window.confirm("Archive this project?")) {
//       await archiveProject(id);
//       fetchProjects();
//       fetchArchived();
//     }
//   };

//   const handleRestore = async (id) => {
//     if (window.confirm("Restore this project?")) {
//       await restoreProject(id);
//       fetchProjects();
//       fetchArchived();
//     }
//   };

//   const filteredProjects = projects.filter(
//     (p) =>
//       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.description.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const filteredArchived = archived.filter(
//     (p) =>
//       p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.description.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             Gender and Development Projects
//           </h1>
//           <p className="text-gray-600">
//             Manage GAD projects, attachments, and archives.
//           </p>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-4 mb-6 border-b">
//           <button
//             onClick={() => setActiveTab("active")}
//             className={`pb-3 px-4 font-medium transition ${
//               activeTab === "active"
//                 ? "border-b-2 border-indigo-600 text-indigo-600"
//                 : "text-gray-600 hover:text-gray-900"
//             }`}
//           >
//             <div className="flex items-center gap-2">
//               <FolderKanban size={18} /> Active Projects
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab("archived")}
//             className={`pb-3 px-4 font-medium transition ${
//               activeTab === "archived"
//                 ? "border-b-2 border-indigo-600 text-indigo-600"
//                 : "text-gray-600 hover:text-gray-900"
//             }`}
//           >
//             <div className="flex items-center gap-2">
//               <Archive size={18} /> Archived Projects
//             </div>
//           </button>
//         </div>

//         {/* Search + Add */}
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
//           <div className="flex items-center w-full sm:w-96 border rounded-lg px-3 py-2 bg-white shadow-sm">
//             <Search className="text-gray-400 mr-2" size={18} />
//             <input
//               type="text"
//               placeholder="Search projects..."
//               className="flex-1 outline-none"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           {activeTab === "active" && (
//             <button
//               onClick={() => openModal()}
//               className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
//             >
//               <Plus size={18} /> Add Project
//             </button>
//           )}
//         </div>

//         {/* Projects Grid */}
//         {activeTab === "active" ? (
//           <ProjectGrid
//             projects={filteredProjects}
//             onArchive={handleArchive}
//             type="active"
//           />
//         ) : (
//           <ProjectGrid
//             projects={filteredArchived}
//             onRestore={handleRestore}
//             type="archived"
//           />
//         )}

//         {/* Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="flex items-center justify-between p-6 border-b">
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {editingItem ? "Edit Project" : "Add Project"}
//                 </h2>
//                 <button
//                   onClick={closeModal}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Title *
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full border rounded-lg px-3 py-2"
//                       value={formData.title}
//                       onChange={(e) =>
//                         setFormData({ ...formData, title: e.target.value })
//                       }
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Year *
//                     </label>
//                     <input
//                       type="number"
//                       min="1900"
//                       max="2100"
//                       placeholder="e.g., 2024"
//                       className="w-full border rounded-lg px-3 py-2"
//                       value={formData.year}
//                       onChange={(e) =>
//                         setFormData({ ...formData, year: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Description
//                   </label>
//                   <textarea
//                     rows={3}
//                     className="w-full border rounded-lg px-3 py-2"
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({ ...formData, description: e.target.value })
//                     }
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Location
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="e.g., Quezon City, Metro Manila"
//                       className="w-full border rounded-lg px-3 py-2"
//                       value={formData.location}
//                       onChange={(e) =>
//                         setFormData({ ...formData, location: e.target.value })
//                       }
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Status
//                     </label>
//                     <select
//                       className="w-full border rounded-lg px-3 py-2"
//                       value={formData.status}
//                       onChange={(e) =>
//                         setFormData({ ...formData, status: e.target.value })
//                       }
//                     >
//                       <option value="Planning">Planning</option>
//                       <option value="Ongoing">Ongoing</option>
//                       <option value="Completed">Completed</option>
//                       <option value="On Hold">On Hold</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Number of Beneficiaries
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="e.g., 150 women"
//                       className="w-full border rounded-lg px-3 py-2"
//                       value={formData.beneficiaries}
//                       onChange={(e) =>
//                         setFormData({ ...formData, beneficiaries: e.target.value })
//                       }
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Partners / Collaborators
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="e.g., Local Government, NGOs"
//                       className="w-full border rounded-lg px-3 py-2"
//                       value={formData.partners}
//                       onChange={(e) =>
//                         setFormData({ ...formData, partners: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Objectives
//                   </label>
//                   <textarea
//                     rows={2}
//                     placeholder="Key objectives and goals of the project"
//                     className="w-full border rounded-lg px-3 py-2"
//                     value={formData.objectives}
//                     onChange={(e) =>
//                       setFormData({ ...formData, objectives: e.target.value })
//                     }
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Image Attachment
//                   </label>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       setFormData({ ...formData, image: file });
//                     }}
//                     className="block w-full border rounded-lg px-3 py-2"
//                   />
//                   {formData.image && (
//                     <div className="mt-3">
//                       <p className="text-sm text-gray-600 mb-2">Preview:</p>
//                       <img
//                         src={URL.createObjectURL(formData.image)}
//                         alt="Preview"
//                         className="w-full h-48 object-cover rounded-lg border"
//                       />
//                     </div>
//                   )}
//                   {editingItem && editingItem.attachments?.length > 0 && !formData.image && (
//                     <div className="mt-3">
//                       <p className="text-sm text-gray-600 mb-2">Current Image:</p>
//                       <img
//                         src={editingItem.attachments[0].imageUrl}
//                         alt="Current"
//                         className="w-full h-48 object-cover rounded-lg border"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex justify-end gap-3 pt-6 border-t">
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2"
//                   >
//                     <Save size={16} />
//                     Save Project
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Display component
// const ProjectGrid = ({ projects, onArchive, onRestore, type }) => {
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [expandedYears, setExpandedYears] = useState({});
//   const ITEMS_PER_PAGE = 6;

//   const grouped = projects.reduce((acc, project) => {
//     acc[project.year] = acc[project.year] || [];
//     acc[project.year].push(project);
//     return acc;
//   }, {});

//   const toggleYear = (year) => {
//     setExpandedYears(prev => ({
//       ...prev,
//       [year]: !prev[year]
//     }));
//   };

//   return (
//     <div>
//       {Object.keys(grouped)
//         .sort((a, b) => b - a)
//         .map((year) => {
//           const yearProjects = grouped[year];
//           const isExpanded = expandedYears[year];
//           const displayedProjects = isExpanded ? yearProjects : yearProjects.slice(0, ITEMS_PER_PAGE);
//           const hasMore = yearProjects.length > ITEMS_PER_PAGE;

//           return (
//             <div key={year} className="mb-8">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//                   <Calendar size={18} /> {year}
//                   <span className="text-sm font-normal text-gray-500">
//                     ({yearProjects.length} {yearProjects.length === 1 ? 'project' : 'projects'})
//                   </span>
//                 </h3>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {displayedProjects.map((item) => (
//                 <div key={item._id}>
//                   <div
//                     className="bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
//                     onClick={() => {
//                       console.log('Project clicked:', item);
//                       console.log('Attachments:', item.attachments);
//                       setSelectedProject(item);
//                     }}
//                   >
//                     {item.attachments && item.attachments.length > 0 && item.attachments[0].imageUrl ? (
//                       <img
//                         src={item.attachments[0].imageUrl}
//                         alt={item.title}
//                         className="w-full h-40 object-cover"
//                         onError={(e) => {
//                           console.log('Image failed to load:', item.attachments[0].imageUrl);
//                           e.target.style.display = 'none';
//                         }}
//                       />
//                     ) : (
//                       <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
//                         <p className="text-gray-400">No image</p>
//                       </div>
//                     )}
//                     <div className="p-4">
//                       <h4 className="text-lg font-semibold text-gray-900 mb-1">
//                         {item.title}
//                       </h4>
//                       {item.status && (
//                         <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
//                           item.status === 'Completed' ? 'bg-green-100 text-green-700' :
//                           item.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
//                           item.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
//                           'bg-gray-100 text-gray-700'
//                         }`}>
//                           {item.status}
//                         </span>
//                       )}
//                       <p className="text-sm text-gray-600 mb-2 line-clamp-2">
//                         {item.description}
//                       </p>
//                       {item.location && (
//                         <p className="text-xs text-gray-500 mb-1">📍 {item.location}</p>
//                       )}
//                       {item.beneficiaries && (
//                         <p className="text-xs text-gray-500">👥 {item.beneficiaries}</p>
//                       )}
//                       <div className="flex gap-2 pt-3 border-t">
//                         {type === "active" ? (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onArchive(item._id);
//                             }}
//                             className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition"
//                           >
//                             <Archive size={16} /> Archive
//                           </button>
//                         ) : (
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onRestore(item._id);
//                             }}
//                             className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 transition"
//                           >
//                             <RotateCcw size={16} /> Restore
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
            
//             {hasMore && (
//               <div className="mt-4 text-center">
//                 <button
//                   onClick={() => toggleYear(year)}
//                   className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium hover:bg-indigo-50 rounded-lg transition"
//                 >
//                   {isExpanded ? 'Show Less' : `See More (${yearProjects.length - ITEMS_PER_PAGE} more)`}
//                 </button>
//               </div>
//             )}
//           </div>
//         );
//       })}

//       {/* Preview Modal */}
//       {selectedProject && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
//           onClick={() => setSelectedProject(null)}
//         >
//           <div
//             className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between p-6 border-b">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 {selectedProject.title}
//               </h2>
//               <button
//                 onClick={() => setSelectedProject(null)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="p-6">
//               {selectedProject.attachments && selectedProject.attachments.length > 0 && selectedProject.attachments[0].imageUrl ? (
//                 <img
//                   src={selectedProject.attachments[0].imageUrl}
//                   alt={selectedProject.title}
//                   className="w-full h-auto rounded-lg mb-4"
//                   onError={(e) => {
//                     console.log('Modal image failed to load');
//                     e.target.style.display = 'none';
//                   }}
//                 />
//               ) : (
//                 <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
//                   <p className="text-gray-400">No image available</p>
//                 </div>
//               )}
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-xs font-medium text-gray-500 uppercase">
//                         Year
//                       </label>
//                       <p className="text-gray-900 mt-1">{selectedProject.year}</p>
//                     </div>
//                     {selectedProject.status && (
//                       <div>
//                         <label className="text-xs font-medium text-gray-500 uppercase">
//                           Status
//                         </label>
//                         <p className="text-gray-900 mt-1">
//                           <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
//                             selectedProject.status === 'Completed' ? 'bg-green-100 text-green-700' :
//                             selectedProject.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
//                             selectedProject.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
//                             'bg-gray-100 text-gray-700'
//                           }`}>
//                             {selectedProject.status}
//                           </span>
//                         </p>
//                       </div>
//                     )}
//                     {selectedProject.location && (
//                       <div>
//                         <label className="text-xs font-medium text-gray-500 uppercase">
//                           Location
//                         </label>
//                         <p className="text-gray-900 mt-1">{selectedProject.location}</p>
//                       </div>
//                     )}
//                     {selectedProject.beneficiaries && (
//                       <div>
//                         <label className="text-xs font-medium text-gray-500 uppercase">
//                           Beneficiaries
//                         </label>
//                         <p className="text-gray-900 mt-1">{selectedProject.beneficiaries}</p>
//                       </div>
//                     )}
//                     {selectedProject.partners && (
//                       <div>
//                         <label className="text-xs font-medium text-gray-500 uppercase">
//                           Partners
//                         </label>
//                         <p className="text-gray-900 mt-1">{selectedProject.partners}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 {selectedProject.description && (
//                   <div>
//                     <label className="text-xs font-medium text-gray-500 uppercase">
//                       Description
//                     </label>
//                     <p className="text-gray-900 mt-1 leading-relaxed">{selectedProject.description}</p>
//                   </div>
//                 )}
                
//                 {selectedProject.objectives && (
//                   <div>
//                     <label className="text-xs font-medium text-gray-500 uppercase">
//                       Objectives
//                     </label>
//                     <p className="text-gray-900 mt-1 leading-relaxed">{selectedProject.objectives}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminProjects;
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, Users, Target, Plus, Edit2, Archive, X, Save } from 'lucide-react';

const GADProgramsViewer = () => {
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({});

  const [gadData, setGadData] = useState([
    {
      id: 1,
      name: "Gender Mainstreaming Program",
      description: "Integration ng gender perspective sa lahat ng policies at programs",
      archived: false,
      projects: [
        {
          id: 101,
          name: "GAD Training and Capacity Building",
          budget: "₱500,000",
          archived: false,
          events: [
            {
              id: 1001,
              title: "Gender Sensitivity Training",
              date: "March 15, 2025",
              participants: 50,
              venue: "City Hall Conference Room",
              archived: false
            },
            {
              id: 1002,
              title: "GAD Planning Workshop",
              date: "April 20, 2025",
              participants: 30,
              venue: "Community Center",
              archived: false
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: "Women Empowerment Program",
      description: "Pagpapalakas ng kapangyarihan ng kababaihan sa lipunan",
      archived: false,
      projects: [
        {
          id: 201,
          name: "Women's Livelihood Development",
          budget: "₱800,000",
          archived: false,
          events: [
            {
              id: 2001,
              title: "Entrepreneurship Training for Women",
              date: "June 5, 2025",
              participants: 75,
              venue: "Trade Center",
              archived: false
            }
          ]
        }
      ]
    }
  ]);

  const toggleProgram = (programId) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const openModal = (type, action, program = null, project = null, event = null) => {
    setModalType(type);
    setModalAction(action);
    setSelectedProgram(program);
    setSelectedProject(project);
    
    if (action === 'edit') {
      if (type === 'program') {
        setFormData({ name: program.name, description: program.description });
      } else if (type === 'project') {
        setFormData({ name: project.name, budget: project.budget });
      } else if (type === 'event') {
        setFormData(event);
      }
    } else {
      setFormData({});
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setSelectedProgram(null);
    setSelectedProject(null);
  };

  const handleSubmit = () => {
    if (modalType === 'program') {
      if (modalAction === 'add') {
        const newProgram = {
          id: Date.now(),
          name: formData.name,
          description: formData.description,
          archived: false,
          projects: []
        };
        setGadData([...gadData, newProgram]);
      } else if (modalAction === 'edit') {
        setGadData(gadData.map(prog => 
          prog.id === selectedProgram.id 
            ? { ...prog, name: formData.name, description: formData.description }
            : prog
        ));
      }
    } else if (modalType === 'project') {
      setGadData(gadData.map(prog => {
        if (prog.id === selectedProgram.id) {
          if (modalAction === 'add') {
            const newProject = {
              id: Date.now(),
              name: formData.name,
              budget: formData.budget,
              archived: false,
              events: []
            };
            return { ...prog, projects: [...prog.projects, newProject] };
          } else if (modalAction === 'edit') {
            return {
              ...prog,
              projects: prog.projects.map(proj =>
                proj.id === selectedProject.id
                  ? { ...proj, name: formData.name, budget: formData.budget }
                  : proj
              )
            };
          }
        }
        return prog;
      }));
    } else if (modalType === 'event') {
      setGadData(gadData.map(prog => {
        if (prog.id === selectedProgram.id) {
          return {
            ...prog,
            projects: prog.projects.map(proj => {
              if (proj.id === selectedProject.id) {
                if (modalAction === 'add') {
                  const newEvent = {
                    id: Date.now(),
                    ...formData,
                    participants: parseInt(formData.participants) || 0,
                    archived: false
                  };
                  return { ...proj, events: [...proj.events, newEvent] };
                } else if (modalAction === 'edit') {
                  return {
                    ...proj,
                    events: proj.events.map(evt =>
                      evt.id === formData.id ? { ...formData, participants: parseInt(formData.participants) } : evt
                    )
                  };
                }
              }
              return proj;
            })
          };
        }
        return prog;
      }));
    }
    
    closeModal();
  };

  const handleArchive = (type, programId, projectId = null, eventId = null) => {
    if (type === 'program') {
      setGadData(gadData.map(prog =>
        prog.id === programId ? { ...prog, archived: !prog.archived } : prog
      ));
    } else if (type === 'project') {
      setGadData(gadData.map(prog => {
        if (prog.id === programId) {
          return {
            ...prog,
            projects: prog.projects.map(proj =>
              proj.id === projectId ? { ...proj, archived: !proj.archived } : proj
            )
          };
        }
        return prog;
      }));
    } else if (type === 'event') {
      setGadData(gadData.map(prog => {
        if (prog.id === programId) {
          return {
            ...prog,
            projects: prog.projects.map(proj => {
              if (proj.id === projectId) {
                return {
                  ...proj,
                  events: proj.events.map(evt =>
                    evt.id === eventId ? { ...evt, archived: !evt.archived } : evt
                  )
                };
              }
              return proj;
            })
          };
        }
        return prog;
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-8 h-8 text-blue-600" />
                GAD Programs at Proyekto
              </h1>
              <p className="text-gray-500 text-sm">
                Gender and Development Programs Management (SuperAdmin)
              </p>
            </div>
            <button
              onClick={() => openModal('program', 'add')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add Program</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{gadData.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {gadData.reduce((acc, prog) => acc + prog.projects.filter(p => !p.archived).length, 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {gadData.reduce((acc, prog) => acc + prog.projects.reduce((pAcc, proj) => pAcc + proj.events.length, 0), 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Archived</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {gadData.filter(prog => prog.archived).length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Archive className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-4">
          {gadData.map((program) => (
            <div key={program.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${program.archived ? 'opacity-60' : ''}`}>
              {/* Program Header */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => toggleProgram(program.id)}>
                    {expandedPrograms[program.id] ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    <Target className="w-5 h-5" />
                    <div>
                      <h2 className="text-xl font-bold">
                        {program.name} {program.archived && '(Archived)'}
                      </h2>
                      <p className="text-blue-100 text-sm">{program.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {program.projects.length} Projects
                    </span>
                    <button
                      onClick={() => openModal('program', 'edit', program)}
                      className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                      title="Edit Program"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchive('program', program.id)}
                      className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                      title={program.archived ? "Unarchive" : "Archive"}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {expandedPrograms[program.id] && !program.archived && (
                  <button
                    onClick={() => openModal('project', 'add', program)}
                    className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 hover:bg-opacity-30 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </button>
                )}
              </div>

              {/* Projects List */}
              {expandedPrograms[program.id] && (
                <div className="p-6 bg-gray-50">
                  {program.projects.map((project) => (
                    <div key={project.id} className={`mb-4 last:mb-0 ${project.archived ? 'opacity-60' : ''}`}>
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => toggleProject(project.id)}>
                              {expandedProjects[project.id] ? <ChevronDown className="w-5 h-5 text-blue-600" /> : <ChevronRight className="w-5 h-5 text-blue-600" />}
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {project.name} {project.archived && '(Archived)'}
                                </h3>
                                <p className="text-sm text-gray-600">Budget: {project.budget}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-semibold">
                                {project.events.length} Events
                              </span>
                              <button
                                onClick={() => openModal('project', 'edit', program, project)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                title="Edit Project"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleArchive('project', program.id, project.id)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                title={project.archived ? "Unarchive" : "Archive"}
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {expandedProjects[project.id] && !project.archived && (
                            <button
                              onClick={() => openModal('event', 'add', program, project)}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 mb-3 shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Event</span>
                            </button>
                          )}

                          {expandedProjects[project.id] && (
                            <div className="border-t border-gray-200 pt-3 space-y-2">
                              {project.events.map((event) => (
                                <div key={event.id} className={`bg-gray-50 p-3 rounded-lg border border-gray-200 ${event.archived ? 'opacity-60' : ''}`}>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-1">
                                        {event.title} {event.archived && '(Archived)'}
                                      </h4>
                                      <div className="text-sm text-gray-700 space-y-1">
                                        <p className="flex items-center">
                                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                          {event.date}
                                        </p>
                                        <p className="flex items-center">
                                          <Users className="w-4 h-4 mr-2 text-blue-600" />
                                          {event.participants} participants
                                        </p>
                                        <p className="text-gray-600">📍 {event.venue}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => openModal('event', 'edit', program, project, event)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                        title="Edit Event"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleArchive('event', program.id, project.id, event.id)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                        title={event.archived ? "Unarchive" : "Archive"}
                                      >
                                        <Archive className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {modalAction === 'add' ? 'Add' : 'Edit'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                  </h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {modalType === 'program' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Program Name
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter program name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          rows="3"
                          placeholder="Enter program description"
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'project' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Project Name
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter project name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget
                        </label>
                        <input
                          type="text"
                          value={formData.budget || ''}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="₱500,000"
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'event' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Event Title
                        </label>
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter event title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="text"
                          value={formData.date || ''}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="March 15, 2025"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Participants
                        </label>
                        <input
                          type="number"
                          value={formData.participants || ''}
                          onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Venue
                        </label>
                        <input
                          type="text"
                          value={formData.venue || ''}
                          onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter venue"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GADProgramsViewer;