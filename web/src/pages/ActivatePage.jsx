import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

const ActivatePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const res = await axios.get(
          `https://reactnative-etala.onrender.com/api/auth/activate/${token}`
        );
        setMessage(res.data.msg || "Your account has been activated successfully!");
        setStatus("success");
        toast.success(res.data.msg || "Account activated!");
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.msg || "Activation failed. The link may have expired.";
        setMessage(errMsg);
        setStatus("error");
        toast.error(errMsg);
      }
    };
    activateAccount();
  }, [token]);

  // Countdown + auto-redirect after activation result
  useEffect(() => {
    if (status === "loading") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(status === "success" ? "/login" : "/signup");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-violet-200 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Top accent bar */}
          <div
            className={`h-1.5 w-full transition-all duration-700 ${
              status === "loading"
                ? "bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 animate-pulse"
                : status === "success"
                ? "bg-gradient-to-r from-emerald-400 to-green-500"
                : "bg-gradient-to-r from-red-400 to-rose-500"
            }`}
          />

          <div className="p-10 flex flex-col items-center text-center">
            {/* Logo */}
            <img
              src="/assets/logo.jpg"
              alt="ETALA Logo"
              className="w-16 h-16 object-cover rounded-full mb-6 shadow-md"
            />

            {/* Status Icon */}
            <div className="mb-6">
              {status === "loading" && (
                <div className="w-20 h-20 rounded-full bg-violet-50 border-2 border-violet-100 flex items-center justify-center">
                  <Loader2 size={40} className="text-violet-600 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center animate-[scale_0.4s_ease-out]">
                  <CheckCircle size={44} className="text-emerald-500" />
                </div>
              )}
              {status === "error" && (
                <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
                  <XCircle size={44} className="text-red-500" />
                </div>
              )}
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === "loading" && "Activating your account…"}
              {status === "success" && "Account Activated!"}
              {status === "error" && "Activation Failed"}
            </h1>

            {/* Sub-message */}
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
              {status === "loading"
                ? "Please wait while we verify your activation link."
                : message}
            </p>

            {/* Countdown + redirect info */}
            {status !== "loading" && (
              <div className="w-full space-y-4">
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 ${
                      status === "success" ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{ width: `${(countdown / 5) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400">
                  Redirecting to{" "}
                  <span className="font-semibold text-gray-600">
                    {status === "success" ? "Login" : "Sign Up"}
                  </span>{" "}
                  in <span className="font-bold text-violet-600">{countdown}s</span>…
                </p>

                {/* Manual redirect button */}
                <button
                  onClick={() => navigate(status === "success" ? "/login" : "/signup")}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    status === "success"
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                      : "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                  }`}
                >
                  {status === "success" ? "Go to Login" : "Back to Sign Up"}
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Gender and Development Office · TUP-Taguig
        </p>
      </div>
    </div>
  );
};

export default ActivatePage;
