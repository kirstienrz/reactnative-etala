import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Calendar, Shield, X, Info } from "lucide-react";
import { toast } from "react-toastify";
import { signup } from "../api/auth"; 
import PolicyModal from "../components/PolicyModal";

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
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState('terms');

  const showDepartment = userType === "Student" || userType === "Faculty" || userType === "Staff";

  const handleTupIdChange = (e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, "");

    let prefix = "";
    let rest = "";

    if (value.startsWith("TUPT")) {
      prefix = "TUPT";
      rest = value.substring(4);
    } else if (value.length >= 3) {
      prefix = value.substring(0, 3);
      rest = value.substring(3);
    } else {
      prefix = value;
      rest = "";
    }

    rest = rest.slice(0, 6);
    let formatted = prefix;
    if (formatted && rest.length >= 1) formatted += "-" + rest.slice(0, 2);
    if (rest.length >= 3) formatted += "-" + rest.slice(2, 6);
    setTupId(formatted);

    // Auto-detect userType from ID format (XXX-XX-XXXX is usually faculty)
    if (prefix.length === 3 && prefix !== "") {
      setUserType("Faculty");
    } else if (prefix === "TUPT") {
      setUserType("Student");
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value.trim();
    setEmail(val);

    // Auto-detect userType from Email format (underscore is usually faculty)
    if (val.includes("_")) {
      setUserType("Faculty");
    } else if (val.includes(".") && !val.includes("_")) {
      setUserType("Student");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const policyChecked = document.getElementById('policy')?.checked;
      if (!policyChecked) {
        toast.warning("Please agree to the Terms and Conditions to proceed.");
        setLoading(false);
        return;
      }

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

      const tupIdMatch = tupId.match(/^[A-Z0-9]{3,4}-\d{2}-\d{4}$/);
      if (!tupIdMatch) {
        toast.warning("Invalid TUP ID format. Use TUPT-XX-XXXX or XXX-XX-XXXX");
        setLoading(false);
        return;
      }

      // Year validation ONLY for Students
      if (userType === "Student") {
        const idYear = parseInt(tupIdMatch[1]);
        const currentYearFull = new Date().getFullYear();
        const currentYearYY = currentYearFull % 100;
        const minYearYY = currentYearYY - 5;

        if (idYear < minYearYY || idYear > currentYearYY) {
          toast.warning(`Invalid TUPT ID. Only student IDs from 20${minYearYY} to 20${currentYearYY} are accepted.`);
          setLoading(false);
          return;
        }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-3 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
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
                  className="w-full pl-3 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
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
                  placeholder="username@tup.edu.ph"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
              {(userType === "Student" || userType === "Faculty") && (
                <p className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 px-1">
                  <Info size={11} className="shrink-0 text-violet-400" />
                  {userType === "Student"
                    ? "Students: use dot (.) separator"
                    : "Faculty: use underscore (_) separator"}
                </p>
              )}
            </div>

            {/* TUP ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TUP ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., TUPT-23-0001"
                value={tupId}
                onChange={handleTupIdChange}
                required
                className="w-full pl-3 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                maxLength={14}
              />
              <p className="text-xs text-gray-500 mt-1">Format: TUPT-XX-XXXX or XXX-XX-XXXX</p>
            </div>

            {/* Gender & Birthday */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          value={["Male", "Female", "Gay", "Lesbian", "Bisexual", "Transgender", "Queer", "Non-binary", "Prefer not to say", ""].includes(gender) ? gender : "Other"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "Other") {
              setGender("Other"); // Set to 'Other' initially to show input
            } else {
              setGender(val);
            }
          }}
          required
          className="w-full pl-3 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Gay">Gay</option>
          <option value="Lesbian">Lesbian</option>
          <option value="Bisexual">Bisexual</option>
          <option value="Transgender">Transgender</option>
          <option value="Queer">Queer/Questioning</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Prefer not to say">Prefer not to say</option>
          <option value="Other">Other (Please specify)</option>
        </select>

        {/* Other Gender Input */}
        {(gender === "Other" || (!["Male", "Female", "Gay", "Lesbian", "Bisexual", "Transgender", "Queer", "Non-binary", "Prefer not to say", ""].includes(gender))) && (
          <input
            type="text"
            placeholder="Please specify your gender"
            value={gender === "Other" ? "" : gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full mt-2 pl-3 pr-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all text-sm"
          />
        )}
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
            className="w-full pl-11 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
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
          className="w-full pl-11 pr-12 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-400 hover:text-gray-600 p-1 rounded-full border border-gray-200"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
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
          className="w-full pl-3 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.code} value={d.code}>{d.name}</option>
          ))}
        </select>
      </div>
    )}

    {/* Policy / Terms Checkbox */}
    <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-2xl border border-violet-100">
      <input
        type="checkbox"
        id="policy"
        required
        className="mt-1 w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
      />
      <label htmlFor="policy" className="text-xs text-gray-600 leading-relaxed">
        I understand that providing false information or misusing this system is strictly prohibited. I agree to the <span onClick={() => { setPolicyTab('terms'); setIsPolicyModalOpen(true); }} className="text-violet-600 font-semibold cursor-pointer underline hover:text-violet-700 transition-colors">Terms of Use</span> and <span onClick={() => { setPolicyTab('privacy'); setIsPolicyModalOpen(true); }} className="text-violet-600 font-semibold cursor-pointer underline hover:text-violet-700 transition-colors">Privacy Policy</span> of ETALA.
      </label>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
    >
      {loading ? "Signing up..." : "Create Account"}
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

      <PolicyModal 
        isOpen={isPolicyModalOpen} 
        onClose={() => setIsPolicyModalOpen(false)} 
        initialTab={policyTab} 
      />
    </div>
  );
};

export default SignupPage;