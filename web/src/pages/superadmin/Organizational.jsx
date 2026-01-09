import React, { useState, useEffect } from "react";
import {
    getOrgChartImages,
    uploadOrgChartImage,
    archiveOrgChartImage,
    getArchivedOrgChartImages,
    restoreOrgChartImage,
} from "../../api/organizational";

export default function OrgChartManagement() {
    const [charts, setCharts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [viewArchived, setViewArchived] = useState(false);
    const [selectedCharts, setSelectedCharts] = useState(new Set());

    useEffect(() => {
        fetchCharts();
    }, [viewArchived]);

    const fetchCharts = async () => {
        setLoading(true);
        try {
            const data = viewArchived
                ? await getArchivedOrgChartImages()
                : await getOrgChartImages();
            setCharts(data);
            setSelectedCharts(new Set());
        } catch (err) {
            setError("Failed to load organizational charts");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
        else setPreviewUrl(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!selectedFile) return setError("Select a file first");

        const formData = new FormData();
        formData.append("image", selectedFile);

        try {
            await uploadOrgChartImage(formData);
            setSuccess("Organizational chart uploaded!");
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchCharts();
        } catch (err) {
            setError("Upload failed");
        }
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedCharts);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCharts(newSet);
    };

    const handleBulkAction = async (action) => {
        if (selectedCharts.size === 0) return setError("Select at least one chart");
        const promises = Array.from(selectedCharts).map((id) =>
            action === "archive" ? archiveOrgChart(id) : restoreOrgChart(id)
        );
        try {
            await Promise.all(promises);
            setSuccess(`${action}d ${selectedCharts.size} chart(s)`);
            fetchCharts();
        } catch {
            setError("Failed to perform bulk action");
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading organizational charts...</p>
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    Organizational Chart Management
                </h1>
                <button
                    onClick={() => setViewArchived(!viewArchived)}
                    className="px-4 py-2 bg-gray-700 text-white rounded"
                >
                    {viewArchived ? "View Active Charts" : "View Archived Charts"}
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
            )}

            {/* Upload */}
            {!viewArchived && (
                <form onSubmit={handleUpload} className="mb-6">
                    <input type="file" onChange={handleFileChange} />
                    <button
                        type="submit"
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        Upload
                    </button>
                </form>
            )}

            {/* Preview */}
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-64 h-64 object-contain border mb-4"
                />
            )}

            {/* Chart Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {charts.length === 0 && <p>No charts found.</p>}
                {charts.map((chart) => (
                    <div key={chart._id} className="border rounded p-2 relative">
                        <input
                            type="checkbox"
                            className="absolute top-2 left-2"
                            checked={selectedCharts.has(chart._id)}
                            onChange={() => toggleSelection(chart._id)}
                        />
                        <img
                            src={chart.imageUrl}
                            alt="Org Chart"
                            className="w-full h-48 object-contain"
                        />
                        <div className="flex justify-between mt-2">
                            {viewArchived ? (
                                <button
                                    onClick={() => restoreOrgChart(chart._id).then(fetchCharts)}
                                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                                >
                                    Restore
                                </button>
                            ) : (
                                <button
                                    onClick={() => archiveOrgChart(chart._id).then(fetchCharts)}
                                    className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                                >
                                    Archive
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bulk Actions */}
            {selectedCharts.size > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => handleBulkAction(viewArchived ? "restore" : "archive")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                        {viewArchived ? "Restore" : "Archive"} Selected ({selectedCharts.size})
                    </button>
                </div>
            )}
        </div>
    );
}
