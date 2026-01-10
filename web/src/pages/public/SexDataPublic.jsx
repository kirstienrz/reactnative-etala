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
    const [selectedCharts, setSelectedCharts] = useState(["bar"]);
    const [filters, setFilters] = useState({});
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
            setSelectedCharts(["bar"]);

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
                                <p className="text-xs text-gray-400 mt-1">
                                    Created: {new Date(d.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => openDataset(d._id)}
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs transition flex items-center gap-1"
                                >
                                    <Eye size={12} /> View Data
                                </button>
                            </div>
                        </div>
                    ))}

                    {datasets.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border">
                            <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No datasets available</h3>
                            <p className="text-gray-500">Check back later for updated datasets</p>
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

                        {/* Data Table - Read Only */}
                        <div className="overflow-x-auto">
                            <div className="mb-3">
                                <h3 className="font-medium text-gray-700">Data Preview</h3>
                                <p className="text-gray-500 text-sm">This is a read-only view of the dataset</p>
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
                                    {getFilteredRows().slice(0, 50).map((row, i) => (
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
                            {getFilteredRows().length > 50 && (
                                <div className="text-sm text-gray-500 mt-2">
                                    Showing first 50 of {getFilteredRows().length} records
                                </div>
                            )}
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