const AdminAvailability = require('../models/AdminAvailability');

// Helper: resolve 'me' to the authenticated user's ID
const resolveAdminId = (req) => {
  const { adminId } = req.params;
  if (adminId === 'me') {
    return req.user?.id || req.user?._id;
  }
  return adminId;
};

// Get availability for an admin (optionally for a specific date or month)
exports.getAvailability = async (req, res) => {
  try {
    const adminId = resolveAdminId(req);
    const { date } = req.query; // can be 'YYYY-MM-DD' or 'YYYY-MM' (month)
    const availability = await AdminAvailability.findOne({ adminId });
    if (!availability) return res.json({ availabilities: [], slotDuration: 60, slotConfig: null });

    let filtered = availability.availabilities;
    if (date) {
      if (date.length === 7) {
        // month query: 'YYYY-MM'
        filtered = availability.availabilities.filter(a => a.date && a.date.startsWith(date));
      } else {
        filtered = availability.availabilities.filter(a => a.date === date);
      }
    }
    res.json({
      availabilities: filtered,
      slotDuration: availability.slotDuration || 60,
      slotConfig: availability.slotConfig || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Set or update availability for a specific date (with optional slotDuration)
exports.setAvailability = async (req, res) => {
  try {
    const adminId = resolveAdminId(req);
    const { date, slots, slotDuration, slotConfig } = req.body;
    let availability = await AdminAvailability.findOne({ adminId });
    if (!availability) {
      availability = new AdminAvailability({
        adminId,
        slotDuration: slotDuration || 60,
        slotConfig: slotConfig || undefined,
        availabilities: [{ date, slots, customSlots: slots.some(s => s.custom) }]
      });
    } else {
      if (slotDuration) availability.slotDuration = slotDuration;
      if (slotConfig) availability.slotConfig = slotConfig;
      const dayIdx = availability.availabilities.findIndex(a => a.date === date);
      if (dayIdx > -1) {
        availability.availabilities[dayIdx].slots = slots;
        availability.availabilities[dayIdx].customSlots = slots.some(s => s.custom);
      } else {
        availability.availabilities.push({ date, slots, customSlots: slots.some(s => s.custom) });
      }
    }
    await availability.save();
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk set availability for multiple dates at once
exports.setBulkAvailability = async (req, res) => {
  try {
    const adminId = resolveAdminId(req);
    const { days, slotDuration, slotConfig } = req.body; // days: [{date, slots, customSlots?}]
    let availability = await AdminAvailability.findOne({ adminId });
    if (!availability) {
      availability = new AdminAvailability({
        adminId,
        slotDuration: slotDuration || 60,
        slotConfig: slotConfig || undefined,
        availabilities: days.map(d => ({
          ...d,
          customSlots: d.customSlots || d.slots.some(s => s.custom)
        }))
      });
    } else {
      if (slotDuration) availability.slotDuration = slotDuration;
      if (slotConfig) availability.slotConfig = slotConfig;
      for (const day of days) {
        const dayIdx = availability.availabilities.findIndex(a => a.date === day.date);
        const customSlots = day.customSlots || day.slots.some(s => s.custom);
        if (dayIdx > -1) {
          availability.availabilities[dayIdx].slots = day.slots;
          availability.availabilities[dayIdx].customSlots = customSlots;
        } else {
          availability.availabilities.push({ ...day, customSlots });
        }
      }
    }
    await availability.save();
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save only the slot config (persisted settings)
exports.saveSlotConfig = async (req, res) => {
  try {
    const adminId = resolveAdminId(req);
    const { slotConfig } = req.body;
    let availability = await AdminAvailability.findOne({ adminId });
    if (!availability) {
      availability = new AdminAvailability({
        adminId,
        slotConfig,
        slotDuration: slotConfig.slotDuration || 60,
        availabilities: []
      });
    } else {
      availability.slotConfig = slotConfig;
      if (slotConfig.slotDuration) availability.slotDuration = slotConfig.slotDuration;
    }
    await availability.save();
    res.json({ slotConfig: availability.slotConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete availability for a specific date
exports.deleteAvailability = async (req, res) => {
  try {
    const adminId = resolveAdminId(req);
    const { date } = req.params;
    const availability = await AdminAvailability.findOne({ adminId });
    if (!availability) return res.status(404).json({ error: 'Not found' });
    availability.availabilities = availability.availabilities.filter(a => a.date !== date);
    await availability.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Public: Get available slots for booking (finds any superadmin's availability)
exports.getPublicAvailability = async (req, res) => {
  try {
    const { date } = req.query; // 'YYYY-MM-DD' or 'YYYY-MM'
    // Find any admin availability record (there should be one superadmin managing slots)
    const availability = await AdminAvailability.findOne().sort({ updatedAt: -1 });
    if (!availability) return res.json({ availabilities: [], slotDuration: 60, slotConfig: null });

    let filtered = availability.availabilities;
    if (date) {
      if (date.length === 7) {
        filtered = availability.availabilities.filter(a => a.date && a.date.startsWith(date));
      } else {
        filtered = availability.availabilities.filter(a => a.date === date);
      }
    }
    // Only return available (non-booked) slots to the user
    const sanitized = filtered.map(day => ({
      date: day.date,
      slots: day.slots
        .filter(s => s.available && !s.booked)
        .map(s => ({ start: s.start, end: s.end }))
    }));

    res.json({
      availabilities: sanitized,
      slotDuration: availability.slotDuration || 60,
      slotConfig: availability.slotConfig ? {
        workStart: availability.slotConfig.workStart,
        workEnd: availability.slotConfig.workEnd,
        lunchStart: availability.slotConfig.lunchStart,
        lunchEnd: availability.slotConfig.lunchEnd,
      } : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
