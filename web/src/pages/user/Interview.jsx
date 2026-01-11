// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { createCalendarEvent, getAllCalendarEvents, verifyBookingAccess } from "../../api/calendar";

// export default function InterviewBooking() {
//     const [events, setEvents] = useState([]);
//     const [holidays, setHolidays] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [selectedDate, setSelectedDate] = useState(null);
//     const [formData, setFormData] = useState({
//         title: "Consultation",
//         type: "consultation",
//         mode: "online",
//         start: "",
//         end: ""
//     });
//     const [accessVerified, setAccessVerified] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [expiresAt, setExpiresAt] = useState(null);

//     const { user } = useSelector((state) => state.auth);
//     const currentUserId = user?._id || user?.id;
//     const location = useLocation();
//     const navigate = useNavigate();

//     // Extract token and uid from URL
//     useEffect(() => {
//         const params = new URLSearchParams(location.search);
//         const token = params.get('token');
//         const uid = params.get('uid');

//         if (!token || !uid) {
//             setError("Invalid booking link. Missing required parameters.");
//             setLoading(false);
//             return;
//         }

//         // Check if logged-in user matches the uid
//         if (!currentUserId) {
//             setError("Please log in to access this page.");
//             setLoading(false);
//             setTimeout(() => navigate('/login'), 3000);
//             return;
//         }

//         if (currentUserId !== uid) {
//             setError("This booking link is not for your account. Please use the link sent to your email.");
//             setLoading(false);
//             return;
//         }

//         verifyAccess(token, uid);
//     }, [location, currentUserId, navigate]);

//     const verifyAccess = async (token, uid) => {
//         try {
//             const response = await verifyBookingAccess(token, uid);

//             if (response.success) {
//                 setAccessVerified(true);
//                 setExpiresAt(new Date(response.expiresAt));
//                 fetchEvents();
//                 loadPhilippineHolidays();
//             } else {
//                 setError(response.message || "Failed to verify booking access");
//             }
//         } catch (err) {
//             const errorMsg = err.response?.data?.message || err.message || "Failed to verify booking access";
            
//             if (err.expired) {
//                 setError("Your booking link has expired. Please request a new link from your case handler.");
//             } else if (err.alreadyBooked) {
//                 setError("You have already booked your consultation. You cannot book again.");
//             } else {
//                 setError(errorMsg);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (!accessVerified || !expiresAt) return;

//         const checkExpiry = setInterval(() => {
//             if (new Date() > expiresAt) {
//                 setError("Your booking access has expired.");
//                 setAccessVerified(false);
//             }
//         }, 60000); // Check every minute

//         return () => clearInterval(checkExpiry);
//     }, [accessVerified, expiresAt]);

//     const fetchEvents = async () => {
//         try {
//             const response = await getAllCalendarEvents();
//             if (response.success) {
//                 setEvents(response.data);
//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const loadPhilippineHolidays = () => {
//         const phHolidays = [
//             { date: "2026-01-01", title: "New Year's Day" },
//             { date: "2026-02-25", title: "EDSA Revolution Anniversary" },
//             { date: "2026-04-09", title: "Araw ng Kagitingan" },
//             { date: "2026-04-10", title: "Maundy Thursday" },
//             { date: "2026-04-11", title: "Good Friday" },
//             { date: "2026-05-01", title: "Labor Day" },
//             { date: "2026-06-12", title: "Independence Day" },
//             { date: "2026-08-31", title: "National Heroes Day" },
//             { date: "2026-11-01", title: "All Saints Day" },
//             { date: "2026-11-30", title: "Bonifacio Day" },
//             { date: "2026-12-25", title: "Christmas Day" },
//             { date: "2026-12-30", title: "Rizal Day" }
//         ];

//         setHolidays(phHolidays.map(h => ({
//             start: h.date,
//             title: h.title,
//             type: "holiday"
//         })));
//     };

//     const handleDateClick = (info) => {
//         if (!accessVerified) {
//             alert("You don't have access to book consultations.");
//             return;
//         }

//         const clickedDate = info.dateStr;
//         const dateObj = new Date(clickedDate);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         if (dateObj <= today) {
//             alert("You cannot book for today or past dates.");
//             return;
//         }

//         const day = dateObj.getDay();
//         if (day === 0 || day === 6) {
//             alert("Booking is not allowed on weekends.");
//             return;
//         }

//         const isOccupied = [...events, ...holidays].some(
//             (event) =>
//                 new Date(event.start).toDateString() === dateObj.toDateString()
//         );

