// import React, { useState, useEffect } from "react";
// import {
//   getCarouselImages,
//   getArchivedCarouselImages,
//   uploadCarouselImage,
//   archiveCarouselImage,
//   restoreCarouselImage,
// } from "../../api/carousel";

// export default function CarouselManagement() {
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null); // 👈 preview URL state
//   const [viewArchived, setViewArchived] = useState(false);

//   useEffect(() => {
//     fetchImages();
//   }, [viewArchived]);

//   const fetchImages = async () => {
//     try {
//       setLoading(true);
//       const data = viewArchived
//         ? await getArchivedCarouselImages()
//         : await getCarouselImages();
//       setImages(data);
//     } catch (err) {
//       setError("Failed to load carousel images");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setSelectedFile(file);
    
//     // Create preview URL 👈
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     } else {
//       setPreviewUrl(null);
//     }
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!selectedFile) {
//       setError("Please select an image first");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("image", selectedFile);
//       await uploadCarouselImage(formData);
//       setSuccess("Image uploaded successfully!");
//       setSelectedFile(null);
//       setPreviewUrl(null); // 👈 clear preview after upload
//       fetchImages();
//     } catch (err) {
//       setError("Failed to upload image");
//     }
//   };

//   const handleArchive = async (id) => {
//     if (!window.confirm("Are you sure you want to archive this image?")) return;

//     try {
//       await archiveCarouselImage(id);
//       setSuccess("Image archived successfully!");
//       fetchImages();
//     } catch (err) {
//       setError("Failed to archive image");
//     }
//   };

//   const handleRestore = async (id) => {
//     if (!window.confirm("Restore this image?")) return;

//     try {
//       await restoreCarouselImage(id);
//       setSuccess("Image restored successfully!");
//       fetchImages();
//     } catch (err) {
//       setError("Failed to restore image");
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p className="text-gray-600 text-xl">Loading...</p>
//       </div>
//     );

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Carousel Management
//         </h1>
//         <button
//           onClick={() => setViewArchived(!viewArchived)}
//           className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
//         >
//           {viewArchived ? "View Active Images" : "View Archived Images"}
//         </button>
//       </div>

//       <p className="text-gray-600 mb-6">
//         {viewArchived
//           ? "View and restore archived carousel images."
//           : "Upload and manage active carousel images displayed in the system."}
//       </p>

//       {error && (
//         <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
//           {success}
//         </div>
//       )}

//       {/* Upload form with preview */}
//       {!viewArchived && (
//         <div className="mb-6">
//           <form onSubmit={handleUpload} className="flex items-center gap-3">
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md 
//                 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
//                 hover:file:bg-blue-100"
//             />
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//             >
//               Upload
//             </button>
//           </form>
          
//           {/* Image Preview 👈 new preview section */}
//           {previewUrl && (
//             <div className="mt-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
//               <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
//               <img
//                 src={previewUrl}
//                 alt="Preview"
//                 className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
//               />
//             </div>
//           )}
//         </div>
//       )}

//       {/* Carousel Images */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {images.length === 0 ? (
//           <p className="text-gray-500 text-center col-span-full">
//             {viewArchived ? "No archived images found." : "No images found."}
//           </p>
//         ) : (
//           images.map((img) => (
//             <div
//               key={img._id}
//               className="relative border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
//             >
//               <img
//                 src={img.imageUrl}
//                 alt="Carousel"
//                 className="w-full h-48 object-cover"
//               />
//               <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white text-sm px-2 py-1 flex justify-between items-center">
//                 <span>{new Date(img.createdAt).toLocaleDateString()}</span>
//                 {viewArchived ? (
//                   <button
//                     onClick={() => handleRestore(img._id)}
//                     className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
//                   >
//                     Restore
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => handleArchive(img._id)}
//                     className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-xs"
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
// }


import React, { useState, useEffect } from "react";
import {
  getCarouselImages,
  getArchivedCarouselImages,
  uploadCarouselImage,
  archiveCarouselImage,
  restoreCarouselImage,
} from "../../api/carousel";

export default function CarouselManagement() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);
  const [modalImage, setModalImage] = useState(null); // 👈 for modal

  useEffect(() => {
    fetchImages();
  }, [viewArchived]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = viewArchived
        ? await getArchivedCarouselImages()
        : await getCarouselImages();
      setImages(data);
    } catch (err) {
      setError("Failed to load carousel images");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      await uploadCarouselImage(formData);
      setSuccess("Image uploaded successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchImages();
    } catch (err) {
      setError("Failed to upload image");
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this image?")) return;

    try {
      await archiveCarouselImage(id);
      setSuccess("Image archived successfully!");
      fetchImages();
    } catch (err) {
      setError("Failed to archive image");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Restore this image?")) return;

    try {
      await restoreCarouselImage(id);
      setSuccess("Image restored successfully!");
      fetchImages();
    } catch (err) {
      setError("Failed to restore image");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 text-xl">Loading...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Carousel Management
        </h1>
        <button
          onClick={() => setViewArchived(!viewArchived)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
        >
          {viewArchived ? "View Active Images" : "View Archived Images"}
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        {viewArchived
          ? "View and restore archived carousel images."
          : "Upload and manage active carousel images displayed in the system."}
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Upload form with preview */}
      {!viewArchived && (
        <div className="mb-6">
          <form onSubmit={handleUpload} className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md 
                file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                hover:file:bg-blue-100"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Upload
            </button>
          </form>
          
          {/* Image Preview - clickable 👈 */}
          {previewUrl && (
            <div className="mt-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                onClick={() => setModalImage(previewUrl)}
                className="w-full max-w-md h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition"
              />
            </div>
          )}
        </div>
      )}

      {/* Carousel Images - clickable 👈 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full">
            {viewArchived ? "No archived images found." : "No images found."}
          </p>
        ) : (
          images.map((img) => (
            <div
              key={img._id}
              className="relative border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <img
                src={img.imageUrl}
                alt="Carousel"
                onClick={() => setModalImage(img.imageUrl)}
                className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 text-white text-sm px-2 py-1 flex justify-between items-center">
                <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                {viewArchived ? (
                  <button
                    onClick={() => handleRestore(img._id)}
                    className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => handleArchive(img._id)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-xs"
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for enlarged image 👈 */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-bold hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={modalImage}
              alt="Enlarged view"
              className="max-w-full max-h-screen object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}