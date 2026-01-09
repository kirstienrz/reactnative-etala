import React, { useState, useEffect } from 'react';
import { 
  Download, Search, Calendar, User, ExternalLink, 
  FileText, BookOpen, Filter, ChevronDown, Eye,
  Tag, ChevronRight, Sparkles, FileArchive, Globe
} from 'lucide-react';
import { getAllResearch, getResearchStats, getAvailableYears } from '../../api/research';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
      <p className="text-violet-600 font-medium">Loading research publications...</p>
    </div>
  </div>
);

// Research Card Component
const ResearchCard = ({ research }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <a
      href={research.link || research.researchFile?.url || '#'}
      target={research.link || research.researchFile?.url ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white border border-slate-200 hover:border-violet-600 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex-1">
        {/* Year Badge */}
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-bold rounded-full">
            {research.year}
          </span>
          {research.researchFile?.url && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full flex items-center gap-1">
              <FileText size={12} />
              PDF Available
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-violet-700 transition-colors">
          {research.title}
        </h3>

        {/* Authors */}
        <div className="flex items-center gap-2 text-slate-600 mb-3">
          <User size={16} className="text-slate-400" />
          <span className="font-medium">{research.authors}</span>
        </div>

        {/* Abstract (Collapsible) */}
        <div className="mb-4">
          <p className={`text-slate-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {research.abstract}
          </p>
          {research.abstract.length > 150 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="mt-2 text-violet-600 hover:text-violet-800 text-sm font-medium flex items-center gap-1"
            >
              {expanded ? 'Show Less' : 'Read More'}
              <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Tags */}
        {research.tags && research.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {research.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full flex items-center gap-1"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
            {research.tags.length > 4 && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                +{research.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Published: {formatDate(research.datePublished)}</span>
          </div>
          {research.researchFile?.bytes && (
            <div className="flex items-center gap-1">
              <FileArchive size={12} />
              <span>{Math.round(research.researchFile.bytes / 1024)} KB</span>
            </div>
          )}
          {research.link && (
            <div className="flex items-center gap-1">
              <Globe size={12} />
              <span>External Link</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-3 text-violet-600 font-semibold mt-4 md:mt-0 group-hover:gap-4 transition-all">
        <div className="text-right hidden md:block">
          <span className="block">
            {research.researchFile?.url ? 'Download PDF' : 
             research.link ? 'View Online' : 'View Details'}
          </span>
          <span className="text-xs font-normal text-slate-400">
            {research.researchFile?.originalName?.split('.').pop().toUpperCase() || 'Research'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {research.researchFile?.url ? (
            <Download className="w-5 h-5" />
          ) : research.link ? (
            <ExternalLink className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
};

// Statistics Component
const StatisticsBar = ({ stats }) => (
  <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-6 mb-8">
    <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
      <Sparkles className="text-violet-600" />
      Research Insights
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-medium text-violet-600 mb-1">Total Publications</div>
        <div className="text-3xl font-black text-slate-900">{stats.total}</div>
      </div>
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-medium text-violet-600 mb-1">Years Covered</div>
        <div className="text-3xl font-black text-slate-900">{stats.availableYears}</div>
      </div>
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-medium text-violet-600 mb-1">With PDFs</div>
        <div className="text-3xl font-black text-slate-900">{stats.withFiles}</div>
      </div>
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="text-sm font-medium text-violet-600 mb-1">Online Links</div>
        <div className="text-3xl font-black text-slate-900">{stats.withLinks}</div>
      </div>
    </div>
  </div>
);

// Year Filter Component
const YearFilter = ({ years, selectedYear, onSelectYear }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <Filter size={18} className="text-violet-600" />
      <span className="font-bold text-slate-900">Filter by Year</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {years.map(year => (
        <button
          key={year}
          onClick={() => onSelectYear(year)}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedYear === year
              ? 'bg-violet-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  </div>
);

// Search Component
const SearchBar = ({ searchQuery, onSearch }) => (
  <div className="relative max-w-2xl mx-auto">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
    <input
      type="text"
      placeholder="Search research by title, authors, or keywords..."
      value={searchQuery}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg shadow-sm"
    />
  </div>
);

// Main Component
export default function ResearchPublications() {
  const [researchData, setResearchData] = useState([]);
  const [filteredResearch, setFilteredResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    availableYears: 0,
    withLinks: 0,
    withFiles: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [availableYears, setAvailableYears] = useState(['All Years']);

  // Fetch data on component mount
  useEffect(() => {
    fetchResearchData();
  }, []);

  // Filter research when search or year changes
  useEffect(() => {
    filterResearch();
  }, [searchQuery, selectedYear, researchData]);

  const fetchResearchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all active research
      const response = await getAllResearch({
        status: 'active',
        limit: 100 // Get more for user view
      });

      if (response.success) {
        setResearchData(response.data);
        setFilteredResearch(response.data);

        // Fetch statistics
        const statsResponse = await getResearchStats();
        if (statsResponse.success) {
          const statsData = statsResponse.data;
          
          // Get available years
          const yearsResponse = await getAvailableYears();
          const yearOptions = yearsResponse || ['All Years', '2024', '2023', '2022'];
          
          setStats({
            total: statsData.total || response.data.length,
            availableYears: statsData.byYear?.length || 0,
            withLinks: statsData.withLinks || response.data.filter(r => r.link).length,
            withFiles: response.data.filter(r => r.researchFile?.url).length
          });
          
          setAvailableYears(yearOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching research:', error);
      setError('Failed to load research publications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterResearch = () => {
    let filtered = [...researchData];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.authors.toLowerCase().includes(query) ||
        item.abstract.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Filter by year
    if (selectedYear !== 'All Years') {
      filtered = filtered.filter(item => item.year === selectedYear);
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

    setFilteredResearch(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  // Render loading state
  if (loading) {
    return (
      <main className="bg-white min-h-screen">
        <section className="relative py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              Research Publications
            </h1>
            <div className="w-20 h-1 bg-violet-400 mx-auto"></div>
          </div>
        </section>
        <LoadingSpinner />
      </main>
    );
  }

  // Render error state
  if (error) {
    return (
      <main className="bg-white min-h-screen">
        <section className="relative py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              Research Publications
            </h1>
            <div className="w-20 h-1 bg-violet-400 mx-auto"></div>
          </div>
        </section>
        
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-8">
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <BookOpen className="mx-auto text-slate-300 mb-4" size={80} />
              <h3 className="text-2xl font-bold text-slate-600 mb-2">Error Loading Research</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchResearchData}
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Research Publications
          </h1>
          <p className="text-xl text-violet-200 mb-8 max-w-2xl mx-auto">
            Explore our collection of academic research, studies, and publications from various fields
          </p>
          <div className="w-20 h-1 bg-violet-400 mx-auto mb-12"></div>
          
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-white">
            <div className="text-center">
              <div className="text-3xl font-black mb-1">{stats.total}</div>
              <div className="text-sm text-violet-300">Total Publications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black mb-1">{stats.availableYears}</div>
              <div className="text-sm text-violet-300">Years Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black mb-1">{stats.withFiles}</div>
              <div className="text-sm text-violet-300">Downloadable PDFs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          {/* Statistics Bar */}
          <StatisticsBar stats={stats} />

          {/* Filters */}
          <div className="mb-8">
            <YearFilter 
              years={availableYears} 
              selectedYear={selectedYear}
              onSelectYear={handleYearSelect}
            />
          </div>

          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 md:mb-0">
              {filteredResearch.length} Research Publications
              {selectedYear !== 'All Years' && (
                <span className="text-violet-600"> in {selectedYear}</span>
              )}
            </h2>
            {searchQuery && (
              <p className="text-slate-600">
                Search results for: <span className="font-bold">"{searchQuery}"</span>
              </p>
            )}
          </div>

          {/* Research List */}
          <div className="space-y-4">
            {filteredResearch.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <BookOpen className="mx-auto text-slate-300 mb-4" size={80} />
                <h3 className="text-2xl font-bold text-slate-600 mb-2">
                  {searchQuery ? 'No Research Found' : 'No Publications Available'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  {searchQuery 
                    ? `No research matching "${searchQuery}" found. Try different keywords.`
                    : 'There are no research publications available at the moment.'
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedYear('All Years');
                    }}
                    className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredResearch.map(research => (
                  <ResearchCard key={research._id} research={research} />
                ))}

                {/* Footer Note */}
                <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                  <p className="text-slate-600 mb-2">
                    Showing {filteredResearch.length} of {stats.total} research publications
                  </p>
                  <p className="text-sm text-slate-500">
                    For more information or to submit research, please contact the research department.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}