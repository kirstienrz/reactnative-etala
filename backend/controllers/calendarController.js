const CalendarEvent = require('../models/CalendarEvent');
const Program = require('../models/Program');

// @desc    Get all calendar events (holidays, consultations, program events)
// @route   GET /api/calendar/events
// @access  Public
const getAllCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.start = {};
      if (startDate) query.start.$gte = new Date(startDate);
      if (endDate) query.start.$lte = new Date(endDate);
    }
    
    const calendarEvents = await CalendarEvent.find(query);
    
    // Get program events
    const programs = await Program.find({ archived: false });
    const programEvents = [];
    
    programs.forEach(program => {
      program.projects.forEach(project => {
        project.events.forEach(event => {
          if (!event.archived) {
            programEvents.push({
              id: event._id,
              title: `${event.title} - ${project.name}`,
              start: event.date,
              end: event.date,
              color: getEventColor('program_event'),
              extendedProps: {
                type: 'program_event',
                programName: program.name,
                projectName: project.name,
                venue: event.venue,
                participants: event.participants,
                status: event.status
              }
            });
          }
        });
      });
    });
    
    // Format calendar events
    const formattedCalendarEvents = calendarEvents.map(event => ({
      id: event._id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      color: getEventColor(event.type),
      extendedProps: {
        type: event.type,
        description: event.description,
        location: event.location,
        notes: event.notes
      }
    }));
    
    const allEvents = [...formattedCalendarEvents, ...programEvents];
    
    res.status(200).json({
      success: true,
      count: allEvents.length,
      data: allEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create calendar event (holiday, consultation, not available)
// @route   POST /api/calendar/events
// @access  Private
const createCalendarEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.create(req.body);
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update calendar event
// @route   PUT /api/calendar/events/:id
// @access  Private
const updateCalendarEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/events/:id
// @access  Private
const deleteCalendarEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Helper function
function getEventColor(type) {
  const colors = {
    holiday: '#ef4444',           // red
    not_available: '#6b7280',     // gray
    consultation: '#8b5cf6',      // purple
    program_event: '#3b82f6',     // blue
    upcoming: '#3b82f6',          // blue
    ongoing: '#f59e0b',           // orange
    completed: '#10b981',         // green
    cancelled: '#ef4444'          // red
  };
  return colors[type] || '#6b7280';
}

// ⬇️ IMPORTANTE: EXPORT GAMIT ANG `const` NA GINAWA NATIN
module.exports = {
  getAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
};