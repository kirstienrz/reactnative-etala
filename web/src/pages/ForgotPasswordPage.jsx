import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../api/auth";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.warning("Please enter your email address.");
            return;
        }

        setLoading(true);
        try {
            const data = await forgotPassword(email);
            toast.success(data.msg || "Reset link sent!");
            // Option to navigate back or just stay to let them see the success message
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to send reset link.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-20 w-72 h-72 bg-violet-300 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 text-gray-500 hover:text-violet-600 transition-colors mb-6 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </button>

                    <h2 className="text-3xl font-semibold text-center text-gray-900 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    placeholder="your.email@etala.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
