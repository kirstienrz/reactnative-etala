const CalendarEvent = require('../models/CalendarEvent');

const PH_HOLIDAYS = [
  // === 2026 HOLIDAYS ===
  { title: "New Year's Day", date: "2026-01-01", description: "Regular Holiday" },
  { title: "EDSA People Power Revolution Anniversary", date: "2026-02-25", description: "Special Non-Working Holiday" },
  { title: "Maundy Thursday", date: "2026-04-02", description: "Regular Holiday" },
  { title: "Good Friday", date: "2026-04-03", description: "Regular Holiday" },
  { title: "Black Saturday", date: "2026-04-04", description: "Special Non-Working Holiday" },
  { title: "Araw ng Kagitingan", date: "2026-04-09", description: "Regular Holiday" },
  { title: "Labor Day", date: "2026-05-01", description: "Regular Holiday" },
  { title: "Independence Day", date: "2026-06-12", description: "Regular Holiday" },
  { title: "Ninoy Aquino Day", date: "2026-08-21", description: "Special Non-Working Holiday" },
  { title: "National Heroes Day", date: "2026-08-31", description: "Regular Holiday" },
  { title: "All Saints' Day", date: "2026-11-01", description: "Special Non-Working Holiday" },
  { title: "All Souls' Day", date: "2026-11-02", description: "Special Non-Working Holiday" },
  { title: "Bonifacio Day", date: "2026-11-30", description: "Regular Holiday" },
  { title: "Feast of the Immaculate Conception of Mary", date: "2026-12-08", description: "Special Non-Working Holiday" },
  { title: "Christmas Eve", date: "2026-12-24", description: "Special Non-Working Holiday" },
  { title: "Christmas Day", date: "2026-12-25", description: "Regular Holiday" },
  { title: "Rizal Day", date: "2026-12-30", description: "Regular Holiday" },
  { title: "Last Day of the Year", date: "2026-12-31", description: "Special Non-Working Holiday" },

  // === 2027 HOLIDAYS ===
  { title: "New Year's Day", date: "2027-01-01", description: "Regular Holiday" },
  { title: "EDSA People Power Revolution Anniversary", date: "2027-02-25", description: "Special Non-Working Holiday" },
  { title: "Maundy Thursday", date: "2027-03-25", description: "Regular Holiday" },
  { title: "Good Friday", date: "2027-03-26", description: "Regular Holiday" },
  { title: "Black Saturday", date: "2027-03-27", description: "Special Non-Working Holiday" },
  { title: "Araw ng Kagitingan", date: "2027-04-09", description: "Regular Holiday" },
  { title: "Labor Day", date: "2027-05-01", description: "Regular Holiday" },
  { title: "Independence Day", date: "2027-06-12", description: "Regular Holiday" },
  { title: "Ninoy Aquino Day", date: "2027-08-21", description: "Special Non-Working Holiday" },
  { title: "National Heroes Day", date: "2027-08-30", description: "Regular Holiday" },
  { title: "All Saints' Day", date: "2027-11-01", description: "Special Non-Working Holiday" },
  { title: "All Souls' Day", date: "2027-11-02", description: "Special Non-Working Holiday" },
  { title: "Bonifacio Day", date: "2027-11-30", description: "Regular Holiday" },
  { title: "Feast of the Immaculate Conception of Mary", date: "2027-12-08", description: "Special Non-Working Holiday" },
  { title: "Christmas Eve", date: "2027-12-24", description: "Special Non-Working Holiday" },
  { title: "Christmas Day", date: "2027-12-25", description: "Regular Holiday" },
  { title: "Rizal Day", date: "2027-12-30", description: "Regular Holiday" },
  { title: "Last Day of the Year", date: "2027-12-31", description: "Special Non-Working Holiday" }
];

const seedPHHolidays = async () => {
  try {
    let count = 0;
    for (const hol of PH_HOLIDAYS) {
      const holidayDate = new Date(hol.date);
      holidayDate.setHours(0, 0, 0, 0);

      // Check if this specific holiday already exists in the calendar events
      const exists = await CalendarEvent.findOne({
        type: 'holiday',
        title: hol.title,
        start: holidayDate
      });

      if (!exists) {
        await CalendarEvent.create({
          title: hol.title,
          type: 'holiday',
          start: holidayDate,
          end: holidayDate,
          allDay: true,
          color: '#ef4444',
          description: hol.description
        });
        count++;
      }
    }

    if (count > 0) {
      console.log(`🎉 Seeded ${count} new Philippine Non-Working Holidays successfully!`);
    }
  } catch (error) {
    console.error("❌ Error seeding holidays:", error);
  }
};

module.exports = { seedPHHolidays };
