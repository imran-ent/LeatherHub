const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with Environment Keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure the automated cloud storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'leather_hub_uploads', // Root folder container inside Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // File constraint validations
    transformation: [{ width: 800, height: 800, crop: 'limit' }], // Optional automatic optimization sizing
  },
});

// Build the standard upload engine
const upload = multer({ storage: storage });

module.exports = upload;
