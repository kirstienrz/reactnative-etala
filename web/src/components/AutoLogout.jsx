import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { toast } from 'react-toastify';

const AutoLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user, role } = useSelector((state) => state.auth);
  const activeRole = user?.role || role;

  useEffect(() => {
    if (!isLoggedIn) return;

    let timeoutId;
    const isAdmin = activeRole === 'superadmin' || activeRole === 'admin';
    const timeoutMinutes = isAdmin ? 60 : 10;
    const TIMEOUT_MS = timeoutMinutes * 60 * 1000;

    const handleLogout = () => {
      dispatch(logout());
      localStorage.removeItem('lastActivityTime');
      navigate('/login', { replace: true });
      toast.info(`Your session has expired due to ${timeoutMinutes} minutes of inactivity. Please log in again for your security.`);
    };

    // Check if they were inactive while the tab was closed
    const savedLastActivity = localStorage.getItem('lastActivityTime');
    if (savedLastActivity) {
      const timeSinceLastActive = Date.now() - parseInt(savedLastActivity, 10);
      if (timeSinceLastActive > TIMEOUT_MS) {
        handleLogout();
        return; // Stop initialization
      }
    }
    
    // Set initial activity
    localStorage.setItem('lastActivityTime', Date.now().toString());
    let lastWriteTime = Date.now();

    const resetTimer = () => {
      clearTimeout(timeoutId);
      
      const now = Date.now();
      // Throttle localStorage writes to once every 5 seconds to preserve performance
      if (now - lastWriteTime > 5000) {
        localStorage.setItem('lastActivityTime', now.toString());
        lastWriteTime = now;
      }
      
      timeoutId = setTimeout(handleLogout, TIMEOUT_MS);
    };

    // Initialize timer
    resetTimer();

    // Listeners for user activity
    const events = ['mousemove', 'keydown', 'wheel', 'mousedown', 'touchstart', 'scroll'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isLoggedIn, activeRole, dispatch, navigate]);

  return null;
};

export default AutoLogout;
