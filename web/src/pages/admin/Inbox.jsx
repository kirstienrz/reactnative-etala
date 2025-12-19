import React, { useState } from "react";
import { Mail, User, Clock, CheckCircle, AlertCircle, Search, Filter, MoreVertical, X, Eye, Archive, Trash2, Download, Reply, Paperclip, ChevronDown, ChevronUp } from "lucide-react";

const sampleInbox = [
  {
    id: 1,
    sender: "Juan Dela Cruz",
    senderRole: "Student",
    subject: "Incident Report Follow-up",
    message: "Please review the recent incident reported on campus regarding harassment. I have attached the necessary documents and witness statements.",
    date: "2025-12-18 10:30 AM",
    status: "Unread",
    priority: "High",
    attachments: 2,
    category: "Case Report",
  },
  {
    id: 2,
    sender: "Maria Santos",
    senderRole: "Faculty",
    subject: "Case Referral",
    message: "I am referring this case to your office for further assessment and investigation.",
    date: "2025-12-17 2:15 PM",
    status: "Read",
    priority: "Medium",
    attachments: 1,
    category: "Referral",
  },
  {
    id: 3,
    sender: "Admin OSA",
    senderRole: "Admin",
    subject: "Weekly Summary Report",
    message: "Attached is the weekly summary of all active cases and reports. Please review by Friday.",
    date: "2025-12-16 5:00 PM",
    status: "Read",
    priority: "Low",
    attachments: 3,
    category: "Report",
  },
  {
    id: 4,
    sender: "Robert Lim",
    senderRole: "Staff",
    subject: "Urgent: Security Concern",
    message: "Need immediate attention regarding security breach in the admin building.",
    date: "2025-12-19 9:00 AM",
    status: "Unread",
    priority: "Critical",
    attachments: 0,
    category: "Security",
  },
  {
    id: 5,
    sender: "Sarah Johnson",
    senderRole: "Student",
    subject: "Follow-up on Previous Case",
    message: "Following up on case #2025-045. Please provide an update on the investigation.",
    date: "2025-12-18 3:45 PM",
    status: "Read",
    priority: "Medium",
    attachments: 1,
    category: "Follow-up",
  },
];

const statusColors = {
  Unread: "bg-blue-100 text-blue-700 border-blue-200",
  Read: "bg-gray-100 text-gray-700 border-gray-300",
};

const priorityColors = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-blue-100 text-blue-700 border-blue-200",
};

