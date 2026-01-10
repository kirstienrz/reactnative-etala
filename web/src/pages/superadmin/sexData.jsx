// // // import { useEffect, useState } from "react";
// // // import {
// // //   uploadSexDataExcel,
// // //   getSexDatasets,
// // //   getSexDatasetById,
// // //   deleteSexDataset
// // // } from "../../api/sexData";

// // // import { Bar, Line } from "react-chartjs-2";
// // // import {
// // //   Chart as ChartJS,
// // //   CategoryScale,
// // //   LinearScale,
// // //   BarElement,
// // //   LineElement,
// // //   PointElement,
// // //   Tooltip,
// // //   Legend
// // // } from "chart.js";

// // // ChartJS.register(
// // //   CategoryScale,
// // //   LinearScale,
// // //   BarElement,
// // //   LineElement,
// // //   PointElement,
// // //   Tooltip,
// // //   Legend
// // // );

// // // export default function SexData() {
// // //   const [datasets, setDatasets] = useState([]);
// // //   const [active, setActive] = useState(null);
// // //   const [file, setFile] = useState(null);
// // //   const [name, setName] = useState("");

// // //   const [xField, setXField] = useState("");
// // //   const [yField, setYField] = useState("");

// // //   const loadDatasets = async () => {
// // //     const data = await getSexDatasets();
// // //     setDatasets(data);
// // //   };

// // //   useEffect(() => {
// // //     loadDatasets();
// // //   }, []);

// // //   const uploadExcel = async () => {
// // //     if (!file) return alert("Select Excel file");

// // //     const formData = new FormData();
// // //     formData.append("file", file);
// // //     formData.append("name", name);

// // //     await uploadSexDataExcel(formData);
// // //     setFile(null);
// // //     setName("");
// // //     loadDatasets();
// // //   };

// // //   const openDataset = async (id) => {
// // //     const data = await getSexDatasetById(id);
// // //     setActive(data);
// // //     setXField("");
// // //     setYField("");
// // //   };

// // //   const removeDataset = async (id) => {
// // //     if (!window.confirm("Delete this dataset?")) return;
// // //     await deleteSexDataset(id);
// // //     setActive(null);
// // //     loadDatasets();
// // //   };

// // //   const numericFields = active
// // //     ? active.headers.filter(h =>
// // //         active.rows.every(r => typeof r[h] === "number")
// // //       )
// // //     : [];

// // //   const chartData =
// // //     active && xField && yField
// // //       ? {
// // //           labels: active.rows.map(r => r[xField]),
// // //           datasets: [
// // //             {
// // //               label: yField,
// // //               data: active.rows.map(r => r[yField])
// // //             }
// // //           ]
// // //         }
// // //       : null;

// // //   return (
// // //     <div style={{ padding: 20 }}>
// // //       <h2>Sex Disaggregated Data</h2>

// // //       <input
// // //         placeholder="Dataset name"
// // //         value={name}
// // //         onChange={e => setName(e.target.value)}
// // //       />
// // //       <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} />
// // //       <button onClick={uploadExcel}>Upload</button>

// // //       <hr />

// // //       <h3>Datasets</h3>
// // //       <ul>
// // //         {datasets.map(d => (
// // //           <li key={d._id}>
// // //             <span
// // //               style={{ cursor: "pointer", color: "blue" }}
// // //               onClick={() => openDataset(d._id)}
// // //             >
// // //               {d.name}
// // //             </span>
// // //             <button onClick={() => removeDataset(d._id)}>Delete</button>
// // //           </li>
// // //         ))}
// // //       </ul>

// // //       {active && (
// // //         <>
// // //           <h3>{active.name}</h3>

