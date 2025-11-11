import React, { useState } from 'react';
import { FileText, Download, Copy, Search, Filter, Eye, Mail, Flag, AlertTriangle, BookOpen, Save, Edit2, X } from 'lucide-react';

const TemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: 'Acknowledgment Letter',
      category: 'acknowledgment',
      description: 'Official letter to acknowledge receipt of documents, requests, or communications',
      content: `[Letterhead]

[Date]

[Recipient Name]
[Recipient Position]
[Recipient Address]

Subject: Acknowledgment of [Document/Request Type]

Dear [Recipient Name],

This is to formally acknowledge receipt of your [document/request] dated [Date] regarding [Subject Matter].

We have received the following:
• [List of documents/items received]
• [Additional details]

Please be advised that your [document/request] is now under review and processing. We will notify you of any updates or additional requirements within [timeline].

Should you have any questions or require further assistance, please do not hesitate to contact us at [contact information].

Thank you for your patience and understanding.

Respectfully yours,

[Your Name]
[Your Position]
[Office/Department]`,
      lastUpdated: '2024-12-01',
      usageCount: 45
    },
    {
      id: 2,
      title: 'Referral Letter',
      category: 'referral',
      description: 'Formal letter referring individuals or matters to appropriate offices or personnel',
      content: `[Letterhead]

[Date]

[Recipient Name]
[Recipient Position]
[Recipient Office/Department]
[Recipient Address]

Subject: Referral of [Case/Matter Type]

Dear [Recipient Name],

I am writing to refer to your office the case of [Client Name] regarding [Brief Description of Matter].

Background:
[Provide relevant background information]

Reasons for Referral:
• [Reason 1]
• [Reason 2]
• [Reason 3]

We believe that your office is better equipped to handle this matter due to [justification]. Enclosed are the following documents for your reference:
• [List of enclosed documents]

We would appreciate it if you could provide the necessary assistance and keep us informed of any developments.

Thank you for your cooperation.

Sincerely,

[Your Name]
[Your Position]
[Office/Department]`,
      lastUpdated: '2024-11-28',
      usageCount: 32
    },
    {
      id: 3,
      title: 'Resolution Letter',
      category: 'resolution',
      description: 'Official document stating decisions or resolutions made by the office or committee',
      content: `[Letterhead]

RESOLUTION NO. [Number]
Series of [Year]

A RESOLUTION [Title describing the action]

WHEREAS, [Preamble statement 1];

WHEREAS, [Preamble statement 2];

WHEREAS, [Preamble statement 3];

NOW, THEREFORE, upon motion of [Name of mover], duly seconded by [Name of seconder], be it:

RESOLVED, as it is hereby resolved, that [Main resolution content];

RESOLVED FURTHER, that [Additional directive 1];

RESOLVED FINALLY, that copies of this resolution be furnished to [List of offices/individuals to receive copies] for their information and guidance.

APPROVED this [Date] at [Place].

ATTESTED BY:

_______________________
[Secretary Name]
Secretary

APPROVED BY:

_______________________
[Chairperson Name]
Chairperson`,
      lastUpdated: '2024-12-05',
      usageCount: 28
    },
    {
      id: 4,
      title: 'Incident Summary Report',
      category: 'incident',
      description: 'Structured report documenting incidents, findings, and recommendations',
      content: `INCIDENT SUMMARY REPORT

I. BASIC INFORMATION
Report No: [Report Number]
Date of Incident: [Date]
Time of Incident: [Time]
Location: [Location]
Report Date: [Current Date]
Prepared by: [Your Name/Position]

II. INCIDENT DETAILS
Type of Incident: [Incident Type]
Persons Involved: 
• [Name 1] - [Role]
• [Name 2] - [Role]

Witnesses:
• [Witness 1] - [Contact Information]
• [Witness 2] - [Contact Information]

III. NARRATIVE DESCRIPTION
[Provide detailed chronological account of the incident, including what happened, when, where, and how]

IV. IMMEDIATE ACTIONS TAKEN
• [Action 1]
• [Action 2]
• [Action 3]

V. FINDINGS AND ANALYSIS
[Analysis of the incident, contributing factors, and observations]

VI. RECOMMENDATIONS
• [Recommendation 1]
• [Recommendation 2]
• [Recommendation 3]

VII. ATTACHMENTS
• [List of attached documents/photos/evidence]

_______________________
[Prepared By Signature]
[Prepared By Name]
[Position]`,
      lastUpdated: '2024-11-30',
      usageCount: 51
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Templates', icon: FileText, color: 'blue' },
    { value: 'acknowledgment', label: 'Acknowledgment', icon: Mail, color: 'green' },
    { value: 'referral', label: 'Referral', icon: Flag, color: 'purple' },
    { value: 'resolution', label: 'Resolution', icon: BookOpen, color: 'orange' },
    { value: 'incident', label: 'Incident Reports', icon: AlertTriangle, color: 'red' }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyTemplate = (content) => {
    navigator.clipboard.writeText(content);
    alert('Template copied to clipboard!');
  };

  const handleDownloadTemplate = (template) => {
    const blob = new Blob([template.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setEditedContent(template.content);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      const updatedTemplates = templates.map(template =>
        template.id === editingTemplate.id
          ? {
              ...template,
              content: editedContent,
              lastUpdated: new Date().toISOString().split('T')[0],
              usageCount: template.usageCount + 1
            }
          : template
      );
      setTemplates(updatedTemplates);
      setEditingTemplate(null);
      setEditedContent('');
      alert('Template updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditedContent('');
  };

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    const IconComponent = category ? category.icon : FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.color : 'blue';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Official Templates
            </h1>
            <p className="text-gray-500 text-sm">
              Pre-built letter templates for official communications and reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm">
              <Download className="w-4 h-4" />
              Export All
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{templates.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Most Used</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Incident Report</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Dec 5, 2024</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {templates.reduce((sum, template) => sum + template.usageCount, 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-${getCategoryColor(template.category)}-100 flex items-center justify-center`}>
                      {getCategoryIcon(template.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{template.title}</h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                    {template.usageCount} uses
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Last updated: {template.lastUpdated}</span>
                  <span className="capitalize">{template.category}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDownloadTemplate(template)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-all duration-200 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{previewTemplate.title}</h3>
                  <p className="text-gray-500 text-sm">{previewTemplate.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTemplate(previewTemplate)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {previewTemplate.content}
                </pre>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCopyTemplate(previewTemplate.content)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy Template
                </button>
                <button
                  onClick={() => handleDownloadTemplate(previewTemplate)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition-all duration-200 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit {editingTemplate.title}</h3>
                  <p className="text-gray-500 text-sm">Modify the template content as needed</p>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Content
                  </label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-none"
                    placeholder="Enter template content..."
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Template Tips:</h4>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Use [brackets] for placeholder text that needs to be filled in</li>
                    <li>Maintain proper formatting and structure</li>
                    <li>Include all necessary sections for the document type</li>
                    <li>Save your changes when finished editing</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition-all duration-200 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;