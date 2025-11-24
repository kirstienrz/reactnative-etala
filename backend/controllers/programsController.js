const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
// @access  Public
exports.getAllPrograms = async (req, res) => {
  try {
    const { year, status, search, includeArchived } = req.query;
    
    const query = {};
    
    // Filter by year
    if (year) {
      query.year = parseInt(year);
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by archived status
    if (includeArchived !== 'true') {
      query.archived = false;
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const programs = await Program.find(query).sort({ year: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: programs.length,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Public
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new program
// @route   POST /api/programs
// @access  Private
exports.createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    
    res.status(201).json({
      success: true,
      data: program
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

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: program
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

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Program deleted successfully',
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

// @desc    Archive/Unarchive program
// @route   PATCH /api/programs/:id/archive
// @access  Private
exports.toggleArchiveProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    program.archived = !program.archived;
    await program.save();
    
    res.status(200).json({
      success: true,
      message: `Program ${program.archived ? 'archived' : 'unarchived'} successfully`,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ==================== PROJECT ROUTES ====================

// @desc    Add project to program
// @route   POST /api/programs/:id/projects
// @access  Private
exports.addProject = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    program.projects.push(req.body);
    await program.save();
    
    const newProject = program.projects[program.projects.length - 1];
    
    res.status(201).json({
      success: true,
      data: newProject
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

// @desc    Update project
// @route   PUT /api/programs/:id/projects/:projectId
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    const project = program.projects.id(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    Object.assign(project, req.body);
    await program.save();
    
    res.status(200).json({
      success: true,
      data: project
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

// @desc    Delete project
// @route   DELETE /api/programs/:id/projects/:projectId
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    const project = program.projects.id(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    project.deleteOne();
    await program.save();
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
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

// @desc    Archive/Unarchive project
// @route   PATCH /api/programs/:id/projects/:projectId/archive
// @access  Private
exports.toggleArchiveProject = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    const project = program.projects.id(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    project.archived = !project.archived;
    await program.save();
    
    res.status(200).json({
      success: true,
      message: `Project ${project.archived ? 'archived' : 'unarchived'} successfully`,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ==================== EVENT ROUTES ====================

// @desc    Add event to project
// @route   POST /api/programs/:id/projects/:projectId/events
// @access  Private
exports.addEvent = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    const project = program.projects.id(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Add extended description fields if not provided
    const eventData = {
      ...req.body,
      extendedDescription: req.body.extendedDescription || '',
      tags: req.body.tags || [],
      eventDetails: req.body.eventDetails || {}
    };
    
    project.events.push(eventData);
    await program.save();
    
    const newEvent = project.events[project.events.length - 1];
    
    res.status(201).json({
      success: true,
      data: newEvent
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

// @desc    Update event
// @route   PUT /api/programs/:id/projects/:projectId/events/:eventId
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    const project = program.projects.id(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const event = project.events.id(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    Object.assign(event, req.body);
    await program.save();
    
    res.status(200).json({
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

// @desc    Delete event
// @route   DELETE /api/programs/:id/projects/:projectId/events/:eventId
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    const project = program.projects.id(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const event = project.events.id(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    event.deleteOne();
    await program.save();
    
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

// @desc    Archive/Unarchive event
// @route   PATCH /api/programs/:id/projects/:projectId/events/:eventId/archive
// @access  Private
exports.toggleArchiveEvent = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    const project = program.projects.id(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const event = project.events.id(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    event.archived = !event.archived;
    await program.save();
    
    res.status(200).json({
      success: true,
      message: `Event ${event.archived ? 'archived' : 'unarchived'} successfully`,
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