import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import {
    Upload, Trash2, X, RefreshCw, BarChart2, Archive,
    RotateCcw, Download, Filter, Folder, FolderArchive, Edit2, Check,
    FileSpreadsheet, Eye, ChevronRight, AlertTriangle
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
    updateSexDataset,
    inspectExcelSheets,
    downloadDatasetTemplate,
    createManualDataset
} from "../../api/sexData";

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ArcElement, Tooltip, Legend, Title
);

// ── Upload wizard steps ──────────────────────────────────────────────────────
const STEP = { FILE: 1, SHEET: 2, PREVIEW: 3, NAME: 4 };

export default function SexDataAdmin() {
    // ── dataset list state ───────────────────────────────────────────────────
    const [datasets, setDatasets] = useState([]);
    const [archivedDatasets, setArchivedDatasets] = useState([]);
    const [active, setActive] = useState(null);
    const [activeTab, setActiveTab] = useState("active");

    // ── upload wizard state ──────────────────────────────────────────────────
    const [showModal, setShowModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [wizardStep, setWizardStep] = useState(STEP.FILE);
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isInspecting, setIsInspecting] = useState(false);
    const [sheets, setSheets] = useState([]);           // from /inspect
    const [selectedSheet, setSelectedSheet] = useState(null);
    const [name, setName] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // ── manual input form state ─────────────────────────────────────────────────
    const [manualName, setManualName] = useState("");
    const [manualHeaders, setManualHeaders] = useState(["Department/Program", "Year Level", "Sex", "Count"]);
    const [manualRows, setManualRows] = useState([{ "Department/Program": "", "Year Level": "", "Sex": "", "Count": "" }]);
    const [isCreatingManual, setIsCreatingManual] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // ── visualization state ──────────────────────────────────────────────────
    const [xField, setXField] = useState("");
    const [yField, setYField] = useState("");
    const [chartType, setChartType] = useState("bar");
    const [viewMode, setViewMode] = useState("charts");
    const [filters, setFilters] = useState({});
    const [yearLevelFilter, setYearLevelFilter] = useState("");
    const [programFilter, setProgramFilter] = useState("");
    const [showReportOptions, setShowReportOptions] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // ── edit state ───────────────────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editingRow, setEditingRow] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const chartRef = useRef(null);

    useEffect(() => {
        const h = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);
    const isMobile = windowWidth < 768;

    // ── drag-and-drop handlers ───────────────────────────────────────────────
    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop      = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
    };

    // ── data loading ─────────────────────────────────────────────────────────
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

    useEffect(() => { loadDatasets(); }, []);

    useEffect(() => {
        if (active?.headers) {
            const initialFilters = {};
            active.headers.forEach(h => { initialFilters[h] = ""; });
            setFilters(initialFilters);
            setYearLevelFilter("");
            setProgramFilter("");
        }
    }, [active]);

    // ── wizard: step 1 → 2 (inspect) ────────────────────────────────────────
    const handleInspect = async () => {
        if (!file) return toast.error("Please select an Excel file first.");
        const formData = new FormData();
        formData.append("file", file);
        try {
            setIsInspecting(true);
            const result = await inspectExcelSheets(formData);
            setSheets(result.sheets);
            setSelectedSheet(null);
            setWizardStep(STEP.SHEET);
        } catch (err) {
            toast.error("Failed to read file: " + (err?.response?.data?.error || err.message));
        } finally {
            setIsInspecting(false);
        }
    };

    // ── wizard: step 2 → 3 (preview) ────────────────────────────────────────
    const handleSelectSheet = (sheet) => {
        if (sheet.isEmpty) return toast.error("This sheet is empty and cannot be imported.");
        setSelectedSheet(sheet);
        setWizardStep(STEP.PREVIEW);
    };

    // ── wizard: step 3 → 4 (name) ───────────────────────────────────────────
    const handleConfirmPreview = () => {
        // Pre-fill name from sheet name if blank
        if (!name) setName(selectedSheet.name);
        setWizardStep(STEP.NAME);
    };

    // ── wizard: step 4 → upload ──────────────────────────────────────────────
    const uploadExcelFile = async () => {
        if (!file) return toast.error("No file selected");
        if (!name.trim()) return toast.error("Enter a dataset name");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name.trim());
        if (selectedSheet) formData.append("sheetName", selectedSheet.name);
        try {
            setIsUploading(true);
            await uploadSexDataExcel(formData);
            resetModal();
            loadDatasets();
            toast.success("Dataset uploaded successfully!");
        } catch (err) {
            toast.error("Upload failed: " + (err?.response?.data?.error || err.message));
        } finally {
            setIsUploading(false);
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setWizardStep(STEP.FILE);
        setFile(null);
        setSheets([]);
        setSelectedSheet(null);
        setName("");
    };

    // ── manual input form handlers ───────────────────────────────────────────────
    const resetManualModal = () => {
        setShowManualModal(false);
        setManualName("");
        setManualHeaders(["Department/Program", "Year Level", "Sex", "Count"]);
        setManualRows([{ "Department/Program": "", "Year Level": "", "Sex": "", "Count": "" }]);
    };

    const addManualRow = () => {
        const newRow = {};
        manualHeaders.forEach(h => newRow[h] = "");
        setManualRows([...manualRows, newRow]);
    };

    const removeManualRow = (index) => {
        if (manualRows.length > 1) {
            setManualRows(manualRows.filter((_, i) => i !== index));
        } else {
            toast.error("At least one row is required");
        }
    };

    const updateManualRow = (index, header, value) => {
        const updatedRows = [...manualRows];
        updatedRows[index][header] = value;
        setManualRows(updatedRows);
    };

    const addManualHeader = () => {
        const newHeader = prompt("Enter new column name:");
        if (newHeader && newHeader.trim() && !manualHeaders.includes(newHeader.trim())) {
            setManualHeaders([...manualHeaders, newHeader.trim()]);
            setManualRows(manualRows.map(row => ({ ...row, [newHeader.trim()]: "" })));
        } else if (manualHeaders.includes(newHeader?.trim())) {
            toast.error("Column name already exists");
        }
    };

    const removeManualHeader = (header) => {
        if (manualHeaders.length <= 1) {
            toast.error("At least one column is required");
            return;
        }
        setManualHeaders(manualHeaders.filter(h => h !== header));
        setManualRows(manualRows.map(row => {
            const newRow = { ...row };
            delete newRow[header];
            return newRow;
        }));
    };

    const handleCreateManualDataset = async () => {
        if (!manualName.trim()) return toast.error("Please enter a dataset name");
        if (manualHeaders.length === 0) return toast.error("At least one column is required");
        if (manualRows.length === 0) return toast.error("At least one row is required");

        // Validate that all rows have values
        const emptyRows = manualRows.filter(row => 
            manualHeaders.every(h => !row[h] || row[h].trim() === "")
        );
        if (emptyRows.length === manualRows.length) {
            return toast.error("Please fill in at least one complete row");
        }

        setShowConfirmDialog(true);
    };

    const confirmCreateManualDataset = async () => {
        try {
            setIsCreatingManual(true);
            await createManualDataset({
                name: manualName.trim(),
                headers: manualHeaders,
                rows: manualRows
            });
            setShowConfirmDialog(false);
            resetManualModal();
            loadDatasets();
            toast.success("Dataset created successfully!");
        } catch (err) {
            toast.error("Failed to create dataset: " + (err?.response?.data?.error || err.message));
        } finally {
            setIsCreatingManual(false);
        }
    };

    // ── dataset actions ──────────────────────────────────────────────────────
    const openDataset = async (id) => {
        try {
            const data = await getSexDatasetById(id);
            setActive(data);
            setXField(""); setYField(""); setChartType("bar");
            if (data?.headers && data?.rows) {
                const textFields = data.headers.filter(h =>
                    data.rows.some(r => typeof r[h] === 'string' || isNaN(Number(r[h])))
                );
                const numericFields = data.headers.filter(h => {
                    const numCount = data.rows.filter(r => {
                        const v = r[h]; return !isNaN(Number(v)) && isFinite(Number(v));
                    }).length;
                    return numCount > data.rows.length * 0.5;
                });
                if (textFields.length > 0) setXField(textFields[0]);
                if (numericFields.length > 0) setYField(numericFields[0]);
            }
        } catch (err) {
            toast.error("Failed to load dataset");
        }
    };

    const archiveDataset = async (id) => {
        if (!window.confirm("Archive this dataset?")) return;
        try {
            await archiveSexDataset(id);
            if (active?._id === id) setActive(null);
            loadDatasets();
            toast.success("Dataset archived successfully!");
        } catch { toast.error("Failed to archive dataset"); }
    };

    const restoreDataset = async (id) => {
        if (!window.confirm("Restore this dataset?")) return;
        try {
            await restoreSexDataset(id);
            if (active?._id === id) setActive(null);
            loadDatasets();
            toast.success("Dataset restored successfully!");
        } catch { toast.error("Failed to restore dataset"); }
    };

    const removeDataset = async (id) => {
        if (!window.confirm("Permanently delete this dataset?")) return;
        try {
            await deleteSexDataset(id);
            if (active?._id === id) setActive(null);
            loadDatasets();
            toast.success("Dataset deleted permanently!");
        } catch { toast.error("Failed to delete dataset"); }
    };

    const handleUpdateName = async () => {
        if (!editName.trim()) return toast.error("Name cannot be empty");
        try {
            setIsSaving(true);
            await updateSexDataset(active._id, { name: editName });
            setActive({ ...active, name: editName });
            setIsEditing(false);
            loadDatasets();
            toast.success("Dataset renamed successfully!");
        } catch { toast.error("Failed to rename dataset"); }
        finally { setIsSaving(false); }
    };

    const handleUpdateRow = async (index) => {
        try {
            setIsSaving(true);
            const updatedRows = [...active.rows];
            updatedRows[index] = editingRow;
            await updateSexDataset(active._id, { rows: updatedRows });
            setActive({ ...active, rows: updatedRows });
            setEditingRow(null);
            toast.success("Row updated successfully!");
        } catch { toast.error("Failed to update row"); }
        finally { setIsSaving(false); }
    };

    // ── filtering ─────────────────────────────────────────────────────────────
    const getFilteredRows = () => {
        if (!active?.rows) return [];
        return active.rows.filter(row => {
            // Global text filters
            const passGlobal = Object.keys(filters).every(key => {
                if (!filters[key]) return true;
                return String(row[key] || "").toLowerCase().includes(filters[key].toLowerCase());
            });
            // Year Level dedicated filter
            const passYear = !yearLevelFilter || !active.yearLevelField ||
                String(row[active.yearLevelField] || "").toLowerCase().includes(yearLevelFilter.toLowerCase());
            // Program dedicated filter
            const passProgram = !programFilter || !active.programField ||
                String(row[active.programField] || "").toLowerCase().includes(programFilter.toLowerCase());
            return passGlobal && passYear && passProgram;
        });
    };

    // Unique values for Year Level dropdown
    const yearLevelOptions = active?.yearLevelField
        ? [...new Set(active.rows.map(r => String(r[active.yearLevelField] || "")).filter(Boolean))].sort()
        : [];

    // Unique values for Program dropdown
    const programOptions = active?.programField
        ? [...new Set(active.rows.map(r => String(r[active.programField] || "")).filter(Boolean))].sort()
        : [];

    // ── chart helpers ─────────────────────────────────────────────────────────
    const numericFields = active?.rows
        ? active.headers.filter(h =>
            active.rows.every(r => {
                const v = r[h];
                return v !== null && v !== "" && !isNaN(Number(v));
            })
          )
        : [];

    const generateChartData = () => {
        if (!active || !xField || !yField) return null;
        const filteredRows = getFilteredRows();
        if (filteredRows.length === 0) return null;
        return {
            labels: filteredRows.map(r =>
                String(r[xField] || "").replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim()
            ),
            datasets: [{
                label: yField,
                data: filteredRows.map(r => Number(r[yField]) || 0),
                backgroundColor: chartType === "pie"
                    ? ["#8B5CF6","#10B981","#EF4444","#F59E0B","#3B82F6",
                       "#EC4899","#06B6D4","#84CC16","#F97316","#6366F1"].slice(0, filteredRows.length)
                    : "rgba(139, 92, 246, 0.6)",
                borderColor: "rgba(124, 58, 237, 1)",
                borderWidth: 1
            }]
        };
    };

    const getDynamicPadding = () => {
        if (chartType === 'pie') return { left: 20, right: 20, top: 40, bottom: 20 };
        const labels = generateChartData()?.labels || [];
        const max = labels.reduce((m, l) => Math.max(m, String(l).length), 0);
        if (max <= 10) return { left: 20, right: 20, top: 10, bottom: 40 };
        if (max <= 25) return { left: Math.round(max * 3), right: 20, top: 10, bottom: Math.round(max * 2.5) };
        return {
            left: Math.min(170, Math.max(80, max * 3.7)),
            right: 20, top: 10,
            bottom: Math.min(95, Math.max(60, max * 2))
        };
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false, indexAxis: 'x',
        layout: { padding: getDynamicPadding() },
        scales: {
            x: { display: chartType !== 'pie', ticks: { maxRotation: 45, minRotation: 45 } },
            y: { display: chartType !== 'pie' }
        },
        plugins: {
            legend: { position: 'top', labels: { padding: chartType === 'pie' ? 20 : 10 } },
            title: { display: true, text: `${yField} by ${xField}` },
            tooltip: { callbacks: { title: ctx => ctx[0].label } }
        }
    };

    // ── download helpers ──────────────────────────────────────────────────────
    const downloadCSV = () => {
        if (!active) return;
        const rows = getFilteredRows();
        const csvRows = [active.headers.join(',')];
        rows.forEach(row => {
            csvRows.push(active.headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${active.name}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    };

    const downloadExcel = async () => {
        if (!active) return;
        try {
            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(getFilteredRows());
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, `${active.name}_${new Date().toISOString().slice(0,10)}.xlsx`);
        } catch { toast.error("Failed to download Excel file"); }
    };

    const captureFullChart = async () => {
        const canvas = chartRef.current?.querySelector('canvas');
        if (!canvas) return null;
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width; tmp.height = canvas.height;
        const ctx = tmp.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, tmp.width, tmp.height);
        ctx.drawImage(canvas, 0, 0);
        return tmp;
    };

    const downloadPDF = async () => {
        if (!active) return;
        try {
            const { jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const purple = [126, 34, 206];

            pdf.setFontSize(22); pdf.setTextColor(...purple); pdf.setFont("helvetica", "bold");
            pdf.text("SEX DISAGGREGATED DATA REPORT", pageWidth / 2, 20, { align: 'center' });
            pdf.setFontSize(10); pdf.setTextColor(100); pdf.setFont("helvetica", "normal");
            pdf.text("Technological University of the Philippines - GAD Office", pageWidth / 2, 26, { align: 'center' });
            pdf.setDrawColor(...purple); pdf.setLineWidth(0.5); pdf.line(14, 32, pageWidth - 14, 32);

            let y = 45;
            pdf.setFontSize(14); pdf.setTextColor(0); pdf.setFont("helvetica", "bold");
            pdf.text(`Dataset: ${active.name}`, 14, y); y += 8;
            pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(80);
            pdf.text(`Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, y); y += 6;
            pdf.text(`Total Records Analyzed: ${getFilteredRows().length}`, 14, y); y += 6;
            if (yearLevelFilter) { pdf.text(`Year Level Filter: ${yearLevelFilter}`, 14, y); y += 6; }
            if (programFilter)   { pdf.text(`Program Filter: ${programFilter}`, 14, y); y += 6; }
            y += 6;

            if (xField && yField && chartRef.current) {
                pdf.setFontSize(12); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...purple);
                pdf.text("Data Visualization", 14, y); y += 6;
                const canvas = await captureFullChart();
                if (canvas) {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = pageWidth - 40;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    if (y + imgHeight > pageHeight - 30) { pdf.addPage(); y = 20; }
                    pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
                    y += imgHeight + 15;
                }
            }

            const filteredRows = getFilteredRows();
            if (xField && yField && filteredRows.length > 0) {
                pdf.setFontSize(12); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...purple);
                pdf.text("Statistical Summary", 14, y); y += 6;
                const summaryMap = {}; let totalY = 0;
                filteredRows.forEach(row => {
                    const label = String(row[xField] || "N/A");
                    const val = Number(row[yField]) || 0;
                    summaryMap[label] = (summaryMap[label] || 0) + val;
                    totalY += val;
                });
                const summaryData = Object.entries(summaryMap)
                    .map(([label, val]) => [label, val.toLocaleString(), totalY > 0 ? ((val/totalY)*100).toFixed(1)+"%" : "0%"])
                    .sort((a, b) => parseFloat(b[1].replace(/,/g,'')) - parseFloat(a[1].replace(/,/g,'')));

                autoTable(pdf, {
                    startY: y,
                    head: [[xField, yField, "Percentage"]],
                    body: summaryData,
                    theme: 'striped',
                    headStyles: { fillColor: purple, textColor: 255 },
                    styles: { fontSize: 9 },
                    margin: { left: 14, right: 14 }
                });
                y = pdf.lastAutoTable.finalY + 12;

                if (y > pageHeight - 60) { pdf.addPage(); y = 25; }
                pdf.setFontSize(12); pdf.setFont("helvetica", "bold"); pdf.setTextColor(...purple);
                pdf.text("Analysis Summary", 14, y); y += 10;
                pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(0);
                const highest = summaryData[0]; const lowest = summaryData[summaryData.length - 1];
                [
                    `• Dataset "${active.name}" contains ${filteredRows.length} records.`,
                    `• Total accumulated value for ${yField}: ${totalY.toLocaleString()}.`,
                    `• Highest: "${highest[0]}" with ${highest[1]} (${highest[2]} of total).`,
                    `• Lowest: "${lowest[0]}" with ${lowest[1]} (${lowest[2]} of total).`,
                    `• ${Object.keys(summaryMap).length} distinct categories for ${xField}.`
                ].forEach(line => {
                    const split = pdf.splitTextToSize(line, pageWidth - 28);
                    pdf.text(split, 14, y);
                    y += (split.length * 5) + 2;
                });
            }

            const pageCount = pdf.internal.getNumberOfPages();
            pdf.setFontSize(8); pdf.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.text(`TUPT-GAD-DATA-ANALYSIS | Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
            }
            pdf.save(`${active.name}_report_${new Date().toISOString().replace(/T/,'_').replace(/:/g,'-').slice(0,19)}.pdf`);
        } catch (err) { toast.error("Failed to generate PDF: " + err.message); }
    };

    const downloadChartImage = async () => {
        if (!chartRef.current) return;
        const canvas = await captureFullChart();
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `${active.name}_chart_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const renderChart = (type) => {
        const data = generateChartData();
        if (!data) return <div className="text-gray-500 text-center py-8">Select X and Y axis to generate chart</div>;
        const props = {
            data,
            options: { ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: `${type.toUpperCase()} Chart - ${yField} by ${xField}` } } },
            height: 900
        };
        if (type === 'bar') return <Bar {...props} />;
        if (type === 'line') return <Line {...props} />;
        if (type === 'pie') return <Pie {...props} />;
        return null;
    };

    const currentDatasets = activeTab === "active" ? datasets : archivedDatasets;

    // ── wizard step labels ────────────────────────────────────────────────────
    const stepLabels = ["Select File", "Choose Sheet", "Preview", "Name & Upload"];
    const stepIcons  = [Upload, FileSpreadsheet, Eye, Check];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sex Disaggregated Data</h1>
                        <p className="text-gray-600 mt-1">Upload, view, analyze, and manage datasets</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={downloadDatasetTemplate}
                            className="px-4 py-2 bg-violet-100 text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-200 transition flex items-center gap-2 text-sm font-medium"
                        >
                            <Download size={16} /> Download Template
                        </button>
                        <button
                            onClick={() => setShowReportOptions(true)}
                            disabled={!active}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                            <Download size={16} /> Export
                        </button>
                        <button
                            onClick={() => { setShowModal(true); setWizardStep(STEP.FILE); }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                        >
                            <Upload size={16} /> Upload Dataset
                        </button>
                        <button
                            onClick={() => setShowManualModal(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 text-sm"
                        >
                            <FileSpreadsheet size={16} /> Manual Input
                        </button>
                    </div>
                </div>

                {/* Dataset Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: "active", label: `Active Datasets (${datasets.length})`, icon: Folder },
                                { id: "archived", label: `Archived Datasets (${archivedDatasets.length})`, icon: FolderArchive }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Datasets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {currentDatasets.map(d => (
                        <div
                            key={d._id}
                            className={`group relative bg-white border rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer overflow-hidden ${
                                active?._id === d._id ? 'ring-2 ring-violet-500 border-transparent bg-violet-50/30' : 'hover:border-violet-200'
                            } ${activeTab === "archived" ? "opacity-75" : ""}`}
                        >
                            <div className="flex flex-col h-full" onClick={() => openDataset(d._id)}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${active?._id === d._id ? 'bg-violet-500 text-white' : 'bg-violet-50 text-violet-600 group-hover:bg-violet-100'}`}>
                                        <BarChart2 size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors truncate">{d.name}</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                        {d.rows?.length || 0} Records
                                    </p>
                                    <p className="text-gray-500 text-sm flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        {d.headers?.length || 0} Columns
                                    </p>
                                    {d.sourceSheet && (
                                        <p className="text-gray-400 text-xs flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
                                            Sheet: {d.sourceSheet}
                                        </p>
                                    )}
                                </div>
                                {activeTab === "archived" && (
                                    <p className="text-[10px] font-bold text-yellow-600 uppercase mt-2">Archived</p>
                                )}
                            </div>

                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {activeTab === "active" ? (
                                    <>
                                        <button onClick={e => { e.stopPropagation(); archiveDataset(d._id); }} className="p-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-all" title="Archive"><Archive size={14} /></button>
                                        <button onClick={e => { e.stopPropagation(); removeDataset(d._id); }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={e => { e.stopPropagation(); restoreDataset(d._id); }} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Restore"><RotateCcw size={14} /></button>
                                        <button onClick={e => { e.stopPropagation(); removeDataset(d._id); }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Delete"><Trash2 size={14} /></button>
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
                                        <div className="bg-violet-600 text-white p-2 rounded-xl shadow-lg shadow-violet-200">
                                            <BarChart2 size={24} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="px-3 py-1 border-2 border-violet-500 rounded-xl text-xl font-black outline-none"
                                                        autoFocus
                                                    />
                                                    <button onClick={handleUpdateName} disabled={isSaving} className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"><Check size={18} /></button>
                                                    <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{active.name}</h2>
                                                    <button onClick={() => { setEditName(active.name); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-full transition"><Edit2 size={18} /></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 font-medium ml-12">
                                        Analyzing <span className="text-violet-600 font-bold">{getFilteredRows().length}</span> of <span className="text-gray-600 font-bold">{active.rows?.length}</span> entries
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
                                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                <mode.icon size={14} />{mode.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setShowReportOptions(true)} className="flex-1 md:flex-none px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                                        <Download size={18} /> Export
                                    </button>
                                    <button onClick={() => setActive(null)} className="flex-1 md:flex-none px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                            {/* Smart Filters */}
                            <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Filter size={14} /> Filters
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Year Level filter — dedicated dropdown if field auto-detected */}
                                    {active.yearLevelField && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-violet-600 uppercase mb-1 ml-1 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block"></span>
                                                Year Level
                                            </label>
                                            <select
                                                value={yearLevelFilter}
                                                onChange={e => setYearLevelFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-violet-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">All Year Levels</option>
                                                {yearLevelOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    {/* Program filter — dedicated dropdown if field auto-detected */}
                                    {active.programField && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-violet-600 uppercase mb-1 ml-1 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block"></span>
                                                Program / Department
                                            </label>
                                            <select
                                                value={programFilter}
                                                onChange={e => setProgramFilter(e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-violet-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="">All Programs</option>
                                                {programOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    {/* Generic text filters for first columns (up to 4 total including smart ones) */}
                                    {active.headers
                                        .filter(h => h !== active.yearLevelField && h !== active.programField)
                                        .slice(0, 4 - (active.yearLevelField ? 1 : 0) - (active.programField ? 1 : 0))
                                        .map(header => (
                                            <div key={header}>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">{header}</label>
                                                <input
                                                    type="text"
                                                    placeholder={`Search ${header}...`}
                                                    value={filters[header] || ""}
                                                    onChange={e => setFilters(prev => ({ ...prev, [header]: e.target.value }))}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                                />
                                            </div>
                                        ))
                                    }
                                    {/* Reset filters */}
                                    {(yearLevelFilter || programFilter || Object.values(filters).some(Boolean)) && (
                                        <div className="flex items-end">
                                            <button
                                                onClick={() => {
                                                    setYearLevelFilter("");
                                                    setProgramFilter("");
                                                    const reset = {};
                                                    active.headers.forEach(h => { reset[h] = ""; });
                                                    setFilters(reset);
                                                }}
                                                className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm hover:bg-red-100 transition font-medium"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Visualization Area */}
                            <div className="w-full flex flex-col gap-6">
                                {viewMode === 'charts' ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-4 md:p-8 flex-1 border border-gray-100 min-h-[680px]">
                                            <div ref={chartRef} className="w-full h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-xl font-bold text-gray-900">{yField || "Values"} by {xField || "Categories"}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${generateChartData() ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}></span>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Preview</span>
                                                    </div>
                                                </div>
                                                <div className={isMobile ? "flex-1 w-full overflow-x-auto pb-4" : "flex-1 w-full"}>
                                                    <div style={{
                                                        width: '100%',
                                                        minWidth: isMobile
                                                            ? (chartType === 'pie' ? '100%' : (() => {
                                                                const labels = generateChartData()?.labels || [];
                                                                const maxLabel = labels.reduce((m, l) => Math.max(m, String(l).length), 0);
                                                                return maxLabel <= 10 ? '100%' : `${Math.max(750, labels.length * 45)}px`;
                                                              })())
                                                            : '100%',
                                                        height: '100%', minHeight: '600px'
                                                    }}>
                                                        {renderChart(chartType)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart2 size={14} /> Chart Configuration</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">{chartType === 'pie' ? 'Category (Slice Label)' : 'X-Axis (Label)'}</label>
                                                    <select value={xField} onChange={e => setXField(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all">
                                                        <option value="">Select Field</option>
                                                        {active.headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">{chartType === 'pie' ? 'Value (Slice Size)' : 'Y-Axis (Value)'}</label>
                                                    {numericFields.length > 0 ? (
                                                        <select value={yField} onChange={e => setYField(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all">
                                                            <option value="">Select Numeric Field</option>
                                                            {numericFields.map(h => <option key={h} value={h}>{h}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed">Auto (Count occurrences)</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Visualization</label>
                                                    <div className="flex p-1 bg-gray-50 border rounded-xl">
                                                        {['bar', 'line', 'pie'].map(type => (
                                                            <button key={type} onClick={() => setChartType(type)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === type ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                                                                {type.toUpperCase()}
                                                            </button>
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
                                                <div className="p-3 bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-200"><Filter size={20} /></div>
                                                <div>
                                                    <p className="text-lg font-black text-gray-900">Detailed Data Table</p>
                                                    <p className="text-xs font-medium text-gray-500">View and edit records for {active.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50/80 backdrop-blur sticky top-0 z-10">
                                                    <tr>
                                                        {active.headers.map(h => (
                                                            <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">{h}</th>
                                                        ))}
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {getFilteredRows().map((row, i) => {
                                                        const originalIndex = active.rows.findIndex(r => r === row);
                                                        const isThisRowEditing = editingRow && editingRow._index === originalIndex;
                                                        return (
                                                            <tr key={i} className="hover:bg-violet-50/30 transition-colors group">
                                                                {active.headers.map(h => (
                                                                    <td key={`${i}-${h}`} className="px-6 py-4 text-sm font-medium text-gray-600">
                                                                        {isThisRowEditing ? (
                                                                            <input type="text" value={editingRow[h] || ""} onChange={e => setEditingRow({ ...editingRow, [h]: e.target.value })} className="w-full px-2 py-1 border-2 border-violet-500 rounded-lg outline-none" />
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
                                                                        <button onClick={() => setEditingRow({ ...row, _index: originalIndex })} className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-violet-100"><Edit2 size={14} /></button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            {getFilteredRows().length === 0 && (
                                                <div className="py-20 text-center text-gray-400 font-medium">No records match your filters.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Upload Wizard Modal ────────────────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">

                        {/* Modal Header + Step Indicator */}
                        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-white">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Upload Dataset</h2>
                                <button onClick={resetModal} className="text-white/70 hover:text-white"><X size={24} /></button>
                            </div>
                            {/* Stepper */}
                            <div className="flex items-center gap-1">
                                {stepLabels.map((label, idx) => {
                                    const stepNum = idx + 1;
                                    const done = wizardStep > stepNum;
                                    const current = wizardStep === stepNum;
                                    const Icon = stepIcons[idx];
                                    return (
                                        <React.Fragment key={label}>
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                current ? 'bg-white text-blue-700 shadow' :
                                                done    ? 'bg-white/30 text-white' :
                                                          'text-white/40'
                                            }`}>
                                                <Icon size={12} /> {label}
                                            </div>
                                            {idx < stepLabels.length - 1 && <ChevronRight size={14} className="text-white/40 flex-shrink-0" />}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6">
                            {/* ── STEP 1: File pick ─────────────────────────── */}
                            {wizardStep === STEP.FILE && (
                                <div className="space-y-5">
                                    <div
                                        onDragEnter={handleDragEnter} onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave} onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                                    >
                                        <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" />
                                        <div className="pointer-events-none">
                                            <Upload size={36} className={`mx-auto mb-3 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <p className="text-gray-700 font-semibold">Click to upload or drag & drop</p>
                                            <p className="text-sm text-gray-400 mt-1">.xlsx or .xls format only</p>
                                        </div>
                                        {file && <p className="text-sm text-blue-600 mt-3 font-medium">✓ {file.name}</p>}
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button onClick={resetModal} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                                        <button onClick={handleInspect} disabled={!file || isInspecting} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center gap-2">
                                            {isInspecting ? <><RefreshCw size={16} className="animate-spin" /> Reading...</> : <>Next: Choose Sheet <ChevronRight size={16} /></>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Sheet selector ────────────────────── */}
                            {wizardStep === STEP.SHEET && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">The file contains <strong>{sheets.length}</strong> sheet{sheets.length !== 1 ? 's' : ''}. Select the one you want to import.</p>
                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                        {sheets.map(sheet => (
                                            <button
                                                key={sheet.name}
                                                onClick={() => handleSelectSheet(sheet)}
                                                disabled={sheet.isEmpty}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                    sheet.isEmpty
                                                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-gray-900 flex items-center gap-2">
                                                            <FileSpreadsheet size={16} className="text-green-600" />
                                                            {sheet.name}
                                                            {sheet.isEmpty && <span className="text-xs text-red-500 font-normal">(empty)</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">{sheet.rowCount} rows · {sheet.headers.length} columns</p>
                                                        {(sheet.detectedYearLevel || sheet.detectedProgram) && (
                                                            <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                                                                <Check size={11} />
                                                                Auto-detects: {[sheet.detectedYearLevel && `Year Level (${sheet.detectedYearLevel})`, sheet.detectedProgram && `Program (${sheet.detectedProgram})`].filter(Boolean).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {!sheet.isEmpty && <ChevronRight size={18} className="text-gray-400 mt-1" />}
                                                </div>
                                                {sheet.headers.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {sheet.headers.slice(0, 6).map(h => (
                                                            <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{h}</span>
                                                        ))}
                                                        {sheet.headers.length > 6 && <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px]">+{sheet.headers.length - 6} more</span>}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-start">
                                        <button onClick={() => setWizardStep(STEP.FILE)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">← Back</button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 3: Preview ───────────────────────────── */}
                            {wizardStep === STEP.PREVIEW && selectedSheet && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-900 flex items-center gap-2"><Eye size={16} className="text-blue-600" /> Preview: "{selectedSheet.name}"</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{selectedSheet.rowCount} total rows · Showing first {Math.min(5, selectedSheet.preview.length)}</p>
                                        </div>
                                        {selectedSheet.headers.length !== selectedSheet.headers.filter((h, i, a) => a.indexOf(h) === i).length && (
                                            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-xs font-medium">
                                                <AlertTriangle size={14} /> Duplicate columns detected
                                            </div>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-60">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    {selectedSheet.headers.map(h => (
                                                        <th key={h} className="px-3 py-2 font-bold text-gray-500 uppercase border-b border-gray-200 whitespace-nowrap">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {selectedSheet.preview.map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        {selectedSheet.headers.map(h => (
                                                            <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap">{String(row[h] ?? "")}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {(selectedSheet.detectedYearLevel || selectedSheet.detectedProgram) && (
                                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 text-sm text-violet-700">
                                            <p className="font-semibold mb-1 flex items-center gap-1"><Check size={14} /> Smart filters will be enabled for:</p>
                                            <ul className="list-disc list-inside text-xs space-y-0.5 ml-1">
                                                {selectedSheet.detectedYearLevel && <li>Year Level → <strong>{selectedSheet.detectedYearLevel}</strong></li>}
                                                {selectedSheet.detectedProgram   && <li>Program / Department → <strong>{selectedSheet.detectedProgram}</strong></li>}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-between gap-3">
                                        <button onClick={() => setWizardStep(STEP.SHEET)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">← Back</button>
                                        <button onClick={handleConfirmPreview} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                                            Looks Good <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 4: Name & Upload ─────────────────────── */}
                            {wizardStep === STEP.NAME && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dataset Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Enrollment Data 2024-2025"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                                        <p className="font-semibold text-gray-800 mb-2">Summary</p>
                                        <p>📄 File: <strong>{file?.name}</strong></p>
                                        <p>📋 Sheet: <strong>{selectedSheet?.name}</strong></p>
                                        <p>📊 Rows to import: <strong>{selectedSheet?.rowCount}</strong></p>
                                        <p>🔢 Columns: <strong>{selectedSheet?.headers.length}</strong></p>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <button onClick={() => setWizardStep(STEP.PREVIEW)} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">← Back</button>
                                        <button onClick={uploadExcelFile} disabled={!name.trim() || isUploading} className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2">
                                            {isUploading ? <><RefreshCw size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Dataset</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Export Modal */}
            {showReportOptions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Export Options</h2>
                            <button onClick={() => setShowReportOptions(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                        </div>
                        {(yearLevelFilter || programFilter) && (
                            <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-700">
                                Export will include only currently filtered records ({getFilteredRows().length} of {active?.rows?.length}).
                            </div>
                        )}
                        <div className="space-y-3">
                            {[
                                { label: "Download CSV", color: "green", fn: downloadCSV },
                                { label: "Download Excel", color: "blue", fn: downloadExcel },
                                { label: "Download PDF Report", color: "red", fn: downloadPDF },
                            ].map(({ label, color, fn }) => (
                                <button key={label} onClick={() => { fn(); setShowReportOptions(false); }}
                                    className={`w-full p-3 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 transition flex items-center justify-center gap-2`}>
                                    <Download size={18} /><span>{label}</span>
                                </button>
                            ))}
                            {generateChartData() && (
                                <button onClick={() => { downloadChartImage(); setShowReportOptions(false); }}
                                    className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
                                    <Download size={18} /><span>Download Chart Image</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Input Modal */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Manual Data Entry</h2>
                                    <p className="text-sm text-white/80 mt-1">Create a dataset by entering data manually</p>
                                </div>
                                <button onClick={resetManualModal} className="text-white/70 hover:text-white"><X size={24} /></button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Dataset Name */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Dataset Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Enrollment Data 2024-2025"
                                    value={manualName}
                                    onChange={e => setManualName(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Column Headers */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Column Headers</label>
                                    <button onClick={addManualHeader} className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                        <Check size={14} /> Add Column
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {manualHeaders.map((header, idx) => (
                                        <div key={header} className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg">
                                            <span className="font-medium">{header}</span>
                                            {manualHeaders.length > 1 && (
                                                <button onClick={() => removeManualHeader(header)} className="text-purple-500 hover:text-red-600">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Rows */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Data Rows</label>
                                    <button onClick={addManualRow} className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                        <Check size={14} /> Add Row
                                    </button>
                                </div>
                                <div className="border rounded-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {manualHeaders.map(h => (
                                                    <th key={h} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">{h}</th>
                                                ))}
                                                <th className="px-4 py-2 text-xs font-bold text-gray-500 uppercase w-10">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {manualRows.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {manualHeaders.map(header => (
                                                        <td key={`${rowIndex}-${header}`} className="px-4 py-2">
                                                            <input
                                                                type="text"
                                                                value={row[header] || ""}
                                                                onChange={e => updateManualRow(rowIndex, header, e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                                placeholder="Enter value"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-4 py-2">
                                                        {manualRows.length > 1 && (
                                                            <button onClick={() => removeManualRow(rowIndex)} className="text-red-500 hover:text-red-700">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={resetManualModal} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                                Cancel
                            </button>
                            <button onClick={handleCreateManualDataset} className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
                                <Check size={16} /> Create Dataset
                            </button>
                        </div>
                    </div>

                    {/* Confirmation Dialog */}
                    {showConfirmDialog && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-10">
                            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <Check size={24} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Confirm Dataset Creation</h3>
                                        <p className="text-sm text-gray-500">Please review the details below</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Dataset Name:</span>
                                        <span className="text-sm font-semibold text-gray-900">{manualName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Columns:</span>
                                        <span className="text-sm font-semibold text-gray-900">{manualHeaders.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Rows:</span>
                                        <span className="text-sm font-semibold text-gray-900">{manualRows.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500">Source:</span>
                                        <span className="text-sm font-semibold text-purple-600">Manual Entry</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setShowConfirmDialog(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
                                        Go Back
                                    </button>
                                    <button onClick={confirmCreateManualDataset} disabled={isCreatingManual} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium">
                                        {isCreatingManual ? <><RefreshCw size={16} className="animate-spin" /> Creating...</> : <><Check size={16} /> Confirm & Create</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}