
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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

    const { user } = useSelector((state) => state.auth); // depende sa structure mo 
    const currentUserId = user?._id || user?.id;

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

    const handleEventClick = (info) => {
        const event = info.event;
        const props = event.extendedProps;

        alert(`
Booking Details:
Name: ${props.userName || "—"}
Email: ${props.userEmail || "—"}
Mode: ${props.mode || "—"}
Status: ${props.status || "—"}
`);
    };


    // const handleSaveBooking = async () => {
    //     try {
    //         if (!selectedDate) {
    //             alert("Please select a valid date.");
    //             return;
    //         }

    //         const startDate = new Date(selectedDate).toISOString();
    //         const endDateObj = new Date(selectedDate);
    //         endDateObj.setHours(23, 59, 59);
    //         const endDate = endDateObj.toISOString();

    //         // const newEvent = {
    //         //     title: "Consultation",
    //         //     start: startDate,
    //         //     end: endDate,
    //         //     allDay: true,
    //         //     type: "consultation",
    //         //     userId: currentUserId, // must not be undefined
    //         //     extendedProps: {
    //         //         userName: user?.name || "Unknown",
    //         //         userEmail: user?.email || "N/A",
    //         //         mode: formData.mode,
    //         //         status: "upcoming"
    //         //     }
    //         // };

    //         const newEvent = {
    //             title: `${user?.name || "Unknown"} (Booked)`, // dito lalabas sa calendar mismo
    //             start: startDate,
    //             end: endDate,
    //             allDay: true,
    //             type: "consultation",
    //             userId: currentUserId,
    //             extendedProps: {
    //                 userName: user?.name || "Unknown",
    //                 userEmail: user?.email || "N/A",
    //                 mode: formData.mode,
    //                 status: "upcoming"
    //             }
    //         };

    //         await createCalendarEvent(newEvent);
    //         setEvents(prev => [...prev, newEvent]);

    //         setShowModal(false);
    //         setSelectedDate(null);
    //         setFormData({ title: "Consultation", type: "consultation", mode: "online" });
    //         alert("Your consultation is booked!");
    //     } catch (error) {
    //         console.error("Booking error:", error);
    //         alert("There was an error booking your consultation.");
    //     }
    // };

    const handleSaveBooking = async () => {
    if (!selectedDate) return alert("Select a date!");

    const startDate = new Date(selectedDate).toISOString();
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59);

    const newEvent = {
        title: "Consultation",
        start: startDate,
        end: endDate.toISOString(),
        allDay: true,
        type: "consultation",
        userId: currentUserId,
        extendedProps: {
            userName: user?.name || "Unknown",
            userEmail: user?.email || "N/A",
            mode: formData.mode,
            status: "upcoming"
        }
    };

    try {
        const response = await createCalendarEvent(newEvent); // save sa DB
        if (response.success) {
            // show simplified details sa calendar
            setEvents(prev => [...prev, response.data]); // mas maayos kung galing sa backend
            setShowModal(false);
            alert("Your consultation is booked!");
        }
    } catch (err) {
        console.error(err);
        alert("Booking failed. Please try again.");
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
                eventClick={handleEventClick} // ⬅️ dito
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
