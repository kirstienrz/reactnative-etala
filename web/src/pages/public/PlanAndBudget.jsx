import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const PlanAndBudget = () => {
  const [expandedDoc, setExpandedDoc] = useState(null);

  const documents = [
    {
      id: 1,
      title: 'GAD Plan and Budget 2024',
      description: 'Annual Gender and Development Plan and Budget allocation for fiscal year 2024, including strategic priorities, program activities, and financial requirements.',
      year: '2024',
      dateApproved: 'January 15, 2024',
      status: 'Approved',
      fileSize: '2.4 MB',
      pages: 45
    },
    {
      id: 2,
      title: 'GAD Plan and Budget 2023',
      description: 'Comprehensive GAD Plan and Budget for 2023 covering mainstreaming initiatives, capacity building programs, and support services across all university units.',
      year: '2023',
      dateApproved: 'December 20, 2022',
      status: 'Approved',
      fileSize: '2.1 MB',
      pages: 42
    },
    {
      id: 3,
      title: 'GAD Accomplishment Report 2023',
      description: 'Annual accomplishment report detailing the implementation of GAD programs, activities, budget utilization, and outcomes achieved during the fiscal year 2023.',
      year: '2023',
      dateApproved: 'February 28, 2024',
      status: 'Approved',
      fileSize: '3.2 MB',
      pages: 58
    },
    {
      id: 4,
      title: 'GAD Plan and Budget 2022',
      description: 'Strategic GAD Plan and Budget for 2022 focusing on gender-responsive policies, programs, and projects aligned with institutional development goals.',
      year: '2022',
      dateApproved: 'December 15, 2021',
      status: 'Approved',
      fileSize: '1.9 MB',
      pages: 38
    },
    {
      id: 5,
      title: 'GAD Accomplishment Report 2022',
      description: 'Consolidated report on GAD program implementation, financial utilization, performance indicators, and impact assessment for the year 2022.',
      year: '2022',
      dateApproved: 'March 10, 2023',
      status: 'Approved',
      fileSize: '2.8 MB',
      pages: 52
    }
  ];

  const toggleExpand = (docId) => {
    setExpandedDoc(expandedDoc === docId ? null : docId);
  };

  const handleView = (docTitle) => {
    alert(`Viewing: ${docTitle}\n\nThis would open the document in a preview window.`);
  };

  const handleDownload = (docTitle) => {
    alert(`Downloading: ${docTitle}\n\nThis would initiate the document download.`);
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Plan and Budget
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Official GAD plans, budgets, and accomplishment reports
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">About GAD Plans and Budgets</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The Gender and Development (GAD) Plan and Budget outlines the university's strategic framework for promoting gender equality and women's empowerment. These documents detail the programs, activities, and financial allocations dedicated to GAD initiatives across all institutional units.
            </p>
            <p>
              All plans and budgets presented here have been officially approved and are aligned with national policies on gender mainstreaming, including the Magna Carta of Women and relevant government directives on GAD budget allocation.
            </p>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="space-y-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-violet-400 hover:shadow-lg transition-all duration-300"
              >
                {/* Main Document Info */}
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full">
                          {doc.year}
                        </span>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                          {doc.status}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">
                        {doc.title}
                      </h2>
                      
                      <p className="text-slate-600 leading-relaxed mb-4">
                        {doc.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Approved: {doc.dateApproved}
                        </span>
                        <span>{doc.pages} pages</span>
                        <span>{doc.fileSize}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleView(doc.title)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                          View Document
                        </button>
                        
                        <button
                          onClick={() => handleDownload(doc.title)}
                          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-violet-600 hover:text-violet-600 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          Download
                        </button>
                        
                        <button
                          onClick={() => toggleExpand(doc.id)}
                          className="ml-auto inline-flex items-center gap-2 px-4 py-3 text-slate-600 hover:text-violet-600 transition-colors"
                        >
                          Details
                          {expandedDoc === doc.id ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedDoc === doc.id && (
                  <div className="px-8 pb-8 pt-0 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-lg p-6 mt-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Document Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Document Type:</span>
                          <p className="text-slate-900 font-medium mt-1">
                            {doc.title.includes('Accomplishment') ? 'Accomplishment Report' : 'Plan and Budget'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Fiscal Year:</span>
                          <p className="text-slate-900 font-medium mt-1">{doc.year}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Approval Date:</span>
                          <p className="text-slate-900 font-medium mt-1">{doc.dateApproved}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">File Format:</span>
                          <p className="text-slate-900 font-medium mt-1">PDF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PlanAndBudget;