//         if (isOccupied) {
//             alert("This date is unavailable. Please choose another date.");
//             return;
//         }

//         setSelectedDate(clickedDate);
//         setFormData({
//             ...formData,
//             start: clickedDate,
//             end: clickedDate
//         });
//         setShowModal(true);
//     };

//     const handleEventClick = (info) => {
//         const event = info.event;
//         const props = event.extendedProps;

//         alert(`
// Booking Details:
// Name: ${props.userName || "—"}
// Email: ${props.userEmail || "—"}
// Mode: ${props.mode || "—"}
// Status: ${props.status || "—"}
// `);
//     };

//     const handleSaveBooking = async () => {
//         if (!selectedDate) return alert("Select a date!");

//         const startDate = new Date(selectedDate).toISOString();
//         const endDate = new Date(selectedDate);
//         endDate.setHours(23, 59, 59);
        
//         // ✅ FIXED: Get user info properly
//         const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "Unknown User";
//         const userEmail = user?.email || "N/A";
        
//         const newEvent = {
//             title: "Consultation",
//             start: startDate,
//             end: endDate.toISOString(),
//             allDay: true,
//             type: "consultation",
//             userId: currentUserId,
//             // ✅ FIXED: Put user info at root level AND in extendedProps
//             userName: userName,
//             userEmail: userEmail,
//             mode: formData.mode,
//             status: "upcoming",
//             extendedProps: {
//                 userName: userName,
//                 userEmail: userEmail,
//                 mode: formData.mode,
//                 status: "upcoming"
//             }
//         };

//         console.log("📤 Booking data being sent:", newEvent);

//         try {
//             const response = await createCalendarEvent(newEvent);
//             if (response.success) {
//                 setEvents(prev => [...prev, response.data]);
//                 setShowModal(false);
//                 setAccessVerified(false); // Prevent further bookings
//                 alert("✅ Your consultation is booked successfully! You cannot book again.");
                
//                 // Redirect after 2 seconds
//                 setTimeout(() => {
//                     navigate('/');
//                 }, 2000);
//             } else {
//                 alert(response.message || "Booking failed. Please try again.");
//             }
//         } catch (err) {
//             console.error(err);
//             const errorMsg = err.response?.data?.message || err.message || "Booking failed. Please try again.";
//             alert(errorMsg);
//         }
//     };

//     const dayCellClassNames = (arg) => {
//         const date = arg.date;
//         const day = date.getDay();
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const isOccupied = [...events, ...holidays].some(
//             (event) => new Date(event.start).toDateString() === date.toDateString()
//         );

//         if (day === 0 || day === 6 || isOccupied || date <= today) {
//             return "bg-gray-200 pointer-events-none";
//         }
//         return "";
//     };

//     const getTimeRemaining = () => {
//         if (!expiresAt) return "";
//         const now = new Date();
//         const diff = expiresAt - now;
        
//         if (diff <= 0) return "Expired";
        
//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
//         return `${hours}h ${minutes}m remaining`;
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Verifying access...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//                 <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
//                     <div className="text-red-500 text-5xl mb-4">⚠️</div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
//                     <p className="text-gray-600 mb-6">{error}</p>
//                     <button
//                         onClick={() => navigate('/')}
//                         className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                         Go to Home
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     if (!accessVerified) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//                 <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
//                     <div className="text-gray-400 text-5xl mb-4">🔒</div>
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">No Access</h2>
//                     <p className="text-gray-600">You don't have permission to access this page.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="mb-6">
//                 <div className="flex justify-between items-center">
//                     <h1 className="text-2xl font-bold">Book Your Consultation</h1>
//                     {expiresAt && (
//                         <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
//                             <span className="text-yellow-800 font-semibold">
//                                 ⏰ {getTimeRemaining()}
//                             </span>
//                         </div>
//                     )}
//                 </div>
//                 <p className="text-gray-600 mt-2">
//                     Select an available date to book your consultation. You can only book ONE appointment.
//                 </p>
//             </div>

//             <FullCalendar
//                 plugins={[dayGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 headerToolbar={{
//                     left: "prev,next today",
//                     center: "title",
//                     right: "dayGridMonth,dayGridWeek,dayGridDay",
//                 }}
//                 events={[...events, ...holidays]}
//                 dateClick={handleDateClick}
//                 dayCellClassNames={dayCellClassNames}
//                 eventClick={handleEventClick}
//                 height="75vh"
//             />

//             {showModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
//                         <h2 className="text-xl font-semibold mb-4">Book Consultation</h2>

//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//                             <p className="text-sm text-blue-800">
//                                 📅 Selected Date: <strong>{selectedDate}</strong>
//                             </p>
//                         </div>

//                         <label className="block mb-2 text-gray-700">Mode</label>
//                         <select
//                             value={formData.mode}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, mode: e.target.value })
//                             }
//                             className="w-full px-3 py-2 mb-4 border rounded-lg"
//                         >
//                             <option value="online">Online</option>
//                             <option value="face_to_face">Face-to-Face</option>
//                         </select>

//                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
//                             <p className="text-xs text-yellow-800">
//                                 ⚠️ You can only book ONE consultation. This action cannot be undone.
//                             </p>
//                         </div>

//                         <div className="flex justify-end gap-3">
//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="px-4 py-2 border rounded-lg hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleSaveBooking}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                             >
//                                 Confirm Booking
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createCalendarEvent, getAllCalendarEvents, verifyBookingAccess } from "../../api/calendar";

