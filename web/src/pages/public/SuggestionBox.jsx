import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { createSuggestion } from '../../api/suggestion';

const GADSuggestionBox = () => {
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');

  const handleSubmit = async () => {
    if (!newSuggestion.trim()) {
      setShowError('Please enter a suggestion before submitting.');
      return;
    }

    try {
      setLoading(true);
      setShowError('');
      await createSuggestion({ text: newSuggestion });
      setNewSuggestion('');
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setShowError('Failed to submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = newSuggestion.length;
  const maxCharacters = 500;
  const isNearLimit = characterCount > maxCharacters * 0.9;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <main className="bg-white min-h-screen">

      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight select-none">
            Suggestion <span className="text-violet-400">Box</span>
          </h1>
          <div className="w-20 h-1.5 bg-violet-500 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-violet-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
            Your voice matters. Share your ideas, concerns, or recommendations to help us build a better community.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT SIDE – SUGGESTION FORM */}
          <div className="lg:col-span-2 space-y-10">

            {/* Success */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Suggestion submitted successfully!</span>
              </div>
            )}

            {/* Error */}
            {showError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{showError}</span>
              </div>
            )}

            {/* Suggestion Input */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Suggestion</h2>

              <textarea
                placeholder="Share your ideas, concerns, or recommendations..."
                value={newSuggestion}
                onChange={(e) => {
                  setNewSuggestion(e.target.value);
                  setShowError('');
                }}
                className="w-full h-52 p-4 border border-slate-300 rounded-xl
                           focus:ring-2 focus:ring-violet-500 focus:border-transparent
                           text-slate-700 resize-none"
                maxLength={maxCharacters}
              />

              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-slate-500">
                  Your submission is <strong>anonymous</strong>.
                </span>
                <span
                  className={`font-medium ${
                    isOverLimit
                      ? 'text-red-600'
                      : isNearLimit
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  {characterCount} / {maxCharacters}
                </span>
              </div>

              <button
                className="bg-white text-violet-700 border border-violet-200 rounded-lg px-4 py-2 shadow hover:bg-violet-50 transition-colors dark:bg-white dark:text-violet-700 dark:hover:bg-violet-100
                "
                onClick={handleSubmit}
                disabled={loading || isOverLimit}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-white" />
                    Submit Suggestion
                  </>
                )}
              </button>
            </div>

            {/* Privacy Card */}
            <div className="bg-white rounded-2xl p-6 shadow border border-slate-200">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-slate-700 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Anonymous & Confidential</h3>
                  <p className="text-slate-600">
                    Your identity will never be recorded. The committee reviews all submissions with respect and confidentiality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – GUIDELINES */}
          <aside>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sticky top-20">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Guidelines</h2>

              <div className="space-y-6">
                {[
                  { num: 1, title: 'Be Respectful', text: 'Provide constructive feedback.' },
                  { num: 2, title: 'Be Specific', text: 'Give clear, actionable suggestions.' },
                  { num: 3, title: 'Stay GAD-Focused', text: 'Align with gender and development goals.' },
                  { num: 4, title: 'Offer Solutions', text: 'Not just problems — give possible improvements.' }
                ].map((i) => (
                  <div key={i.num} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <span className="text-violet-700 font-bold">{i.num}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{i.title}</h4>
                      <p className="text-slate-600 text-sm">{i.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t pt-6">
                <h3 className="font-semibold text-slate-900 mb-3">What Happens Next?</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Reviewed by GAD Committee</li>
                  <li>• Discussed in meetings</li>
                  <li>• Evaluated for implementation</li>
                  <li>• Integrated into improvements</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-14 text-center">
        <h3 className="text-2xl font-bold mb-3">Your Voice Matters</h3>
        <p className="text-slate-300 max-w-xl mx-auto">
          Every suggestion helps us build a safer and more inclusive community.
        </p>
      </footer>
    </main>
  );
};

export default GADSuggestionBox;
