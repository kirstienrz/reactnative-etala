import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { login, verifyPin } from "../api/auth";
import { Lock, Mail, Key, User, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  // siguraduhin na nagsisimula sa TUPT
  if (!value.startsWith("TUPT")) {
    value = "TUPT" + value.replace(/^TUPT/, "");
  }

  // tanggalin muna ang TUPT para ma-format yung numbers
  let rest = value.replace("TUPT", "");

  // limit sa 6 characters (XX + XXXX)
  rest = rest.slice(0, 6);

  let formatted = "TUPT";

  if (rest.length >= 1) {
    formatted += "-" + rest.slice(0, 2);
  }

  if (rest.length >= 3) {
    formatted += "-" + rest.slice(2, 6);
  }

  setTupId(formatted);
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

      // 🔹 EMAIL FORMAT CHECK
      if (!email.endsWith("@etala.com")) {
        toast.warning("Please use your E-tala email address only.");
        setLoading(false);
        return;
      }
      let data;

      if (usePin) {
        if (pin.length !== 6) {
          throw new Error("PIN must be exactly 6 digits");
        }
        data = await verifyPin(email, pin);
      } else {
        if (!tupId.match(/^TUPT-\d{2}-\d{4}$/)) {
          throw new Error("TUPT ID must be in format: TUPT-XX-XXXX");
        }
        data = await login(email, password, tupId);
      }

      dispatch(loginSuccess({
        token: data.token,
        role: data.role,
        department: data.department,
        user: {
          _id: data.id,      // ✅ Use _id to match MongoDB convention
          name: data.name,
          role: data.role,
          department: data.department
        }
      }));

      toast.success("Login successful!");

      if (data.role === "superadmin") navigate("/superadmin/dashboard");
      else if (data.role === "admin") navigate("/admin/dashboard");
      else navigate("/user/dashboard");

    } catch (err) {
      // ✅ Custom error handling
      if (err.response) {
        const { status, data } = err.response;

        if (status === 403 && data?.msg?.toLowerCase().includes("deactivated")) {
          toast.error("Your account has been deactivated. Please contact the administrator.");
        } else if (status === 403 && data?.msg?.toLowerCase().includes("archived")) {
          toast.error("Your account is archived. Please contact support.");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-violet-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/logo.jpg"
              alt="Logo"
              className="w-20 h-20 object-cover"
            />
          </div>


          {/* Title */}
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-2">
            Welcome to the GAD Portal
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Technological University of the Philippines – Taguig
          </p>

          {/* Toggle */}
          <div className="flex justify-center mb-6">
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
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="your.email@etala.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {usePin ? (
              /* PIN Input */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit PIN</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    value={pin}
                    onChange={handlePinChange}
                    onPaste={handlePinPaste}
                    required
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                    autoComplete="off"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {pin.length}/6 digits entered
                </p>
              </div>
            ) : (
              <>
                {/* TUPT ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TUPT ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="TUPT-23-0001"
                      value={tupId}
                      onChange={handleTupIdChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all font-mono"
                      autoComplete="off"
                      maxLength={14}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Format: TUPT-XX-XXXX</p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                      autoComplete="current-password"
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
              </>
            )}

            {/* Error Message */}
            {/* {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <span className="font-medium">⚠</span>
                <span>{error}</span>
              </div>
            )} */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Need help? Contact GAD Office</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;