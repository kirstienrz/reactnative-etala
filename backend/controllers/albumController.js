const Album = require("../models/Album");
const cloudinary = require("../config/cloudinary");

// ✅ GET ALL ACTIVE ALBUMS
const getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ isArchived: false })
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: albums
    });
  } catch (err) {
    console.error("Error fetching albums:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch albums" 
    });
  }
};

// ✅ GET ARCHIVED ALBUMS
const getArchivedAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ isArchived: true })
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: albums
    });
  } catch (err) {
    console.error("Error fetching archived albums:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch archived albums" 
    });
  }
};

// ✅ GET SINGLE ALBUM WITH IMAGES
const getAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    
    const album = await Album.findById(id);
    
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    res.json({
      success: true,
      data: album
    });
  } catch (err) {
    console.error("Error fetching album:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch album" 
    });
  }
};

// ✅ CREATE NEW ALBUM (with cover image)
const createAlbum = async (req, res) => {
  try {
    console.log('Create album request received');
    
    const { title, description, date } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Title and cover image are required" 
      });
    }

    // Upload cover image to Cloudinary
    const coverResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "gad-portal/albums/covers",
          resource_type: 'image' 
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary cover upload error:', error);
            reject(error);
          } else {
            console.log('Cover uploaded successfully:', result.secure_url);
            resolve(result);
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    // Create album with cover image
    const newAlbum = await Album.create({
      title,
      description: description || "",
      date: date ? new Date(date) : new Date(),
      coverImage: {
        imageUrl: coverResult.secure_url,
        cloudinaryId: coverResult.public_id
      },
      images: [],
      isArchived: false
    });

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumsUpdated");
    }

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      data: newAlbum
    });

  } catch (err) {
    console.error('Create album error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to create album",
      error: err.message 
    });
  }
};

// ✅ UPLOAD IMAGES TO ALBUM
const uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { captions = [] } = req.body;
    
    console.log(`Upload images to album ${id}`);

    // Check if album exists
    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    // Handle multiple files
    const files = req.files || [req.file];
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No images uploaded" 
      });
    }

    const newImages = [];

    // Upload each image to Cloudinary
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions[i] || "";

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: `gad-portal/albums/${id}`,
            resource_type: 'image' 
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary image upload error:', error);
              reject(error);
            } else {
              console.log(`Image ${i+1} uploaded:`, result.secure_url);
              resolve(result);
            }
          }
        );
        
        uploadStream.end(file.buffer);
      });

      const newImage = {
        imageUrl: result.secure_url,
        cloudinaryId: result.public_id,
        caption: caption,
        order: album.images.length + i,
        uploadedAt: new Date()
      };

      newImages.push(newImage);
    }

    // Add new images to album
    album.images.push(...newImages);
    
    // If album doesn't have a cover image, use first uploaded image
    if (!album.coverImage.imageUrl && newImages.length > 0) {
      album.coverImage = {
        imageUrl: newImages[0].imageUrl,
        cloudinaryId: newImages[0].cloudinaryId
      };
    }

    await album.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumUpdated", { albumId: id });
    }

    res.status(201).json({
      success: true,
      message: `${newImages.length} images uploaded successfully`,
      data: newImages
    });

  } catch (err) {
    console.error('Upload images error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to upload images",
      error: err.message 
    });
  }
};

// ✅ UPDATE ALBUM DETAILS
const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;
    
    console.log(`Update album ${id}`);

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    // Update fields if provided
    if (title) album.title = title;
    if (description !== undefined) album.description = description;
    if (date) album.date = new Date(date);

    // If new cover image is uploaded
    if (req.file) {
      // Delete old cover from Cloudinary
      if (album.coverImage.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(album.coverImage.cloudinaryId);
        } catch (err) {
          console.warn('Failed to delete old cover:', err.message);
        }
      }

      // Upload new cover
      const coverResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: "gad-portal/albums/covers",
            resource_type: 'image' 
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.end(req.file.buffer);
      });

      album.coverImage = {
        imageUrl: coverResult.secure_url,
        cloudinaryId: coverResult.public_id
      };
    }

    await album.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumUpdated", { albumId: id });
    }

    res.status(200).json({
      success: true,
      message: "Album updated successfully",
      data: album
    });

  } catch (err) {
    console.error('Update album error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update album",
      error: err.message 
    });
  }
};

// ✅ UPDATE IMAGE CAPTION
const updateImageCaption = async (req, res) => {
  try {
    const { albumId, imageIndex } = req.params;
    const { caption } = req.body;
    
    console.log(`Update image caption for album ${albumId}, index ${imageIndex}`);

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    if (imageIndex < 0 || imageIndex >= album.images.length) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }

    // Update caption
    album.images[imageIndex].caption = caption || "";
    await album.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumUpdated", { albumId: albumId });
    }

    res.status(200).json({
      success: true,
      message: "Image caption updated successfully",
      data: album.images[imageIndex]
    });

  } catch (err) {
    console.error('Update image caption error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update image caption",
      error: err.message 
    });
  }
};

