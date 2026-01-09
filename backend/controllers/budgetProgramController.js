const BudgetProgram = require("../models/BudgetProgram");
const cloudinary = require("../config/cloudinary");

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

exports.uploadBudgetProgram = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!req.file) return res.status(400).json({ message: "File is required" });

    const format = req.file.mimetype;
    const fileName = req.file.originalname.replace(/\.[^/.]+$/, "");
    const timestamp = Date.now();

    console.log("📁 Starting upload:", { 
      fileName, 
      format,
      bufferSize: req.file.buffer?.length 
    });

    // Check if file type is allowed
    const isPDF = format === "application/pdf";
    const isImage = format.startsWith("image/");

    if (!isPDF && !isImage) {
      return res.status(400).json({ 
        message: "Only PDF and image files are allowed" 
      });
    }

    let uploadResult;

    if (isPDF) {
      // PDF FILES: Upload as image type for automatic preview conversion
      console.log("📄 Uploading PDF...");
      
      uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "budgets",
        public_id: `${timestamp}_${fileName}`,
        resource_type: "image",
        format: "pdf",
      });

      console.log("✅ PDF uploaded:", uploadResult.public_id);
      
    } else {
      // IMAGE FILES: Standard upload
      console.log("🖼️ Uploading image...");
      
      uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "budgets",
        public_id: `${timestamp}_${fileName}`,
        resource_type: "image",
      });

      console.log("✅ Image uploaded:", uploadResult.public_id);
    }

    // Generate preview URLs
    const publicId = uploadResult.public_id;
    const originalUrl = uploadResult.secure_url;
    let imageUrls = [];
    let pageCount = 1;

    if (isImage) {
      // For images, just use the original URL
      imageUrls = [originalUrl];
      pageCount = 1;
    } else if (isPDF) {
      // For PDFs, get the actual page count from Cloudinary
      try {
        const assetInfo = await cloudinary.api.resource(publicId, {
          resource_type: "image",
          pages: true
        });
        
        const actualPages = assetInfo.pages || 1;
        pageCount = actualPages;
        
        console.log(`📄 PDF has ${actualPages} pages`);
        
        // Generate URLs for actual number of pages
        for (let page = 1; page <= actualPages; page++) {
          const url = cloudinary.url(publicId, {
            resource_type: "image",
            format: "jpg",
            page: page,
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto:good" }
            ]
          });
          imageUrls.push(url);
        }
        
        console.log("✅ Generated preview URLs for PDF");
        console.log(`   Pages: ${actualPages}`);
        console.log("   First page:", imageUrls[0]);
      } catch (err) {
        console.error("Error getting PDF page count:", err);
        // Fallback: generate URLs for first 10 pages
        pageCount = 10;
        for (let page = 1; page <= 10; page++) {
          const url = cloudinary.url(publicId, {
            resource_type: "image",
            format: "jpg",
            page: page,
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto:good" }
            ]
          });
          imageUrls.push(url);
        }
      }
    }

    // Save to database
    const budget = await BudgetProgram.create({
      title,
      file: {
        public_id: publicId,
        original_url: originalUrl,
        image_urls: imageUrls,
        format,
        page_count: pageCount,
        is_previewable: true
      },
      uploadedBy: req.user?._id,
    });

    console.log("✅ Budget saved successfully:", budget._id);

    res.status(201).json({
      success: true,
      budget,
      message: "Budget uploaded successfully"
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message || "Upload failed",
      error: err.toString()
    });
  }
};

exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await BudgetProgram.find().sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await BudgetProgram.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await BudgetProgram.findByIdAndDelete(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    // Delete file from Cloudinary
    try {
      await cloudinary.uploader.destroy(budget.file.public_id, { 
        resource_type: "image",
        invalidate: true 
      });
      console.log("✅ Deleted file from Cloudinary:", budget.file.public_id);
    } catch (e) {
      console.error("Failed to delete file:", e.message);
    }

    res.json({ success: true, message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};