const cloudinary = require('../config/cloudinary');

// Upload image to Cloudinary
const uploadToCloudinary = async (file, folder = 'research/thumbnails') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'auto'
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId, resource_type = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete from Cloudinary');
  }
};

// Upload multiple files
const uploadMultipleToCloudinary = async (files, folder = 'research/thumbnails') => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error('Failed to upload multiple files');
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary
};