export default function InterviewBooking() {
    const [events, setEvents] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({
        title: "Consultation",
        type: "consultation",
        mode: "online",
        start: "",
        end: ""
    });
    const [accessVerified, setAccessVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [ticketNumber, setTicketNumber] = useState(null); // ✅ NEW: Track report ticket

    const { user } = useSelector((state) => state.auth);
    const currentUserId = user?._id || user?.id;
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ UPDATED: Extract token, uid, and ticket from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const uid = params.get('uid');
        const ticket = params.get('ticket'); // ✅ NEW: Get ticket number

        if (!token || !uid || !ticket) {
            setError("Invalid booking link. Missing required parameters.");
            setLoading(false);
            return;
        }

        if (!currentUserId) {
            setError("Please log in to access this page.");
            setLoading(false);
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (currentUserId !== uid) {
            setError("This booking link is not for your account. Please use the link sent to your email.");
            setLoading(false);
            return;
        }

        setTicketNumber(ticket); // ✅ Store ticket number
        verifyAccess(token, uid, ticket);
    }, [location, currentUserId, navigate]);

    // ✅ UPDATED: Verify access with ticket number
    const verifyAccess = async (token, uid, ticket) => {
        try {
            const response = await verifyBookingAccess(token, uid, ticket);

            if (response.success) {
                setAccessVerified(true);
                setExpiresAt(new Date(response.expiresAt));
                setTicketNumber(response.ticketNumber); // ✅ Confirm ticket number
                fetchEvents();
                loadPhilippineHolidays();
            } else {
                setError(response.message || "Failed to verify booking access");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Failed to verify booking access";
            
            if (err.expired) {
                setError("Your booking link has expired. Please request a new link from your case handler.");
            } else if (err.alreadyBooked) {
                setError("You have already booked your consultation for this report. You can only rebook if your previous booking was cancelled or completed.");
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!accessVerified || !expiresAt) return;

        const checkExpiry = setInterval(() => {
            if (new Date() > expiresAt) {
                setError("Your booking access has expired.");
                setAccessVerified(false);
            }
        }, 60000);

        return () => clearInterval(checkExpiry);
    }, [accessVerified, expiresAt]);

    const fetchEvents = async () => {
        try {
            const response = await getAllCalendarEvents();
            if (response.success) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadPhilippineHolidays = () => {
        const phHolidays = [
            { date: "2026-01-01", title: "New Year's Day" },
            { date: "2026-02-25", title: "EDSA Revolution Anniversary" },
            { date: "2026-04-09", title: "Araw ng Kagitingan" },
            { date: "2026-04-10", title: "Maundy Thursday" },
            { date: "2026-04-11", title: "Good Friday" },
            { date: "2026-05-01", title: "Labor Day" },
            { date: "2026-06-12", title: "Independence Day" },
            { date: "2026-08-31", title: "National Heroes Day" },
            { date: "2026-11-01", title: "All Saints Day" },
            { date: "2026-11-30", title: "Bonifacio Day" },
            { date: "2026-12-25", title: "Christmas Day" },
            { date: "2026-12-30", title: "Rizal Day" }
        ];

        setHolidays(phHolidays.map(h => ({
            start: h.date,
            title: h.title,
            type: "holiday"
        })));
    };

    const handleDateClick = (info) => {
        if (!accessVerified) {
            alert("You don't have access to book consultations.");
            return;
        }

        const clickedDate = info.dateStr;
        const dateObj = new Date(clickedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateObj <= today) {
            alert("You cannot book for today or past dates.");
            return;
        }

        const day = dateObj.getDay();
        if (day === 0 || day === 6) {
            alert("Booking is not allowed on weekends.");
            return;
        }

        const isOccupied = [...events, ...holidays].some(
            (event) =>
                new Date(event.start).toDateString() === dateObj.toDateString()
        );

        if (isOccupied) {
            alert("This date is unavailable. Please choose another date.");
            return;
        }

        setSelectedDate(clickedDate);
        setFormData({
            ...formData,
            start: clickedDate,
            end: clickedDate
        });
        setShowModal(true);
    };

    const handleEventClick = (info) => {
        const event = info.event;
        const props = event.extendedProps;

        alert(`
Booking Details:
Name: ${props.userName || "—"}
Email: ${props.userEmail || "—"}
Mode: ${props.mode || "—"}
Status: ${props.status || "—"}
Ticket: ${props.reportTicketNumber || "—"}
`);
    };

    // ✅ UPDATED: Include report ticket number when creating booking
    const handleSaveBooking = async () => {
        if (!selectedDate) return alert("Select a date!");
        if (!ticketNumber) return alert("Missing report ticket number!");

        const startDate = new Date(selectedDate).toISOString();
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59);
        
        const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "Unknown User";
        const userEmail = user?.email || "N/A";
        
        const newEvent = {
            title: "Consultation",
            start: startDate,
            end: endDate.toISOString(),
            allDay: true,
            type: "consultation",
            userId: currentUserId,
            reportTicketNumber: ticketNumber, // ✅ NEW: Include ticket number
            userName: userName,
            userEmail: userEmail,
            mode: formData.mode,
            status: "upcoming",
            extendedProps: {
                userName: userName,
                userEmail: userEmail,
                mode: formData.mode,
                status: "upcoming",
                reportTicketNumber: ticketNumber // ✅ NEW: Include in extendedProps
            }
        };

        console.log("📤 Booking data being sent:", newEvent);

        try {
            const response = await createCalendarEvent(newEvent);
            if (response.success) {
                setEvents(prev => [...prev, response.data]);
                setShowModal(false);
                setAccessVerified(false);
                alert("✅ Your consultation is booked successfully! You cannot book again for this report unless cancelled or completed.");
                
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                alert(response.message || "Booking failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.message || "Booking failed. Please try again.";
            alert(errorMsg);
        }
    };

    const dayCellClassNames = (arg) => {
        const date = arg.date;
        const day = date.getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOccupied = [...events, ...holidays].some(
            (event) => new Date(event.start).toDateString() === date.toDateString()
        );

        if (day === 0 || day === 6 || isOccupied || date <= today) {
            return "bg-gray-200 pointer-events-none";
        }
        return "";
    };

    const getTimeRemaining = () => {
        if (!expiresAt) return "";
        const now = new Date();
        const diff = expiresAt - now;
        
        if (diff <= 0) return "Expired";
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m remaining`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!accessVerified) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
                    <div className="text-gray-400 text-5xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Access</h2>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Book Your Consultation</h1>
                        {ticketNumber && (
                            <p className="text-sm text-gray-600 mt-1">
                                Report: <span className="font-semibold">{ticketNumber}</span>
                            </p>
                        )}
                    </div>
                    {expiresAt && (
                        <div className="bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-lg">
                            <span className="text-yellow-800 font-semibold">
                                ⏰ {getTimeRemaining()}
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-gray-600 mt-2">
                    Select an available date to book your consultation. You can only book ONE appointment per report.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-blue-800">
                        ℹ️ You can rebook if your previous booking for this report was <strong>cancelled or completed</strong>.
                    </p>
                </div>
            </div>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,dayGridWeek,dayGridDay",
                }}
                events={[...events, ...holidays]}
                dateClick={handleDateClick}
                dayCellClassNames={dayCellClassNames}
                eventClick={handleEventClick}
                height="75vh"
            />

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">Book Consultation</h2>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800">
                                📅 Selected Date: <strong>{selectedDate}</strong>
                            </p>
                            <p className="text-sm text-blue-800 mt-1">
                                🎫 Report: <strong>{ticketNumber}</strong>
                            </p>
                        </div>

                        <label className="block mb-2 text-gray-700">Mode</label>
                        <select
                            value={formData.mode}
                            onChange={(e) =>
                                setFormData({ ...formData, mode: e.target.value })
                            }
                            className="w-full px-3 py-2 mb-4 border rounded-lg"
                        >
                            <option value="online">Online</option>
                            <option value="face_to_face">Face-to-Face</option>
                        </select>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-yellow-800">
                                ⚠️ You can only book ONE consultation per report. You can rebook if this booking is cancelled or completed.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveBooking}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}