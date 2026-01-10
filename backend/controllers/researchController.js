const Research = require('../models/Research');
const cloudinary = require('../config/cloudinary');
const { deleteFromCloudinary } = require('../utils/cloudinaryUpload');

// Get all research (with filtering)
const getAllResearch = async (req, res) => {
  try {
    const { 
      status = 'active', 
      year, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'newest'
    } = req.query;

    // Build query
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by year
    if (year && year !== 'All Years') {
      query.year = year;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authors: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sort = {};
    switch(sortBy) {
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'title':
        sort.title = 1;
        break;
      case 'newest':
      default:
        sort.createdAt = -1;
        break;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Research.countDocuments(query);

    // Get research data
    const research = await Research.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get statistics
    const stats = {
      total: await Research.countDocuments({}),
      active: await Research.countDocuments({ status: 'active' }),
      archived: await Research.countDocuments({ status: 'archived' }),
      withLinks: await Research.countDocuments({ link: { $ne: null, $ne: '' } })
    };

    res.status(200).json({
      success: true,
      count: research.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      stats,
      data: research
    });
  } catch (error) {
    console.error('Error getting research:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching research' 
    });
  }
};

// Get single research by ID
const getResearchById = async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: research
    });
  } catch (error) {
    console.error('Error getting research:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching research' 
    });
  }
};

// Create new research
const createResearch = async (req, res) => {
  try {
    const { title, authors, year, abstract, tags, status, link } = req.body;

    // Parse tags if provided as string
    let tagsArray = [];
    if (tags) {
      tagsArray = typeof tags === 'string' 
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags;
    }

    // Handle thumbnail upload
    let thumbnailData = {
      url: 'https://res.cloudinary.com/demo/image/upload/v1570979137/default-research.jpg',
      public_id: null,
      format: null,
      bytes: null
    };

    if (req.files && req.files.thumbnail) {
      const thumbnail = req.files.thumbnail[0];
      thumbnailData = {
        url: thumbnail.path,
        public_id: thumbnail.filename,
        format: thumbnail.mimetype.split('/')[1],
        bytes: thumbnail.size
      };
    }

    // Handle research file upload
    let researchFileData = null;
    if (req.files && req.files.researchFile) {
      const researchFile = req.files.researchFile[0];
      researchFileData = {
        url: researchFile.path,
        public_id: researchFile.filename,
        format: researchFile.mimetype.split('/')[1],
        bytes: researchFile.size,
        originalName: researchFile.originalname
      };
    }

    // Create new research
    const research = new Research({
      title,
      authors,
      year,
      abstract,
      tags: tagsArray,
      status: status || 'active',
      link: link || '',
      thumbnail: thumbnailData,
      researchFile: researchFileData,
      datePublished: new Date()
    });

    await research.save();

    // Real-time update (if using Socket.io)
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(201).json({
      success: true,
      message: 'Research created successfully',
      data: research
    });
  } catch (error) {
    console.error('Error creating research:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to create research' 
    });
  }
};

// Update research
const updateResearch = async (req, res) => {
  try {
    const { title, authors, year, abstract, tags, status, link } = req.body;
    
    // Find research
    let research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research not found' 
      });
    }

    // Parse tags if provided
    if (tags) {
      research.tags = typeof tags === 'string' 
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags;
    }

    // Handle thumbnail update
    if (req.files && req.files.thumbnail) {
      // Delete old thumbnail from Cloudinary if exists
      if (research.thumbnail.public_id) {
        await deleteFromCloudinary(research.thumbnail.public_id);
      }

      const thumbnail = req.files.thumbnail[0];
      research.thumbnail = {
        url: thumbnail.path,
        public_id: thumbnail.filename,
        format: thumbnail.mimetype.split('/')[1],
        bytes: thumbnail.size
      };
    }

    // Handle research file update
    if (req.files && req.files.researchFile) {
      // Delete old file from Cloudinary if exists
      if (research.researchFile && research.researchFile.public_id) {
        await deleteFromCloudinary(research.researchFile.public_id, 'raw');
      }

      const researchFile = req.files.researchFile[0];
      research.researchFile = {
        url: researchFile.path,
        public_id: researchFile.filename,
        format: researchFile.mimetype.split('/')[1],
        bytes: researchFile.size,
        originalName: researchFile.originalname
      };
    }

    // Update fields
    research.title = title || research.title;
    research.authors = authors || research.authors;
    research.year = year || research.year;
    research.abstract = abstract || research.abstract;
    research.status = status || research.status;
    research.link = link !== undefined ? link : research.link;

    await research.save();

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(200).json({
      success: true,
      message: 'Research updated successfully',
      data: research
    });
  } catch (error) {
    console.error('Error updating research:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to update research' 
    });
  }
};

