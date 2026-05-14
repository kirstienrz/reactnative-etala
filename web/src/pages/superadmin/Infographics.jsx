import React, { useState, useEffect } from 'react';
import { Upload, Edit2, Trash2, Plus, X, Search, Calendar, Image, Archive, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    getInfographics,
    getArchivedInfographics,
    uploadInfographics,
    updateInfographic,
    archiveInfographic,
    restoreInfographic,
    deleteInfographic
} from '../../api/infographics';

export default function InfographicsAdmin() {
    const categories = ['Policy', 'Legal', 'Safety', 'Communication', 'Education', 'Budget', 'Awareness'];
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
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const [isDragging, setIsDragging] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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
            handleImageUpload({ target: { files: e.dataTransfer.files } });
        }
    };

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
    }, [viewArchived, refreshTrigger]); 

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    const [formData, setFormData] = useState({
        academicYear: '',
        title: '',
        category: 'Policy',
        imageFiles: [],
        status: 'active'
    });

    const [newYear, setNewYear] = useState('');

    // Process data first - move this before any functions that use these variables
    const filteredInfographics = infographics.filter(item =>
        item.status === (viewArchived ? 'archived' : 'active') &&
        (selectedCategory === 'All' || item.category === selectedCategory) &&
        (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.academicYear?.includes(searchQuery))
    );

    const filteredAndSortedImages = filteredInfographics.sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.uploadDate) - new Date(a.uploadDate);
        if (sortBy === 'oldest') return new Date(a.uploadDate) - new Date(b.uploadDate);
        return 0;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedImages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedImages = filteredAndSortedImages.slice(startIndex, startIndex + itemsPerPage);

    const groupedInfographics = paginatedImages.reduce((acc, item) => {
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

        // Only require image for new uploads
        if (!editingItem && previewImages.length === 0) {
            alert('Please upload at least one image!');
            return;
        }

        setIsUploading(true);

        const form = new FormData();
        form.append('academicYear', formData.academicYear);
        form.append('title', formData.title || '');
        form.append('category', formData.category);

        if (formData.imageFiles.length > 0) {
            if (editingItem) {
                // Backend PUT uses upload.single('image')
                form.append('image', formData.imageFiles[0]);
            } else {
                // Backend POST uses upload.array('images')
                formData.imageFiles.forEach(file => form.append('images', file));
            }
        }

        try {
            if (editingItem) {
                await updateInfographic(editingItem._id, form);
            } else {
                await uploadInfographics(form);
            }

            closeModal();
            fetchInfographics();
            alert(`Infographics ${editingItem ? 'updated' : 'uploaded'} successfully!`);
        } catch (error) {
            console.error('Operation failed:', error);
            alert(`Failed to ${editingItem ? 'update' : 'upload'} infographics. Please try again.`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            academicYear: item.academicYear,
            title: item.title,
            category: item.category || 'Policy',
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
        if (!window.confirm("Are you sure you want to permanently delete this infographic? This action cannot be undone.")) return;
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
            setSelectedImages(new Set(filteredAndSortedImages.map(img => img._id)));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedImages.size === 0) return;

        if (!window.confirm(`Confirm ${action} for ${selectedImages.size} image(s)?`)) return;

        try {
            for (let id of selectedImages) {
                if (action === 'archive') await archiveInfographic(id);
                if (action === 'restore') await restoreInfographic(id);
                if (action === 'delete') await deleteInfographic(id);
            }
            setSelectedImages(new Set());
            // Auto-refresh after bulk action
            await fetchInfographics();
            alert(`Successfully ${action === 'delete' ? 'deleted' : (action === 'archive' ? 'archived' : 'restored')} selected infographics.`);
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
            category: 'Policy',
            imageFiles: [],
            status: 'active'
        });
        setPreviewImages([]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 md:relative z-30">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Infographics</h1>
                            <p className="text-gray-600 text-sm md:text-base mt-1">
                                {viewArchived
                                    ? 'View and restore archived infographics'
                                    : 'Upload and manage infographics by academic year'}
                            </p>
                        </div>
                        <button
                            onClick={() => setViewArchived(!viewArchived)}
                            className="w-full md:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition shadow-lg font-bold text-sm"
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
                <div className="space-y-4 mb-8">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                        {/* Top row: Search, Filters and Actions */}
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            <div className="flex-1 w-full relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by title or year..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                {!viewArchived && (
                                    <button
                                        onClick={() => setShowYearModal(true)}
                                        className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-100 font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} />
                                        <span className="hidden sm:inline">New Year</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 font-bold text-sm flex items-center justify-center gap-2"
                                >
                                    <Upload size={18} />
                                    <span className="hidden sm:inline">Add Graphics</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>


                {/* Infographics Grid by Year */}
                <div className="space-y-8">
                    {Object.keys(groupedInfographics).length > 0 ? (
                        <>
                            {Object.keys(groupedInfographics).sort().reverse().map(year => (
                                <div key={year} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 leading-none">AY {year}</h2>
                                            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">
                                                {groupedInfographics[year].length} items
                                            </p>
                                        </div>
                                    </div>

                                    {/* Filters and Selection moved here */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* Select All integrated here */}
                                        <button
                                            onClick={toggleSelectAll}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold text-[10px] uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {selectedImages.size === filteredAndSortedImages.length ? 'Deselect All' : `Select All (${filteredAndSortedImages.length})`}
                                        </button>

                                        {/* Bulk Actions when selected */}
                                        {selectedImages.size > 0 && (
                                            <div className="flex gap-1 animate-in zoom-in-95 duration-200 mr-2 border-r pr-2 border-gray-200">
                                                <button
                                                    onClick={() => handleBulkAction(viewArchived ? 'restore' : 'archive')}
                                                    className={`p-2 text-white rounded-lg transition shadow-sm ${viewArchived ? 'bg-green-600' : 'bg-yellow-600'}`}
                                                    title={viewArchived ? 'Restore Selected' : 'Archive Selected'}
                                                >
                                                    {viewArchived ? <RefreshCw size={14} /> : <Archive size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => handleBulkAction('delete')}
                                                    className="p-2 bg-red-600 text-white rounded-lg shadow-sm"
                                                    title="Delete Selected"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}

                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-[10px] uppercase tracking-wider outline-none cursor-pointer shadow-sm"
                                        >
                                            <option value="All">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-[10px] uppercase tracking-wider outline-none cursor-pointer shadow-sm"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {groupedInfographics[year].map(item => (
                                            <div
                                                key={item._id}
                                                className={`group relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${selectedImages.has(item._id) ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'
                                                    }`}
                                            >
                                                {/* Selection Checkbox */}
                                                <div className="absolute top-3 left-3 z-20">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedImages.has(item._id)}
                                                        onChange={() => toggleImageSelection(item._id)}
                                                        className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform group-hover:scale-110"
                                                    />
                                                </div>

                                                {/* Image Container */}
                                                <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        onClick={() => setModalImage(item.imageUrl)}
                                                        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    
                                                    {/* Category Badge */}
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                                            {item.category || 'General'}
                                                        </span>
                                                    </div>

                                                    {/* Quick Actions Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                                                        {viewArchived ? (
                                                            <button
                                                                onClick={() => handleRestore(item._id)}
                                                                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                                                                title="Restore"
                                                            >
                                                                <RefreshCw size={18} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleArchive(item._id)}
                                                                    className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                                                                    title="Archive"
                                                                >
                                                                    <Archive size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all hover:scale-110"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Content Area */}
                                                <div className="p-4">
                                                    <h3 className="font-bold text-gray-900 truncate mb-1">{item.title}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        Uploaded {new Date(item.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-12 pb-8">
                                    <button
                                        onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page</span>
                                        <span className="font-bold text-gray-900">{currentPage}</span>
                                        <span className="text-gray-300">/</span>
                                        <span className="font-bold text-gray-400">{totalPages}</span>
                                    </div>

                                    <button
                                        onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Image size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {searchQuery || selectedCategory !== 'All'
                                    ? 'No matches found'
                                    : viewArchived
                                        ? 'Archive is empty'
                                        : 'No infographics yet'}
                            </h3>
                            <p className="text-gray-500 max-w-xs mx-auto text-sm">
                                {searchQuery || selectedCategory !== 'All'
                                    ? 'Try adjusting your filters or search terms to find what you looking for.'
                                    : 'Start organizing your documents by uploading your first infographic.'}
                            </p>
                            {(searchQuery || selectedCategory !== 'All') && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition"
                                >
                                    Clear all filters
                                </button>
                            )}
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
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
                                    <div
                                        onDragEnter={handleDragEnter}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple={!editingItem}
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                                            id="imageUpload"
                                        />
                                        <div className="pointer-events-none">
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
                                                    <div className={`inline-flex p-3 rounded-full mb-3 ${isDragging ? 'bg-blue-200' : 'bg-gray-100'}`}>
                                                        <Upload className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-gray-500'}`} />
                                                    </div>
                                                    <p className="text-gray-600 font-medium">Click to upload infographics</p>
                                                    <p className="text-sm text-gray-400">PNG, JPG, WebP up to 5MB each</p>
                                                    {!editingItem && <p className="text-sm text-blue-600">You can select multiple files</p>}
                                                </div>
                                            )}
                                        </div>
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