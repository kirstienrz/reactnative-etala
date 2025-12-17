// // import React, { useEffect, useState } from "react";
// // import {
// //   getAccomplishments,
// //   getArchivedAccomplishments,
// //   uploadAccomplishment,
// //   archiveAccomplishment,
// //   restoreAccomplishment,
// // } from "../../api/accomplishments";
// // import { FileText } from "lucide-react";

// // const Accomplishments = () => {
// //   const [reports, setReports] = useState([]);
// //   const [viewArchived, setViewArchived] = useState(false);
// //   const [loading, setLoading] = useState(true);

// //   const [title, setTitle] = useState("");
// //   const [year, setYear] = useState("");
// //   const [file, setFile] = useState(null);

// //   const [error, setError] = useState("");
// //   const [success, setSuccess] = useState("");

// //   useEffect(() => {
// //     fetchReports();
// //   }, [viewArchived]);

// //   const fetchReports = async () => {
// //     try {
// //       setLoading(true);
// //       const data = viewArchived
// //         ? await getArchivedAccomplishments()
// //         : await getAccomplishments();
// //       setReports(data);
// //     } catch (err) {
// //       setError("Failed to load accomplishment reports");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleUpload = async (e) => {
// //     e.preventDefault();
// //     setError("");
// //     setSuccess("");

// //     if (!title || !year || !file) {
// //       setError("All fields are required");
// //       return;
// //     }

// //     const formData = new FormData();
// //     formData.append("title", title);
// //     formData.append("year", year);
// //     formData.append("file", file); // MUST be "file"

// //     try {
// //       await uploadAccomplishment(formData);
// //       setSuccess("Accomplishment report uploaded successfully");
// //       setTitle("");
// //       setYear("");
// //       setFile(null);
// //       fetchReports();
// //     } catch (err) {
// //       setError("Failed to upload accomplishment report");
// //     }
// //   };

// //   const handleArchive = async (id) => {
// //     if (!window.confirm("Archive this accomplishment report?")) return;
// //     await archiveAccomplishment(id);
// //     fetchReports();
// //   };

// //   const handleRestore = async (id) => {
// //     if (!window.confirm("Restore this accomplishment report?")) return;
// //     await restoreAccomplishment(id);
// //     fetchReports();
// //   };

// //   if (loading) {
// //     return <p className="text-gray-600">Loading accomplishment reports...</p>;
// //   }

// //   return (
// //     <div className="max-w-6xl mx-auto p-6">
// //       {/* Header */}
// //       <div className="flex justify-between items-center mb-6">
// //         <div>
// //           <h2 className="text-2xl font-bold">Accomplishment Reports</h2>
// //           <p className="text-gray-600">
// //             {viewArchived
// //               ? "View archived accomplishment reports"
// //               : "Upload and manage accomplishment reports"}
// //           </p>
// //         </div>
// //         <button
// //           onClick={() => setViewArchived(!viewArchived)}
// //           className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
// //         >
// //           {viewArchived ? "View Active" : "View Archived"}
// //         </button>
// //       </div>

// //       {/* Alerts */}
// //       {error && (
// //         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
// //       )}
// //       {success && (
// //         <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
// //           {success}
// //         </div>
// //       )}

// //       {/* Upload Section */}
// //       {!viewArchived && (
// //         <div className="mb-8 bg-white border rounded-lg p-6 shadow-sm">
// //           <h3 className="font-semibold mb-4">Upload Accomplishment Report</h3>

// //           <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-3">
// //             <input
// //               type="text"
// //               placeholder="Report Title"
// //               value={title}
// //               onChange={(e) => setTitle(e.target.value)}
// //               className="border rounded-lg px-3 py-2"
// //             />

// //             <input
// //               type="number"
// //               placeholder="Year (e.g. 2024)"
// //               value={year}
// //               onChange={(e) => setYear(e.target.value)}
// //               className="border rounded-lg px-3 py-2"
// //             />

// //             <input
// //               type="file"
// //               accept="application/pdf"
// //               onChange={(e) => setFile(e.target.files[0])}
// //               className="border rounded-lg px-3 py-2"
// //             />

// //             <button
// //               type="submit"
// //               className="md:col-span-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
// //             >
// //               Upload PDF
// //             </button>
// //           </form>
// //         </div>
// //       )}

