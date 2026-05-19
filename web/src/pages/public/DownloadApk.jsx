import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Smartphone, 
  Settings, 
  ShieldAlert, 
  Sparkles
} from "lucide-react";

export default function DownloadApk() {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const navigate = useNavigate();

  const triggerDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement("a");
    link.href = "/assets/eTALA.apk";
    link.download = "eTALA.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const steps = [
    {
      icon: <Download className="w-6 h-6 text-violet-500" />,
      title: "1. Download the File",
      desc: "Click 'Download APK Now'. You will see a file named 'eTALA.apk' in your notifications or downloads list."
    },
    {
      icon: <Settings className="w-6 h-6 text-violet-500" />,
      title: "2. Allow Unknown Sources",
      desc: "If prompted by your device with a security warning, go to Settings and turn on 'Allow installation of apps from unknown sources' or 'Allow from this source'."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-violet-500" />,
      title: "3. Complete Installation",
      desc: "Tap the completed download file and select 'Install'. Once complete, open the eTALA app and log in!"
    }
  ];

  return (
    <main className="bg-slate-50 min-h-screen relative overflow-hidden flex flex-col justify-between">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-300/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header Back Button */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 relative z-10">
        <button 
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-bold rounded-xl border border-slate-200 shadow-sm transition-all hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>

      {/* Main Download Card */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center relative z-10">
        <div className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-8 md:p-12 text-center max-w-2xl mb-12 relative overflow-hidden">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 mb-6 border border-violet-200">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">Mobile App Installer</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight leading-none">
            Download <span className="text-violet-600">eTALA App</span>
          </h1>

          <p className="text-slate-500 font-medium text-base md:text-lg mb-8 max-w-md mx-auto">
            Get the official eTALA mobile application to report issues and stay connected on the go.
          </p>

          {/* Status & Smartphone visual wrapper */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-violet-50 border-4 border-violet-100 text-violet-600 shadow-md">
              <Smartphone className="w-12 h-12 text-violet-600 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-400 opacity-20 animate-ping"></div>
            </div>
            
            <p className="mt-4 text-base font-bold text-slate-700">
              {downloadStarted ? "🎉 Download started! Check your device notifications." : "Ready to install the application"}
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-4 max-w-md mx-auto">
            <button
              onClick={triggerDownload}
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
            >
              <Download className="w-6 h-6 animate-bounce" />
              Download APK Now
            </button>

            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Secure & Direct Installation Package
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Installation Guide */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Smartphone className="w-6 h-6 text-violet-600" />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Android Installation Guide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/60 shadow-lg rounded-2xl p-6 flex flex-col items-center text-center hover:scale-[1.03] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Safety Notice */}
          <div className="mt-8 flex gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm mb-0.5">Secure Application File Notice</h4>
              <p className="text-amber-700 text-xs leading-relaxed font-medium">
                The eTALA mobile application package is completely safe, verified, and free of malware. Android marks manually downloaded files as "unknown sources" because it has not been downloaded from the Google Play Store, but it is entirely safe to proceed with the installation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="w-full text-center py-8 border-t border-slate-200/60 z-10 bg-white/40 backdrop-blur-sm mt-12">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          &copy; {new Date().getFullYear()} eTALA. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}
