const News = require("../models/News");
const cloudinary = require("../config/cloudinary");

// ✅ Create news with image upload
const createNews = async (req, res) => {
  try {
    const { title, content, link, date } = req.body;
    
    let imageUrl = "";
    let publicId = "";

    // Handle image upload if file exists
    if (req.file) {
      imageUrl = req.file.path;
      publicId = req.file.filename;
    }

    // Auto-generate date if not provided
    const newsDate = date || new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const newNews = new News({ 
      title, 
      date: newsDate, 
      content, 
      imageUrl, 
      publicId, 
      link 
    });
    await newNews.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("newsUpdated");

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: newNews,
    });
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ success: false, message: "Failed to create news" });
  }
};

// ✅ Get all non-archived news
const getAllNews = async (req, res) => {
  try {
    const news = await News.find({ archived: false }).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
};

// ✅ Update news
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, link, date } = req.body;
    
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (news.publicId) {
        await cloudinary.uploader.destroy(news.publicId);
      }
      
      news.imageUrl = req.file.path;
      news.publicId = req.file.filename;
    }

    // Update other fields
    news.title = title || news.title;
    news.content = content || news.content;
    news.link = link || news.link;
    if (date) news.date = date;

    await news.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("newsUpdated");

    res.status(200).json({ 
      success: true, 
      message: "News updated successfully",
      data: news 
    });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ success: false, message: "Failed to update news" });
  }
};

// ✅ Archive news (soft delete)
const archiveNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    news.archived = true;
    await news.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("newsUpdated");

    res.status(200).json({ 
      success: true, 
      message: "News archived successfully" 
    });
  } catch (error) {
    console.error("Error archiving news:", error);
    res.status(500).json({ success: false, message: "Failed to archive news" });
  }
};

// ✅ Get all archived news
const getArchivedNews = async (req, res) => {
  try {
    const news = await News.find({ archived: true }).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching archived news:", error);
    res.status(500).json({ success: false, message: "Failed to fetch archived news" });
  }
};

// ✅ Restore archived news
const restoreNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    news.archived = false;
    await news.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("newsUpdated");

    res.status(200).json({ 
      success: true, 
      message: "News restored successfully" 
    });
  } catch (error) {
    console.error("Error restoring news:", error);
    res.status(500).json({ success: false, message: "Failed to restore news" });
  }
};

// ✅ Permanently delete news (hard delete)
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);

    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    // Delete image from Cloudinary
    if (news.publicId) {
      await cloudinary.uploader.destroy(news.publicId);
    }

    await News.findByIdAndDelete(id);

    // 🔔 Real-time update
    const io = req.app.get("io");
    io?.emit("newsUpdated");

    res.status(200).json({ 
      success: true, 
      message: "News deleted permanently" 
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ success: false, message: "Failed to delete news" });
  }
};

module.exports = {
  createNews,
  getAllNews,
  updateNews,
  archiveNews,
  getArchivedNews,
  restoreNews,
  deleteNews,
};