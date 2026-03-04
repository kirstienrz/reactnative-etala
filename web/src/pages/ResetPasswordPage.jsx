import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { resetPassword } from "../api/auth";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isReset, setIsReset] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            toast.warning("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const data = await resetPassword(token, password);
            toast.success(data.msg || "Password reset successful!");
            setIsReset(true);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to reset password. Link may be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    if (isReset) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 text-center max-w-md w-full">
                    <div className="flex justify-center mb-6">
                        <CheckCircle className="text-green-500" size={64} />
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-900 mb-4">Password Reset!</h2>
                    <p className="text-gray-600 mb-8">
                        Your password has been successfully reset. You can now login with your new credentials.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="relative w-full max-w-md">
                <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
                    <h2 className="text-3xl font-semibold text-center text-gray-900 mb-2">
                        Reset Password
                    </h2>
                    <p className="text-center text-gray-600 mb-8">
                        Please enter your new password below.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