// //       {/* Reports List */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //         {reports.length === 0 ? (
// //           <p className="text-gray-500 col-span-full text-center">
// //             No accomplishment reports found
// //           </p>
// //         ) : (
// //           reports.map((report) => (
// //             <div
// //               key={report._id}
// //               className="border rounded-lg p-4 shadow-sm bg-white"
// //             >
// //               <div className="flex items-start gap-3 mb-3">
// //                 <FileText size={36} className="text-red-600" />
// //                 <div>
// //                   <p className="font-semibold">{report.title}</p>
// //                   <p className="text-sm text-gray-500">
// //                     Year: {report.year}
// //                   </p>
// //                 </div>
// //               </div>

// //               <div className="flex justify-between items-center mt-4">
// //                 <a
// //                   href={report.fileUrl}
// //                   target="_blank"
// //                   rel="noopener noreferrer"
// //                   className="text-blue-600 text-sm hover:underline"
// //                 >
// //                   View PDF
// //                 </a>

// //                 {viewArchived ? (
// //                   <button
// //                     onClick={() => handleRestore(report._id)}
// //                     className="text-green-600 text-sm hover:underline"
// //                   >
// //                     Restore
// //                   </button>
// //                 ) : (
// //                   <button
// //                     onClick={() => handleArchive(report._id)}
// //                     className="text-yellow-600 text-sm hover:underline"
// //                   >
// //                     Archive
// //                   </button>
// //                 )}
// //               </div>
// //             </div>
// //           ))
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Accomplishments;
// import React, { useEffect, useState } from "react";
// import {
//   getAccomplishments,
//   getArchivedAccomplishments,
//   uploadAccomplishment,
//   archiveAccomplishment,
//   restoreAccomplishment,
// } from "../../api/accomplishments";
// import { FileText } from "lucide-react";

// const Accomplishments = () => {
//   const [reports, setReports] = useState([]);
//   const [viewArchived, setViewArchived] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const [title, setTitle] = useState("");
//   const [year, setYear] = useState("");
//   const [file, setFile] = useState(null);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     fetchReports();
//   }, [viewArchived]);

//   const fetchReports = async () => {
//     try {
//       setLoading(true);
//       const data = viewArchived
//         ? await getArchivedAccomplishments()
//         : await getAccomplishments();
//       setReports(data);
//     } catch (err) {
//       setError("Failed to load accomplishment reports");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Validation function for year
//   const validateYear = (yearValue) => {
//     const currentYear = new Date().getFullYear();
//     const minYear = 1900; // Adjust this based on your requirements
    
//     if (!yearValue) {
//       return "Year is required";
//     }
    
//     const yearNum = parseInt(yearValue);
    
//     if (isNaN(yearNum)) {
//       return "Year must be a valid number";
//     }
    
//     if (yearNum < minYear || yearNum > currentYear) {
//       return `Year must be between ${minYear} and ${currentYear}`;
//     }
    
//     if (yearValue.length !== 4) {
//       return "Year must be 4 digits (e.g. 2024)";
//     }
    
//     return ""; // No error
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     // Validate all fields
//     if (!title || !year || !file) {
//       setError("All fields are required");
//       return;
//     }

//     // Validate year specifically
//     const yearError = validateYear(year);
//     if (yearError) {
//       setError(yearError);
//       return;
//     }

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("year", year);
//     formData.append("file", file); // MUST be "file"

//     try {
//       await uploadAccomplishment(formData);
//       setSuccess("Accomplishment report uploaded successfully");
//       setTitle("");
//       setYear("");
//       setFile(null);
//       fetchReports();
//     } catch (err) {
//       setError("Failed to upload accomplishment report");
//     }
//   };

//   const handleArchive = async (id) => {
//     if (!window.confirm("Archive this accomplishment report?")) return;
//     await archiveAccomplishment(id);
//     fetchReports();
//   };

//   const handleRestore = async (id) => {
//     if (!window.confirm("Restore this accomplishment report?")) return;
//     await restoreAccomplishment(id);
//     fetchReports();
//   };

//   // Handle year input change with validation
//   const handleYearChange = (e) => {
//     const value = e.target.value;
//     setYear(value);
    
//     // Optional: Show validation error as user types (for better UX)
//     if (value && value.length === 4) {
//       const errorMsg = validateYear(value);
//       if (errorMsg) {
//         // You could set a separate validation state here for real-time feedback
//         // For now, we'll just clear any previous errors
//         setError("");
//       }
//     }
//   };