const categoryColors = {
  "Case Report": "bg-purple-100 text-purple-700 border-purple-200",
  "Referral": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Report": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Security": "bg-red-100 text-red-700 border-red-200",
  "Follow-up": "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const AdminInbox = () => {
  const [messages, setMessages] = useState(sampleInbox);
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    category: [],
    senderRole: [],
  });

  const allStatuses = [...new Set(messages.map(m => m.status))];
  const allPriorities = [...new Set(messages.map(m => m.priority))];
  const allCategories = [...new Set(messages.map(m => m.category))];
  const allSenderRoles = [...new Set(messages.map(m => m.senderRole))];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [filterType]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentValues, value]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      category: [],
      senderRole: [],
    });
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = search === "" || 
      Object.values(message).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus = filters.status.length === 0 || filters.status.includes(message.status);
    const matchesPriority = filters.priority.length === 0 || filters.priority.includes(message.priority);
    const matchesCategory = filters.category.length === 0 || filters.category.includes(message.category);
    const matchesSenderRole = filters.senderRole.length === 0 || filters.senderRole.includes(message.senderRole);

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesSenderRole;
  });

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    
    // Mark as read when viewing
    if (message.status === "Unread") {
      setMessages(prev =>
        prev.map(m =>
          m.id === message.id ? { ...m, status: "Read" } : m
        )
      );
    }
  };

  const handleMarkAsRead = (id) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === id ? { ...m, status: "Read" } : m
      )
    );
  };

  const handleMarkAsUnread = (id) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === id ? { ...m, status: "Unread" } : m
      )
    );
  };

  const handleDeleteMessage = (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const FilterSection = ({ title, icon: Icon, options, filterType }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-500" />
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters[filterType].includes(option)}
              onChange={() => handleFilterChange(filterType, option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Message View Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-700" />
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-600">From: {selectedMessage.sender}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Message Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Sender</h4>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-900">{selectedMessage.sender}</p>
                        <p className="text-xs text-gray-500">{selectedMessage.senderRole}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h4>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{selectedMessage.date}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[selectedMessage.priority]}`}>
                        {selectedMessage.priority}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[selectedMessage.category]}`}>
                        {selectedMessage.category}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedMessage.status]}`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Message</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedMessage.attachments > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Attachments</h4>
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedMessage.attachments} file(s) attached</span>
                    <button className="ml-4 text-sm text-blue-600 hover:text-blue-700">
                      Download All
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedMessage.id);
                    setSelectedMessage({ ...selectedMessage, status: "Read" });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Read
                </button>
                <button
                  onClick={() => {
                    // Reply functionality would go here
                    alert("Reply functionality would be implemented here");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    handleDeleteMessage(selectedMessage.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end p-4 z-40">
          <div className="bg-white rounded-xl w-full max-w-md mt-16">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilter(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <FilterSection
                title="Status"
                icon={Eye}
                options={allStatuses}
                filterType="status"
              />
              
              <FilterSection
                title="Priority"
                icon={AlertCircle}
                options={allPriorities}
                filterType="priority"
              />
              
              <FilterSection
                title="Category"
                icon={Mail}
                options={allCategories}
                filterType="category"
              />
              
              <FilterSection
                title="Sender Role"
                icon={User}
                options={allSenderRoles}
                filterType="senderRole"
              />
              
              <div className="pt-4">
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters ({Object.values(filters).flat().length} selected)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your messages and communications</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
              {Object.values(filters).flat().length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {Object.values(filters).flat().length}
                </span>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Archive className="w-4 h-4" />
              Archive All
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages by sender, subject, or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {messages.filter(m => m.status === "Unread").length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {Object.values(filters).flat().length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Active filters:</span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 ml-2"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([filterType, values]) =>
                values.map(value => (
                  <div
                    key={`${filterType}-${value}`}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    <span>{value}</span>
                    <button
                      onClick={() => handleFilterChange(filterType, value)}
                      className="hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sender & Subject
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMessages.map((message) => (
                <tr 
                  key={message.id} 
                  className={`hover:bg-gray-50 transition-colors ${message.status === "Unread" ? "bg-blue-50/50" : ""}`}
                  onClick={() => handleViewMessage(message)}
                >
                  <td className="py-5 px-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${message.status === "Unread" ? "bg-blue-100" : "bg-gray-100"}`}>
                            <User className={`w-4 h-4 ${message.status === "Unread" ? "text-blue-600" : "text-gray-600"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{message.sender}</p>
                            <p className="text-xs text-gray-500">{message.senderRole}</p>
                          </div>
                        </div>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle more options
                          }}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{message.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[message.priority]}`}>
                          {message.priority}
                        </span>
                        {message.attachments > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Paperclip className="w-3 h-3" />
                            {message.attachments}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-5 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[message.category]}`}>
                      {message.category}
                    </span>
                  </td>
                  
                  <td className="py-5 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColors[message.status]}`}>
                      {message.status}
                    </span>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{message.date.split(' ')[1]}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.date.split(' ')[0]}</p>
                  </td>
                  
                  <td className="py-5 px-6">
                    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {message.status === "Unread" ? (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Read
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsUnread(message.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <Clock className="w-4 h-4" />
                          Mark Unread
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{filteredMessages.length}</span> of <span className="font-medium">{messages.length}</span> messages
            </p>
            <div className="flex items-center gap-4">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
                Previous
              </button>
              <span className="text-sm text-gray-600">Page 1 of 1</span>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;