// ✅ DELETE IMAGE FROM ALBUM
const deleteImage = async (req, res) => {
  try {
    const { albumId, imageIndex } = req.params;
    
    console.log(`Delete image from album ${albumId}, index ${imageIndex}`);

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    if (imageIndex < 0 || imageIndex >= album.images.length) {
      return res.status(404).json({ 
        success: false, 
        message: "Image not found" 
      });
    }

    const imageToDelete = album.images[imageIndex];

    // Delete from Cloudinary
    if (imageToDelete.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.cloudinaryId);
      } catch (err) {
        console.warn('Failed to delete image from Cloudinary:', err.message);
      }
    }

    // Check if this image is the cover image
    if (album.coverImage.cloudinaryId === imageToDelete.cloudinaryId) {
      // Set a different image as cover or keep it if no images left
      if (album.images.length > 1) {
        const nextIndex = imageIndex === 0 ? 1 : 0;
        album.coverImage = {
          imageUrl: album.images[nextIndex].imageUrl,
          cloudinaryId: album.images[nextIndex].cloudinaryId
        };
      }
    }

    // Remove image from array
    album.images.splice(imageIndex, 1);

    // Update order for remaining images
    album.images.forEach((img, index) => {
      img.order = index;
    });

    await album.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumUpdated", { albumId: albumId });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });

  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete image",
      error: err.message 
    });
  }
};

// ✅ ARCHIVE ALBUM
const archiveAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Archive album ${id}`);

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    album.isArchived = true;
    await album.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumsUpdated");
    }

    res.status(200).json({
      success: true, 
      message: "Album archived successfully",
      data: album
    });
  } catch (err) {
    console.error("Error archiving album:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to archive album",
      error: err.message 
    });
  }
};

// ✅ RESTORE ALBUM
const restoreAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Restore album ${id}`);

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    album.isArchived = false;
    await album.save();

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumsUpdated");
    }

    res.status(200).json({
      success: true, 
      message: "Album restored successfully",
      data: album
    });
  } catch (err) {
    console.error("Error restoring album:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to restore album",
      error: err.message 
    });
  }
};

// ✅ DELETE ALBUM PERMANENTLY
const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Delete album ${id}`);

    const album = await Album.findById(id);
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        message: "Album not found" 
      });
    }

    // Delete cover image from Cloudinary
    if (album.coverImage.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(album.coverImage.cloudinaryId);
      } catch (err) {
        console.warn('Failed to delete cover image:', err.message);
      }
    }

    // Delete all images from Cloudinary
    for (const image of album.images) {
      if (image.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(image.cloudinaryId);
        } catch (err) {
          console.warn('Failed to delete image:', image.cloudinaryId, err.message);
        }
      }
    }

    await Album.findByIdAndDelete(id);

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumsUpdated");
    }

    res.status(200).json({
      success: true, 
      message: "Album deleted permanently"
    });
  } catch (err) {
    console.error("Error deleting album:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete album",
      error: err.message 
    });
  }
};

// ✅ BULK ARCHIVE ALBUMS
const bulkArchiveAlbums = async (req, res) => {
  try {
    const { albumIds } = req.body;
    
    if (!albumIds || !Array.isArray(albumIds) || albumIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide album IDs to archive"
      });
    }

    const result = await Album.updateMany(
      { _id: { $in: albumIds } },
      { isArchived: true }
    );

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumsUpdated");
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} albums archived successfully`
    });
  } catch (err) {
    console.error("Error bulk archiving albums:", err);
    res.status(500).json({
      success: false,
      message: "Failed to bulk archive albums",
      error: err.message
    });
  }
};

// ✅ BULK RESTORE ALBUMS
const bulkRestoreAlbums = async (req, res) => {
  try {
    const { albumIds } = req.body;
    
    if (!albumIds || !Array.isArray(albumIds) || albumIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide album IDs to restore"
      });
    }

    const result = await Album.updateMany(
      { _id: { $in: albumIds } },
      { isArchived: false }
    );

    // 🔔 Real-time update
    const io = req.app.get("io");
    if (io) {
      io.emit("albumsUpdated");
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} albums restored successfully`
    });
  } catch (err) {
    console.error("Error bulk restoring albums:", err);
    res.status(500).json({
      success: false,
      message: "Failed to bulk restore albums",
      error: err.message
    });
  }
};

module.exports = {
  getAllAlbums,
  getArchivedAlbums,
  getAlbum,
  createAlbum,
  uploadImages,
  updateAlbum,
  updateImageCaption,
  deleteImage,
  archiveAlbum,
  restoreAlbum,
  deleteAlbum,
  bulkArchiveAlbums,
  bulkRestoreAlbums
};