//   if (loading) {
//     return <p className="text-gray-600">Loading accomplishment reports...</p>;
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold">Accomplishment Reports</h2>
//           <p className="text-gray-600">
//             {viewArchived
//               ? "View archived accomplishment reports"
//               : "Upload and manage accomplishment reports"}
//           </p>
//         </div>
//         <button
//           onClick={() => setViewArchived(!viewArchived)}
//           className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
//         >
//           {viewArchived ? "View Active" : "View Archived"}
//         </button>
//       </div>

//       {/* Alerts */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
//       )}
//       {success && (
//         <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
//           {success}
//         </div>
//       )}

//       {/* Upload Section */}
//       {!viewArchived && (
//         <div className="mb-8 bg-white border rounded-lg p-6 shadow-sm">
//           <h3 className="font-semibold mb-4">Upload Accomplishment Report</h3>

//           <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-3">
//             <input
//               type="text"
//               placeholder="Report Title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="border rounded-lg px-3 py-2"
//             />

//             <input
//               type="number"
//               placeholder="Year (e.g. 2024)"
//               value={year}
//               onChange={handleYearChange}
//               min="1900"
//               max={new Date().getFullYear()}
//               className="border rounded-lg px-3 py-2"
//             />

//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={(e) => setFile(e.target.files[0])}
//               className="border rounded-lg px-3 py-2"
//             />

//             <button
//               type="submit"
//               className="md:col-span-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
//             >
//               Upload PDF
//             </button>
//           </form>
//         </div>
//       )}

//       {/* Reports List */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {reports.length === 0 ? (
//           <p className="text-gray-500 col-span-full text-center">
//             No accomplishment reports found
//           </p>
//         ) : (
//           reports.map((report) => (
//             <div
//               key={report._id}
//               className="border rounded-lg p-4 shadow-sm bg-white"
//             >
//               <div className="flex items-start gap-3 mb-3">
//                 <FileText size={36} className="text-red-600" />
//                 <div>
//                   <p className="font-semibold">{report.title}</p>
//                   <p className="text-sm text-gray-500">
//                     Year: {report.year}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex justify-between items-center mt-4">
//                 <a
//                   href={report.fileUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 text-sm hover:underline"
//                 >
//                   View PDF
//                 </a>

//                 {viewArchived ? (
//                   <button
//                     onClick={() => handleRestore(report._id)}
//                     className="text-green-600 text-sm hover:underline"
//                   >
//                     Restore
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => handleArchive(report._id)}
//                     className="text-yellow-600 text-sm hover:underline"
//                   >
//                     Archive
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Accomplishments;

import React, { useEffect, useState } from "react";
import {
  getAccomplishments,
  getArchivedAccomplishments,
  uploadAccomplishment,
  archiveAccomplishment,
  restoreAccomplishment,
} from "../../api/accomplishments";
import { FileText, Loader2 } from "lucide-react";

