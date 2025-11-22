import React, { useState, useEffect } from 'react';
import { Upload, Edit2, Trash2, Plus, X, Search, Calendar, Image, Archive, RefreshCw } from 'lucide-react';
import {
    getInfographics,
    getArchivedInfographics,
    uploadInfographics,
    archiveInfographic,
    restoreInfographic,
    deleteInfographic
} from '../../api/infographics';

export default function InfographicsAdmin() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [viewArchived, setViewArchived] = useState(false);
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [sortBy, setSortBy] = useState('newest');
    const [modalImage, setModalImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Add this

    const [academicYears, setAcademicYears] = useState([]);

    const [infographics, setInfographics] = useState([]);



    const fetchInfographics = async () => {
        try {
            const data = viewArchived ? await getArchivedInfographics() : await getInfographics();
            const infographicsArray = Array.isArray(data) ? data : [];
            setInfographics(infographicsArray);

            // Compute unique years after data is fetched
            const years = [...new Set(infographicsArray.map(item => item.academicYear))];
            const academicYearsData = years.map(year => ({
                id: year,
                year: year,
                status: 'active',
                infographicsCount: infographicsArray.filter(item => item.academicYear === year).length
            }));
            setAcademicYears(academicYearsData);
        } catch (error) {
            console.error('Failed to fetch infographics:', error);
        }
    };

       useEffect(() => {
        fetchInfographics();
    }, [viewArchived, refreshTrigger]); // 

    const [formData, setFormData] = useState({
        academicYear: '',
        title: '',
        imageFiles: [],
        status: 'active'
    });

    const [newYear, setNewYear] = useState('');

    // Process data first - move this before any functions that use these variables
    const filteredInfographics = infographics.filter(item =>
        item.status === (viewArchived ? 'archived' : 'active') &&
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.academicYear?.includes(searchQuery))
    );

    const filteredAndSortedImages = filteredInfographics.sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.uploadDate) - new Date(a.uploadDate);
        if (sortBy === 'oldest') return new Date(a.uploadDate) - new Date(b.uploadDate);
        return 0;
    });

    const groupedInfographics = filteredAndSortedImages.reduce((acc, item) => {
        if (!acc[item.academicYear]) acc[item.academicYear] = [];
        acc[item.academicYear].push(item);
        return acc;
    }, {});

    const stats = {
        active: infographics.filter(i => i.status === 'active').length,
        archived: infographics.filter(i => i.status === 'archived').length,
        selected: selectedImages.size
    };

    const activeYears = academicYears.filter(y => y.status === 'active');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleYearChange = (e) => {
        const value = e.target.value;
        // Allow empty string or any 1-4 digit number during typing
        if (value === '' || /^\d{0,4}$/.test(value)) {
            setNewYear(value);
        }
    };

    const handleCreateYear = (e) => {
        e.preventDefault();

        // Validation: Check if year is empty
        if (!newYear.trim()) {
            alert('Please enter a year!');
            return;
        }

        // Validation: Check if year is valid (4 digits)
        if (!/^\d{4}$/.test(newYear)) {
            alert('Please enter a valid 4-digit year (2000-2099)!');
            return;
        }

        // Validation: Check if year already exists in academicYears
        if (academicYears.find(y => y.year === newYear)) {
            alert('This academic year already exists!');
            return;
        }

        // Validation: Check if year already exists in infographics
        const existingYearInInfographics = infographics.find(item => item.academicYear === newYear);
        if (existingYearInInfographics) {
            alert('This academic year already exists in your infographics!');
            return;
        }

        const newAcademicYear = {
            id: Date.now(),
            year: newYear,
            status: 'active',
            infographicsCount: 0
        };

        setAcademicYears(prev => [...prev, newAcademicYear]);
        setNewYear('');
        setShowYearModal(false);
        alert(`Academic Year ${newYear} created successfully!`);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, imageFiles: files }));

            const previews = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews.push(reader.result);
                    if (previews.length === files.length) {
                        setPreviewImages(previews);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.academicYear) {
        alert('Please select an academic year!');
        return;
    }

    if (previewImages.length === 0) {
        alert('Please upload at least one image!');
        return;
    }

    setIsUploading(true);

    const form = new FormData();
    form.append('academicYear', formData.academicYear);
    form.append('title', formData.title || '');
    formData.imageFiles.forEach(file => form.append('images', file));

    try {
        await uploadInfographics(form);
        setFormData({ academicYear: '', title: '', imageFiles: [], status: 'active' });
        setPreviewImages([]);
        setShowModal(false);

        // Wait a bit for the server to process, then refresh
        setTimeout(() => {
            fetchInfographics();
        }, 500);
        
        alert('Infographics uploaded successfully!');
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
    } finally {
        setIsUploading(false);
    }
};

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            academicYear: item.academicYear,
            title: item.title,
            imageFiles: [],
            status: item.status
        });
        setPreviewImages([item.imageUrl]);
        setShowModal(true);
    };

    const handleArchive = async (id) => {
        if (!window.confirm('Are you sure you want to archive this infographic?')) return;
        try {
            await archiveInfographic(id);
            // Auto-refresh after archiving
            await fetchInfographics();
        } catch (error) {
            console.error(error);
            alert('Failed to archive infographic. Please try again.');
        }
    };

    const handleRestore = async (id) => {
        if (!window.confirm('Restore this infographic?')) return;
        try {
            await restoreInfographic(id);
            // Auto-refresh after restoring
            await fetchInfographics();
        } catch (error) {
            console.error(error);
            alert('Failed to restore infographic. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this infographic?')) return;
        try {
            await deleteInfographic(id);
            // Auto-refresh after deleting
            await fetchInfographics();
        } catch (error) {
            console.error(error);
            alert('Failed to delete infographic. Please try again.');
        }
    };

    const toggleImageSelection = (id) => {
        const newSelected = new Set(selectedImages);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedImages(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedImages.size === filteredAndSortedImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(filteredAndSortedImages.map(img => img.id)));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedImages.size === 0) return;

        if (!window.confirm(`Confirm ${action} for ${selectedImages.size} image(s)?`)) return;

        try {
            for (let id of selectedImages) {
                if (action === 'archive') await archiveInfographic(id);
                if (action === 'restore') await restoreInfographic(id);
            }
            setSelectedImages(new Set());
            // Auto-refresh after bulk action
            await fetchInfographics();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action} infographics. Please try again.`);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            academicYear: '',
            title: '',
            imageFiles: [],
            status: 'active'
        });
        setPreviewImages([]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Higher Education Institutions Data</h1>
                            <p className="text-gray-600 mt-1">
                                {viewArchived
                                    ? 'View and restore archived infographics'
                                    : 'Upload and manage infographics by academic year'}
                            </p>
                        </div>
                        <button
                            onClick={() => setViewArchived(!viewArchived)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
                        >
                            {viewArchived ? 'View Active Images' : 'View Archived Images'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-600 mb-1">Active Images</div>
                        <div className="text-2xl font-bold text-blue-900">
                            {viewArchived ? '—' : stats.active}
                        </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-yellow-600 mb-1">Archived Images</div>
                        <div className="text-2xl font-bold text-yellow-900">
                            {viewArchived ? stats.archived : '—'}
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-green-600 mb-1">Selected</div>
                        <div className="text-2xl font-bold text-green-900">
                            {stats.selected}
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="mb-6 bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search by title or year..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-2 flex-wrap w-full md:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>

                            {!viewArchived && (
                                <button
                                    onClick={() => setShowYearModal(true)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition whitespace-nowrap"
                                >
                                    <Plus size={16} className="inline mr-1" />
                                    New Academic Year
                                </button>
                            )}

                            <button
                                onClick={() => setShowModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                            >
                                <Upload size={16} className="inline mr-1" />
                                Add Infographics
                            </button>

                            {filteredAndSortedImages.length > 0 && (
                                <>
                                    <button
                                        onClick={toggleSelectAll}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                    >
                                        {selectedImages.size === filteredAndSortedImages.length ? 'Deselect All' : 'Select All'}
                                    </button>

                                    {selectedImages.size > 0 && (
                                        <button
                                            onClick={() => handleBulkAction(viewArchived ? 'restore' : 'archive')}
                                            className={`px-4 py-2 text-white rounded-lg transition ${viewArchived
                                                ? 'bg-green-500 hover:bg-green-600'
                                                : 'bg-yellow-500 hover:bg-yellow-600'
                                                }`}
                                        >
                                            {viewArchived ? 'Restore' : 'Archive'} Selected ({selectedImages.size})
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Infographics Grid by Year */}
                <div className="space-y-8">
                    {Object.keys(groupedInfographics).sort().reverse().map(year => (
                        <div key={year}>
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="text-blue-600" size={24} />
                                <h2 className="text-xl font-bold text-gray-800">AY {year}</h2>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {groupedInfographics[year].length} items
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {groupedInfographics[year].map(item => (
                                    <div
                                        key={item.id}
                                        className={`relative bg-white rounded-lg border overflow-hidden hover:shadow-lg transition ${selectedImages.has(item.id) ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                    >
                                        <div className="absolute top-2 left-2 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedImages.has(item.id)}
                                                onChange={() => toggleImageSelection(item.id)}
                                                className="w-5 h-5 cursor-pointer"
                                            />
                                        </div>

                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            onClick={() => setModalImage(item.imageUrl)}
                                            className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                                        />

                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent text-white p-3">
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs">
                                                    <div className="font-medium truncate">{item.title}</div>
                                                    <div className="text-gray-300">{new Date(item.uploadDate).toLocaleDateString()}</div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {viewArchived ? (
                                                        <button
                                                            onClick={() => handleRestore(item.id)}
                                                            className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs font-medium transition"
                                                        >
                                                            <RefreshCw size={12} className="inline" />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs font-medium transition"
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleArchive(item.id)}
                                                                className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded text-xs font-medium transition"
                                                            >
                                                                <Archive size={12} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {Object.keys(groupedInfographics).length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border">
                            <Image size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                {searchQuery
                                    ? 'No infographics found matching your search'
                                    : viewArchived
                                        ? 'No archived infographics found'
                                        : 'No infographics found'}
                            </h3>
                            <p className="text-gray-500">
                                {!viewArchived && 'Start by adding infographics for an academic year'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* Create Academic Year Modal */}
            {showYearModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Create New Academic Year</h2>
                            <button onClick={() => setShowYearModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleCreateYear}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Year *
                                        </label>
                                        <input
                                            type="number"
                                            value={newYear}
                                            onChange={handleYearChange}
                                            placeholder="Enter year, e.g. 2024"
                                            min="2000"
                                            max="2099"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter a single 4-digit year (2000-2099)
                                        </p>
                                        {newYear && !/^\d{4}$/.test(newYear) && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Please enter a valid 4-digit year
                                            </p>
                                        )}
                                    </div>

                                    {newYear && /^\d{4}$/.test(newYear) && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm text-blue-900">
                                                <strong>Preview:</strong> Academic Year {newYear}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowYearModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newYear || !/^\d{4}$/.test(newYear)}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Create Year
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            {/* Upload Infographics Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingItem ? 'Edit Infographic' : 'Add Infographics'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Academic Year * {!formData.academicYear && <span className="text-red-500">(Required)</span>}
                                    </label>
                                    <select
                                        name="academicYear"
                                        value={formData.academicYear}
                                        onChange={handleInputChange}
                                        required
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!formData.academicYear ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Academic Year</option>
                                        {activeYears.map(year => (
                                            <option key={year.id} value={year.year}>
                                                {year.year} ({year.infographicsCount} infographics)
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.academicYear && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Please select an academic year before uploading
                                        </p>
                                    )}
                                </div>

                                {editingItem && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="Infographic title"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Infographics * {!editingItem && '(Multiple files supported)'}
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple={!editingItem}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="imageUpload"
                                        />
                                        <label htmlFor="imageUpload" className="cursor-pointer">
                                            {previewImages.length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {previewImages.map((img, index) => (
                                                            <img
                                                                key={index}
                                                                src={img}
                                                                alt={`Preview ${index + 1}`}
                                                                className="max-h-40 mx-auto rounded border"
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-blue-600 font-medium">
                                                        {previewImages.length} image(s) selected - Click to change
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Upload size={48} className="mx-auto text-gray-400" />
                                                    <p className="text-gray-600 font-medium">Click to upload infographics</p>
                                                    <p className="text-sm text-gray-400">PNG, JPG, WebP up to 5MB each</p>
                                                    {!editingItem && <p className="text-sm text-blue-600">You can select multiple files</p>}
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!formData.academicYear || previewImages.length === 0 || isUploading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isUploading ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin mr-2" />
                                            Uploading...
                                        </>
                                    ) : (
                                        `${editingItem ? 'Update' : 'Upload'} Infographics`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {modalImage && (
                <div
                    onClick={() => setModalImage(null)}
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 cursor-pointer"
                >
                    <div className="relative max-w-7xl max-h-full">
                        <button
                            onClick={() => setModalImage(null)}
                            className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-gray-300 transition"
                        >
                            ×
                        </button>
                        <img
                            src={modalImage}
                            alt="Enlarged view"
                            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}