import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';

const SuggestionBox = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    anonymous: false
  });
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'General Feedback',
    'Policy Suggestions',
    'Program Ideas',
    'Campus Safety',
    'Gender Equality Concerns',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Suggestion submitted:', formData);
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
        anonymous: false
      });
    }, 3000);
  };

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Suggestion Box
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Share your ideas, feedback, and suggestions to help improve our GAD programs
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">We Value Your Input</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
            <p>
              The GAD Office welcomes your suggestions and feedback. Share your ideas to help us improve our programs and better serve the university community.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-8">
          {submitted ? (
            <div className="bg-white border border-green-200 rounded-lg p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Thank You!</h3>
              <p className="text-slate-600 text-lg">
                Your suggestion has been submitted successfully. We appreciate your feedback and will review it carefully.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Submit a Suggestion</h2>
              </div>

              <div className="space-y-6">
                {/* Anonymous Option */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="anonymous"
                    name="anonymous"
                    checked={formData.anonymous}
                    onChange={handleChange}
                    className="w-4 h-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
                  />
                  <label htmlFor="anonymous" className="text-sm text-slate-700 font-medium">
                    Submit anonymously (your contact information will not be recorded)
                  </label>
                </div>

                {/* Contact Information - Hidden if anonymous */}
                {!formData.anonymous && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Brief summary of your suggestion"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                    Your Suggestion
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="8"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    placeholder="Please provide detailed information about your suggestion..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Submit Suggestion
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

    </main>
  );
};

export default SuggestionBox;