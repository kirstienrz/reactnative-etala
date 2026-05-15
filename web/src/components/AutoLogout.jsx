import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { toast } from 'react-toastify';

const AutoLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const TIMEOUT_MS = 60 * 60 * 1000; // 1 hour in milliseconds

    const handleLogout = () => {
      dispatch(logout());
      navigate('/login', { replace: true });
      toast.info('Your session has expired due to 1 hour of inactivity. Please log in again for your security.');
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, TIMEOUT_MS);
    };

    // Initialize timer
    resetTimer();

    // Listeners for user activity
    const events = ['mousemove', 'keydown', 'wheel', 'mousedown', 'touchstart', 'scroll'];
    
    // Use a throttled version for performance (optional, but standard resetTimer is fine for this use case since clearTimeout is fast)
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, dispatch, navigate]);

  return null;
};

export default AutoLogout;