const Accomplishments = () => {
  const [reports, setReports] = useState([]);
  const [viewArchived, setViewArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [archiving, setArchiving] = useState({});
  const [restoring, setRestoring] = useState({});

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReports();
  }, [viewArchived]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = viewArchived
        ? await getArchivedAccomplishments()
        : await getAccomplishments();
      setReports(data);
    } catch (err) {
      setError("Failed to load accomplishment reports");
    } finally {
      setLoading(false);
    }
  };

  // Validation function for title
  const validateTitle = (titleValue) => {
    if (!titleValue.trim()) {
      return "Report title is required";
    }

    if (titleValue.trim().length < 3) {
      return "Title must be at least 3 characters long";
    }

    if (titleValue.trim().length > 100) {
      return "Title must be less than 100 characters";
    }

    // Check if title is purely numeric
    if (/^\d+$/.test(titleValue.trim())) {
      return "Title cannot be purely numeric";
    }

    // Optional: Check if title contains at least one letter
    if (!/[a-zA-Z]/.test(titleValue)) {
      return "Title must contain at least one letter";
    }

    return ""; // No error
  };

  // Validation function for year
  const validateYear = (yearValue) => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900; // Adjust this based on your requirements
    
    if (!yearValue) {
      return "Year is required";
    }
    
    const yearNum = parseInt(yearValue);
    
    if (isNaN(yearNum)) {
      return "Year must be a valid number";
    }
    
    if (yearNum < minYear || yearNum > currentYear) {
      return `Year must be between ${minYear} and ${currentYear}`;
    }
    
    if (yearValue.length !== 4) {
      return "Year must be 4 digits (e.g. 2024)";
    }
    
    return ""; // No error
  };

  // Validation function for file type
  const validateFile = (file) => {
    if (!file) {
      return "File is required";
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.pdf'];
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      return "Only PDF files are allowed";
    }

    // Check MIME type as well for extra security
    const validMimeTypes = ['application/pdf'];
    if (!validMimeTypes.includes(file.type)) {
      return "File must be a PDF document";
    }

    // Optional: Check file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    return ""; // No error
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate all fields
    if (!title || !year || !file) {
      setError("All fields are required");
      return;
    }

    // Validate title specifically
    const titleError = validateTitle(title);
    if (titleError) {
      setError(titleError);
      return;
    }

    // Validate year specifically
    const yearError = validateYear(year);
    if (yearError) {
      setError(yearError);
      return;
    }

    // Validate file specifically
    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("year", year);
    formData.append("file", file); // MUST be "file"

    try {
      await uploadAccomplishment(formData);
      setSuccess("Accomplishment report uploaded successfully");
      setTitle("");
      setYear("");
      setFile(null);
      fetchReports();
    } catch (err) {
      setError("Failed to upload accomplishment report");
    } finally {
      setUploading(false);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Archive this accomplishment report?")) return;
    
    setArchiving(prev => ({ ...prev, [id]: true }));
    
    try {
      await archiveAccomplishment(id);
      fetchReports();
    } catch (err) {
      setError("Failed to archive accomplishment report");
    } finally {
      setArchiving(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Restore this accomplishment report?")) return;
    
    setRestoring(prev => ({ ...prev, [id]: true }));
    
    try {
      await restoreAccomplishment(id);
      fetchReports();
    } catch (err) {
      setError("Failed to restore accomplishment report");
    } finally {
      setRestoring(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle title input change with validation
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    
    // Clear any previous title errors when user starts typing
    if (error && (error.includes("Title") || error.includes("title"))) {
      setError("");
    }
  };

  // Handle year input change with validation
  const handleYearChange = (e) => {
    const value = e.target.value;
    setYear(value);
    
    // Clear any previous year errors when user starts typing
    if (value && value.length === 4) {
      const errorMsg = validateYear(value);
      if (errorMsg) {
        setError("");
      }
    }
  };

  // Handle file selection with validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file immediately when selected
    const fileError = validateFile(selectedFile);
    if (fileError) {
      setError(fileError);
      setFile(null);
      // Clear the file input
      e.target.value = "";
      return;
    }

    // Clear any previous errors if file is valid
    if (error && (error.includes("file") || error.includes("File"))) {
      setError("");
    }
    
    setFile(selectedFile);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading accomplishment reports...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Accomplishment Reports</h2>
          <p className="text-gray-600">
            {viewArchived
              ? "View archived accomplishment reports"
              : "Upload and manage accomplishment reports"}
          </p>
        </div>
        <button
          onClick={() => setViewArchived(!viewArchived)}
          disabled={loading}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {viewArchived ? "View Active" : "View Archived"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Upload Section */}
      {!viewArchived && (
        <div className="mb-8 bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Upload Accomplishment Report</h3>

          <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-3">
            <div>
              <input
                type="text"
                placeholder="Report Title (e.g., Annual Report 2024)"
                value={title}
                onChange={handleTitleChange}
                className="border rounded-lg px-3 py-2 w-full"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must contain letters, at least 3 characters
              </p>
            </div>

            <div>
              <input
                type="number"
                placeholder="Year (e.g. 2024)"
                value={year}
                onChange={handleYearChange}
                min="1900"
                max={new Date().getFullYear()}
                className="border rounded-lg px-3 py-2 w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be 4 digits, between 1900-{new Date().getFullYear()}
              </p>
            </div>

            <div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="border rounded-lg px-3 py-2 w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Only PDF files allowed (max 10MB)
              </p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="md:col-span-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload PDF"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No {viewArchived ? "archived" : "active"} accomplishment reports found
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report._id}
              className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <FileText size={36} className="text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold truncate">{report.title}</p>
                  <p className="text-sm text-gray-500">
                    Year: {report.year}
                  </p>
                  {report.uploadedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                >
                  View PDF
                </a>

                {viewArchived ? (
                  <button
                    onClick={() => handleRestore(report._id)}
                    disabled={restoring[report._id]}
                    className="text-green-600 text-sm hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {restoring[report._id] ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Restoring...
                      </>
                    ) : (
                      "Restore"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleArchive(report._id)}
                    disabled={archiving[report._id]}
                    className="text-yellow-600 text-sm hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {archiving[report._id] ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Archiving...
                      </>
                    ) : (
                      "Archive"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Accomplishments;