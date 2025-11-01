// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchProfile, saveProfile } from "../../store/userSlice";

// const Profile = () => {
//     const dispatch = useDispatch();
//     const { profile, loading, updating, error } = useSelector((state) => state.user);

//     const [form, setForm] = useState({
//         firstName: "",
//         lastName: "",
//         birthday: "",
//         gender: "",
//         currentPassword: "",
//         newPassword: "",
//     });

//     useEffect(() => {
//         dispatch(fetchProfile());
//     }, [dispatch]);

//     useEffect(() => {
//         if (profile) {
//             setForm({
//                 firstName: profile.firstName || "",
//                 lastName: profile.lastName || "",
//                 birthday: profile?.birthday ? profile.birthday.split("T")[0] : "",
//                 gender: profile.gender || "",
//                 currentPassword: "",
//                 newPassword: "",
//             });
//         }
//     }, [profile]);

//     const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         const payload = {
//             firstName: form.firstName,
//             lastName: form.lastName,
//             birthday: form.birthday,
//             gender: form.gender,
//         };

//         // Add password only if both fields filled
//         if (form.currentPassword && form.newPassword) {
//             payload.currentPassword = form.currentPassword;
//             payload.newPassword = form.newPassword;
//         }

//         dispatch(saveProfile(payload));
//     };


//     if (loading) return <p>Loading profile...</p>;
//     if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
//     if (!profile) return <p>No profile data</p>;

//     return (
//         <div>
//             {error && <p style={{ color: "red" }}>{error}</p>}
//             <h2>My Profile</h2>
//             <form onSubmit={handleSubmit}>
//                 <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
//                 <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
//                 <input type="date" name="birthday" value={form.birthday} onChange={handleChange} />
//                 <select name="gender" value={form.gender} onChange={handleChange}>
//                     <option value="">Select Gender</option>
//                     <option value="Male">Male</option>
//                     <option value="Female">Female</option>
//                     <option value="Other">Other</option>
//                 </select>
//                 <input
//                     type="password"
//                     name="currentPassword"
//                     value={form.currentPassword}
//                     onChange={handleChange}
//                     placeholder="Current Password"
//                 />
//                 <input
//                     type="password"
//                     name="newPassword"
//                     value={form.newPassword}
//                     onChange={handleChange}
//                     placeholder="New Password"
//                 />
//                 <button type="submit" disabled={updating}>
//                     {updating ? "Updating..." : "Update Profile"}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default Profile;
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, saveProfile } from "../../store/userSlice";
import { User, Calendar, Lock } from "lucide-react";

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
        <div className="p-6 w-full">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                        {form.firstName.charAt(0)}{form.lastName.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                        <p className="text-sm text-gray-500">{profile.username || "GADnganupdateei"} • {profile.role || "superadmin"}</p>
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
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
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
    );
};

export default Profile;