// // //           <table border="1">
// // //             <thead>
// // //               <tr>
// // //                 {active.headers.map(h => <th key={h}>{h}</th>)}
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {active.rows.map((row, i) => (
// // //                 <tr key={i}>
// // //                   {active.headers.map(h => (
// // //                     <td key={h}>{row[h]}</td>
// // //                   ))}
// // //                 </tr>
// // //               ))}
// // //             </tbody>
// // //           </table>

// // //           <h3>Generate Chart</h3>

// // //           <select onChange={e => setXField(e.target.value)}>
// // //             <option value="">X-axis</option>
// // //             {active.headers.map(h => <option key={h}>{h}</option>)}
// // //           </select>

// // //           <select onChange={e => setYField(e.target.value)}>
// // //             <option value="">Y-axis (numeric)</option>
// // //             {numericFields.map(h => <option key={h}>{h}</option>)}
// // //           </select>

// // //           {chartData && (
// // //             <>
// // //               <Bar data={chartData} />
// // //               <Line data={chartData} />
// // //             </>
// // //           )}
// // //         </>
// // //       )}
// // //     </div>
// // //   );
// // // }



// // import React, { useState, useEffect } from "react";
// // import { Upload, Trash2, X, RefreshCw, BarChart2 } from "lucide-react";
// // import { Bar, Line } from "react-chartjs-2";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   LineElement,
// //   PointElement,
// //   Tooltip,
// //   Legend
// // } from "chart.js";

// // import {
// //   uploadSexDataExcel,
// //   getSexDatasets,
// //   getSexDatasetById,
// //   deleteSexDataset
// // } from "../../api/sexData";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   LineElement,
// //   PointElement,
// //   Tooltip,
// //   Legend
// // );

// // export default function SexDataAdmin() {
// //   const [datasets, setDatasets] = useState([]);
// //   const [active, setActive] = useState(null);
// //   const [file, setFile] = useState(null);
// //   const [name, setName] = useState("");
// //   const [showModal, setShowModal] = useState(false);
// //   const [xField, setXField] = useState("");
// //   const [yField, setYField] = useState("");
// //   const [isUploading, setIsUploading] = useState(false);

// //   const loadDatasets = async () => {
// //     try {
// //       const data = await getSexDatasets();
// //       setDatasets(Array.isArray(data) ? data : []);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   useEffect(() => {
// //     loadDatasets();
// //   }, []);

// //   const uploadExcelFile = async () => {
// //     if (!file) return alert("Select Excel file");
// //     if (!name.trim()) return alert("Enter dataset name");

// //     const formData = new FormData();
// //     formData.append("file", file);
// //     formData.append("name", name);

// //     try {
// //       setIsUploading(true);
// //       await uploadSexDataExcel(formData);
// //       setFile(null);
// //       setName("");
// //       setShowModal(false);
// //       loadDatasets();
// //       alert("Dataset uploaded successfully!");
// //     } catch (err) {
// //       console.error(err);
// //       alert("Upload failed");
// //     } finally {
// //       setIsUploading(false);
// //     }
// //   };

// //   const openDataset = async (id) => {
// //     const data = await getSexDatasetById(id);
// //     setActive(data);
// //     setXField("");
// //     setYField("");
// //   };

// //   const removeDataset = async (id) => {
// //     if (!window.confirm("Delete this dataset?")) return;
// //     await deleteSexDataset(id);
// //     if (active?._id === id) setActive(null);
// //     loadDatasets();
// //   };

// //   const numericFields = active
// //     ? active.headers.filter((h) =>
// //         active.rows.every((r) => typeof r[h] === "number")
// //       )
// //     : [];

// //   const chartData =
// //     active && xField && yField
// //       ? {
// //           labels: active.rows.map((r) => r[xField]),
// //           datasets: [
// //             {
// //               label: yField,
// //               data: active.rows.map((r) => r[yField]),
// //               backgroundColor: "rgba(59, 130, 246, 0.6)"
// //             }
// //           ]
// //         }
// //       : null;

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-6">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="flex justify-between items-center mb-6">
// //           <div>
// //             <h1 className="text-3xl font-bold text-gray-900">Sex Disaggregated Data</h1>
// //             <p className="text-gray-600 mt-1">Upload, view, and analyze datasets</p>
// //           </div>
// //           <button
// //             onClick={() => setShowModal(true)}
// //             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
// //           >
// //             <Upload size={16} /> Upload Dataset
// //           </button>
// //         </div>

// //         {/* Datasets Grid */}
// //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
// //           {datasets.map((d) => (
// //             <div
// //               key={d._id}
// //               className="bg-white border rounded-lg p-4 hover:shadow-lg transition flex flex-col justify-between"
// //             >
// //               <div>
// //                 <h3 className="font-medium text-gray-800 truncate">{d.name}</h3>
// //                 <p className="text-gray-500 text-sm mt-1">{d.rows.length} rows</p>
// //               </div>
// //               <div className="flex justify-end gap-2 mt-4">
// //                 <button
// //                   onClick={() => openDataset(d._id)}
// //                   className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-xs"
// //                 >
// //                   View
// //                 </button>
// //                 <button
// //                   onClick={() => removeDataset(d._id)}
// //                   className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-white text-xs flex items-center gap-1"
// //                 >
// //                   <Trash2 size={12} /> Delete
// //                 </button>
// //               </div>
// //             </div>
// //           ))}

// //           {datasets.length === 0 && (
// //             <div className="col-span-full text-center py-12 bg-white rounded-lg border">
// //               <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
// //               <h3 className="text-xl font-semibold text-gray-600 mb-2">No datasets found</h3>
// //               <p className="text-gray-500">Start by uploading a new dataset</p>
// //             </div>
// //           )}
// //         </div>

// //         {/* Active Dataset Table & Chart */}
// //         {active && (
// //           <div className="bg-white rounded-lg border p-6 mb-6">
// //             <div className="flex justify-between items-center mb-4">
// //               <h2 className="text-xl font-bold text-gray-800">{active.name}</h2>
// //               <button
// //                 onClick={() => setActive(null)}
// //                 className="text-gray-500 hover:text-gray-700"
// //               >
// //                 <X size={20} />
// //               </button>
// //             </div>

// //             <div className="overflow-x-auto mb-4">
// //               <table className="min-w-full border">
// //                 <thead className="bg-gray-100">
// //                   <tr>
// //                     {active.headers.map((h) => (
// //                       <th key={h} className="px-3 py-2 text-left text-sm font-medium text-gray-700 border">
// //                         {h}
// //                       </th>
// //                     ))}
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {active.rows.map((row, i) => (
// //                     <tr key={i} className="border-b">
// //                       {active.headers.map((h) => (
// //                         <td key={h} className="px-3 py-2 text-sm text-gray-600 border">
// //                           {row[h]}
// //                         </td>
// //                       ))}
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>

// //             <div className="flex flex-col sm:flex-row gap-4 mb-4">
// //               <select
// //                 value={xField}
// //                 onChange={(e) => setXField(e.target.value)}
// //                 className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
// //               >
// //                 <option value="">X-axis</option>
// //                 {active.headers.map((h) => (
// //                   <option key={h} value={h}>
// //                     {h}
// //                   </option>
// //                 ))}
// //               </select>

// //               <select
// //                 value={yField}
// //                 onChange={(e) => setYField(e.target.value)}
// //                 className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
// //               >
// //                 <option value="">Y-axis (numeric)</option>
// //                 {numericFields.map((h) => (
// //                   <option key={h} value={h}>
// //                     {h}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             {chartData && (
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                 <div className="bg-gray-50 p-4 rounded-lg">
// //                   <Bar data={chartData} />
// //                 </div>
// //                 <div className="bg-gray-50 p-4 rounded-lg">
// //                   <Line data={chartData} />
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         {/* Upload Modal */}
// //         {showModal && (
// //           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
// //             <div className="bg-white rounded-lg max-w-2xl w-full p-6">
// //               <div className="flex justify-between items-center mb-4">
// //                 <h2 className="text-xl font-bold text-gray-800">Upload Dataset</h2>
// //                 <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
// //                   <X size={24} />
// //                 </button>
// //               </div>

// //               <div className="space-y-4">
// //                 <input
// //                   type="text"
// //                   placeholder="Dataset name"
// //                   value={name}
// //                   onChange={(e) => setName(e.target.value)}
// //                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 />
// //                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
// //                   <input
// //                     type="file"
// //                     accept=".xlsx,.xls"
// //                     onChange={(e) => setFile(e.target.files[0])}
// //                     className="hidden"
// //                     id="datasetUpload"
// //                   />
// //                   <label htmlFor="datasetUpload">
// //                     <Upload size={48} className="mx-auto text-gray-400" />
// //                     <p className="text-gray-600 font-medium">Click to upload Excel file</p>
// //                     <p className="text-sm text-gray-400">.xlsx or .xls</p>
// //                   </label>
// //                   {file && (
// //                     <p className="text-sm text-blue-600 mt-2">{file.name}</p>
// //                   )}
// //                 </div>

// //                 <div className="flex gap-3 mt-4">
// //                   <button
// //                     onClick={() => setShowModal(false)}
// //                     className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
// //                   >
// //                     Cancel
// //                   </button>
// //                   <button
// //                     onClick={uploadExcelFile}
// //                     disabled={!file || !name.trim() || isUploading}
// //                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
// //                   >
// //                     {isUploading ? (
// //                       <>
// //                         <RefreshCw size={16} className="animate-spin mr-2" /> Uploading...
// //                       </>
// //                     ) : (
// //                       "Upload Dataset"
// //                     )}
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useEffect, useRef } from "react";
// import { Upload, Trash2, X, RefreshCw, BarChart2, Download, Printer, FileText, Filter } from "lucide-react";
// import { Bar, Line, Pie } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Title
// } from "chart.js";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import html2canvas from "html2canvas";

// import {
//   uploadSexDataExcel,
//   getSexDatasets,
//   getSexDatasetById,
//   deleteSexDataset
// } from "../../api/sexData";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Title
// );

// export default function SexDataAdmin() {
//   const [datasets, setDatasets] = useState([]);
//   const [active, setActive] = useState(null);
//   const [file, setFile] = useState(null);
//   const [name, setName] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [xField, setXField] = useState("");
//   const [yField, setYField] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const [chartType, setChartType] = useState("bar");
//   const [selectedCharts, setSelectedCharts] = useState([]);
//   const [filteredRows, setFilteredRows] = useState([]);
//   const [filters, setFilters] = useState({});
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const chartRef = useRef(null);

//   const loadDatasets = async () => {
//     try {
//       const data = await getSexDatasets();
//       setDatasets(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     loadDatasets();
//   }, []);

//   useEffect(() => {
//     if (active) {
//       setFilteredRows(active.rows);
//       // Initialize filters
//       const initialFilters = {};
//       active.headers.forEach(header => {
//         initialFilters[header] = "";
//       });
//       setFilters(initialFilters);
//     }
//   }, [active]);

//   const uploadExcelFile = async () => {
//     if (!file) return alert("Select Excel file");
//     if (!name.trim()) return alert("Enter dataset name");

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("name", name);

//     try {
//       setIsUploading(true);
//       await uploadSexDataExcel(formData);
//       setFile(null);
//       setName("");
//       setShowModal(false);
//       loadDatasets();
//       alert("Dataset uploaded successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Upload failed");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const openDataset = async (id) => {
//     const data = await getSexDatasetById(id);
//     setActive(data);
//     setXField("");
//     setYField("");
//     setChartType("bar");
//     setSelectedCharts([]);
//   };

//   const removeDataset = async (id) => {
//     if (!window.confirm("Delete this dataset?")) return;
//     await deleteSexDataset(id);
//     if (active?._id === id) setActive(null);
//     loadDatasets();
//   };

//   const numericFields = active
//     ? active.headers.filter((h) =>
//         active.rows.every((r) => typeof r[h] === "number")
//       )
//     : [];

//   const applyFilters = () => {
//     if (!active) return;

//     let filtered = active.rows;

//     Object.keys(filters).forEach(key => {
//       if (filters[key]) {
//         filtered = filtered.filter(row => 
//           String(row[key]).toLowerCase().includes(filters[key].toLowerCase())
//         );
//       }
//     });

//     setFilteredRows(filtered);
//   };

//   useEffect(() => {
//     applyFilters();
//   }, [filters]);

//   const chartData = (rows = filteredRows) => {
//     if (!active || !xField || !yField || !rows.length) return null;

//     return {
//       labels: rows.map((r) => r[xField]),
//       datasets: [
//         {
//           label: yField,
//           data: rows.map((r) => r[yField]),
//           backgroundColor: chartType === "pie" 
//             ? [
//                 "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6",
//                 "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
//               ].slice(0, rows.length)
//             : "rgba(59, 130, 246, 0.6)",
//           borderColor: "rgba(59, 130, 246, 1)",
//           borderWidth: 1
//         }
//       ]
//     };
//   };

//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: `${active?.name || ''} - ${yField} vs ${xField}`
//       },
//       tooltip: {
//         callbacks: {
//           label: function(context) {
//             return `${context.dataset.label}: ${context.parsed.y}`;
//           }
//         }
//       }
//     }
//   };

//   // Download Functions
//   const downloadExcel = () => {
//     if (!active) return;

//     const ws = XLSX.utils.json_to_sheet(filteredRows);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Data");

//     // Add chart data sheet if chart exists
//     if (chartData()) {
//       const chartWs = XLSX.utils.aoa_to_sheet([
//         ["Chart Data", `${yField} vs ${xField}`],
//         [xField, yField],
//         ...filteredRows.map(row => [row[xField], row[yField]])
//       ]);
//       XLSX.utils.book_append_sheet(wb, chartWs, "Chart_Data");
//     }

//     XLSX.writeFile(wb, `${active.name}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
//   };

//   const downloadPDF = async () => {
//     if (!active || !chartRef.current) return;

//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pageWidth = pdf.internal.pageSize.getWidth();

//     // Title
//     pdf.setFontSize(20);
//     pdf.text("Data Report", pageWidth / 2, 20, { align: 'center' });

//     // Dataset Info
//     pdf.setFontSize(12);
//     pdf.text(`Dataset: ${active.name}`, 20, 35);
//     pdf.text(`Total Records: ${filteredRows.length}`, 20, 45);
//     pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 55);

//     // Add chart image
//     const canvas = await html2canvas(chartRef.current);
//     const imgData = canvas.toDataURL('image/png');
//     pdf.addImage(imgData, 'PNG', 20, 70, pageWidth - 40, 80);

//     // Add table
//     const headers = active.headers;
//     const tableData = filteredRows.map(row => headers.map(h => row[h]));

//     pdf.autoTable({
//       head: [headers],
//       body: tableData,
//       startY: 160,
//       margin: { horizontal: 20 },
//       styles: { fontSize: 8, cellPadding: 2 },
//       headStyles: { fillColor: [59, 130, 246] }
//     });

//     pdf.save(`${active.name}_report_${new Date().toISOString().split('T')[0]}.pdf`);
//   };

//   const downloadChartImage = async () => {
//     if (!chartRef.current) return;

//     const canvas = await html2canvas(chartRef.current);
//     const link = document.createElement('a');
//     link.download = `${active.name}_chart_${new Date().toISOString().split('T')[0]}.png`;
//     link.href = canvas.toDataURL('image/png');
//     link.click();
//   };

//   const downloadCSV = () => {
//     if (!active) return;

//     const headers = active.headers.join(',');
//     const rows = filteredRows.map(row => 
//       active.headers.map(h => `"${row[h]}"`).join(',')
//     ).join('\n');

//     const csvContent = `${headers}\n${rows}`;
//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `${active.name}_${new Date().toISOString().split('T')[0]}.csv`;
//     link.click();
//   };

//   const generateReport = (format) => {
//     switch(format) {
//       case 'excel':
//         downloadExcel();
//         break;
//       case 'pdf':
//         downloadPDF();
//         break;
//       case 'image':
//         downloadChartImage();
//         break;
//       case 'csv':
//         downloadCSV();
//         break;
//       default:
//         break;
//     }
//     setShowReportOptions(false);
//   };

//   const toggleChartSelection = (type) => {
//     setSelectedCharts(prev => 
//       prev.includes(type) 
//         ? prev.filter(t => t !== type)
//         : [...prev, type]
//     );
//   };

//   const renderChart = (type, data) => {
//     const chartProps = {
//       data,
//       options: {
//         ...chartOptions,
//         plugins: {
//           ...chartOptions.plugins,
//           title: {
//             ...chartOptions.plugins.title,
//             text: `${type.toUpperCase()} Chart - ${yField} vs ${xField}`
//           }
//         }
//       }
//     };

//     switch(type) {
//       case 'bar':
//         return <Bar {...chartProps} />;
//       case 'line':
//         return <Line {...chartProps} />;
//       case 'pie':
//         return <Pie {...chartProps} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Sex Disaggregated Data</h1>
//             <p className="text-gray-600 mt-1">Upload, view, analyze, and export datasets</p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={() => setShowReportOptions(true)}
//               disabled={!active}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               <Download size={16} /> Export Report
//             </button>
//             <button
//               onClick={() => setShowModal(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
//             >
//               <Upload size={16} /> Upload Dataset
//             </button>
//           </div>
//         </div>

//         {/* Datasets Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//           {datasets.map((d) => (
//             <div
//               key={d._id}
//               className="bg-white border rounded-lg p-4 hover:shadow-lg transition flex flex-col justify-between"
//             >
//               <div>
//                 <h3 className="font-medium text-gray-800 truncate">{d.name}</h3>
//                 <p className="text-gray-500 text-sm mt-1">{d.rows.length} rows</p>
//                 <p className="text-gray-500 text-xs mt-1">
//                   {d.headers.length} columns
//                 </p>
//               </div>
//               <div className="flex justify-end gap-2 mt-4">
//                 <button
//                   onClick={() => openDataset(d._id)}
//                   className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white text-xs"
//                 >
//                   View
//                 </button>
//                 <button
//                   onClick={() => removeDataset(d._id)}
//                   className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-white text-xs flex items-center gap-1"
//                 >
//                   <Trash2 size={12} /> Delete
//                 </button>
//               </div>
//             </div>
//           ))}

//           {datasets.length === 0 && (
//             <div className="col-span-full text-center py-12 bg-white rounded-lg border">
//               <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
//               <h3 className="text-xl font-semibold text-gray-600 mb-2">No datasets found</h3>
//               <p className="text-gray-500">Start by uploading a new dataset</p>
//             </div>
//           )}
//         </div>

//         {/* Active Dataset Section */}
//         {active && (
//           <div className="bg-white rounded-lg border p-6 mb-6">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">{active.name}</h2>
//                 <p className="text-gray-600 text-sm">
//                   {filteredRows.length} of {active.rows.length} records shown
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setShowReportOptions(true)}
//                   className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
//                 >
//                   <Download size={14} /> Export
//                 </button>
//                 <button
//                   onClick={() => setActive(null)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             {/* Filters */}
//             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//               <div className="flex items-center gap-2 mb-3">
//                 <Filter size={16} className="text-gray-600" />
//                 <h3 className="font-medium text-gray-700">Filters</h3>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                 {active.headers.slice(0, 3).map((header) => (
//                   <input
//                     key={header}
//                     type="text"
//                     placeholder={`Filter by ${header}`}
//                     value={filters[header] || ""}
//                     onChange={(e) => setFilters(prev => ({
//                       ...prev,
//                       [header]: e.target.value
//                     }))}
//                     className="px-3 py-2 border rounded-lg text-sm"
//                   />
//                 ))}
//               </div>
//             </div>

//             {/* Chart Configuration */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <select
//                 value={xField}
//                 onChange={(e) => setXField(e.target.value)}
//                 className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">X-axis (Category)</option>
//                 {active.headers.map((h) => (
//                   <option key={h} value={h}>
//                     {h}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={yField}
//                 onChange={(e) => setYField(e.target.value)}
//                 className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Y-axis (Numeric)</option>
//                 {numericFields.map((h) => (
//                   <option key={h} value={h}>
//                     {h}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={chartType}
//                 onChange={(e) => setChartType(e.target.value)}
//                 className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="bar">Bar Chart</option>
//                 <option value="line">Line Chart</option>
//                 <option value="pie">Pie Chart</option>
//               </select>
//             </div>

//             {/* Chart Selection */}
//             <div className="mb-6">
//               <h3 className="font-medium text-gray-700 mb-3">Select Chart Types to Display:</h3>
//               <div className="flex gap-3">
//                 {['bar', 'line', 'pie'].map(type => (
//                   <button
//                     key={type}
//                     onClick={() => toggleChartSelection(type)}
//                     className={`px-4 py-2 rounded-lg transition ${
//                       selectedCharts.includes(type)
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                     }`}
//                   >
//                     {type.charAt(0).toUpperCase() + type.slice(1)} Chart
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Charts Display */}
//             {chartData() && (
//               <div className="mb-8">
//                 <div ref={chartRef} className="mb-6">
//                   {selectedCharts.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       {selectedCharts.map(type => (
//                         <div key={type} className="bg-gray-50 p-4 rounded-lg">
//                           {renderChart(type, chartData())}
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className="bg-gray-50 p-4 rounded-lg">
//                       {renderChart(chartType, chartData())}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Data Table */}
//             <div className="overflow-x-auto mb-4">
//               <table className="min-w-full border">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     {active.headers.map((h) => (
//                       <th key={h} className="px-3 py-2 text-left text-sm font-medium text-gray-700 border">
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRows.map((row, i) => (
//                     <tr key={i} className="border-b hover:bg-gray-50">
//                       {active.headers.map((h) => (
//                         <td key={h} className="px-3 py-2 text-sm text-gray-600 border">
//                           {row[h]}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Upload Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-2xl w-full p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-bold text-gray-800">Upload Dataset</h2>
//                 <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
//                   <X size={24} />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   placeholder="Dataset name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
//                   <input
//                     type="file"
//                     accept=".xlsx,.xls"
//                     onChange={(e) => setFile(e.target.files[0])}
//                     className="hidden"
//                     id="datasetUpload"
//                   />
//                   <label htmlFor="datasetUpload" className="cursor-pointer">
//                     <Upload size={48} className="mx-auto text-gray-400" />
//                     <p className="text-gray-600 font-medium">Click to upload Excel file</p>
//                     <p className="text-sm text-gray-400">.xlsx or .xls</p>
//                   </label>
//                   {file && (
//                     <p className="text-sm text-blue-600 mt-2">{file.name}</p>
//                   )}
//                 </div>

//                 <div className="flex gap-3 mt-4">
//                   <button
//                     onClick={() => setShowModal(false)}
//                     className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={uploadExcelFile}
//                     disabled={!file || !name.trim() || isUploading}
//                     className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
//                   >
//                     {isUploading ? (
//                       <>
//                         <RefreshCw size={16} className="animate-spin mr-2" /> Uploading...
//                       </>
//                     ) : (
//                       "Upload Dataset"
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Report Options Modal */}
//         {showReportOptions && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg max-w-md w-full p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-bold text-gray-800">Export Report</h2>
//                 <button 
//                   onClick={() => setShowReportOptions(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               <div className="space-y-3">
//                 <button
//                   onClick={() => generateReport('pdf')}
//                   className="w-full p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-3"
//                 >
//                   <FileText size={20} />
//                   <span>Download PDF Report</span>
//                 </button>

//                 <button
//                   onClick={() => generateReport('excel')}
//                   className="w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
//                 >
//                   <FileText size={20} />
//                   <span>Download Excel Report</span>
//                 </button>

//                 <button
//                   onClick={() => generateReport('csv')}
//                   className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-3"
//                 >
//                   <FileText size={20} />
//                   <span>Download CSV Data</span>
//                 </button>

//                 {chartData() && (
//                   <button
//                     onClick={() => generateReport('image')}
//                     className="w-full p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-3"
//                   >
//                     <Download size={20} />
//                     <span>Download Chart as Image</span>
//                   </button>
//                 )}
//               </div>

//               <button
//                 onClick={() => setShowReportOptions(false)}
//                 className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, X, RefreshCw, BarChart2, Download, Filter } from "lucide-react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from "chart.js";

import {
    uploadSexDataExcel,
    getSexDatasets,
    getSexDatasetById,
    deleteSexDataset
} from "../../api/sexData";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
    Title
);

export default function SexDataAdmin() {
    const [datasets, setDatasets] = useState([]);
    const [active, setActive] = useState(null);
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [xField, setXField] = useState("");
    const [yField, setYField] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [chartType, setChartType] = useState("bar");
    const [selectedCharts, setSelectedCharts] = useState(["bar"]);
    const [filters, setFilters] = useState({});
    const [showReportOptions, setShowReportOptions] = useState(false);
    const chartRef = useRef(null);

    const loadDatasets = async () => {
        try {
            const data = await getSexDatasets();
            setDatasets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setDatasets([]);
        }
    };

    useEffect(() => {
        loadDatasets();
    }, []);

    useEffect(() => {
        if (active && active.headers) {
            const initialFilters = {};
            active.headers.forEach(header => {
                initialFilters[header] = "";
            });
            setFilters(initialFilters);
        }
    }, [active]);

    const uploadExcelFile = async () => {
        if (!file) return alert("Select Excel file");
        if (!name.trim()) return alert("Enter dataset name");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);

        try {
            setIsUploading(true);
            await uploadSexDataExcel(formData);
            setFile(null);
            setName("");
            setShowModal(false);
            loadDatasets();
            alert("Dataset uploaded successfully!");
        } catch (err) {
            console.error(err);
            alert("Upload failed: " + (err.message || "Unknown error"));
        } finally {
            setIsUploading(false);
        }
    };

    const openDataset = async (id) => {
        try {
            const data = await getSexDatasetById(id);
            setActive(data);
            setXField("");
            setYField("");
            setChartType("bar");
            setSelectedCharts(["bar"]);

            // Auto-select first text field for X and first numeric for Y
            if (data && data.headers && data.rows) {
                const textFields = data.headers.filter(h =>
                    data.rows.some(r => typeof r[h] === 'string' || isNaN(Number(r[h])))
                );
                const numericFields = active.headers.filter((h) => {
                    // Check if majority of values are numbers
                    let numericCount = 0;
                    active.rows.forEach((r) => {
                        const value = r[h];
                        const num = Number(value);
                        if (!isNaN(num) && isFinite(num)) {
                            numericCount++;
                        }
                    });
                    // Consider column numeric if > 50% of values are numbers
                    return numericCount > active.rows.length * 0.5;
                });

                if (textFields.length > 0) setXField(textFields[0]);
                if (numericFields.length > 0) setYField(numericFields[0]);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to load dataset");
        }
    };

    const removeDataset = async (id) => {
        if (!window.confirm("Delete this dataset?")) return;
        try {
            await deleteSexDataset(id);
            if (active?._id === id) setActive(null);
            loadDatasets();
            alert("Dataset deleted successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to delete dataset");
        }
    };

    const getFilteredRows = () => {
        if (!active || !active.rows) return [];

        return active.rows.filter(row => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                const rowValue = String(row[key] || "").toLowerCase();
                const filterValue = filters[key].toLowerCase();
                return rowValue.includes(filterValue);
            });
        });
    };

    const numericFields = active && active.rows
        ? active.headers.filter((h) => {
            return active.rows.every((r) => {
                const value = r[h];
                return value !== null && value !== "" && !isNaN(Number(value));
            });
        })
        : [];

    const generateChartData = () => {
        if (!active || !xField || !yField) return null;

        const filteredRows = getFilteredRows();
        if (filteredRows.length === 0) return null;

        return {
            labels: filteredRows.map((r) => String(r[xField] || "")),
            datasets: [
                {
                    label: yField,
                    data: filteredRows.map((r) => Number(r[yField]) || 0),
                    backgroundColor: chartType === "pie"
                        ? [
                            "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6",
                            "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
                        ].slice(0, filteredRows.length)
                        : "rgba(59, 130, 246, 0.6)",
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${yField} by ${xField}`
            }
        }
    };

    // Download Functions
    const downloadCSV = () => {
        if (!active) return;

        const filteredRows = getFilteredRows();
        const headers = active.headers;

        // Create CSV content
        const csvRows = [];
        csvRows.push(headers.join(','));

        filteredRows.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${active.name}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadExcel = async () => {
        if (!active) return;

        try {
            // Dynamic import for xlsx to reduce bundle size
            const XLSX = await import('xlsx');
            const filteredRows = getFilteredRows();

            const ws = XLSX.utils.json_to_sheet(filteredRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");

            XLSX.writeFile(wb, `${active.name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (err) {
            console.error("Excel download error:", err);
            alert("Failed to download Excel file");
        }
    };

    const downloadPDF = async () => {
        if (!active || !chartRef.current) return;

        try {
            const { jsPDF } = await import('jspdf');
            const html2canvas = await import('html2canvas');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();

            // Add title
            pdf.setFontSize(18);
            pdf.text("Data Analysis Report", pageWidth / 2, 20, { align: 'center' });

            // Add metadata
            pdf.setFontSize(12);
            pdf.text(`Dataset: ${active.name}`, 20, 40);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
            pdf.text(`Total Records: ${getFilteredRows().length}`, 20, 60);

            // Add chart if exists
            if (generateChartData()) {
                const canvas = await html2canvas.default(chartRef.current);
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 40;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 20, 70, imgWidth, imgHeight);
            }

            // Add summary
            pdf.setFontSize(14);
            pdf.text("Data Summary", 20, pdf.internal.pageSize.getHeight() - 40);
            pdf.setFontSize(10);

            pdf.save(`${active.name}_report_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error("PDF download error:", err);
            alert("Failed to generate PDF");
        }
    };

    const downloadChartImage = async () => {
        if (!chartRef.current) return;

        try {
            const html2canvas = await import('html2canvas');
            const canvas = await html2canvas.default(chartRef.current);
            const link = document.createElement('a');
            link.download = `${active.name}_chart_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Image download error:", err);
            alert("Failed to download chart image");
        }
    };

    const renderChart = (type) => {
        const data = generateChartData();
        if (!data) return <div className="text-gray-500 text-center py-8">Select X and Y axis to generate chart</div>;

        const chartProps = {
            data,
            options: {
                ...chartOptions,
                plugins: {
                    ...chartOptions.plugins,
                    title: {
                        ...chartOptions.plugins.title,
                        text: `${type.toUpperCase()} Chart - ${yField} by ${xField}`
                    }
                }
            },
            height: 300
        };

        switch (type) {
            case 'bar':
                return <Bar {...chartProps} />;
            case 'line':
                return <Line {...chartProps} />;
            case 'pie':
                return <Pie {...chartProps} />;
            default:
                return null;
        }
    };

    const handleFilterChange = (header, value) => {
        setFilters(prev => ({
            ...prev,
            [header]: value
        }));
    };

    const toggleChartSelection = (type) => {
        setSelectedCharts(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sex Disaggregated Data</h1>
                        <p className="text-gray-600 mt-1">Upload, view, analyze, and export datasets</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowReportOptions(true)}
                            disabled={!active}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                            <Download size={16} /> Export
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                        >
                            <Upload size={16} /> Upload Dataset
                        </button>
                    </div>
                </div>

                {/* Datasets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {datasets.map((d) => (
                        <div
                            key={d._id}
                            className="bg-white border rounded-lg p-4 hover:shadow-lg transition flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="font-medium text-gray-800 truncate">{d.name}</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    {d.rows?.length || 0} rows, {d.headers?.length || 0} columns
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => openDataset(d._id)}
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs transition"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => removeDataset(d._id)}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs transition flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {datasets.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border">
                            <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No datasets found</h3>
                            <p className="text-gray-500">Start by uploading a new dataset</p>
                        </div>
                    )}
                </div>

                {/* Active Dataset Section */}
                {active && (
                    <div className="bg-white rounded-lg border p-4 md:p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{active.name}</h2>
                                <p className="text-gray-600 text-sm">
                                    Showing {getFilteredRows().length} of {active.rows?.length || 0} records
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowReportOptions(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
                                >
                                    <Download size={16} /> Export Report
                                </button>
                                <button
                                    onClick={() => setActive(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Filter size={16} className="text-gray-600" />
                                <h3 className="font-medium text-gray-700">Filter Data</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {active.headers.slice(0, 3).map((header) => (
                                    <input
                                        key={header}
                                        type="text"
                                        placeholder={`Filter ${header}...`}
                                        value={filters[header] || ""}
                                        onChange={(e) => handleFilterChange(header, e.target.value)}
                                        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ))}
                                {active.headers.length > 3 && (
                                    <div className="text-sm text-gray-500">
                                        + {active.headers.length - 3} more columns
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chart Controls */}
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-700 mb-3">Chart Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <select
                                    value={xField}
                                    onChange={(e) => setXField(e.target.value)}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select X-axis</option>
                                    {active.headers.map((h) => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>

                                <select
                                    value={yField}
                                    onChange={(e) => setYField(e.target.value)}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Y-axis (numeric)</option>
                                    {numericFields.map((h) => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>

                                <select
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="bar">Bar Chart</option>
                                    <option value="line">Line Chart</option>
                                    <option value="pie">Pie Chart</option>
                                </select>

                                <div className="flex gap-2 items-center">
                                    <span className="text-sm text-gray-600">Charts:</span>
                                    {['bar', 'line', 'pie'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleChartSelection(type)}
                                            className={`px-3 py-1 rounded text-xs ${selectedCharts.includes(type)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Charts Display */}
                        <div className="mb-8">
                            <div ref={chartRef} className="space-y-6">
                                {selectedCharts.map(type => (
                                    <div key={type} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="h-64">
                                            {renderChart(type)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <div className="mb-3">
                                <h3 className="font-medium text-gray-700">Data Preview</h3>
                            </div>
                            <table className="min-w-full border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {active.headers.map((h) => (
                                            <th key={h} className="px-3 py-2 text-left text-sm font-medium text-gray-700 border">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getFilteredRows().slice(0, 100).map((row, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                            {active.headers.map((h) => (
                                                <td key={`${i}-${h}`} className="px-3 py-2 text-sm text-gray-600 border">
                                                    {row[h]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {getFilteredRows().length > 100 && (
                                <div className="text-sm text-gray-500 mt-2">
                                    Showing first 100 of {getFilteredRows().length} records
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Upload Dataset</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dataset Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter dataset name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Excel File
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="hidden"
                                            id="fileUpload"
                                        />
                                        <label htmlFor="fileUpload" className="cursor-pointer">
                                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-gray-600 font-medium">Click to upload Excel file</p>
                                            <p className="text-sm text-gray-400 mt-1">.xlsx or .xls format</p>
                                        </label>
                                        {file && (
                                            <p className="text-sm text-blue-600 mt-3">
                                                Selected: {file.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setFile(null);
                                            setName("");
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={uploadExcelFile}
                                        disabled={!file || !name.trim() || isUploading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isUploading ? (
                                            <>
                                                <RefreshCw size={16} className="animate-spin mr-2" /> Uploading...
                                            </>
                                        ) : (
                                            "Upload Dataset"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Modal */}
                {showReportOptions && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Export Options</h2>
                                <button
                                    onClick={() => setShowReportOptions(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        downloadCSV();
                                        setShowReportOptions(false);
                                    }}
                                    className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    <span>Download CSV</span>
                                </button>

                                <button
                                    onClick={() => {
                                        downloadExcel();
                                        setShowReportOptions(false);
                                    }}
                                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    <span>Download Excel</span>
                                </button>

                                <button
                                    onClick={() => {
                                        downloadPDF();
                                        setShowReportOptions(false);
                                    }}
                                    className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    <Download size={18} />
                                    <span>Download PDF Report</span>
                                </button>

                                {generateChartData() && (
                                    <button
                                        onClick={() => {
                                            downloadChartImage();
                                            setShowReportOptions(false);
                                        }}
                                        className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} />
                                        <span>Download Chart Image</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}