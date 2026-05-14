import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Lock, AlertCircle, Loader2, X } from 'lucide-react';
import { createSuggestion } from '../../api/suggestion';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const GADSuggestionBox = () => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setShowLoginOverlay(true);
      return;
    }

    if (!newSuggestion.trim()) {
      setShowError('Please enter a suggestion before submitting.');
      return;
    }

    if (isOverLimit) {
      setShowError('Your suggestion is too long. Please shorten it.');
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
      const msg = err.response?.data?.error || 'Failed to submit suggestion. Please try again.';
      setShowError(msg);
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
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{showError}</span>
                </div>
                {!isLoggedIn && showError.includes('logged in') && (
                  <Link to="/login" className="text-red-600 font-bold text-xs uppercase tracking-wider hover:underline">
                    Login Now
                  </Link>
                )}
              </div>
            )}

            {/* Suggestion Input */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Suggestion</h2>

              <div className="relative">
                <textarea
                  placeholder="Share your ideas, concerns, or recommendations..."
                  value={newSuggestion}
                  onChange={(e) => {
                    setNewSuggestion(e.target.value);
                    setShowError('');
                  }}
                  disabled={loading}
                  className={`w-full h-52 p-4 border border-slate-300 rounded-xl transition-all
                            focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-700
                            resize-none`}
                  maxLength={maxCharacters}
                />
                
                {/* Login Overlay - Only shown when clicking submit without being logged in */}
                {showLoginOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[4px] rounded-xl z-20 animate-in fade-in duration-300">
                    <div className="text-center p-8 bg-white shadow-2xl border border-slate-100 rounded-3xl max-w-sm mx-4 animate-in zoom-in-95 duration-300 relative">
                      <button 
                        onClick={() => setShowLoginOverlay(false)}
                        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-violet-600" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Login Required</h3>
                      <p className="text-sm text-slate-500 mb-6 px-2">
                        To maintain a high-quality community feedback system, we require users to be logged in to submit suggestions.
                      </p>
                      
                      <div className="flex flex-col gap-3">
                        <Link 
                          to="/login" 
                          className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition shadow-lg shadow-violet-200 no-underline"
                        >
                          Log In to Submit
                        </Link>
                        <button 
                          onClick={() => setShowLoginOverlay(false)}
                          className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-slate-500 italic">
                  {isLoggedIn ? `Posting as ${user?.name || 'User'}` : ''}
                </span>
                <span
                  className={`font-bold ${
                    isOverLimit
                      ? 'text-red-600'
                      : isNearLimit
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                >
                  {characterCount} / {maxCharacters}
                </span>
              </div>

              <button
                className={`mt-6 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg
                ${loading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-violet-600 text-white hover:bg-violet-700 hover:shadow-violet-200 active:scale-[0.98]'
                  }`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting suggestion...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Suggestion</span>
                  </>
                )}
              </button>
            </div>

            {/* Privacy Card */}
            <div className="bg-white rounded-2xl p-6 shadow border border-slate-200">
                <div className="flex items-start gap-4">
                  <Lock className="w-6 h-6 text-slate-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">Fair & Responsible Feedback</h3>
                    <p className="text-slate-600">
                      To ensure high-quality feedback, we limit submissions to <strong>2 per day</strong> per user. This helps us focus on the most important suggestions.
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
