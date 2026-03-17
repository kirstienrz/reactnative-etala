import React, { useState, useEffect, useRef } from "react";
import {
    Upload, Trash2, X, RefreshCw, BarChart2, Archive,
    RotateCcw, Download, Filter, Folder, FolderArchive, Edit2, Check
} from "lucide-react";
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
    deleteSexDataset,
    archiveSexDataset,
    restoreSexDataset,
    getArchivedSexDatasets,
    updateSexDataset
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
    const [archivedDatasets, setArchivedDatasets] = useState([]);
    const [active, setActive] = useState(null);
    const [file, setFile] = useState(null);
    const [name, setName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [xField, setXField] = useState("");
    const [yField, setYField] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [chartType, setChartType] = useState("bar");
    const [filters, setFilters] = useState({});
    const [showReportOptions, setShowReportOptions] = useState(false);
    const [activeTab, setActiveTab] = useState("active"); // "active" or "archived"
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editingRow, setEditingRow] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState("charts"); // "charts" or "table"
    const chartRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const loadDatasets = async () => {
        try {
            const [activeData, archivedData] = await Promise.all([
                getSexDatasets(),
                getArchivedSexDatasets()
            ]);
            setDatasets(Array.isArray(activeData) ? activeData : []);
            setArchivedDatasets(Array.isArray(archivedData) ? archivedData : []);
        } catch (err) {
            console.error(err);
            setDatasets([]);
            setArchivedDatasets([]);
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

    const openDataset = async (id, fromArchived = false) => {
        try {
            const data = await getSexDatasetById(id);
            setActive(data);
            setXField("");
            setYField("");
            setChartType("bar");

            // Auto-select first text field for X and first numeric for Y
            if (data && data.headers && data.rows) {
                const textFields = data.headers.filter(h =>
                    data.rows.some(r => typeof r[h] === 'string' || isNaN(Number(r[h])))
                );
                const numericFields = data.headers.filter((h) => {
                    let numericCount = 0;
                    data.rows.forEach((r) => {
                        const value = r[h];
                        const num = Number(value);
                        if (!isNaN(num) && isFinite(num)) {
                            numericCount++;
                        }
                    });
                    return numericCount > data.rows.length * 0.5;
                });

                if (textFields.length > 0) setXField(textFields[0]);
                if (numericFields.length > 0) setYField(numericFields[0]);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to load dataset");
        }
    };

    const archiveDataset = async (id) => {
        if (!window.confirm("Archive this dataset?")) return;
        try {
            await archiveSexDataset(id);
            if (active?._id === id) setActive(null);
            loadDatasets();
            alert("Dataset archived successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to archive dataset");
        }
    };

    const restoreDataset = async (id) => {
        if (!window.confirm("Restore this dataset?")) return;
        try {
            await restoreSexDataset(id);
            if (active?._id === id) setActive(null);
            loadDatasets();
            alert("Dataset restored successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to restore dataset");
        }
    };

    const removeDataset = async (id) => {
        if (!window.confirm("Permanently delete this dataset?")) return;
        try {
            await deleteSexDataset(id);
            if (active?._id === id) setActive(null);
            loadDatasets();
            alert("Dataset deleted permanently!");
        } catch (err) {
            console.error(err);
            alert("Failed to delete dataset");
        }
    };

    const handleUpdateName = async () => {
        if (!editName.trim()) return alert("Name cannot be empty");
        try {
            setIsSaving(true);
            await updateSexDataset(active._id, { name: editName });
            setActive({ ...active, name: editName });
            setIsEditing(false);
            loadDatasets();
            alert("Dataset renamed successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to rename dataset");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateRow = async (index) => {
        try {
            setIsSaving(true);
            const updatedRows = [...active.rows];
            updatedRows[index] = editingRow;
            await updateSexDataset(active._id, { rows: updatedRows });
            setActive({ ...active, rows: updatedRows });
            setEditingRow(null);
            alert("Row updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update row");
        } finally {
            setIsSaving(false);
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

    // Download Functions (same as before, pero idinagdag ko lang dito)
    const downloadCSV = () => {
        if (!active) return;

        const filteredRows = getFilteredRows();
        const headers = active.headers;

        const csvRows = [];
        csvRows.push(headers.join(','));

        filteredRows.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
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
        if (!active) return;

        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;
            const html2canvas = (await import('html2canvas')).default;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const purpleTheme = [126, 34, 206]; // Purple 700 (consistent with other reports)

            // ===== HEADER =====
            pdf.setFontSize(22);
            pdf.setTextColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
            pdf.setFont("helvetica", "bold");
            pdf.text("SEX DISAGGREGATED DATA REPORT", pageWidth / 2, 20, { align: 'center' });

            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.setFont("helvetica", "normal");
            pdf.text("Technological University of the Philippines - GAD Office", pageWidth / 2, 26, { align: 'center' });

            pdf.setDrawColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
            pdf.setLineWidth(0.5);
            pdf.line(14, 32, pageWidth - 14, 32);

            let y = 45;

            // ===== DATASET INFO =====
            pdf.setFontSize(14);
            pdf.setTextColor(0);
            pdf.setFont("helvetica", "bold");
            pdf.text(`Dataset: ${active.name}`, 14, y);
            y += 8;

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(80);
            pdf.text(`Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, y);
            y += 6;
            pdf.text(`Total Records Analyzed: ${getFilteredRows().length}`, 14, y);
            y += 12;

            // ===== CHART SECTION =====
            if (xField && yField && chartRef.current) {
                try {
                    pdf.setFontSize(12);
                    pdf.setFont("helvetica", "bold");
                    pdf.setTextColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
                    pdf.text("Data Visualization", 14, y);
                    y += 6;

                    const canvas = await html2canvas(chartRef.current);
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = pageWidth - 40;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    // Check if chart fits on current page, if not add page
                    if (y + imgHeight > pageHeight - 30) {
                        pdf.addPage();
                        y = 20;
                    }

                    pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
                    y += imgHeight + 15;
                } catch (chartErr) {
                    console.error("Error capturing chart for PDF:", chartErr);
                }
            }

            // ===== DATA SUMMARY TABLE =====
            const filteredRows = getFilteredRows();
            if (xField && yField && filteredRows.length > 0) {
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
                pdf.text("Statistical Summary", 14, y);
                y += 6;

                // Group data by X field and sum Y field
                const summaryMap = {};
                let totalY = 0;
                filteredRows.forEach(row => {
                    const label = String(row[xField] || "N/A");
                    const val = Number(row[yField]) || 0;
                    summaryMap[label] = (summaryMap[label] || 0) + val;
                    totalY += val;
                });

                const summaryData = Object.entries(summaryMap).map(([label, val]) => [
                    label,
                    val.toLocaleString(),
                    totalY > 0 ? ((val / totalY) * 100).toFixed(1) + "%" : "0%"
                ]);

                // Sort by value descending
                summaryData.sort((a, b) => {
                    const valA = parseFloat(a[1].replace(/,/g, ''));
                    const valB = parseFloat(b[1].replace(/,/g, ''));
                    return valB - valA;
                });

                autoTable(pdf, {
                    startY: y,
                    head: [[xField, yField, "Percentage"]],
                    body: summaryData,
                    theme: 'striped',
                    headStyles: { fillColor: purpleTheme, textColor: 255 },
                    styles: { fontSize: 9 },
                    margin: { left: 14, right: 14 }
                });

                y = pdf.lastAutoTable.finalY + 12;

                // ===== KEY FINDINGS =====
                if (y > pageHeight - 60) {
                    pdf.addPage();
                    y = 25;
                }

                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.setTextColor(purpleTheme[0], purpleTheme[1], purpleTheme[2]);
                pdf.text("Analysis Summary", 14, y);
                y += 10;

                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(0);

                const highest = summaryData[0];
                const lowest = summaryData[summaryData.length - 1];
                const summaryText = [
                    `• The dataset "${active.name}" contains a total of ${filteredRows.length} records.`,
                    `• The total accumulated value for ${yField} across all categories is ${totalY.toLocaleString()}.`,
                    `• The category with the highest ${yField} is "${highest[0]}" with ${highest[1]} (${highest[2]} of total).`,
                    `• The category with the lowest ${yField} is "${lowest[0]}" with ${lowest[1]} (${lowest[2]} of total).`,
                    `• Analysis shows ${Object.keys(summaryMap).length} distinct categories for ${xField}.`
                ];

                summaryText.forEach(line => {
                    const splitText = pdf.splitTextToSize(line, pageWidth - 28);
                    pdf.text(splitText, 14, y);
                    y += (splitText.length * 5) + 2;
                });
            }

            // ===== FOOTER =====
            const pageCount = pdf.internal.getNumberOfPages();
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.text(
                    `TUPT-GAD-DATA-ANALYSIS | Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: "center" }
                );
            }

            pdf.save(`${active.name}_report_${new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19)}.pdf`);
        } catch (err) {
            console.error("PDF download error:", err);
            alert("Failed to generate PDF: " + err.message);
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

    const currentDatasets = activeTab === "active" ? datasets : archivedDatasets;
    const hasActiveDatasets = datasets.length > 0;
    const hasArchivedDatasets = archivedDatasets.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sex Disaggregated Data</h1>
                        <p className="text-gray-600 mt-1">Upload, view, analyze, and manage datasets</p>
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

                {/* Dataset Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("active")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "active"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                <Folder size={16} />
                                Active Datasets ({datasets.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("archived")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "archived"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                <FolderArchive size={16} />
                                Archived Datasets ({archivedDatasets.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Datasets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {currentDatasets.map((d) => (
                        <div
                            key={d._id}
                            className={`group relative bg-white border rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer overflow-hidden ${active?._id === d._id ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/30' : 'hover:border-blue-200'} ${activeTab === "archived" ? "opacity-75" : ""}`}
                        >
                            <div className="flex flex-col h-full" onClick={() => openDataset(d._id, activeTab === "archived")}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${active?._id === d._id ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                                        <Folder size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{d.name}</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                        {d.rows?.length || 0} Records
                                    </p>
                                    <p className="text-gray-500 text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        {d.headers?.length || 0} Columns
                                    </p>
                                </div>
                                {activeTab === "archived" && (
                                    <p className="text-[10px] font-bold text-yellow-600 uppercase mt-2">Archived</p>
                                )}
                            </div>

                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {activeTab === "active" ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); archiveDataset(d._id); }} className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-all" title="Archive"><Archive size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); removeDataset(d._id); }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); restoreDataset(d._id); }} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Restore"><RotateCcw size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); removeDataset(d._id); }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {currentDatasets.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <BarChart2 size={64} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No datasets found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                {activeTab === "active" ? "Click 'Upload Dataset' to start adding new data." : "Your archived datasets will appear here."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Active Dataset Section */}
                {active && (
                    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {/* Dataset Header */}
                        <div className="p-6 md:p-8 border-b bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
                                            <Folder size={24} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="px-3 py-1 border-2 border-blue-500 rounded-xl text-xl font-black outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={handleUpdateName} disabled={isSaving} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"><Check size={18} /></button>
                                                    <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{active.name}</h2>
                                                    <button onClick={() => { setEditName(active.name); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"><Edit2 size={18} /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 font-medium ml-12">
                                        Total Records: <span className="text-blue-600 font-bold">{active.rows?.length || 0}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                    <div className="flex p-1 bg-gray-100 rounded-xl mr-2">
                                        {[
                                            { id: 'charts', label: 'Charts', icon: BarChart2 },
                                            { id: 'table', label: 'Data Table', icon: Filter }
                                        ].map(mode => (
                                            <button
                                                key={mode.id}
                                                onClick={() => setViewMode(mode.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <mode.icon size={14} />
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setShowReportOptions(true)}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} /> Export
                                    </button>
                                    <button
                                        onClick={() => setActive(null)}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Configuration Sidebar */}
                                <div className="lg:col-span-4 space-y-8">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Filter size={14} /> Filter Data
                                        </h3>
                                        <div className="bg-gray-50 p-5 rounded-2xl space-y-4">
                                            {active.headers.slice(0, 3).map((header) => (
                                                <div key={header}>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">{header}</label>
                                                    <input
                                                        type="text"
                                                        placeholder={`Search ${header}...`}
                                                        value={filters[header] || ""}
                                                        onChange={(e) => handleFilterChange(header, e.target.value)}
                                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {viewMode === 'charts' ? (
                                        <div className="flex flex-col gap-8">
                                            <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 min-h-[450px]">
                                                <div ref={chartRef} className="w-full h-full flex flex-col">
                                                    <div className="flex justify-between items-center mb-8">
                                                        <h3 className="text-lg font-black text-gray-900">{chartType.toUpperCase()} Visualization</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected: {yField} vs {xField}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex items-center justify-center">
                                                        {renderChart(chartType)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Moved Chart Config Here */}
                                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <BarChart2 size={14} /> Chart Configuration
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">X-Axis</label>
                                                        <select value={xField} onChange={(e) => setXField(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                            <option value="">Select Category</option>
                                                            {active.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Y-Axis</label>
                                                        <select value={yField} onChange={(e) => setYField(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                                            <option value="">Select Value</option>
                                                            {numericFields.map((h) => <option key={h} value={h}>{h}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Chart Style</label>
                                                        <div className="flex p-1 bg-gray-50 border rounded-xl">
                                                            {['bar', 'line', 'pie'].map(type => (
                                                                <button key={type} onClick={() => setChartType(type)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartType === type ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}>{type}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                                            <div className="px-6 py-5 border-b bg-gray-50/50 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                                                        <Filter size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-gray-900">Dataset Records</p>
                                                        <p className="text-xs font-medium text-gray-500">Raw data entries for {active.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead className="bg-gray-50/80 backdrop-blur sticky top-0 z-10">
                                                        <tr>
                                                            {active.headers.map((h) => (
                                                                <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">{h}</th>
                                                            ))}
                                                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {getFilteredRows().slice(0, 100).map((row, i) => {
                                                            const originalIndex = active.rows.findIndex(r => r === row);
                                                            const isThisRowEditing = editingRow && editingRow._index === originalIndex;
                                                            return (
                                                                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                                                    {active.headers.map((h) => (
                                                                        <td key={`${i}-${h}`} className="px-6 py-4 text-sm font-medium text-gray-600">
                                                                            {isThisRowEditing ? (
                                                                                <input type="text" value={editingRow[h] || ""} onChange={(e) => setEditingRow({ ...editingRow, [h]: e.target.value })} className="w-full px-2 py-1 border-2 border-blue-500 rounded-lg outline-none" />
                                                                            ) : row[h]}
                                                                        </td>
                                                                    ))}
                                                                    <td className="px-6 py-4 text-right">
                                                                        {isThisRowEditing ? (
                                                                            <div className="flex justify-end gap-1">
                                                                                <button onClick={() => handleUpdateRow(originalIndex)} disabled={isSaving} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md shadow-green-100"><Check size={14} /></button>
                                                                                <button onClick={() => setEditingRow(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"><X size={14} /></button>
                                                                            </div>
                                                                        ) : (
                                                                            <button onClick={() => setEditingRow({ ...row, _index: originalIndex })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-blue-100"><Edit2 size={14} /></button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
                                    <div
                                        onDragEnter={handleDragEnter}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                            id="fileUpload"
                                        />
                                        <div className="pointer-events-none">
                                            <Upload size={32} className={`mx-auto mb-2 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <p className="text-gray-600 font-medium">Click to upload or drag and drop Excel file</p>
                                            <p className="text-sm text-gray-400 mt-1">.xlsx or .xls format</p>
                                        </div>
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
        );
    }