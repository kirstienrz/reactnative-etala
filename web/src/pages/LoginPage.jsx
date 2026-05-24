import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";
import { login, verifyPin } from "../api/auth";
import { Lock, Mail, Key, User, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [isNativeApp, setIsNativeApp] = useState(false);

  React.useEffect(() => {
    try {
      const platform = Capacitor.getPlatform();
      setIsNativeApp(platform === "android" || platform === "ios");
    } catch (e) {
      setIsNativeApp(false);
    }
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userType, setUserType] = useState("Student");
  const [email, setEmail] = useState("");
  const [tupId, setTupId] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTupIdChange = (e) => {
    let value = e.target.value.toUpperCase();

    // alisin lahat ng hindi letter/number
    value = value.replace(/[^A-Z0-9]/g, "");

    // Detect if it starts with 4 letters (like TUPT) or 3 letters
    let prefix = "";
    let rest = "";

    if (value.startsWith("TUPT")) {
      prefix = "TUPT";
      rest = value.substring(4);
    } else if (value.length >= 3) {
      // If it doesn't start with TUPT but has at least 3 characters
      prefix = value.substring(0, 3);
      rest = value.substring(3);
    } else {
      prefix = value;
      rest = "";
    }

    // limit rest sa 6 characters (XX + XXXX)
    rest = rest.slice(0, 6);

    let formatted = prefix;

    if (rest.length >= 1) {
      formatted += "-" + rest.slice(0, 2);
    }

    if (rest.length >= 3) {
      formatted += "-" + rest.slice(2, 6);
    }

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


  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPin(value);
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numbers = pastedText.replace(/\D/g, '').slice(0, 6);
    setPin(numbers);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔹 BASIC FIELD VALIDATION (client-side trapping)
      if (!email || (!usePin && (!password || !tupId)) || (usePin && !pin)) {
        toast.warning("Please fill in all required fields.");
        setLoading(false);
        return; // stop the process
      }

      let data;

      if (usePin) {
        if (pin.length !== 6) {
          throw new Error("PIN must be exactly 6 digits");
        }
        data = await verifyPin(email, pin);
      } else {
        if (!tupId.match(/^[A-Z0-9]{3,4}-\d{2}-\d{4}$/)) {
          throw new Error("Invalid TUP ID format. Use TUPT-XX-XXXX or XXX-XX-XXXX");
        }
        data = await login(email, password, tupId);
      }

      console.log("📥 Backend Response:", data); // ✅ Debug log

      // ✅ Dispatch the ENTIRE backend response - authSlice will handle restructuring
      dispatch(loginSuccess(data));

      toast.success("Login successful!");

      if (data.role === "superadmin" || data.role === "admin") navigate("/superadmin/dashboard");
      else navigate("/user/dashboard");

    } catch (err) {
      // ✅ Custom error handling
      if (err.response) {
        const { status, data } = err.response;

        if (status === 403 && data?.msg?.toLowerCase().includes("deactivated")) {
          toast.error("Your account has been deactivated. Please contact the administrator.");
        } else if (status === 403 && data?.msg?.toLowerCase().includes("archived")) {
          toast.error("Your account is archived. Please contact support.");
        } else if (status === 400 && data?.msg?.toLowerCase().includes("no pin set")) {
          toast.warning("You don't have an MPIN set up yet. Please log in with your password first and set up your MPIN in your Profile settings.");
        } else if (status === 400) {
          toast.error(data?.msg || "Invalid credentials. Please try again.");
        } else {
          toast.error(data?.msg || "Login failed. Please try again later.");
        }
      } else {
        toast.error("Invalid. Please try again");
      }

      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={`${isNativeApp ? 'bg-white w-full px-8 pt-8 pb-32 flex flex-col justify-center min-h-[85vh]' : 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center content-container py-4 relative overflow-hidden'}`}>
      {/* Animated background elements */}
      {!isNativeApp && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-violet-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      )}

      {/* Login Card */}
      <div className={`relative w-full ${isNativeApp ? 'max-w-md mx-auto' : 'max-w-md'}`}>
        <div className={`${isNativeApp ? 'w-full' : 'bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-8 border border-gray-200'}`}>
          {/* Logo */}
          <div className={`flex justify-center ${isNativeApp ? 'mb-4' : 'mb-3 sm:mb-6'}`}>
            <img
              src="/assets/logo.jpg"
              alt="Logo"
              className={`${isNativeApp ? 'w-16 h-16' : 'w-14 h-14 sm:w-20 sm:h-20'} object-cover`}
            />
          </div>

          {/* Title */}
          <h2 className={`${isNativeApp ? 'text-[26px]' : 'text-xl sm:text-3xl'} font-semibold text-center text-gray-900 mb-1 sm:mb-2`}>
            Welcome to the GAD Portal
          </h2>
          <p className={`text-center text-gray-600 ${isNativeApp ? 'mb-6 text-sm' : 'text-xs sm:text-sm mb-4 sm:mb-8'}`}>
            Technological University of the Philippines – Taguig
          </p>

          {/* User Type Toggle */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-6">
            <button
              type="button"
              onClick={() => {
                setUsePin(!usePin);
                setError("");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-full transition-all font-medium text-sm border border-violet-200"
            >
              <Key size={16} />
              {usePin ? "Use Password" : "Use PIN"}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className={isNativeApp ? 'space-y-4' : 'space-y-3 sm:space-y-5'}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-11 pr-4 ${isNativeApp ? 'py-3 text-[15px]' : 'py-2.5 sm:py-3 text-sm'} bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all duration-300`}
                  autoComplete="email"
                />
              </div>
            </div>

            {usePin ? (
              /* PIN Input */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">6-Digit PIN</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    value={pin}
                    onChange={handlePinChange}
                    onPaste={handlePinPaste}
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                    autoComplete="off"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {pin.length}/6 digits entered
                </p>
              </div>
            ) : (
              <>
                {/* TUP ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">TUP ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Enter your TUP ID"
                      value={tupId}
                      onChange={handleTupIdChange}
                      required
                      className={`w-full pl-11 pr-4 ${isNativeApp ? 'py-3 text-[15px]' : 'py-2.5 sm:py-3 text-sm'} bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all duration-300 font-mono`}
                      autoComplete="off"
                      maxLength={14}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: TUPT-XX-XXXX or XXX-XX-XXXX</p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={`Enter your ${usePin ? 'PIN' : 'password'}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`w-full pl-11 pr-12 ${isNativeApp ? 'py-3 text-[15px]' : 'py-2.5 sm:py-3 text-sm'} bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all duration-300`}
                      autoComplete="current-password"
                      minLength={0}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-gray-400 hover:text-gray-600 p-1 rounded-full border border-gray-200 dark:bg-white dark:text-gray-400 dark:hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs sm:text-sm text-violet-600 hover:text-violet-700 cursor-pointer font-medium"
                    >
                      Forgot Password?
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold ${isNativeApp ? 'py-4' : 'py-2.5 sm:py-3 text-sm sm:text-base'} rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 space-y-1">
            <p>Need help? Contact GAD Office</p>
            <p>
              Don't have an account?{" "}
              <span
                className="text-violet-600 cursor-pointer font-medium hover:underline"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;