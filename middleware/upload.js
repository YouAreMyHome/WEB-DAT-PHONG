//upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // Kiểm tra đường dẫn

/**
 * Tạo multer upload middleware cho từng loại tài nguyên.
 * Tất cả ảnh nằm trong thư mục mẹ StaynightSystem:
 *   StaynightSystem/user   — avatar người dùng
 *   StaynightSystem/hotel  — ảnh khách sạn
 *   StaynightSystem/room   — ảnh phòng
 *
 * Dùng: const upload = require('./middleware/upload')('hotel');
 */
const createUpload = (subfolder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `StaynightSystem/${subfolder}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
  return multer({ storage });
};

module.exports = createUpload;
