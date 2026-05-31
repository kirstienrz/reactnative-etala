import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, saveProfile } from "../../store/userSlice";
import { User, Calendar, Lock, Key, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { updateUserPin } from "../../api/user";

const Profile = () => {
    const dispatch = useDispatch();
    const { profile, loading, updating, error } = useSelector((state) => state.user);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        birthday: "",
        gender: "",
        currentPassword: "",
        newPassword: "",
    });

    const [hasPin, setHasPin] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinPassword, setPinPassword] = useState("");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [showPin, setShowPin] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);
    const [pinError, setPinError] = useState("");
    const [pinSuccess, setPinSuccess] = useState("");

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setForm({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                birthday: profile?.birthday ? profile.birthday.split("T")[0] : "",
                gender: profile.gender || "",
                currentPassword: "",
                newPassword: "",
            });
            setHasPin(profile.hasPin || false);
        }
    }, [profile]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            firstName: form.firstName,
            lastName: form.lastName,
            birthday: form.birthday,
            gender: form.gender,
        };

        // Add password only if both fields filled
        if (form.currentPassword && form.newPassword) {
            payload.currentPassword = form.currentPassword;
            payload.newPassword = form.newPassword;
        }

        dispatch(saveProfile(payload));
    };

    const handlePinChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 6) {
            setPin(value);
            setPinError("");
        }
    };

    const handleConfirmPinChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 6) {
            setConfirmPin(value);
            setPinError("");
        }
    };

    const handleSavePin = async (e) => {
        e.preventDefault();
        setPinError("");
        setPinSuccess("");

        if (!pinPassword) {
            setPinError("Current password is required.");
            return;
        }

        if (pin.length !== 6) {
            setPinError("PIN must be exactly 6 digits.");
            return;
        }

        if (pin !== confirmPin) {
            setPinError("PINs do not match.");
            return;
        }

        setPinLoading(true);

        try {
            await updateUserPin({ currentPassword: pinPassword, newPin: pin });
            setHasPin(true);
            setPinSuccess("MPIN updated successfully!");
            setPin("");
            setConfirmPin("");
            setPinPassword("");
            
            // Auto-hide success message and modal
            setTimeout(() => {
                setPinSuccess("");
                setShowPinModal(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            setPinError(err.response?.data?.message || err.response?.data?.msg || "Failed to set MPIN. Please try again.");
        } finally {
            setPinLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) return <p className="text-center text-gray-600 p-8">No profile data</p>;

    return (
        <>
        <div className="p-6 w-full">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                        {form.firstName.charAt(0)}{form.lastName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                        <p className="text-sm text-gray-500">{profile.email || "GADnganupdateei"}</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Personal Information Section */}
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                placeholder="Enter first name"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="Enter last name"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Birthday</span>
                            </label>
                            <input
                                type="date"
                                name="birthday"
                                value={form.birthday}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="border-t border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center space-x-2">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Leave blank if you don't want to change password</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={form.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={form.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* MPIN Security Section */}
                <div className="border-t border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Key className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">MPIN Security</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            hasPin 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                            {hasPin ? 'Active' : 'Not Configured'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Set up a 6-digit MPIN for faster and secure login. You will need your current password.</p>
                </div>

                <div className="p-6">
                    <button
                        type="button"
                        onClick={() => setShowPinModal(true)}
                        className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    >
                        {hasPin ? "Change MPIN" : "Configure MPIN"}
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={updating}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                    >
                        {updating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Updating...</span>
                            </>
                        ) : (
                            <span>Update Profile</span>
                        )}
                    </button>
                </div>
            </div>
        </div>

        {/* MPIN Modal */}
        {showPinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">{hasPin ? "Change MPIN" : "Configure MPIN"}</h3>
                        <button onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-gray-600">
                            &times;
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {pinSuccess && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700 text-sm font-medium">
                                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>{pinSuccess}</span>
                            </div>
                        )}

                        {pinError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>{pinError}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="password"
                                    value={pinPassword}
                                    onChange={(e) => setPinPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New 6-Digit MPIN <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPin ? "text" : "password"}
                                    inputMode="numeric"
                                    value={pin}
                                    onChange={handlePinChange}
                                    placeholder="Enter 6-digit PIN"
                                    maxLength={6}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm 6-Digit MPIN <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPin ? "text" : "password"}
                                    inputMode="numeric"
                                    value={confirmPin}
                                    onChange={handleConfirmPinChange}
                                    placeholder="Confirm 6-digit PIN"
                                    maxLength={6}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                        <button
                            onClick={() => setShowPinModal(false)}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSavePin}
                            disabled={pinLoading || !pin || !confirmPin || !pinPassword}
                            className={`px-6 py-2.5 font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${
                                pinLoading || !pin || !confirmPin || !pinPassword
                                    ? 'bg-blue-300 cursor-not-allowed text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            }`}
                        >
                            {pinLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save MPIN</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default Profile;