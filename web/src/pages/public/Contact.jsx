// import React, { useState } from "react";

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     subject: "",
//     message: "",
//   });

//   const [status, setStatus] = useState(""); // success / error / loading

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus("loading");

//     try {
//       // Replace with your API call
//       await fetch("/api/contact", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       setStatus("success");
//       setFormData({ name: "", email: "", subject: "", message: "" });
//     } catch (err) {
//       console.error(err);
//       setStatus("error");
//     }
//   };

//   return (
//     <main className="bg-white min-h-screen">
//       {/* Hero Section */}
//       <section className="relative py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
//         <div className="max-w-4xl mx-auto px-8 text-center">
//           <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
//             Contact Us
//           </h1>
//           <div className="w-20 h-1 bg-violet-400 mx-auto"></div>
//           <p className="text-lg text-violet-200 mt-4">
//             Have questions or suggestions? Send us a message!
//           </p>
//         </div>
//       </section>

//       {/* Contact Form Section */}
//       <section className="py-20 bg-white">
//         <div className="max-w-3xl mx-auto px-8">
//           <form
//             onSubmit={handleSubmit}
//             className="space-y-6 bg-white shadow-lg rounded-xl p-8 border border-slate-200"
//           >
//             <div className="grid md:grid-cols-2 gap-6">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Your Name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
//               />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Your Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
//               />
//             </div>

//             <input
//               type="text"
//               name="subject"
//               placeholder="Subject"
//               value={formData.subject}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
//             />

//             <textarea
//               name="message"
//               placeholder="Your Message"
//               value={formData.message}
//               onChange={handleChange}
//               required
//               rows={6}
//               className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
//             ></textarea>

//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
//             >
//               {status === "loading" ? "Sending..." : "Send Message"}
//             </button>

//             {status === "success" && (
//               <p className="text-green-600 text-center mt-2">
//                 Message sent successfully!
//               </p>
//             )}
//             {status === "error" && (
//               <p className="text-red-600 text-center mt-2">
//                 Failed to send message. Please try again.
//               </p>
//             )}
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-700">
//                 Attach files (optional)
//               </label>

//               <div className="flex items-center gap-4">
//                 <input
//                   type="file"
//                   multiple
//                   className="block w-full text-sm text-slate-600
//         file:mr-4 file:py-2.5 file:px-5
//         file:rounded-md file:border
//         file:border-slate-300
//         file:bg-white
//         file:text-slate-700
//         file:font-medium
//         hover:file:bg-slate-50
//         cursor-pointer"
//                 />
//               </div>

//               <p className="text-xs text-slate-500">
//                 Accepted file types: PDF, JPG, PNG, DOCX. Max 10MB per file.
//               </p>
//             </div>

//           </form>
//         </div>
//       </section>
//     </main>
//   );
// };

// export default Contact;
import React, { useState } from "react";
import { sendContactMessage, prepareContactFormData, validateContactForm } from "../../api/contact";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [status, setStatus] = useState(""); // success / error / loading
  const [validationErrors, setValidationErrors] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 10MB each)
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      alert('Some files exceed 10MB limit and were not added');
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
    
    // Create preview URLs for images
    const newPreviews = validFiles.filter(file => file.type.startsWith('image/')).map(file => 
      URL.createObjectURL(file)
    );
    setPreviewFiles(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    
    // Revoke object URL for preview
    if (previewFiles[index]) {
      URL.revokeObjectURL(previewFiles[index]);
    }
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    setStatus("loading");
    setValidationErrors([]);

    try {
      // Prepare form data
      const formDataToSend = prepareContactFormData(formData, attachments);
      
      // Send to API
      const result = await sendContactMessage(formDataToSend);

      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setAttachments([]);
        setPreviewFiles([]);
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setStatus("");
        }, 5000);
      } else {
        setStatus("error");
        setValidationErrors([result.error || 'Failed to send message']);
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.error || 'Server error occurred';
        setValidationErrors([errorMessage]);
      } else if (err.request) {
        // Request was made but no response
        setValidationErrors(['Network error. Please check your connection.']);
      } else {
        // Something else happened
        setValidationErrors(['An unexpected error occurred. Please try again.']);
      }
    }
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      previewFiles.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewFiles]);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Contact Us
          </h1>
          <div className="w-20 h-1 bg-violet-400 mx-auto"></div>
          <p className="text-lg text-violet-200 mt-4">
            Have questions or suggestions? Send us a message!
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white shadow-lg rounded-xl p-8 border border-slate-200"
          >
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <ul className="text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                name="subject"
                placeholder="Subject *"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
              />
            </div>

            <div>
              <textarea
                name="message"
                placeholder="Your Message *"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white text-gray-900"
              ></textarea>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Attach files (optional, max 10MB each)
              </label>

              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-600
                    file:mr-4 file:py-2.5 file:px-5
                    file:rounded-lg file:border
                    file:border-slate-300
                    file:bg-white
                    file:text-slate-700
                    file:font-medium
                    hover:file:bg-slate-50
                    cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                
                {/* File Previews */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      {attachments.length} file(s) selected
                    </p>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center gap-3">
                            {file.type.startsWith('image/') && previewFiles[index] ? (
                              <img 
                                src={previewFiles[index]} 
                                alt="Preview" 
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-violet-100 rounded flex items-center justify-center">
                                <span className="text-violet-600 font-bold text-xs">
                                  {file.name.split('.').pop().toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-800 text-sm truncate max-w-xs">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="bg-white text-violet-700 border border-violet-200 rounded-lg px-4 py-2 shadow hover:bg-violet-50 transition-colors dark:bg-white dark:text-violet-700 dark:hover:bg-violet-100"
                            onClick={() => removeFile(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Accepted file types: PDF, JPG, PNG, DOC, DOCX. Max 10MB per file.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl dark:from-violet-600 dark:to-purple-600 dark:text-white"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                <p className="text-green-700 text-center font-medium flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Message sent successfully! We'll get back to you soon.
                </p>
              </div>
            )}
          </form>

          {/* Contact Info */}
          <div className="mt-12 p-8 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Other Ways to Reach Us
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-violet-600 text-xl">📧</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Email</h4>
                <a 
                  href="mailto:kirstientruiz@gmail.com" 
                  className="text-slate-600 hover:text-violet-600 transition-colors"
                >
                  kirstientruiz@gmail.com
                </a>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-violet-600 text-xl">📱</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Response Time</h4>
                <p className="text-slate-600">3-5 Business Day</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-violet-600 text-xl">📍</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Office Hours</h4>
                <p className="text-slate-600">Mon-Fri, 9AM-5PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;