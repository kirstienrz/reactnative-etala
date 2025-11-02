import React, { useState } from "react";
import { MessageSquare, Send, Share2, X } from "lucide-react";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [referralNote, setReferralNote] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const reports = [
    {
      id: "TCK-2025-001",
      reporter: "Anonymous",
      category: "Bullying",
      description: "Student was reportedly being bullied in hallway.",
      status: "Pending",
      date: "Nov 1, 2025",
    },
    {
      id: "TCK-2025-002",
      reporter: "Maria Santos",
      category: "Harassment",
      description: "Received inappropriate messages from coworker.",
      status: "In Progress",
      date: "Nov 1, 2025",
    },
  ];

  const handleRefer = (report) => {
    setSelectedReport(report);
    setShowReferralModal(true);
  };

  const handleSendReferral = () => {
    alert(`Referred report ${selectedReport.id} with note: ${referralNote}`);
    setReferralNote("");
    setShowReferralModal(false);
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      setMessages([...messages, { sender: "SuperAdmin", text: message }]);
      setMessage("");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📋 Reports Management</h1>

      {/* Reports List */}
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <div key={r.id} className="bg-white shadow-md rounded-xl p-4 border">
            <h2 className="font-semibold text-lg mb-1">{r.category}</h2>
            <p className="text-sm text-gray-600 mb-1">{r.description}</p>
            <p className="text-xs text-gray-500 mb-2">
              <b>Reporter:</b> {r.reporter} • <b>Status:</b> {r.status}
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => handleRefer(r)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <Share2 size={16} /> Refer
              </button>
              <button
                onClick={() => setSelectedReport(r)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
              >
                <MessageSquare size={16} /> Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                Refer Report {selectedReport?.id}
              </h2>
              <X
                className="cursor-pointer hover:text-red-500"
                onClick={() => setShowReferralModal(false)}
              />
            </div>
            <textarea
              className="w-full border p-2 rounded-md mb-3"
              rows="3"
              placeholder="Add referral note or instruction..."
              value={referralNote}
              onChange={(e) => setReferralNote(e.target.value)}
            />
            <button
              onClick={handleSendReferral}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
            >
              Send Referral
            </button>
          </div>
        </div>
      )}

      {/* Message Drawer */}
      {selectedReport && !showReferralModal && (
        <div className="fixed bottom-0 right-0 bg-white border-t border-l shadow-lg w-full md:w-96 h-96 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b bg-gray-100">
            <h2 className="font-semibold text-gray-700">
              Chat — {selectedReport.category}
            </h2>
            <X
              className="cursor-pointer hover:text-red-500"
              onClick={() => setSelectedReport(null)}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">No messages yet...</p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-md text-sm max-w-[80%] ${
                    m.sender === "SuperAdmin"
                      ? "bg-blue-100 self-end ml-auto"
                      : "bg-gray-100"
                  }`}
                >
                  <b>{m.sender}: </b>
                  {m.text}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