// Archive research
const archiveResearch = async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research not found' 
      });
    }

    research.status = 'archived';
    await research.save();

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(200).json({
      success: true,
      message: 'Research archived successfully',
      data: research
    });
  } catch (error) {
    console.error('Error archiving research:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to archive research' 
    });
  }
};

// Restore research (from archived to active)
const restoreResearch = async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research not found' 
      });
    }

    research.status = 'active';
    await research.save();

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(200).json({
      success: true,
      message: 'Research restored successfully',
      data: research
    });
  } catch (error) {
    console.error('Error restoring research:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to restore research' 
    });
  }
};

// Delete research
const deleteResearch = async (req, res) => {
  try {
    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ 
        success: false, 
        error: 'Research not found' 
      });
    }

    // Delete thumbnail from Cloudinary if exists
    if (research.thumbnail.public_id) {
      await deleteFromCloudinary(research.thumbnail.public_id);
    }

    // Delete research file from Cloudinary if exists
    if (research.researchFile && research.researchFile.public_id) {
      await deleteFromCloudinary(research.researchFile.public_id, 'raw');
    }

    await Research.findByIdAndDelete(req.params.id);

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(200).json({
      success: true,
      message: 'Research deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting research:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to delete research' 
    });
  }
};

// Bulk operations
const bulkArchive = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide research IDs to archive' 
      });
    }

    const result = await Research.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'archived' } }
    );

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} research items archived successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk archiving:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to archive research' 
    });
  }
};

const bulkRestore = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide research IDs to restore' 
      });
    }

    const result = await Research.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'active' } }
    );

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} research items restored successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk restoring:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to restore research' 
    });
  }
};

const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide research IDs to delete' 
      });
    }

    // Find research items to delete their files from Cloudinary
    const researchItems = await Research.find({ _id: { $in: ids } });
    
    // Delete files from Cloudinary
    for (const research of researchItems) {
      if (research.thumbnail.public_id) {
        await deleteFromCloudinary(research.thumbnail.public_id);
      }
      if (research.researchFile && research.researchFile.public_id) {
        await deleteFromCloudinary(research.researchFile.public_id, 'raw');
      }
    }

    const result = await Research.deleteMany({ _id: { $in: ids } });

    // Real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('researchUpdated');
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} research items deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Failed to delete research' 
    });
  }
};

// Get statistics
const getStats = async (req, res) => {
  try {
    const total = await Research.countDocuments();
    const active = await Research.countDocuments({ status: 'active' });
    const archived = await Research.countDocuments({ status: 'archived' });
    const withLinks = await Research.countDocuments({ link: { $ne: null, $ne: '' } });

    // Get research count by year
    const byYear = await Research.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        archived,
        withLinks,
        byYear
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching statistics' 
    });
  }
};

module.exports = {
  getAllResearch,
  getResearchById,
  createResearch,
  updateResearch,
  archiveResearch,
  restoreResearch,
  deleteResearch,
  bulkArchive,
  bulkRestore,
  bulkDelete,
  getStats
};