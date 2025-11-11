import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Plus, FileText, ArrowRight } from 'lucide-react';

const BudgetProgramsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [excelData, setExcelData] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      setExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Budget & Programs</h1>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {['overview', 'budgetUpload', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-purple-700 border-b-2 border-purple-700'
                  : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              {tab === 'budgetUpload' ? 'Budget Upload' : tab}
            </button>
          ))}
        </div>

        {/* Budget Upload Tab */}
        {activeTab === 'budgetUpload' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <label className="bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-800 transition-colors flex items-center gap-2">
                Upload Excel
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Plus className="w-4 h-4" />
              </label>
              {selectedFileName && <span className="text-gray-600">{selectedFileName}</span>}
            </div>

            {excelData.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      {Object.keys(excelData[0]).map((col, idx) => (
                        <th key={idx} className="px-4 py-2 border-b text-left text-gray-700 font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        {Object.keys(row).map((col, colIdx) => (
                          <td key={colIdx} className="px-4 py-2 border-b text-gray-700">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetProgramsDashboard;
