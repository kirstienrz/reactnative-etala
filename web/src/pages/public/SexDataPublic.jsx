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
        if (!active || !chartRef.current) return;

        try {
            const { jsPDF } = await import('jspdf');
            const html2canvas = await import('html2canvas');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();

            pdf.setFontSize(18);
            pdf.text("Data Analysis Report", pageWidth / 2, 20, { align: 'center' });

            pdf.setFontSize(12);
            pdf.text(`Dataset: ${active.name}`, 20, 40);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
            pdf.text(`Total Records: ${getFilteredRows().length}`, 20, 60);

            if (generateChartData()) {
                const canvas = await html2canvas.default(chartRef.current);
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 40;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 20, 70, imgWidth, imgHeight);
            }

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


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header - Simplified for Users */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sex Disaggregated Data</h1>
                        <p className="text-gray-600 mt-1">View and analyze available datasets</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowReportOptions(true)}
                            disabled={!active}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        >
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Datasets Grid - View Only */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {datasets.map((d) => (
                        <div
                            key={d._id}
                            onClick={() => openDataset(d._id)}
                            className={`group relative bg-white border rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer overflow-hidden ${active?._id === d._id ? 'ring-2 ring-blue-500 border-transparent bg-blue-50/30' : 'hover:border-blue-200'}`}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${active?._id === d._id ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                                        <BarChart2 size={20} />
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
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString()}</span>
                                    <div className={`p-1.5 rounded-full transition-all ${active?._id === d._id ? 'bg-blue-500 text-white' : 'text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
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
                                        Analyzing <span className="text-blue-600 font-bold">{getFilteredRows().length}</span> entries
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
                                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                            {/* Controls Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Configuration */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Filter size={14} /> Filter & Grouping
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
                                                {active.headers.slice(0, 2).map((header) => (
                                                    <div key={header}>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">{header}</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`Search ${header}...`}
                                                            value={filters[header] || ""}
                                                            onChange={(e) => handleFilterChange(header, e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <BarChart2 size={14} /> Chart Settings
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">X-Axis (Label)</label>
                                                <select
                                                    value={xField}
                                                    onChange={(e) => setXField(e.target.value)}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                >
                                                    <option value="">Select Numeric Field</option>
                                                    {numericFields.map((h) => (
                                                        <option key={h} value={h}>{h}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Visualization</label>
                                                <div className="flex p-1 bg-white border rounded-xl">
                                                    {['bar', 'line', 'pie'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => setChartType(type)}
                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${chartType === type ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                                                        >
                                                            {type.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visualization Area */}
                                <div className="lg:col-span-8 flex flex-col gap-6">
                                    {viewMode === 'charts' ? (
                                        <div className="bg-gray-50 rounded-3xl p-6 md:p-8 flex-1 border border-gray-100 min-h-[400px]">
                                            <div ref={chartRef} className="w-full h-full flex flex-col">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-lg font-bold text-gray-900">
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
        </div>
    );
}