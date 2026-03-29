import React, { useState, useEffect, useRef } from "react";
import { BarChart2, Download, Filter, Eye } from "lucide-react";
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
    getSexDatasets,
    getSexDatasetById
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

export default function SexDataViewer() {
    const [datasets, setDatasets] = useState([]);
    const [active, setActive] = useState(null);
    const [xField, setXField] = useState("");
    const [yField, setYField] = useState("");
    const [chartType, setChartType] = useState("bar");
    const [filters, setFilters] = useState({});
    const [viewMode, setViewMode] = useState("charts"); // "charts" or "table"
    const [showReportOptions, setShowReportOptions] = useState(false);
    const chartRef = useRef(null);

    const loadDatasets = async () => {
        try {
            const activeData = await getSexDatasets();
            setDatasets(Array.isArray(activeData) ? activeData : []);
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

    const openDataset = async (id) => {
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
                            "#8B5CF6", "#10B981", "#EF4444", "#F59E0B", "#3B82F6",
                            "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
                        ].slice(0, filteredRows.length)
                        : "rgba(139, 92, 246, 0.6)",
                    borderColor: "rgba(124, 58, 237, 1)",
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

    // Download Functions (Read-only for users)
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
            const purpleTheme = [126, 34, 206]; // Purple 700

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
            height: 900
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


    return (
        <main className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden mb-12">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
                        Sex Disaggregated <span className="text-violet-400">Data</span>
                    </h1>
                    <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
                    <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
                        View and analyze available datasets for gender-based research and institutional reporting.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Datasets Grid - View Only */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {datasets.map((d) => (
                        <div
                            key={d._id}
                            onClick={() => openDataset(d._id)}
                            className={`group relative bg-white border rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer overflow-hidden ${active?._id === d._id ? 'ring-2 ring-violet-500 border-transparent bg-violet-50/30' : 'hover:border-violet-200'}`}
                        >
                            <div className="flex flex-col h-full">
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
                                </div>
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()}</span>
                                    <div className={`p-1.5 rounded-full transition-all ${active?._id === d._id ? 'bg-violet-500 text-white' : 'text-gray-400 group-hover:bg-violet-50 group-hover:text-violet-500'}`}>
                                        <Eye size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {datasets.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <BarChart2 size={64} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No datasets available</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">Check back later for updated sex-disaggregated statistics and analysis.</p>
                        </div>
                    )}
                </div>

                {/* Active Dataset Section */}
                {active && (
                    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                        {/* Dataset Header */}
                        <div className="p-6 md:p-8 border-b bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-blue-600 text-white p-2 rounded-xl">
                                            <BarChart2 size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-gray-900 leading-tight">{active.name}</h2>
                                    </div>
                                    <p className="text-gray-500 font-medium ml-12">
                                        Analyzing <span className="text-violet-600 font-bold">{getFilteredRows().length}</span> entries
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

                        <div className="p-6 md:p-8 space-y-8">
                            {/* Horizontal Filters */}
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Filter size={14} /> Global Filters
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {active.headers.slice(0, 4).map((header) => (
                                        <div key={header}>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">{header}</label>
                                            <input
                                                type="text"
                                                placeholder={`Search ${header}...`}
                                                value={filters[header] || ""}
                                                onChange={(e) => handleFilterChange(header, e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visualization Area - Full Width */}
                            <div className="w-full flex flex-col gap-6">
                                {viewMode === 'charts' ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="bg-gray-50 rounded-3xl p-6 md:p-8 flex-1 border border-gray-100 min-h-[1000px]">
                                            <div ref={chartRef} className="w-full h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {yField || "Values"} by {xField || "Categories"}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${generateChartData() ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}></span>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Preview</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex items-center justify-center">
                                                    {renderChart(chartType)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chart Settings */}
                                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <BarChart2 size={14} /> Chart Configuration
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">X-Axis (Label)</label>
                                                    <select
                                                        value={xField}
                                                        onChange={(e) => setXField(e.target.value)}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                                    >
                                                        <option value="">Select Field</option>
                                                        {active.headers.map((h) => (
                                                            <option key={h} value={h}>{h}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Y-Axis (Value)</label>
                                                    <select
                                                        value={yField}
                                                        onChange={(e) => setYField(e.target.value)}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                                    >
                                                        <option value="">Select Numeric Field</option>
                                                        {numericFields.map((h) => (
                                                            <option key={h} value={h}>{h}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Visualization</label>
                                                    <div className="flex p-1 bg-gray-50 border rounded-xl">
                                                        {['bar', 'line', 'pie'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => setChartType(type)}
                                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === type ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                                            >
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
                                                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                                                    <Filter size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-gray-900">Detailed Data Table</p>
                                                    <p className="text-xs font-medium text-gray-500">View raw records and filtered results</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50/80 backdrop-blur sticky top-0 z-10">
                                                    <tr>
                                                        {active.headers.map((h) => (
                                                            <th key={h} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                                                                {h}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {getFilteredRows().map((row, i) => (
                                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                                            {active.headers.map((h) => (
                                                                <td key={`${i}-${h}`} className="px-6 py-4 text-sm font-medium text-gray-600">
                                                                    {row[h]}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {getFilteredRows().length === 0 && (
                                                <div className="py-20 text-center text-gray-400 font-medium">
                                                    No records match your filters.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                    X
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
        </main>
    );
}