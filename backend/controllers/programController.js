const mongoose = require('mongoose');
const Program = require('../models/Program');

// @desc    Get all active programs (non-archived)
// @route   GET /api/programs
// @access  Public
const getPrograms = async (req, res) => {
  try {
    const { year, status } = req.query;
    let filter = { archived: false }; // Default to non-archived

    if (year) filter.year = year;
    if (status) filter.status = status;

    const programs = await Program.find(filter).sort({ year: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: programs,
      count: programs.length
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get archived programs
// @route   GET /api/programs/archived
// @access  Public
const getArchivedPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ archived: true }).sort({ year: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: programs,
      count: programs.length
    });
  } catch (error) {
    console.error('Error fetching archived programs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Get program statistics
// @route   GET /api/programs/stats
// @access  Public
const getProgramStats = async (req, res) => {
  try {
    const totalPrograms = await Program.countDocuments();
    const activePrograms = await Program.countDocuments({ archived: false });
    const archivedPrograms = await Program.countDocuments({ archived: true });
    const completedPrograms = await Program.countDocuments({ status: 'completed' });
    
    // Get all programs to calculate project stats
    const programs = await Program.find();
    const allProjects = programs.flatMap(prog => prog.projects);
    const activeProjects = allProjects.filter(proj => !proj.archived).length;
    const archivedProjects = allProjects.filter(proj => proj.archived).length;
    const completedProjects = allProjects.filter(proj => proj.status === 'completed').length;
    
    const allEvents = programs.flatMap(prog => 
      prog.projects.flatMap(proj => proj.events)
    );
    const upcomingEvents = allEvents.filter(evt => evt.status === 'upcoming').length;
    const ongoingEvents = allEvents.filter(evt => evt.status === 'ongoing').length;
    const completedEvents = allEvents.filter(evt => evt.status === 'completed').length;
    const archivedEvents = allEvents.filter(evt => evt.archived).length;

    const stats = {
      programs: {
        total: totalPrograms,
        active: activePrograms,
        archived: archivedPrograms,
        completed: completedPrograms
      },
      projects: {
        total: allProjects.length,
        active: activeProjects,
        archived: archivedProjects,
        completed: completedProjects
      },
      events: {
        total: allEvents.length,
        upcoming: upcomingEvents,
        ongoing: ongoingEvents,
        completed: completedEvents,
        archived: archivedEvents
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching program stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Public
const createProgram = async (req, res) => {
  try {
    const { name, description, year, status } = req.body;
    
    // Validation
    if (!name || !description || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, and year'
      });
    }

    const program = new Program({
      name,
      description,
      year,
      status: status || 'ongoing'
    });

    const createdProgram = await program.save();
    
    res.status(201).json({
      success: true,
      data: createdProgram,
      message: 'Program created successfully'
    });
  } catch (error) {
    console.error('Error creating program:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating program',
      error: error.message
    });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Public
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, year, status } = req.body;

    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID' 
      });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID format' 
      });
    }

    const program = await Program.findById(id);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    if (name) program.name = name;
    if (description) program.description = description;
    if (year) program.year = year;
    if (status) program.status = status;

    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid program data', 
      error: error.message 
    });
  }
};

// @desc    Archive program
// @route   PATCH /api/programs/:id/archive
// @access  Public
const archiveProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID' 
      });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID format' 
      });
    }

    const program = await Program.findById(id);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    program.archived = true;
    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Program archived successfully'
    });
  } catch (error) {
    console.error('Error archiving program:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error archiving program', 
      error: error.message 
    });
  }
};

// @desc    Restore program
// @route   PATCH /api/programs/:id/restore
// @access  Public
const restoreProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID' 
      });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID format' 
      });
    }

    const program = await Program.findById(id);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    program.archived = false;
    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Program restored successfully'
    });
  } catch (error) {
    console.error('Error restoring program:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error restoring program', 
      error: error.message 
    });
  }
};

