const cloudinary = require('../config/cloudinary.config'); // Adjust the path if necessary

async function uploadToCloudinary(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Dynamically detect the file format from the uploaded file's mimetype
    const format = req.file.mimetype.split('/')[1]; // Example: "image/png" -> "png"

    // Upload file buffer directly to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'my-drive', resource_type: 'auto' }, // 'resource_type: auto' allows any file type
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );

      // Stream the file buffer to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    // Add the Cloudinary URL to the request object
    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = uploadToCloudinary;
