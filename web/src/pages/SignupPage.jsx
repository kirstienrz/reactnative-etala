import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { signup } from "../api/auth"; // iyong signup API

const departments = [
  { code: 'BASD', name: 'Basic Arts and Sciences Department' },
  { code: 'CAAD', name: 'Civil and Allied Department' },
  { code: 'EEAD', name: 'Electrical and Allied Department' },
  { code: 'MAAD', name: 'Mechanical and Allied Department' },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [tupId, setTupId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("Student");
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState(""); // ✅ new
  const [loading, setLoading] = useState(false);

  const showDepartment = userType === "Student" || userType === "Faculty";

  const handleTupIdChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, "");
    if (!value.startsWith("TUPT")) value = "TUPT" + value.replace(/^TUPT/, "");
    let rest = value.replace("TUPT", "").slice(0, 6);
    let formatted = "TUPT";
    if (rest.length >= 1) formatted += "-" + rest.slice(0, 2);
    if (rest.length >= 3) formatted += "-" + rest.slice(2, 6);
    setTupId(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !tupId ||
        !userType ||
        !gender ||
        !birthday || // ✅ birthday required
        (showDepartment && !department)
      ) {
        toast.warning("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      if (!email.endsWith("@tup.edu.ph")) {
        toast.warning("Please use your @tup.edu.ph email address.");
        setLoading(false);
        return;
      }

      if (!tupId.match(/^TUPT-\d{2}-\d{4}$/)) {
        toast.warning("TUPT ID must be in format: TUPT-XX-XXXX");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.warning("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      await signup({
        firstName,
        lastName,
        email,
        tupId,
        password,
        userType,
        gender,
        birthday, // ✅ include birthday
        department: showDepartment ? department : null,
      });

      toast.success("Signup successful! Check your email to activate your account.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-violet-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Signup Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/assets/logo.jpg" alt="Logo" className="w-20 h-20 object-cover" />
          </div>

          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-2">
            Create an Account
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Technological University of the Philippines – Taguig
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="your.email@tup.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
            </div>

            {/* TUPT ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TUPT ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="TUPT-23-0001"
                value={tupId}
                onChange={handleTupIdChange}
                required
                className="w-full pl-3 pr-3 py-3 bg-white border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                maxLength={14}
              />
              <p className="text-xs text-gray-500 mt-1">Format: TUPT-XX-XXXX</p>
            </div>

            {/* Gender & Birthday */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                    className="w-full pl-11 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a <span className="text-red-500">*</span>
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
                className="w-full pl-3 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Non-Faculty">Non-Faculty</option>
              </select>
            </div>

            {/* Department (conditional) */}
            {showDepartment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Already have an account?{" "}
              <span
                className="text-violet-600 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;