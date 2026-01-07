// import React, { useState, useEffect } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { createCalendarEvent, getAllCalendarEvents } from "../../api/calendar";

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

//     useEffect(() => {
//         // Optional: mark that the user is currently on the page
//         console.log("User accessed interview page ✅");

//         return () => {
//             // Remove access when leaving the page
//             localStorage.removeItem("canAccessInterview");
//             console.log("Interview access removed ❌");
//         };
//     }, []);

//     useEffect(() => {
//         fetchEvents();
//         loadPhilippineHolidays();
//     }, []);

//     // Fetch existing events
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

//     // Philippine Holidays for 2026
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

//     // Handle date click
//     const handleDateClick = (info) => {
//         const clickedDate = info.dateStr;
//         const dateObj = new Date(clickedDate);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // Normalize time

//         // Disable past dates & today
//         if (dateObj <= today) {
//             alert("You cannot book for today or past dates.");
//             return;
//         }

//         // Disable weekends
//         const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
//         if (day === 0 || day === 6) {
//             alert("Booking is not allowed on weekends.");
//             return;
//         }

//         // Disable dates with existing events or holidays
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

//     // Save booking
//     const handleSaveBooking = async () => {
//         try {
//             await createCalendarEvent(formData);
//             setShowModal(false);
//             setFormData({ title: "Consultation", type: "consultation", mode: "online" });
//             fetchEvents();
//             alert("Your consultation is booked!");
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // Grey out weekends, holidays, existing events, past & today
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

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <h1 className="text-2xl font-bold mb-4">Book Your Consultation</h1>

//             <FullCalendar
//                 plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 headerToolbar={{
//                     left: "prev,next today",
//                     center: "title",
//                     right: "dayGridMonth,timeGridWeek,timeGridDay",
//                 }}
//                 events={[...events, ...holidays]}
//                 dateClick={handleDateClick}
//                 dayCellClassNames={dayCellClassNames}
//                 height="75vh"
//                 nowIndicator={true}
//             />

//             {/* Modal */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
//                         <h2 className="text-xl font-semibold mb-4">Book Consultation</h2>

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

//                         <label className="block mb-2 text-gray-700">Start Time</label>
//                         <input
//                             type="time"
//                             value={formData.startTime || ""}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, start: `${selectedDate}T${e.target.value}` })
//                             }
//                             className="w-full px-3 py-2 mb-4 border rounded-lg"
//                         />

//                         <label className="block mb-2 text-gray-700">End Time</label>
//                         <input
//                             type="time"
//                             value={formData.endTime || ""}
//                             onChange={(e) =>
//                                 setFormData({ ...formData, end: `${selectedDate}T${e.target.value}` })
//                             }
//                             className="w-full px-3 py-2 mb-4 border rounded-lg"
//                         />

//                         <div className="flex justify-end gap-3">
//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="px-4 py-2 border rounded-lg"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleSaveBooking}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//                             >
//                                 Book
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { createCalendarEvent, getAllCalendarEvents } from "../../api/calendar";

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

    useEffect(() => {
        // mark that the user is currently on the page
        console.log("User accessed interview page ✅");

        return () => {
            // Remove access when leaving the page
            localStorage.removeItem("canAccessInterview");
            console.log("Interview access removed ❌");
        };
    }, []);

    useEffect(() => {
        fetchEvents();
        loadPhilippineHolidays();
    }, []);

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

    const handleSaveBooking = async () => {
        try {
            if (!selectedDate) {
                alert("Please select a valid date.");
                return;
            }

            const startDate = new Date(selectedDate);
            const endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59); // Ensure end > start

            const newEvent = {
                title: "Consultation",
                type: "consultation",
                start: startDate,
                end: endDate,
                allDay: true,
                mode: formData.mode
            };

            await createCalendarEvent(newEvent);

            setEvents(prev => [...prev, newEvent]);
            setShowModal(false);
            setFormData({ title: "Consultation", type: "consultation", mode: "online" });
            setSelectedDate(null);

            alert("Your consultation is booked!");
        } catch (error) {
            console.error("Booking error:", error);
            alert("There was an error booking your consultation.");
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-4">Book Your Consultation</h1>

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
                height="75vh"
            />

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">Book Consultation</h2>

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

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveBooking}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Book
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
