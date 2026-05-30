import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export default function HardwareBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isListenerSetup = false;
    let listener = null;

    const setupListener = async () => {
      listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        // Specific pages where back button should close the app or do nothing
        const exitPages = ["/", "/login", "/superadmin/dashboard", "/user/dashboard"];
        
        if (exitPages.includes(location.pathname)) {
          CapacitorApp.exitApp();
        } else if (canGoBack) {
          navigate(-1);
        } else {
          CapacitorApp.exitApp();
        }
      });
      isListenerSetup = true;
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [navigate, location]);

  return null;
}
