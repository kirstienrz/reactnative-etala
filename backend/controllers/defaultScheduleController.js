const DefaultSchedule = require("../models/DefaultSchedule");
const AdminAvailability = require("../models/AdminAvailability");
const User = require("../models/User");

/**
 * Create or update a default schedule for a specific month
 * @route POST /api/default-schedule
 * @access Admin, Superadmin
 */
exports.createDefaultSchedule = async (req, res) => {
  try {
    const { month, year, recurringPatterns, exceptions } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!month || !year || !recurringPatterns || !Array.isArray(recurringPatterns)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input. month, year, and recurringPatterns array are required."
      });
    }

    // Check if schedule already exists for this month/year
    const existingSchedule = await DefaultSchedule.findOne({
      adminId,
      month,
      year
    });

    let schedule;

    if (existingSchedule) {
      // Update existing schedule
      schedule = await DefaultSchedule.findByIdAndUpdate(
        existingSchedule._id,
        {
          recurringPatterns,
          exceptions: exceptions || [],
          generatedSlots: false, // Reset flag so slots can be regenerated
        },
        { new: true }
      );
    } else {
      // Create new schedule
      schedule = new DefaultSchedule({
        adminId,
        month,
        year,
        recurringPatterns,
        exceptions: exceptions || [],
        isActive: true,
        generatedSlots: false,
      });
      await schedule.save();
    }

    res.json({
      success: true,
      data: schedule,
      message: existingSchedule ? "Default schedule updated" : "Default schedule created"
    });
  } catch (error) {
    console.error("Error creating default schedule:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get default schedule for a specific month
 * @route GET /api/default-schedule/:month/:year
 * @access Admin, Superadmin
 */
exports.getDefaultSchedule = async (req, res) => {
  try {
    const { month, year } = req.params;
    const adminId = req.user.id;

    const schedule = await DefaultSchedule.findOne({
      adminId,
      month: parseInt(month),
      year: parseInt(year)
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error("Error fetching default schedule:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get all default schedules for the current admin
 * @route GET /api/default-schedule
 * @access Admin, Superadmin
 */
exports.getAllDefaultSchedules = async (req, res) => {
  try {
    const adminId = req.user.id;

    const schedules = await DefaultSchedule.find({ adminId })
      .sort({ year: -1, month: -1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error("Error fetching default schedules:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete a default schedule
 * @route DELETE /api/default-schedule/:id
 * @access Admin, Superadmin
 */
exports.deleteDefaultSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await DefaultSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Default schedule not found"
      });
    }

    res.json({
      success: true,
      message: "Default schedule deleted"
    });
  } catch (error) {
    console.error("Error deleting default schedule:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add an exception to a default schedule
 * @route POST /api/default-schedule/:id/exception
 * @access Admin, Superadmin
 */
exports.addException = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason, type, customSlots } = req.body;

    const schedule = await DefaultSchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Default schedule not found"
      });
    }

    // Check if exception already exists for this date
    const existingExceptionIndex = schedule.exceptions.findIndex(
      exc => exc.date === date
    );

    if (existingExceptionIndex >= 0) {
      // Update existing exception
      schedule.exceptions[existingExceptionIndex] = {
        date,
        reason,
        type: type || 'unavailable',
        customSlots: customSlots || []
      };
    } else {
      // Add new exception
      schedule.exceptions.push({
        date,
        reason,
        type: type || 'unavailable',
        customSlots: customSlots || []
      });
    }

    schedule.generatedSlots = false; // Reset flag so slots can be regenerated
    await schedule.save();

    res.json({
      success: true,
      data: schedule,
      message: "Exception added successfully"
    });
  } catch (error) {
    console.error("Error adding exception:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Generate AdminAvailability slots from default schedule
 * @route POST /api/default-schedule/:id/generate-slots
 * @access Admin, Superadmin
 */
exports.generateSlotsFromSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await DefaultSchedule.findById(id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Default schedule not found"
      });
    }

    // Get or create AdminAvailability for this admin
    let adminAvailability = await AdminAvailability.findOne({
      adminId: schedule.adminId
    });

    if (!adminAvailability) {
      adminAvailability = new AdminAvailability({
        adminId: schedule.adminId,
        slotDuration: 60,
        slotConfig: {
          workStart: '08:00',
          workEnd: '17:00',
          lunchStart: '12:00',
          lunchEnd: '13:00',
          slotDuration: 60
        },
        availabilities: []
      });
    }

    // Get all dates in the month
    const datesInMonth = getDatesInMonth(schedule.month, schedule.year);

    // Generate slots for each date
    for (const date of datesInMonth) {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Check if this date has an exception
      const exception = schedule.exceptions.find(exc => exc.date === date);

      if (exception && exception.type === 'unavailable') {
        // Skip this date (mark as unavailable)
        continue;
      }

      // Find recurring pattern for this day of week
      const pattern = schedule.recurringPatterns.find(
        p => p.dayOfWeek === dayOfWeek
      );

      if (!pattern) {
        // No pattern for this day, skip
        continue;
      }

      // Generate time slots for this date
      const slots = generateTimeSlots(
        pattern.startTime,
        pattern.endTime,
        pattern.slotDuration || 60
      );

      // If exception has custom slots, use those instead
      if (exception && exception.type === 'custom_slots' && exception.customSlots.length > 0) {
        slots.length = 0; // Clear default slots
        exception.customSlots.forEach(customSlot => {
          slots.push({
            start: customSlot.start,
            end: customSlot.end,
            booked: false,
            available: true,
            custom: true
          });
        });
      }

      // Check if this date already exists in availabilities
      const existingDateIndex = adminAvailability.availabilities.findIndex(
        avail => avail.date === date
      );

      if (existingDateIndex >= 0) {
        // Update existing date (preserve booked status)
        const existingSlots = adminAvailability.availabilities[existingDateIndex].slots;
        
        // Merge slots, preserving booked status
        const mergedSlots = slots.map(slot => {
          const existingSlot = existingSlots.find(
            es => es.start === slot.start && es.end === slot.end
          );
          return existingSlot ? { ...slot, booked: existingSlot.booked } : slot;
        });

        adminAvailability.availabilities[existingDateIndex].slots = mergedSlots;
        adminAvailability.availabilities[existingDateIndex].customSlots = true;
      } else {
        // Add new date
        adminAvailability.availabilities.push({
          date: date,
          slots: slots,
          customSlots: true
        });
      }
    }

    await adminAvailability.save();

    // Mark schedule as generated
    schedule.generatedSlots = true;
    await schedule.save();

    res.json({
      success: true,
      data: adminAvailability,
      message: "Slots generated successfully from default schedule"
    });
  } catch (error) {
    console.error("Error generating slots:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Helper function to get all dates in a month
 */
function getDatesInMonth(month, year) {
  const dates = [];
  const lastDay = new Date(year, month, 0).getDate();

  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    dates.push(dateStr);
  }

  return dates;
}

/**
 * Helper function to generate time slots
 */
function generateTimeSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const slotStartHour = Math.floor(currentMinutes / 60);
    const slotStartMinute = currentMinutes % 60;
    const slotEndHour = Math.floor((currentMinutes + durationMinutes) / 60);
    const slotEndMinute = (currentMinutes + durationMinutes) % 60;

    slots.push({
      start: `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`,
      end: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`,
      booked: false,
      available: true,
      custom: false
    });

    currentMinutes += durationMinutes;
  }

  return slots;
}