// @desc    Update program status
// @route   PATCH /api/programs/:id/status
// @access  Public
const updateProgramStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID' 
      });
    }

    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID format' 
      });
    }

    // Validate status
    const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status. Must be: upcoming, ongoing, completed, or cancelled' 
      });
    }

    const program = await Program.findById(id);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    program.status = status;
    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: `Program status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating program status:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating program status', 
      error: error.message 
    });
  }
};

// @desc    Add project to program
// @route   POST /api/programs/:id/projects
// @access  Public
const addProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Validate program ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID format' 
      });
    }

    const program = await Program.findById(id);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const newProject = {
      name,
      year: year || new Date().getFullYear(),
      status: status || 'ongoing'
    };

    program.projects.push(newProject);
    const updatedProgram = await program.save();
    
    res.status(201).json({
      success: true,
      data: updatedProgram,
      message: 'Project added successfully'
    });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid project data', 
      error: error.message 
    });
  }
};

// @desc    Update project
// @route   PUT /api/programs/:programId/projects/:projectId
// @access  Public
const updateProject = async (req, res) => {
  try {
    const { programId, projectId } = req.params;
    const { name, year, status, archived } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(programId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program or project ID' 
      });
    }

    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const project = program.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    if (name) project.name = name;
    if (year) project.year = year;
    if (status) project.status = status;
    if (archived !== undefined) project.archived = archived;

    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid project data', 
      error: error.message 
    });
  }
};

// @desc    Archive project
// @route   PATCH /api/programs/:programId/projects/:projectId/archive
// @access  Public
const archiveProject = async (req, res) => {
  try {
    const { programId, projectId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(programId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program or project ID' 
      });
    }

    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const project = program.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    project.archived = true;
    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Project archived successfully'
    });
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error archiving project', 
      error: error.message 
    });
  }
};

// @desc    Restore project
// @route   PATCH /api/programs/:programId/projects/:projectId/restore
// @access  Public
const restoreProject = async (req, res) => {
  try {
    const { programId, projectId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(programId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program or project ID' 
      });
    }

    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const project = program.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    project.archived = false;
    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Project restored successfully'
    });
  } catch (error) {
    console.error('Error restoring project:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error restoring project', 
      error: error.message 
    });
  }
};

// @desc    Add event to project
// @route   POST /api/programs/:programId/projects/:projectId/events
// @access  Public
const addEvent = async (req, res) => {
  try {
    const { programId, projectId } = req.params;
    const { title, date, participants, venue, status } = req.body;

    // Validation
    if (!title || !date || !participants || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, date, participants, and venue'
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(programId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program or project ID' 
      });
    }

    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const project = program.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const newEvent = {
      title,
      date,
      participants,
      venue,
      status: status || 'upcoming'
    };

    project.events.push(newEvent);
    const updatedProgram = await program.save();
    
    res.status(201).json({
      success: true,
      data: updatedProgram,
      message: 'Event added successfully'
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid event data', 
      error: error.message 
    });
  }
};

// @desc    Update event
// @route   PUT /api/programs/:programId/projects/:projectId/events/:eventId
// @access  Public
const updateEvent = async (req, res) => {
  try {
    const { programId, projectId, eventId } = req.params;
    const { title, date, participants, venue, status, archived } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(programId) || 
        !mongoose.Types.ObjectId.isValid(projectId) || 
        !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program, project, or event ID' 
      });
    }

    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const project = program.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const event = project.events.id(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    if (title) event.title = title;
    if (date) event.date = date;
    if (participants) event.participants = participants;
    if (venue) event.venue = venue;
    if (status) event.status = status;
    if (archived !== undefined) event.archived = archived;

    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ 
      success: false,
      message: 'Invalid event data', 
      error: error.message 
    });
  }
};

// @desc    Archive event
// @route   PATCH /api/programs/:programId/projects/:projectId/events/:eventId/archive
// @access  Public
const archiveEvent = async (req, res) => {
  try {
    const { programId, projectId, eventId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(programId) || 
        !mongoose.Types.ObjectId.isValid(projectId) || 
        !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program, project, or event ID' 
      });
    }

    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const project = program.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const event = project.events.id(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    event.archived = true;
    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Event archived successfully'
    });
  } catch (error) {
    console.error('Error archiving event:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error archiving event', 
      error: error.message 
    });
  }
};

// @desc    Restore event
// @route   PATCH /api/programs/:programId/projects/:projectId/events/:eventId/restore
// @access  Public
const restoreEvent = async (req, res) => {
  try {
    const { programId, projectId, eventId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(programId) || 
        !mongoose.Types.ObjectId.isValid(projectId) || 
        !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program, project, or event ID' 
      });
    }

    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    const project = program.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: 'Project not found' 
      });
    }

    const event = project.events.id(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    event.archived = false;
    const updatedProgram = await program.save();
    
    res.json({
      success: true,
      data: updatedProgram,
      message: 'Event restored successfully'
    });
  } catch (error) {
    console.error('Error restoring event:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error restoring event', 
      error: error.message 
    });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Public
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid program ID format' 
      });
    }

    const program = await Program.findById(id);
    
    if (!program) {
      return res.status(404).json({ 
        success: false,
        message: 'Program not found' 
      });
    }

    await Program.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

module.exports = {
  getPrograms,
  getArchivedPrograms,
  getProgramStats,
  createProgram,
  updateProgram,
  archiveProgram,
  restoreProgram,
  updateProgramStatus,
  addProject,
  updateProject,
  archiveProject,
  restoreProject,
  addEvent,
  updateEvent,
  archiveEvent,
  restoreEvent,
  deleteProgram
};